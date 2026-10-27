import { useState } from 'react'
import { Bar, Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { toast } from 'react-toastify'
import api from '../services/api'
import { MdAssessment, MdDownload, MdInventory, MdPointOfSale, MdWarning, MdTrendingUp } from 'react-icons/md'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend)

const REPORT_TYPES = [
  { key: 'inventory', label: 'Inventory Report', icon: <MdInventory />, color: '#0d6efd', bg: '#eff6ff' },
  { key: 'sales', label: 'Sales Report', icon: <MdPointOfSale />, color: '#20c997', bg: '#f0fdf4' },
  { key: 'expiry', label: 'Expiry Report', icon: <MdWarning />, color: '#f97316', bg: '#fff7ed' },
  { key: 'demand', label: 'Demand Report', icon: <MdTrendingUp />, color: '#8b5cf6', bg: '#f5f3ff' },
]

export default function Reports() {
  const [activeReport, setActiveReport] = useState(null)
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const loadReport = async (type) => {
    setLoading(true); setActiveReport(type)
    try {
      const params = {}
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate
      const { data } = await api.get(`/reports/${type}`, { params })
      setReportData(data)
    } catch { toast.error('Failed to load report') }
    finally { setLoading(false) }
  }

  const exportCSV = () => {
    if (!reportData) return
    let rows = []
    if (activeReport === 'inventory') {
      rows = [['Name', 'Category', 'Stock', 'Expiry', 'Price', 'Supplier']]
      reportData.data?.forEach(m => rows.push([m.name, m.category, m.currentStock, m.expiryDate, m.sellingPrice, m.supplier?.name || '']))
    } else if (activeReport === 'sales') {
      rows = [['Invoice', 'Customer', 'Date', 'Total', 'Net', 'Payment']]
      reportData.data?.forEach(s => rows.push([s.invoiceNumber, s.customerName, s.saleDate, s.totalAmount, s.netAmount, s.paymentMethod]))
    } else if (activeReport === 'demand') {
      rows = [['Medicine', 'Category', 'Total Sold', 'Revenue', 'Current Stock']]
      reportData.data?.forEach(d => rows.push([d.medicine?.name, d.medicine?.category, d.dataValues?.totalSold || d.totalSold, d.dataValues?.revenue || d.revenue, d.medicine?.currentStock]))
    }
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${activeReport}_report.csv`; a.click()
    toast.success('CSV exported!')
  }

  const demandChartData = activeReport === 'demand' && reportData ? {
    labels: reportData.data?.slice(0, 10).map(d => d.medicine?.name?.split(' ').slice(0, 2).join(' ')),
    datasets: [{
      label: 'Units Sold',
      data: reportData.data?.slice(0, 10).map(d => parseInt(d.totalSold || 0)),
      backgroundColor: 'rgba(139,92,246,0.7)', borderRadius: 8
    }]
  } : null

  return (
    <div>
      <div className="page-header">
        <div>
          <h4>Reports & Analytics</h4>
          <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>Generate comprehensive pharmacy reports</p>
        </div>
        {reportData && (
          <button className="btn btn-success d-flex align-items-center gap-2" onClick={exportCSV}>
            <MdDownload /> Export CSV
          </button>
        )}
      </div>

      {/* Date Filter */}
      <div className="chart-card mb-4">
        <div className="row g-2 align-items-end">
          <div className="col-md-3">
            <label className="form-label mb-1" style={{ fontSize: '0.8rem' }}>Start Date</label>
            <input type="date" className="form-control form-control-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="col-md-3">
            <label className="form-label mb-1" style={{ fontSize: '0.8rem' }}>End Date</label>
            <input type="date" className="form-control form-control-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Report Type Cards */}
      <div className="row g-3 mb-4">
        {REPORT_TYPES.map(r => (
          <div key={r.key} className="col-md-6 col-lg-3">
            <div className={`stat-card cursor-pointer ${activeReport === r.key ? 'border-2' : ''}`} style={{ cursor: 'pointer', borderColor: activeReport === r.key ? r.color : '#e2e8f0', borderWidth: activeReport === r.key ? 2 : 1 }} onClick={() => loadReport(r.key)}>
              <div className="d-flex align-items-center gap-3">
                <div style={{ width: 48, height: 48, borderRadius: 12, background: r.bg, color: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>{r.icon}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.label}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Click to generate</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Content */}
      {loading && <div className="text-center py-5"><div className="spinner-border text-primary" /><p className="mt-2 text-muted">Generating report...</p></div>}

      {!loading && reportData && (
        <div className="chart-card">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h6 className="mb-0">{REPORT_TYPES.find(r => r.key === activeReport)?.label}</h6>
            <span className="badge bg-secondary">{new Date().toLocaleDateString('en-IN')}</span>
          </div>

          {/* Inventory Report */}
          {activeReport === 'inventory' && (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead><tr><th>#</th><th>Medicine</th><th>Category</th><th>Stock</th><th>Min Stock</th><th>Expiry</th><th>Price</th><th>Supplier</th></tr></thead>
                <tbody>
                  {reportData.data?.map((m, i) => (
                    <tr key={m.id}>
                      <td>{i + 1}</td>
                      <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>{m.name}</td>
                      <td><span className="badge" style={{ background: '#eff6ff', color: '#0d6efd' }}>{m.category}</span></td>
                      <td><span className={`badge ${m.currentStock <= m.minStockLevel ? 'bg-danger' : 'bg-success'}`}>{m.currentStock}</span></td>
                      <td>{m.minStockLevel}</td>
                      <td style={{ fontSize: '0.8rem' }}>{new Date(m.expiryDate).toLocaleDateString('en-IN')}</td>
                      <td>₹{parseFloat(m.sellingPrice).toFixed(2)}</td>
                      <td style={{ fontSize: '0.8rem' }}>{m.supplier?.name || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Sales Report */}
          {activeReport === 'sales' && (
            <div>
              {reportData.summary && (
                <div className="row g-3 mb-4">
                  {[
                    { label: 'Total Revenue', value: `₹${parseFloat(reportData.summary?.totalRevenue || 0).toFixed(2)}`, color: '#20c997' },
                    { label: 'Total Sales', value: reportData.summary?.totalSales || 0, color: '#0d6efd' },
                    { label: 'Avg Sale Value', value: `₹${parseFloat(reportData.summary?.avgSaleValue || 0).toFixed(2)}`, color: '#8b5cf6' },
                  ].map((s, i) => (
                    <div key={i} className="col-md-4">
                      <div style={{ background: '#f8fafc', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead><tr><th>Invoice</th><th>Customer</th><th>Date</th><th>Total</th><th>Net</th><th>Payment</th></tr></thead>
                  <tbody>
                    {reportData.data?.map(s => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600, color: '#0d6efd', fontSize: '0.8rem' }}>{s.invoiceNumber}</td>
                        <td>{s.customerName || 'Walk-in'}</td>
                        <td style={{ fontSize: '0.8rem' }}>{new Date(s.saleDate).toLocaleDateString('en-IN')}</td>
                        <td>₹{parseFloat(s.totalAmount).toFixed(2)}</td>
                        <td style={{ fontWeight: 600, color: '#20c997' }}>₹{parseFloat(s.netAmount).toFixed(2)}</td>
                        <td><span className="badge bg-info text-dark">{s.paymentMethod}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Expiry Report */}
          {activeReport === 'expiry' && (
            <div>
              {[
                { title: '🔴 Expired Medicines', data: reportData.data?.expired, color: '#ef4444' },
                { title: '🟠 Expiring in 30 Days', data: reportData.data?.expiring30, color: '#f97316' },
                { title: '🟡 Expiring in 90 Days', data: reportData.data?.expiring90, color: '#eab308' },
              ].map((section, i) => (
                <div key={i} className="mb-4">
                  <h6 style={{ color: section.color }}>{section.title} ({section.data?.length || 0})</h6>
                  {section.data?.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead><tr><th>Medicine</th><th>Category</th><th>Stock</th><th>Expiry Date</th><th>Batch</th></tr></thead>
                        <tbody>
                          {section.data.map(m => (
                            <tr key={m.id}>
                              <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>{m.name}</td>
                              <td>{m.category}</td>
                              <td>{m.currentStock}</td>
                              <td style={{ color: section.color, fontWeight: 600 }}>{new Date(m.expiryDate).toLocaleDateString('en-IN')}</td>
                              <td style={{ fontSize: '0.8rem' }}>{m.batchNumber}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : <p className="text-muted" style={{ fontSize: '0.875rem' }}>No medicines in this category</p>}
                </div>
              ))}
            </div>
          )}

          {/* Demand Report */}
          {activeReport === 'demand' && (
            <div>
              {demandChartData && <Bar data={demandChartData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } } } }} height={80} />}
              <div className="table-responsive mt-4">
                <table className="table table-hover">
                  <thead><tr><th>#</th><th>Medicine</th><th>Category</th><th>Total Sold</th><th>Revenue</th><th>Current Stock</th></tr></thead>
                  <tbody>
                    {reportData.data?.map((d, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>{d.medicine?.name}</td>
                        <td><span className="badge" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>{d.medicine?.category}</span></td>
                        <td style={{ fontWeight: 600, color: '#8b5cf6' }}>{d.totalSold || 0}</td>
                        <td>₹{parseFloat(d.revenue || 0).toFixed(2)}</td>
                        <td>{d.medicine?.currentStock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && !reportData && (
        <div className="chart-card text-center py-5">
          <MdAssessment style={{ fontSize: '3rem', color: '#cbd5e1' }} />
          <p className="text-muted mt-2">Select a report type above to generate</p>
        </div>
      )}
    </div>
  )
}
