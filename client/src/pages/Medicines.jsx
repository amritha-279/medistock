import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import api from '../services/api'
import { MdAdd, MdEdit, MdDelete, MdSearch, MdFilterList, MdMedication } from 'react-icons/md'

const EMPTY_FORM = { name: '', genericName: '', category: '', manufacturer: '', batchNumber: '', purchaseDate: '', expiryDate: '', purchasePrice: '', sellingPrice: '', currentStock: '', minStockLevel: 10, unit: 'tablets', supplierId: '', description: '' }

const CATEGORIES = ['Analgesic', 'Antibiotic', 'Antidiabetic', 'Antihistamine', 'Cardiovascular', 'Gastrointestinal', 'Respiratory', 'Supplement', 'Thyroid', 'Other']

export default function Medicines() {
  const [medicines, setMedicines] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [expiryFilter, setExpiryFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})

  const fetchMedicines = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (search) params.search = search
      if (category) params.category = category
      if (expiryFilter) params.expiryFilter = expiryFilter
      const { data } = await api.get('/medicines', { params })
      setMedicines(data.data)
      setPagination({ total: data.total, pages: data.pages })
    } catch { toast.error('Failed to load medicines') }
    finally { setLoading(false) }
  }, [page, search, category, expiryFilter])

  useEffect(() => { fetchMedicines() }, [fetchMedicines])
  useEffect(() => { api.get('/suppliers?limit=100').then(r => setSuppliers(r.data.data)).catch(() => {}) }, [])

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true) }
  const formatDate = (d) => d ? d.toString().split('T')[0] : ''
  const openEdit = (med) => {
    setEditItem(med)
    setForm({ ...med, supplierId: med.supplierId || '', purchaseDate: formatDate(med.purchaseDate), expiryDate: formatDate(med.expiryDate) })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Clean up form - remove empty strings for optional fields
      const payload = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== '' && v !== null && v !== undefined))
      if (editItem) { await api.put(`/medicines/${editItem.id}`, payload); toast.success('Medicine updated') }
      else { await api.post('/medicines', payload); toast.success('Medicine added') }
      setShowModal(false); fetchMedicines()
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed') }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return
    try { await api.delete(`/medicines/${id}`); toast.success('Medicine deleted'); fetchMedicines() }
    catch { toast.error('Delete failed') }
  }

  const getDaysToExpiry = (date) => Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))

  const getExpiryBadge = (date) => {
    const days = getDaysToExpiry(date)
    if (days < 0) return <span className="badge bg-danger">Expired</span>
    if (days <= 30) return <span className="badge bg-danger">{days}d</span>
    if (days <= 90) return <span className="badge bg-warning text-dark">{days}d</span>
    return <span className="badge bg-success">{days}d</span>
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h4>Medicine Management</h4>
          <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>Manage your pharmacy inventory</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={openAdd}>
          <MdAdd size={18} /> Add Medicine
        </button>
      </div>

      {/* Filters */}
      <div className="chart-card mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text"><MdSearch /></span>
              <input className="form-control" placeholder="Search medicines..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
            </div>
          </div>
          <div className="col-md-3">
            <select className="form-select" value={category} onChange={e => { setCategory(e.target.value); setPage(1) }}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select" value={expiryFilter} onChange={e => { setExpiryFilter(e.target.value); setPage(1) }}>
              <option value="">All Expiry Status</option>
              <option value="near">Near Expiry (90 days)</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div className="col-md-2">
            <button className="btn btn-outline-secondary w-100" onClick={() => { setSearch(''); setCategory(''); setExpiryFilter(''); setPage(1) }}>
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{pagination.total || 0} medicines found</span>
        </div>
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>#</th><th>Medicine</th><th>Category</th><th>Batch</th>
                  <th>Stock</th><th>Expiry</th><th>Price</th><th>Supplier</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {medicines.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-4 text-muted">No medicines found</td></tr>
                ) : medicines.map((med, i) => (
                  <tr key={med.id}>
                    <td>{(page - 1) * 10 + i + 1}</td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{med.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{med.genericName}</div>
                    </td>
                    <td><span className="badge" style={{ background: '#eff6ff', color: '#0d6efd' }}>{med.category}</span></td>
                    <td style={{ fontSize: '0.8rem' }}>{med.batchNumber}</td>
                    <td>
                      <span className={`badge ${med.currentStock <= med.minStockLevel ? 'bg-danger' : 'bg-success'}`}>
                        {med.currentStock}
                      </span>
                    </td>
                    <td>{getExpiryBadge(med.expiryDate)}</td>
                    <td style={{ fontSize: '0.85rem' }}>₹{parseFloat(med.sellingPrice).toFixed(2)}</td>
                    <td style={{ fontSize: '0.8rem' }}>{med.supplier?.name || '—'}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(med)}><MdEdit /></button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(med.id, med.name)}><MdDelete /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="d-flex justify-content-center p-3 gap-2">
            <button className="btn btn-sm btn-outline-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="btn btn-sm btn-outline-secondary" disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, zIndex: 1055, overflowY: 'auto' }}>
          <div className="modal-dialog modal-lg" style={{ margin: '1.75rem auto' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editItem ? 'Edit Medicine' : 'Add Medicine'}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Medicine Name *</label>
                      <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Generic Name</label>
                      <input className="form-control" value={form.genericName} onChange={e => setForm({ ...form, genericName: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Category *</label>
                      <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                        <option value="">Select Category</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Manufacturer</label>
                      <input className="form-control" value={form.manufacturer} onChange={e => setForm({ ...form, manufacturer: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Batch Number</label>
                      <input className="form-control" value={form.batchNumber} onChange={e => setForm({ ...form, batchNumber: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Unit</label>
                      <select className="form-select" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                        {['tablets', 'capsules', 'syrup', 'injection', 'cream', 'drops', 'powder'].map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Purchase Date</label>
                      <input type="date" className="form-control" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Expiry Date *</label>
                      <input type="date" className="form-control" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Purchase Price (₹) *</label>
                      <input type="number" step="0.01" className="form-control" value={form.purchasePrice} onChange={e => setForm({ ...form, purchasePrice: e.target.value })} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Selling Price (₹) *</label>
                      <input type="number" step="0.01" className="form-control" value={form.sellingPrice} onChange={e => setForm({ ...form, sellingPrice: e.target.value })} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Current Stock *</label>
                      <input type="number" className="form-control" value={form.currentStock} onChange={e => setForm({ ...form, currentStock: e.target.value })} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Min Stock Level</label>
                      <input type="number" className="form-control" value={form.minStockLevel} onChange={e => setForm({ ...form, minStockLevel: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Supplier</label>
                      <select className="form-select" value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })}>
                        <option value="">Select Supplier</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description</label>
                      <textarea className="form-control" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editItem ? 'Update' : 'Add Medicine'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
