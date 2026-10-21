import { createContext, useContext, useEffect, useState } from 'react'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

// Ito yung "shared box". Dito natin ilalagay kung sino ang naka-login
// para makuha ng ibang page (Topbar, Sidebar, etc.) nang hindi inuulit ang code.
const AuthContext = createContext()

// Iisang error message para sa lahat ng failed login.
// Kahit mali email, mali password, o hindi admin, ito lagi ang lalabas.
// Bakit: para hindi malaman ng iba kung alin sa tatlo ang mali.
const LOGIN_ERROR = 'Invalid email or password'

// Chine-check kung admin ang user.
// Tinitingnan kung may document sa Firestore: admins/{uid}
// - Kung meron: ibabalik ang laman (fullName, position)
// - Kung wala: null, ibig sabihin hindi siya admin
// Bakit may try/catch: kung may error (halimbawa hinarang ng rules),
// ituturing na hindi admin para hindi siya makapasok.
async function getAdmin(uid) {
  try {
    const snap = await getDoc(doc(db, 'admins', uid))
    return snap.exists() ? snap.data() : null
  } catch (err) {
    console.log('cant read admin doc', err)
    return null
  }
}

// Binabalot nito ang buong app (ilalagay natin sa main.jsx mamaya).
export function AuthProvider({ children }) {
  // user = yung naka-login na account (null kung wala)
  const [user, setUser] = useState(null)
  // admin = info ng admin galing Firestore (fullName, position)
  const [admin, setAdmin] = useState(null)
  // loading = true habang chine-check pa kung may naka-login na.
  // Bakit kailangan: kung wala ito, pag nag-refresh ka, mapupunta ka agad
  // sa /login kahit naka-login ka naman, kasi hindi pa tapos ang check.
  const [loading, setLoading] = useState(true)

  // Tumatakbo ito pagbukas ng app, tapos nakikinig sa Firebase.
  // Magti-trigger ito kapag:
  //   1. may nag-login
  //   2. may nag-logout
  //   3. nag-refresh ng page (naaalala ng Firebase ang dating login)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      // Walang naka-login: linisin ang lahat
      if (!firebaseUser) {
        setUser(null)
        setAdmin(null)
        setLoading(false)
        return
      }

      // May naka-login, kaya tingnan kung admin
      const adminData = await getAdmin(firebaseUser.uid)

      if (!adminData) {
        // May account pero hindi admin (halimbawa tourist account).
        // I-logout agad para hindi siya manatiling naka-login.
        await signOut(auth)
        setUser(null)
        setAdmin(null)
      } else {
        // Admin siya, i-save ang info para magamit sa Topbar
        setUser(firebaseUser)
        setAdmin(adminData)
      }
      setLoading(false)
    })

    // Cleanup: titigil ang listening pag nag-close ang app
    return unsub
  }, [])

  // Tinatawag ng Login page pag pinindot ang Login button.
  // Kapag tama at admin: walang ibabalik, tapos papasok na sa Dashboard
  // (yung listener sa taas ang mag-a-update ng user at admin).
  // Kapag mali o hindi admin: magtatapon ng error, tapos ang Login page
  // ang magpapakita ng "Invalid username or password".
  async function login(email, password) {
    let result
    try {
      result = await signInWithEmailAndPassword(auth, email.trim(), password)
    } catch (err) {
      // Mali ang email o password
      throw new Error(LOGIN_ERROR)
    }

    // Tama ang email at password, pero admin ba talaga?
    const adminData = await getAdmin(result.user.uid)
    if (!adminData) {
      await signOut(auth)
      throw new Error(LOGIN_ERROR)
    }
  }

  // Tinatawag ng Log Out button sa sidebar.
  // Pagkatapos nito, wala nang naka-login, kaya ibabalik ka ng
  // ProtectedRoute (File 3) sa /login.
  function logout() {
    return signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Ito ang tatawagin ng ibang file para makuha ang info.
// Halimbawa sa Topbar:  const { admin } = useAuth()
// tapos gamitin ang admin.fullName
export function useAuth() {
  return useContext(AuthContext)
}