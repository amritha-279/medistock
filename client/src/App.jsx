import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { ToastContainer } from 'react-toastify'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Medicines from './pages/Medicines'
import Sales from './pages/Sales'
import Suppliers from './pages/Suppliers'
import Predictions from './pages/Predictions'
import Reports from './pages/Reports'
import Profile from './pages/Profile'
import UserManagement from './pages/UserManagement'
import Inventory from './pages/Inventory'
import Alerts from './pages/Alerts'
import MLSettings from './pages/MLSettings'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }) => {
  const { user } = useAuth()
  return !user ? children : <Navigate to="/dashboard" replace />
}

const AdminRoute = ({ children }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="medicines" element={<Medicines />} />
            <Route path="sales" element={<Sales />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="predictions" element={<Predictions />} />
            <Route path="reports" element={<Reports />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="profile" element={<Profile />} />
            <Route path="users" element={<AdminRoute><UserManagement /></AdminRoute>} />
            <Route path="ml-settings" element={<AdminRoute><MLSettings /></AdminRoute>} />
          </Route>
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      </BrowserRouter>
    </AuthProvider>
  )
}
