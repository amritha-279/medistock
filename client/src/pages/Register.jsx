import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import { MdLocalHospital, MdPerson, MdEmail, MdLock, MdPhone } from 'react-icons/md'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', role: 'manager' })
  // role is always manager for public registration
  const { register, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    const result = await register({ name: form.name, email: form.email, password: form.password, phone: form.phone, role: form.role })
    if (result.success) { toast.success('Account created!'); navigate('/dashboard') }
    else toast.error(result.message)
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: 500 }}>
        <div className="text-center mb-4">
          <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, #0d6efd, #20c997)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <MdLocalHospital style={{ color: '#fff', fontSize: '1.8rem' }} />
          </div>
          <h4 className="fw-700" style={{ color: '#1e293b' }}>Create Account</h4>
          <p className="text-muted mb-0">Join MediStock AI</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label fw-500" style={{ fontSize: '0.875rem' }}>Full Name</label>
              <div className="input-group">
                <span className="input-group-text"><MdPerson /></span>
                <input type="text" className="form-control" placeholder="Your full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
            </div>
            <div className="col-12">
              <label className="form-label fw-500" style={{ fontSize: '0.875rem' }}>Email Address</label>
              <div className="input-group">
                <span className="input-group-text"><MdEmail /></span>
                <input type="email" className="form-control" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-500" style={{ fontSize: '0.875rem' }}>Phone</label>
              <div className="input-group">
                <span className="input-group-text"><MdPhone /></span>
                <input type="tel" className="form-control" placeholder="Phone number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-500" style={{ fontSize: '0.875rem' }}>Role</label>
              <input className="form-control" value="Manager" disabled style={{ background: '#f1f5f9', color: '#64748b' }} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-500" style={{ fontSize: '0.875rem' }}>Password</label>
              <div className="input-group">
                <span className="input-group-text"><MdLock /></span>
                <input type="password" className="form-control" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-500" style={{ fontSize: '0.875rem' }}>Confirm Password</label>
              <div className="input-group">
                <span className="input-group-text"><MdLock /></span>
                <input type="password" className="form-control" placeholder="Confirm" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-100 py-2 mt-4" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-3 mb-0" style={{ fontSize: '0.875rem' }}>
          Already have an account? <Link to="/login" style={{ color: '#0d6efd', fontWeight: 600 }}>Sign In</Link>
        </p>
        <p className="text-center mt-2 mb-0" style={{ fontSize: '0.875rem' }}>
          <Link to="/" style={{ color: '#64748b' }}>← Back to Home</Link>
        </p>
      </div>
    </div>
  )
}
