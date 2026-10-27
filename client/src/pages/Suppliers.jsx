import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import api from '../services/api'
import { MdAdd, MdEdit, MdDelete, MdSearch, MdBusiness } from 'react-icons/md'

const EMPTY = { name: '', contactPerson: '', email: '', phone: '', address: '', city: '' }

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})

  const fetchSuppliers = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (search) params.search = search
      const { data } = await api.get('/suppliers', { params })
      setSuppliers(data.data); setPagination({ total: data.total, pages: data.pages })
    } catch { toast.error('Failed to load suppliers') }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { fetchSuppliers() }, [fetchSuppliers])

  const openAdd = () => { setEditItem(null); setForm(EMPTY); setShowModal(true) }
  const openEdit = (s) => { setEditItem(s); setForm(s); setShowModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editItem) { await api.put(`/suppliers/${editItem.id}`, form); toast.success('Supplier updated') }
      else { await api.post('/suppliers', form); toast.success('Supplier added') }
      setShowModal(false); fetchSuppliers()
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed') }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete supplier ${name}?`)) return
    try { await api.delete(`/suppliers/${id}`); toast.success('Supplier deleted'); fetchSuppliers() }
    catch { toast.error('Delete failed') }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h4>Supplier Management</h4>
          <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>Manage your medicine suppliers</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={openAdd}>
          <MdAdd size={18} /> Add Supplier
        </button>
      </div>

      <div className="chart-card mb-3">
        <div className="row g-2">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text"><MdSearch /></span>
              <input className="form-control" placeholder="Search suppliers..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
            </div>
          </div>
          <div className="col-md-2">
            <button className="btn btn-outline-secondary w-100" onClick={() => { setSearch(''); setPage(1) }}>Clear</button>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {loading ? <div className="col-12 text-center py-5"><div className="spinner-border text-primary" /></div>
          : suppliers.length === 0 ? <div className="col-12 text-center py-5 text-muted">No suppliers found</div>
          : suppliers.map(s => (
            <div key={s.id} className="col-md-6 col-lg-4">
              <div className="stat-card h-100">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d6efd', fontSize: '1.3rem' }}>
                      <MdBusiness />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{s.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.city}</div>
                    </div>
                  </div>
                  <div className="d-flex gap-1">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(s)}><MdEdit /></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(s.id, s.name)}><MdDelete /></button>
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                  {s.contactPerson && <div>👤 {s.contactPerson}</div>}
                  {s.phone && <div>📞 {s.phone}</div>}
                  {s.email && <div>✉️ {s.email}</div>}
                  {s.address && <div className="text-muted mt-1" style={{ fontSize: '0.8rem' }}>📍 {s.address}</div>}
                </div>
              </div>
            </div>
          ))}
      </div>

      {pagination.pages > 1 && (
        <div className="d-flex justify-content-center mt-3 gap-2">
          <button className="btn btn-sm btn-outline-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
          <span className="btn btn-sm btn-primary">{page} / {pagination.pages}</span>
          <button className="btn btn-sm btn-outline-secondary" disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}

      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, zIndex: 1055, overflowY: 'auto' }}>
          <div className="modal-dialog" style={{ margin: '1.75rem auto' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editItem ? 'Edit Supplier' : 'Add Supplier'}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Company Name *</label>
                      <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Contact Person</label>
                      <input className="form-control" value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone</label>
                      <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">City</label>
                      <input className="form-control" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Address</label>
                      <textarea className="form-control" rows={2} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editItem ? 'Update' : 'Add Supplier'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
