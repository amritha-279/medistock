import { useState } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { MdPerson, MdEmail, MdPhone, MdSecurity, MdEdit, MdSave, MdLock } from 'react-icons/md'

export default function Profile() {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put('/auth/profile', form)
      toast.success('Profile updated successfully')
      setEditing(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed') }
    finally { setLoading(false) }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match')
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters')
    setPwLoading(true)
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      toast.success('Password changed successfully')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) { toast.error(err.response?.data?.message || 'Password change failed') }
    finally { setPwLoading(false) }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h4>My Profile</h4>
          <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>Manage your account settings</p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="chart-card text-center">
            <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg, #0d6efd, #20c997)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '2.5rem', color: '#fff', fontWeight: 700 }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h5 style={{ fontWeight: 700 }}>{user?.name}</h5>
            <p className="text-muted mb-2">{user?.email}</p>
            <span className="badge" style={{ background: user?.role === 'admin' ? '#eff6ff' : '#f0fdf4', color: user?.role === 'admin' ? '#0d6efd' : '#20c997', fontSize: '0.85rem', padding: '0.4rem 1rem', textTransform: 'capitalize' }}>
              {user?.role}
            </span>
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Member since</div>
              <div style={{ fontWeight: 600 }}>{new Date().getFullYear()}</div>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="chart-card mb-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h6 className="mb-0 d-flex align-items-center gap-2"><MdPerson /> Personal Information</h6>
              {!editing && <button className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1" onClick={() => setEditing(true)}><MdEdit /> Edit</button>}
            </div>
            {editing ? (
              <form onSubmit={handleProfileUpdate}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Full Name</label>
                    <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Phone</label>
                    <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input className="form-control" value={user?.email} disabled style={{ background: '#f8fafc' }} />
                    <small className="text-muted">Email cannot be changed</small>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Role</label>
                    <input className="form-control" value={user?.role} disabled style={{ background: '#f8fafc', textTransform: 'capitalize' }} />
                  </div>
                </div>
                <div className="d-flex gap-2 mt-3">
                  <button type="submit" className="btn btn-primary d-flex align-items-center gap-1" disabled={loading}>
                    <MdSave /> {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <div className="row g-3">
                {[
                  { icon: <MdPerson />, label: 'Full Name', value: user?.name },
                  { icon: <MdEmail />, label: 'Email', value: user?.email },
                  { icon: <MdPhone />, label: 'Phone', value: user?.phone || 'Not set' },
                  { icon: <MdSecurity />, label: 'Role', value: user?.role, capitalize: true },
                ].map((item, i) => (
                  <div key={i} className="col-md-6">
                    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '1rem' }}>
                      <div className="d-flex align-items-center gap-2 mb-1" style={{ color: '#64748b', fontSize: '0.8rem' }}>
                        {item.icon} {item.label}
                      </div>
                      <div style={{ fontWeight: 600, textTransform: item.capitalize ? 'capitalize' : 'none' }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="chart-card">
            <h6 className="mb-4 d-flex align-items-center gap-2"><MdLock /> Change Password</h6>
            <form onSubmit={handlePasswordChange}>
              <div className="mb-3">
                <label className="form-label">Current Password</label>
                <input type="password" className="form-control" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
              </div>
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <input type="password" className="form-control" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} required minLength={6} />
              </div>
              <div className="mb-3">
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="form-control" value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-warning" disabled={pwLoading}>
                {pwLoading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
