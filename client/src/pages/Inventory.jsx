import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { MdInventory, MdWarning, MdTrendingDown, MdEdit } from 'react-icons/md'
import api from '../services/api'

const TABS = ['current', 'low_stock', 'near_expiry']

export default function Inventory() {
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('current')
  const [stockModal, setStockModal] = useState(null)
  const [newStock, setNewStock] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/medicines?limit=200')
      setMedicines(data.data)
    } catch { toast.error('Failed to load inventory') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleUpdateStock = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/medicines/${stockModal.id}`, { currentStock: parseInt(newStock) })
      toast.success('Stock updated')
      setStockModal(null)
      load()
    } catch { toast.error('Failed to update stock') }
  }

  const today = new Date()
  const in90 = new Date(); in90.setDate(today.getDate() + 90)

  const lowStock = medicines.filter(m => m.currentStock <= m.minStockLevel)
  const nearExpiry = medicines.filter(m => new Date(m.expiryDate) <= in90 && new Date(m.expiryDate) >= today)
  const overstock = medicines.filter(m => m.currentStock > m.minStockLevel * 3)

  const displayed = tab === 'low_stock' ? lowStock : tab === 'near_expiry' ? nearExpiry : medicines

  const getDaysToExpiry = (date) => Math.ceil((new Date(date) - today) / (1000 * 60 * 60 * 24))

  return (
    <div>
      <div className="page-header">
        <div>
          <h4>Inventory Management</h4>
          <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>Monitor and manage stock levels</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Medicines', value: medicines.length, icon: <MdInventory />, color: '#0d6efd', bg: '#eff6ff' },
          { label: 'Low Stock', value: lowStock.length, icon: <MdTrendingDown />, color: '#f97316', bg: '#fff7ed' },
          { label: 'Near Expiry', value: nearExpiry.length, icon: <MdWarning />, color: '#ef4444', bg: '#fef2f2' },
          { label: 'Overstock', value: overstock.length, icon: <MdInventory />, color: '#8b5cf6', bg: '#f5f3ff' },
        ].map((c, i) => (
          <div key={i} className="col-6 col-md-3">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
              <div className="stat-value mt-2">{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-3">
        <button className={`btn btn-sm ${tab === 'current' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setTab('current')}>All Inventory ({medicines.length})</button>
        <button className={`btn btn-sm ${tab === 'low_stock' ? 'btn-danger' : 'btn-outline-danger'}`} onClick={() => setTab('low_stock')}>Low Stock ({lowStock.length})</button>
        <button className={`btn btn-sm ${tab === 'near_expiry' ? 'btn-warning' : 'btn-outline-warning'}`} onClick={() => setTab('near_expiry')}>Near Expiry ({nearExpiry.length})</button>
      </div>

      <div className="table-card">
        {loading ? <div className="text-center py-5"><div className="spinner-border text-primary" /></div> : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr><th>Medicine</th><th>Category</th><th>Current Stock</th><th>Min Stock</th><th>Status</th><th>Expiry</th><th>Update Stock</th></tr>
              </thead>
              <tbody>
                {displayed.length === 0 && <tr><td colSpan={7} className="text-center py-4 text-muted">No medicines found</td></tr>}
                {displayed.map(m => {
                  const days = getDaysToExpiry(m.expiryDate)
                  return (
                    <tr key={m.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{m.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{m.genericName}</div>
                      </td>
                      <td><span className="badge" style={{ background: '#eff6ff', color: '#0d6efd' }}>{m.category}</span></td>
                      <td>
                        <span className={`badge ${m.currentStock <= m.minStockLevel ? 'bg-danger' : m.currentStock <= m.minStockLevel * 2 ? 'bg-warning text-dark' : 'bg-success'}`}>
                          {m.currentStock} {m.unit}
                        </span>
                      </td>
                      <td>{m.minStockLevel}</td>
                      <td>
                        {m.currentStock <= m.minStockLevel
                          ? <span className="badge bg-danger">Low Stock</span>
                          : m.currentStock > m.minStockLevel * 3
                          ? <span className="badge bg-info text-dark">Overstock</span>
                          : <span className="badge bg-success">Normal</span>}
                      </td>
                      <td>
                        <span className={`badge ${days < 0 ? 'bg-danger' : days <= 30 ? 'bg-danger' : days <= 90 ? 'bg-warning text-dark' : 'bg-success'}`}>
                          {days < 0 ? 'Expired' : `${days}d`}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => { setStockModal(m); setNewStock(m.currentStock) }}>
                          <MdEdit size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update Stock Modal */}
      {stockModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, zIndex: 1055, overflowY: 'auto' }}>
          <div className="modal-dialog" style={{ margin: '1.75rem auto' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Stock — {stockModal.name}</h5>
                <button className="btn-close" onClick={() => setStockModal(null)} />
              </div>
              <form onSubmit={handleUpdateStock}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Current Stock: <strong>{stockModal.currentStock} {stockModal.unit}</strong></label>
                    <input type="number" className="form-control" value={newStock} onChange={e => setNewStock(e.target.value)} min={0} required />
                  </div>
                  <small className="text-muted">Min stock level: {stockModal.minStockLevel}</small>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setStockModal(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Update Stock</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
