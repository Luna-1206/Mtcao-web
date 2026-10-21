import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Menu items. Same order and icons as the prototype.
const MENU = [
    {
        label: 'Dashboard',
        path: '/dashboard',
        icon: (
            <svg viewBox="0 0 24 24">
                <rect x="3" y="3" width="8" height="8" rx="1" />
                <rect x="13" y="3" width="8" height="5" rx="1" />
                <rect x="13" y="11" width="8" height="10" rx="1" />
                <rect x="3" y="14" width="8" height="7" rx="1" />
            </svg>
        ),
    },
    {
        label: 'Tourist List',
        path: '/tourists',
        icon: (
            <svg viewBox="0 0 24 24">
                <circle cx="9" cy="8" r="4" />
                <path d="M2 21c0-4 3-6 7-6s7 2 7 6M17 4a4 4 0 010 8" />
            </svg>
        ),
    },
    // Okay
    {
        label: 'Manage Destination',
        path: '/destinations',
        icon: (
            <svg viewBox="0 0 24 24">
                <path d="M12 22s7-6 7-12a7 7 0 10-14 0c0 6 7 12 7 12z" />
                <circle cx="12" cy="10" r="2.5" />
            </svg>
        ),
    },
    {
        label: 'Archive',
        path: '/archive',
        icon: (
            <svg viewBox="0 0 24 24">
                <path d="M3 5h18v4H3zM5 9v10h14V9M10 13h4" />
            </svg>
        ),
    },
    {
        label: 'Activity Logs',
        path: '/logs',
        icon: (
            <svg viewBox="0 0 24 24">
                <path d="M8 4h8v3H8zM6 5H5v16h14V5h-1M9 12h6M9 16h6" />
            </svg>
        ),
    },
    {
        label: 'About Us',
        path: '/about',
        icon: (
            <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v6M12 7.5v.5" />
            </svg>
        ),
    },
    {
        label: 'Settings',
        path: '/settings',
        icon: (
            <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
            </svg>
        ),
    },
]

// Makes initials from a name. Example: "Richard Bejer" -> "RB"
function getInitials(fullName) {
    // No name yet, so show nothing
    if (!fullName) {
        return ''
    }

    // "Richard Bejer" -> ["Richard", "Bejer"]
    const nameWords = fullName.trim().split(' ')

    // First letter of the first word
    const firstLetter = nameWords[0][0]

    // First letter of the last word.
    // If there is only one word, there is no last letter.
    let lastLetter = ''
    if (nameWords.length > 1) {
        const lastWord = nameWords[nameWords.length - 1]
        lastLetter = lastWord[0]
    }

    return (firstLetter + lastLetter).toUpperCase()
}

export default function Layout() {
    const { admin, logout } = useAuth()
    const navigate = useNavigate()

    // Tells us the address of the page that is open now (example: "/archive")
    const currentLocation = useLocation()

    // Find which menu item is open now. We use it for the highlight and the title.
    // The loop stops (break) at the first menu item that matches.
    let currentMenuItem = null
    for (const menuItem of MENU) {
        if (currentLocation.pathname.startsWith(menuItem.path)) {
            currentMenuItem = menuItem
            break
        }
    }

    // The page title for the topbar
    let pageTitle = ''
    if (currentMenuItem) {
        pageTitle = currentMenuItem.label
    }

    // The admin name and position for the topbar
    let adminName = ''
    let adminPosition = ''
    if (admin) {
        adminName = admin.fullName
        adminPosition = admin.position
    }

    return (
        <>
            {/* Sidebar */}
            <aside>
                <div className="logo">
                    <img src="/seal.png" alt="Seal of the Municipality of Bacacay" />
                </div>

                <nav aria-label="Main">
                    {MENU.map((menuItem) => {
                        // Highlight the menu item of the page that is open
                        let ariaCurrent = undefined
                        if (menuItem === currentMenuItem) {
                            ariaCurrent = 'page'
                        }

                        return (
                            <button
                                key={menuItem.path}
                                aria-current={ariaCurrent}
                                onClick={() => navigate(menuItem.path)}
                            >
                                {menuItem.icon}
                                {menuItem.label}
                            </button>
                        )
                    })}

                    {/* Log out: after this, ProtectedRoute sends the user to /login */}
                    <button onClick={logout}>
                        <svg viewBox="0 0 24 24">
                            <path d="M9 4H4v16h5M16 8l4 4-4 4M20 12H9" />
                        </svg>
                        Log Out
                    </button>
                </nav>
            </aside>

            {/* Right side: topbar + page */}
            <div className="main">
                <div className="top">
                    <div>
                        <h2>{pageTitle}</h2>
                    </div>

                    <div className="user">
                        <div>
                            <span>{adminName}</span>
                            <small>{adminPosition}</small>
                        </div>
                        <span className="av">
                            <span>{getInitials(adminName)}</span>
                        </span>
                    </div>
                </div>

                <div className="wrap">
                    {/* The current page appears here */}
                    <Outlet />
                </div>
            </div>
        </>
    )
}