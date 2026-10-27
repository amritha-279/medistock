import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  MdDashboard, MdMedication, MdPointOfSale, MdLocalShipping,
  MdAutoGraph, MdAssessment, MdPerson, MdLogout, MdMenu, MdClose,
  MdNotifications, MdLocalHospital, MdAdminPanelSettings, MdInventory, MdWarning, MdSettings
} from 'react-icons/md'

const navItems = [
  { to: '/dashboard', icon: <MdDashboard />, label: 'Dashboard' },
  { to: '/medicines', icon: <MdMedication />, label: 'Medicines' },
  { to: '/sales', icon: <MdPointOfSale />, label: 'Sales' },
  { to: '/suppliers', icon: <MdLocalShipping />, label: 'Suppliers' },
  { to: '/inventory', icon: <MdInventory />, label: 'Inventory' },
  { to: '/predictions', icon: <MdAutoGraph />, label: 'AI Predictions' },
  { to: '/reports', icon: <MdAssessment />, label: 'Reports' },
  { to: '/alerts', icon: <MdWarning />, label: 'Alerts' },
  { to: '/profile', icon: <MdPerson />, label: 'Profile' },
  // Admin only
  { to: '/users', icon: <MdAdminPanelSettings />, label: 'User Management', adminOnly: true },
  { to: '/ml-settings', icon: <MdSettings />, label: 'ML Model Settings', adminOnly: true },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="d-flex">
      {/* Overlay for mobile */}
      {sidebarOpen && <div className="position-fixed inset-0 bg-dark bg-opacity-50" style={{ zIndex: 999 }} onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand d-flex align-items-center gap-2">
          <div style={{ background: 'rgba(32,201,151,0.2)', borderRadius: 10, padding: '6px 8px' }}>
            <MdLocalHospital style={{ color: '#20c997', fontSize: '1.4rem' }} />
          </div>
          <div>
            <h5 className="mb-0">Medi<span>Stock</span> AI</h5>
            <small style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>Pharmacy Intelligence</small>
          </div>
        </div>

        <div className="sidebar-nav" style={{ overflowY: 'auto', flex: 1 }}>
          <div className="nav-section-title">Main Menu</div>
          {navItems
            .filter(item => !item.adminOnly || user?.role === 'admin')
            .map(item => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                {item.icon} {item.label}
              </NavLink>
            ))}
          <div className="nav-section-title mt-3">Account</div>
          <button className="sidebar-link w-100 border-0 bg-transparent text-start" style={{ color: '#ff6b6b' }} onClick={handleLogout}>
            <MdLogout /> Logout
          </button>
        </div>

        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 'auto' }}>
          <div className="d-flex align-items-center gap-2">
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #20c997, #0d6efd)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>{user?.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="main-content flex-grow-1">
        <div className="topbar">
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-sm btn-light d-md-none" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <MdClose /> : <MdMenu />}
            </button>
            <div>
              <h6 className="mb-0 fw-600" style={{ color: '#1e293b' }}>MediStock AI</h6>
              <small className="text-muted">Medicine Demand Forecasting System</small>
            </div>
          </div>
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-light btn-sm position-relative">
              <MdNotifications size={18} />
            </button>
            {user?.role === 'admin' && (
              <span className="badge" style={{ background: '#eff6ff', color: '#0d6efd', fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>Admin</span>
            )}
            {user?.role === 'manager' && (
              <span className="badge" style={{ background: '#f0fdf4', color: '#20c997', fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>Manager</span>
            )}
            <div className="d-flex align-items-center gap-2">
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #20c997, #0d6efd)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="d-none d-md-block">
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'capitalize' }}>{user?.role}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
