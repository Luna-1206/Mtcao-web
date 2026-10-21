import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import ManageDestination from './pages/ManageDestination'
import Placeholder from './pages/Placeholder'

export default function App() {
    return (
        <Routes>
            {/* Login page: anyone can open it */}

            <Route path="/login" element={<Login />} />

            {/* Admin-only pages: checked by ProtectedRoute, shown inside Layout */}
            <Route
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                
                <Route path="/dashboard" element={<Placeholder title="Dashboard" />} />
                <Route path="/tourists" element={<Placeholder title="Tourist List" />} />
                <Route path="/destinations" element={<ManageDestination />} />
                <Route path="/archive" element={<Placeholder title="Archive" />} />
                <Route path="/logs" element={<Placeholder title="Activity Logs" />} />
                <Route path="/about" element={<Placeholder title="About Us" />} />
                <Route path="/settings" element={<Placeholder title="Settings" />} />
            </Route>

            {/* Any other address (including "/") goes to the dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    )
}