import { useState, useEffect } from 'react'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { MdMedication, MdWarning, MdTrendingUp, MdAttachMoney, MdLocalShipping, MdNotifications, MdPointOfSale, MdInventory, MdPeople, MdAutoGraph, MdSettings } from 'react-icons/md'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler)

const SEVERITY_CLASS = { critical: 'alert-critical', high: 'alert-high', medium: 'alert-medium', low: 'alert-low' }
const SEVERITY_ICON = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' }
const chartOptions = { responsive: true, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: '#f1f5f9' } } } }

function AdminDashboard({ data }) {
  const stats = data?.stats || {}
  const monthlySalesChart = data?.monthlySalesChart || []
  const topMedicines = data?.topMedicines || []
  const categoryDist = data?.categoryDist || []

  const statCards = [
    { label: 'Total Medicines', value: stats.totalMedicines || 0, icon: <MdMedication />, color: '#0d6efd', bg: '#eff6ff', sub: 'Active inventory' },
    { label: 'Total Suppliers', value: stats.totalSuppliers || 0, icon: <MdLocalShipping />, color: '#20c997', bg: '#f0fdf4', sub: 'Active suppliers' },
    { label: 'Total Managers', value: stats.totalManagers || 0, icon: <MdPeople />, color: '#8b5cf6', bg: '#f5f3ff', sub: 'Active staff' },
    { label: 'Monthly Revenue', value: `₹${parseFloat(stats.monthlyRevenue || 0).toFixed(0)}`, icon: <MdAttachMoney />, color: '#20c997', bg: '#f0fdf4', sub: 'This month' },
    { label: 'Low Stock', value: stats.lowStock || 0, icon: <MdWarning />, color: '#f97316', bg: '#fff7ed', sub: 'Need restocking' },
    { label: 'Near Expiry', value: stats.nearExpiry || 0, icon: <MdWarning />, color: '#ef4444', bg: '#fef2f2', sub: 'Within 90 days' },
    { label: 'Total Sales', value: stats.totalSales || 0, icon: <MdTrendingUp />, color: '#0891b2', bg: '#ecfeff', sub: 'All time' },
    { label: 'Unread Alerts', value: stats.unreadAlerts || 0, icon: <MdNotifications />, color: '#eab308', bg: '#fefce8', sub: 'Pending review' },
  ]

  const categoryColors = ['#0d6efd', '#20c997', '#f97316', '#8b5cf6', '#ef4444', '#0891b2', '#eab308', '#64748b']
  const lineData = {
    labels: monthlySalesChart.map(d => d.month || ''),
    datasets: [{ label: 'Revenue (₹)', data: monthlySalesChart.map(d => parseFloat(d.revenue || 0)), borderColor: '#0d6efd', backgroundColor: 'rgba(13,110,253,0.1)', fill: true, tension: 0.4, pointBackgroundColor: '#0d6efd', pointRadius: 5 }]
  }
  const barData = {
    labels: topMedicines.map(m => m.medicine?.name?.split(' ').slice(0, 2).join(' ') || ''),
    datasets: [{ label: 'Units Sold', data: topMedicines.map(m => parseInt(m.totalSold || 0)), backgroundColor: ['#0d6efd', '#20c997', '#f97316', '#8b5cf6', '#ef4444'], borderRadius: 8 }]
  }
  const doughnutData = {
    labels: categoryDist.length ? categoryDist.map(c => c.category) : ['No Data'],
    datasets: [{ data: categoryDist.length ? categoryDist.map(c => parseInt(c.count || 0)) : [1], backgroundColor: categoryColors.slice(0, Math.max(categoryDist.length, 1)), borderWidth: 0 }]
  }

  const quickLinks = [
    { label: 'Manage Medicines', to: '/medicines', color: '#0d6efd', bg: '#eff6ff', icon: <MdMedication /> },
    { label: 'Manage Suppliers', to: '/suppliers', color: '#20c997', bg: '#f0fdf4', icon: <MdLocalShipping /> },
    { label: 'AI Predictions', to: '/predictions', color: '#8b5cf6', bg: '#f5f3ff', icon: <MdAutoGraph /> },
    { label: 'View Reports', to: '/reports', color: '#f97316', bg: '#fff7ed', icon: <MdTrendingUp /> },
    { label: 'User Management', to: '/users', color: '#0891b2', bg: '#ecfeff', icon: <MdPeople /> },
    { label: 'ML Model Settings', to: '/ml-settings', color: '#64748b', bg: '#f8fafc', icon: <MdSettings /> },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h4>Admin Dashboard</h4>
          <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>System overview — medicines, revenue, staff & analytics</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          {stats.unreadAlerts > 0 && <span className="badge bg-danger">{stats.unreadAlerts} Alerts</span>}
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {statCards.map((card, i) => (
          <div key={i} className="col-6 col-md-4 col-xl-3">
            <div className="stat-card h-100">
              <div className="stat-icon mb-2" style={{ background: card.bg, color: card.color }}>{card.icon}</div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-label">{card.label}</div>
              <div className="stat-change text-muted mt-1">{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-8">
          <div className="chart-card">
            <h6>Monthly Revenue Trend</h6>
            <Line data={lineData} options={{ ...chartOptions, plugins: { legend: { display: true } } }} height={80} />
          </div>
        </div>
        <div className="col-lg-4">
          <div className="chart-card">
            <h6>Inventory by Category</h6>
            <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } } }} />
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="chart-card">
            <h6>Top Selling Medicines</h6>
            <Bar data={barData} options={chartOptions} height={120} />
          </div>
        </div>
        <div className="col-lg-6">
          <div className="chart-card">
            <h6 className="mb-3">Quick Actions</h6>
            <div className="row g-2">
              {quickLinks.map((a, i) => (
                <div key={i} className="col-6">
                  <a href={a.to} style={{ textDecoration: 'none' }}>
                    <div style={{ background: a.bg, borderRadius: 10, padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.6rem', border: `1px solid ${a.color}20` }}>
                      <span style={{ color: a.color, fontSize: '1.2rem' }}>{a.icon}</span>
                      <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#1e293b' }}>{a.label}</span>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ManagerDashboard({ data }) {
  const stats = data?.stats || {}
  const recentAlerts = data?.recentAlerts || []

  const statCards = [
    { label: "Today's Sales", value: stats.todaySales || 0, icon: <MdPointOfSale />, color: '#0d6efd', bg: '#eff6ff', sub: 'Transactions today' },
    { label: 'Monthly Sales', value: stats.monthlySalesCount || 0, icon: <MdTrendingUp />, color: '#20c997', bg: '#f0fdf4', sub: 'This month' },
    { label: 'Low Stock Items', value: stats.lowStock || 0, icon: <MdWarning />, color: '#f97316', bg: '#fff7ed', sub: 'Need attention' },
    { label: 'Near Expiry', value: stats.nearExpiry || 0, icon: <MdWarning />, color: '#ef4444', bg: '#fef2f2', sub: 'Within 90 days' },
  ]

  const quickLinks = [
    { label: 'Record New Sale', to: '/sales', color: '#0d6efd', bg: '#eff6ff', icon: <MdPointOfSale /> },
    { label: 'View Inventory', to: '/inventory', color: '#20c997', bg: '#f0fdf4', icon: <MdInventory /> },
    { label: 'AI Predictions', to: '/predictions', color: '#8b5cf6', bg: '#f5f3ff', icon: <MdAutoGraph /> },
    { label: 'Check Alerts', to: '/alerts', color: '#ef4444', bg: '#fef2f2', icon: <MdWarning /> },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h4>Manager Dashboard</h4>
          <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>Your daily operations overview</p>
        </div>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>

      <div className="row g-3 mb-4">
        {statCards.map((card, i) => (
          <div key={i} className="col-6 col-md-3">
            <div className="stat-card h-100">
              <div className="stat-icon mb-2" style={{ background: card.bg, color: card.color }}>{card.icon}</div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-label">{card.label}</div>
              <div className="stat-change text-muted mt-1">{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        <div className="col-lg-5">
          <div className="chart-card">
            <h6 className="mb-3">Quick Actions</h6>
            <div className="row g-2">
              {quickLinks.map((a, i) => (
                <div key={i} className="col-6">
                  <a href={a.to} style={{ textDecoration: 'none' }}>
                    <div style={{ background: a.bg, borderRadius: 10, padding: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.6rem', border: `1px solid ${a.color}20` }}>
                      <span style={{ color: a.color, fontSize: '1.2rem' }}>{a.icon}</span>
                      <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#1e293b' }}>{a.label}</span>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-lg-7">
          <div className="chart-card">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="mb-0">Recent Alerts</h6>
              <span className="badge bg-danger">{recentAlerts.length}</span>
            </div>
            <div style={{ maxHeight: 260, overflowY: 'auto' }}>
              {recentAlerts.length === 0
                ? <div className="text-center text-muted py-4">No active alerts 🎉</div>
                : recentAlerts.map(alert => (
                  <div key={alert.id} className={`alert-item ${SEVERITY_CLASS[alert.severity] || 'alert-medium'}`}>
                    <span>{SEVERITY_ICON[alert.severity] || '🟡'}</span>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{alert.medicine?.name || 'System Alert'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{alert.message}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" />
        <p className="text-muted">Loading dashboard...</p>
      </div>
    </div>
  )

  return user?.role === 'admin' ? <AdminDashboard data={data} /> : <ManagerDashboard data={data} />
}
