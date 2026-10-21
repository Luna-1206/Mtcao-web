import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Wraps pages that are for admins only.
// "children" is the page inside it (example: Dashboard).
export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()

    // Still checking if someone is logged in, so wait first.
    // Without this, a refresh would send you to /login even if you are logged in.
    if (loading) {
        return <p>Loading...</p>
    }

    // Nobody is logged in, so send them to /login
    if (!user) {
        return <Navigate to="/login" replace />
    }

    // Someone is logged in, so show the page
    return children
}