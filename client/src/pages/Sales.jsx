import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import api from '../services/api'
import { MdAdd, MdSearch, MdReceipt, MdDelete } from 'react-icons/md'

export default function Sales() {
  const [sales, setSales] = useState([])
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showInvoice, setShowInvoice] = useState(null)
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [form, setForm] = useState({ customerName: '', customerPhone: '', paymentMethod: 'cash', discount: 0, notes: '', items: [{ medicineId: '', quantity: 1, unitPrice: 0 }] })

  const fetchSales = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (search) params.search = search
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate
      const { data } = await api.get('/sales', { params })
      setSales(data.data); setPagination({ total: data.total, pages: data.pages })
    } catch { toast.error('Failed to load sales') }
    finally { setLoading(false) }
  }, [page, search, startDate, endDate])

  useEffect(() => { fetchSales() }, [fetchSales])
  useEffect(() => { api.get('/medicines?limit=200').then(r => setMedicines(r.data.data)).catch(() => {}) }, [])

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { medicineId: '', quantity: 1, unitPrice: 0 }] }))
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))

  const updateItem = (i, field, value) => {
    const items = [...form.items]
    items[i][field] = value
    if (field === 'medicineId') {
      const med = medicines.find(m => m.id === parseInt(value))
      if (med) items[i].unitPrice = parseFloat(med.sellingPrice)
    }
    setForm(f => ({ ...f, items }))
  }

  const getTotal = () => form.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const getNet = () => getTotal() - parseFloat(form.discount || 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.items.some(i => !i.medicineId || i.quantity < 1)) return toast.error('Fill all item details')
    try {
      await api.post('/sales', { ...form, items: form.items.map(i => ({ ...i, medicineId: parseInt(i.medicineId), quantity: parseInt(i.quantity) })) })
      toast.success('Sale recorded successfully')
      setShowModal(false)
      setForm({ customerName: '', customerPhone: '', paymentMethod: 'cash', discount: 0, notes: '', items: [{ medicineId: '', quantity: 1, unitPrice: 0 }] })
      fetchSales()
    } catch (err) { toast.error(err.response?.data?.message || 'Sale failed') }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h4>Sales Management</h4>
          <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>Record and manage medicine sales</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setShowModal(true)}>
          <MdAdd size={18} /> New Sale
        </button>
      </div>

      {/* Filters */}
      <div className="chart-card mb-3">
        <div className="row g-2">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text"><MdSearch /></span>
              <input className="form-control" placeholder="Search invoice or customer..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
            </div>
          </div>
          <div className="col-md-3">
            <input type="date" className="form-control" value={startDate} onChange={e => setStartDate(e.target.value)} placeholder="Start Date" />
          </div>
          <div className="col-md-3">
            <input type="date" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} placeholder="End Date" />
          </div>
          <div className="col-md-2">
            <button className="btn btn-outline-secondary w-100" onClick={() => { setSearch(''); setStartDate(''); setEndDate(''); setPage(1) }}>Clear</button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        <div className="p-3 border-bottom">
          <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{pagination.total || 0} sales records</span>
        </div>
        {loading ? <div className="text-center py-5"><div className="spinner-border text-primary" /></div> : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr><th>Invoice</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Discount</th><th>Net</th><th>Payment</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {sales.length === 0 ? <tr><td colSpan={9} className="text-center py-4 text-muted">No sales found</td></tr>
                  : sales.map(sale => (
                    <tr key={sale.id}>
                      <td><span style={{ fontWeight: 600, color: '#0d6efd', fontSize: '0.8rem' }}>{sale.invoiceNumber}</span></td>
                      <td style={{ fontSize: '0.875rem' }}>{sale.customerName || 'Walk-in'}</td>
                      <td style={{ fontSize: '0.8rem' }}>{new Date(sale.saleDate).toLocaleDateString('en-IN')}</td>
                      <td><span className="badge bg-secondary">{sale.items?.length || 0}</span></td>
                      <td>₹{parseFloat(sale.totalAmount).toFixed(2)}</td>
                      <td>₹{parseFloat(sale.discount).toFixed(2)}</td>
                      <td style={{ fontWeight: 600, color: '#20c997' }}>₹{parseFloat(sale.netAmount).toFixed(2)}</td>
                      <td><span className="badge bg-info text-dark">{sale.paymentMethod}</span></td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => setShowInvoice(sale)}><MdReceipt /></button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
        {pagination.pages > 1 && (
          <div className="d-flex justify-content-center p-3 gap-2">
            <button className="btn btn-sm btn-outline-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
            <span className="btn btn-sm btn-primary">{page}</span>
            <button className="btn btn-sm btn-outline-secondary" disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        )}
      </div>

      {/* New Sale Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, zIndex: 1055, overflowY: 'auto' }}>
          <div className="modal-dialog modal-lg" style={{ margin: '1.75rem auto' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">New Sale</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Customer Name</label>
                      <input className="form-control" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} placeholder="Walk-in customer" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Customer Phone</label>
                      <input className="form-control" value={form.customerPhone} onChange={e => setForm({ ...form, customerPhone: e.target.value })} />
                    </div>
                  </div>

                  <h6 className="mb-2">Sale Items</h6>
                  {form.items.map((item, i) => (
                    <div key={i} className="row g-2 mb-2 align-items-end">
                      <div className="col-md-5">
                        <select className="form-select form-select-sm" value={item.medicineId} onChange={e => updateItem(i, 'medicineId', e.target.value)} required>
                          <option value="">Select Medicine</option>
                          {medicines.map(m => <option key={m.id} value={m.id}>{m.name} (Stock: {m.currentStock})</option>)}
                        </select>
                      </div>
                      <div className="col-md-2">
                        <input type="number" className="form-control form-control-sm" min={1} value={item.quantity} onChange={e => updateItem(i, 'quantity', parseInt(e.target.value))} placeholder="Qty" required />
                      </div>
                      <div className="col-md-3">
                        <input type="number" step="0.01" className="form-control form-control-sm" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', parseFloat(e.target.value))} placeholder="Price" />
                      </div>
                      <div className="col-md-2">
                        <div className="d-flex gap-1">
                          <span className="form-control form-control-sm text-center" style={{ background: '#f8fafc' }}>₹{(item.quantity * item.unitPrice).toFixed(0)}</span>
                          {form.items.length > 1 && <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeItem(i)}><MdDelete /></button>}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn btn-sm btn-outline-primary mb-3" onClick={addItem}><MdAdd /> Add Item</button>

                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Payment Method</label>
                      <select className="form-select" value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="upi">UPI</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Discount (₹)</label>
                      <input type="number" step="0.01" className="form-control" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Net Amount</label>
                      <input className="form-control" readOnly value={`₹${getNet().toFixed(2)}`} style={{ background: '#f0fdf4', fontWeight: 700, color: '#20c997' }} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <div className="me-auto">
                    <strong>Total: ₹{getTotal().toFixed(2)}</strong>
                    <span className="text-muted ms-2">| Net: ₹{getNet().toFixed(2)}</span>
                  </div>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Record Sale</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoice && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, zIndex: 1055, overflowY: 'auto' }}>
          <div className="modal-dialog" style={{ margin: '1.75rem auto' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Invoice — {showInvoice.invoiceNumber}</h5>
                <button className="btn-close" onClick={() => setShowInvoice(null)} />
              </div>
              <div className="modal-body">
                <div className="text-center mb-3">
                  <h5 style={{ color: '#0d6efd' }}>MediStock AI Pharmacy</h5>
                  <small className="text-muted">Invoice #{showInvoice.invoiceNumber}</small>
                </div>
                <div className="row mb-3">
                  <div className="col-6"><small className="text-muted">Customer</small><div>{showInvoice.customerName || 'Walk-in'}</div></div>
                  <div className="col-6 text-end"><small className="text-muted">Date</small><div>{new Date(showInvoice.saleDate).toLocaleDateString('en-IN')}</div></div>
                </div>
                <table className="table table-sm">
                  <thead><tr><th>Medicine</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
                  <tbody>
                    {showInvoice.items?.map(item => (
                      <tr key={item.id}>
                        <td>{item.medicine?.name}</td>
                        <td>{item.quantity}</td>
                        <td>₹{parseFloat(item.unitPrice).toFixed(2)}</td>
                        <td>₹{parseFloat(item.totalPrice).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-end">
                  <div>Subtotal: ₹{parseFloat(showInvoice.totalAmount).toFixed(2)}</div>
                  <div>Discount: -₹{parseFloat(showInvoice.discount).toFixed(2)}</div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#20c997' }}>Net: ₹{parseFloat(showInvoice.netAmount).toFixed(2)}</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>Payment: {showInvoice.paymentMethod?.toUpperCase()}</div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowInvoice(null)}>Close</button>
                <button className="btn btn-primary" onClick={() => window.print()}>Print</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
