import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import { MdLocalHospital, MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdAdminPanelSettings, MdPerson } from 'react-icons/md'

export default function Login() {
  const [loginType, setLoginType] = useState('manager')
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const handleToggle = (type) => {
    setLoginType(type)
    if (type === 'admin') setForm({ email: 'amrithasekar27@gmail.com', password: 'amri@2006' })
    else setForm({ email: 'amritha@manager.com', password: 'amri@2006' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(form.email, form.password)
    if (result.success) { toast.success('Welcome back!'); navigate('/dashboard') }
    else toast.error(result.message)
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="text-center mb-4">
          <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, #0d6efd, #20c997)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <MdLocalHospital style={{ color: '#fff', fontSize: '1.8rem' }} />
          </div>
          <h4 className="fw-700" style={{ color: '#1e293b' }}>Welcome Back</h4>
          <p className="text-muted mb-0">Sign in to MediStock AI</p>
        </div>

        {/* Toggle */}
        <div className="d-flex mb-4" style={{ background: '#f1f5f9', borderRadius: 10, padding: 4 }}>
          <button type="button" onClick={() => handleToggle('admin')}
            className="btn w-50 py-2 d-flex align-items-center justify-content-center gap-2"
            style={{ borderRadius: 8, fontWeight: 600, fontSize: '0.875rem', border: 'none', background: loginType === 'admin' ? '#ef4444' : 'transparent', color: loginType === 'admin' ? '#fff' : '#64748b', transition: 'all 0.2s' }}>
            <MdAdminPanelSettings size={18} /> Admin
          </button>
          <button type="button" onClick={() => handleToggle('manager')}
            className="btn w-50 py-2 d-flex align-items-center justify-content-center gap-2"
            style={{ borderRadius: 8, fontWeight: 600, fontSize: '0.875rem', border: 'none', background: loginType === 'manager' ? '#0d6efd' : 'transparent', color: loginType === 'manager' ? '#fff' : '#64748b', transition: 'all 0.2s' }}>
            <MdPerson size={18} /> Manager
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-500" style={{ fontSize: '0.875rem' }}>Email Address</label>
            <div className="input-group">
              <span className="input-group-text"><MdEmail /></span>
              <input type="email" className="form-control" placeholder="Enter your email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
          </div>
          <div className="mb-4">
            <label className="form-label fw-500" style={{ fontSize: '0.875rem' }}>Password</label>
            <div className="input-group">
              <span className="input-group-text"><MdLock /></span>
              <input type={showPass ? 'text' : 'password'} className="form-control" placeholder="Enter your password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              <button type="button" className="input-group-text" onClick={() => setShowPass(!showPass)}>
                {showPass ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn w-100 py-2" disabled={loading}
            style={{ background: loginType === 'admin' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #0d6efd, #2563eb)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}>
            {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
            {loading ? 'Signing in...' : `Sign In as ${loginType === 'admin' ? 'Admin' : 'Manager'}`}
          </button>
        </form>

        {loginType === 'manager' && (
          <p className="text-center mt-3 mb-0" style={{ fontSize: '0.875rem' }}>
            Don't have an account? <Link to="/register" style={{ color: '#0d6efd', fontWeight: 600 }}>Register</Link>
          </p>
        )}
        <p className="text-center mt-2 mb-0" style={{ fontSize: '0.875rem' }}>
          <Link to="/" style={{ color: '#64748b' }}>← Back to Home</Link>
        </p>
      </div>
    </div>
  )
}
