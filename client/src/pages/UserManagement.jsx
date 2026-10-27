import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { MdPersonAdd, MdEdit, MdDelete, MdLockReset, MdToggleOn, MdToggleOff } from 'react-icons/md'
import api from '../services/api'

const EMPTY = { name: '', email: '', password: '', phone: '' }

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [resetUser, setResetUser] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [newPassword, setNewPassword] = useState('')

  const load = async () => {
    try {
      const { data } = await api.get('/users')
      setUsers(data.data)
    } catch { toast.error('Failed to load managers') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true) }
  const openEdit = (u) => { setEditing(u); setForm({ name: u.name, email: u.email, password: '', phone: u.phone || '' }); setShowModal(true) }
  const openReset = (u) => { setResetUser(u); setNewPassword(''); setShowResetModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`/users/${editing.id}`, { name: form.name, phone: form.phone })
        toast.success('Manager updated')
      } else {
        await api.post('/users', form)
        toast.success('Manager created')
      }
      setShowModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this manager?')) return
    try {
      await api.delete(`/users/${id}`)
      toast.success('Manager deleted'); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete') }
  }

  const handleToggleActive = async (u) => {
    try {
      await api.put(`/users/${u.id}`, { name: u.name, phone: u.phone, isActive: !u.isActive })
      toast.success(`Manager ${!u.isActive ? 'activated' : 'deactivated'}`); load()
    } catch { toast.error('Failed to update status') }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/users/${resetUser.id}/reset-password`, { password: newPassword })
      toast.success('Password reset successfully'); setShowResetModal(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to reset password') }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h4>User Management</h4>
          <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>Manage pharmacy managers</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={openAdd}>
          <MdPersonAdd /> Add Manager
        </button>
      </div>

      <div className="chart-card">
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-4">No managers found</td></tr>}
                {users.map((u, i) => (
                  <tr key={u.id}>
                    <td>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #20c997, #0d6efd)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        {u.name}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.875rem' }}>{u.email}</td>
                    <td style={{ fontSize: '0.875rem' }}>{u.phone || '—'}</td>
                    <td>
                      <span className={`badge ${u.isActive ? 'bg-success' : 'bg-secondary'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button className="btn btn-sm btn-outline-primary" title="Edit" onClick={() => openEdit(u)}><MdEdit /></button>
                        <button className="btn btn-sm btn-outline-warning" title="Reset Password" onClick={() => openReset(u)}><MdLockReset /></button>
                        <button className={`btn btn-sm ${u.isActive ? 'btn-outline-secondary' : 'btn-outline-success'}`} title={u.isActive ? 'Deactivate' : 'Activate'} onClick={() => handleToggleActive(u)}>
                          {u.isActive ? <MdToggleOff /> : <MdToggleOn />}
                        </button>
                        <button className="btn btn-sm btn-outline-danger" title="Delete" onClick={() => handleDelete(u.id)}><MdDelete /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, zIndex: 1055, overflowY: 'auto' }}>
          <div className="modal-dialog" style={{ margin: '1.75rem auto' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editing ? 'Edit Manager' : 'Add Manager'}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required disabled={!!editing} />
                  </div>
                  {!editing && (
                    <div className="mb-3">
                      <label className="form-label">Password</label>
                      <input type="password" className="form-control" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, zIndex: 1055, overflowY: 'auto' }}>
          <div className="modal-dialog" style={{ margin: '1.75rem auto' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reset Password — {resetUser?.name}</h5>
                <button className="btn-close" onClick={() => setShowResetModal(false)} />
              </div>
              <form onSubmit={handleResetPassword}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input type="password" className="form-control" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} placeholder="Min 6 characters" />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowResetModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-warning">Reset Password</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
