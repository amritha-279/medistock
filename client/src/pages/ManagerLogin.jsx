import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdPerson } from 'react-icons/md'

export default function ManagerLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(form.email, form.password)
    if (result.success) { toast.success('Welcome!'); navigate('/dashboard') }
    else toast.error(result.message)
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="text-center mb-4">
          <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, #0d6efd, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <MdPerson style={{ color: '#fff', fontSize: '1.8rem' }} />
          </div>
          <h4 className="fw-700" style={{ color: '#1e293b' }}>Manager Login</h4>
          <p className="text-muted mb-0">Sign in to MediStock AI as Manager</p>
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
            style={{ background: 'linear-gradient(135deg, #0d6efd, #2563eb)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}>
            {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
            {loading ? 'Signing in...' : 'Sign In as Manager'}
          </button>
        </form>

        <p className="text-center mt-3 mb-0" style={{ fontSize: '0.875rem' }}>
          Don't have an account? <Link to="/register" style={{ color: '#0d6efd', fontWeight: 600 }}>Register</Link>
        </p>
        <p className="text-center mt-2 mb-0" style={{ fontSize: '0.875rem' }}>
          <Link to="/login" style={{ color: '#64748b' }}>← Back to Login</Link>
        </p>
      </div>
    </div>
  )
}
