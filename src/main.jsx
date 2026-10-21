import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import 'leaflet/dist/leaflet.css'
import './main.css'

// Put the whole app inside the <div id="root"> of index.html
createRoot(document.getElementById('root')).render(
    <StrictMode>
        {/* BrowserRouter lets the app use addresses like /login */}
        <BrowserRouter>
            {/* AuthProvider shares who is logged in with all pages */}
            <AuthProvider>
                <App />
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
)