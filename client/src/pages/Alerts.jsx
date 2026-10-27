import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { MdWarning, MdCheckCircle, MdNotifications, MdInventory, MdTrendingUp } from 'react-icons/md'
import api from '../services/api'

const TYPE_CONFIG = {
  low_stock: { label: 'Low Stock', icon: <MdInventory />, color: '#f97316', bg: '#fff7ed' },
  near_expiry: { label: 'Near Expiry', icon: <MdWarning />, color: '#ef4444', bg: '#fef2f2' },
  high_expiry_risk: { label: 'High Expiry Risk', icon: <MdWarning />, color: '#dc2626', bg: '#fef2f2' },
  demand_surge: { label: 'High Demand', icon: <MdTrendingUp />, color: '#8b5cf6', bg: '#f5f3ff' },
}

const SEVERITY_COLOR = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e' }

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const load = async () => {
    try {
      const { data } = await api.get('/alerts')
      setAlerts(data.data)
    } catch { toast.error('Failed to load alerts') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const markRead = async (id) => {
    try {
      await api.put(`/alerts/${id}/read`)
      setAlerts(a => a.map(x => x.id === id ? { ...x, isRead: true } : x))
    } catch { toast.error('Failed to mark as read') }
  }

  const resolve = async (id) => {
    try {
      await api.put(`/alerts/${id}/resolve`)
      toast.success('Alert resolved')
      load()
    } catch { toast.error('Failed to resolve') }
  }

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.alertType === filter)
  const unread = alerts.filter(a => !a.isRead).length

  return (
    <div>
      <div className="page-header">
        <div>
          <h4>Alerts & Notifications</h4>
          <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
            {unread > 0 ? <span className="text-danger fw-bold">{unread} unread alerts</span> : 'All caught up!'}
          </p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary btn-sm" onClick={async () => {
            try {
              const { data } = await api.post('/alerts/generate')
              toast.success(data.message)
              load()
            } catch { toast.error('Failed to generate alerts') }
          }}>Generate Alerts</button>
          {unread > 0 && (
            <button className="btn btn-outline-secondary btn-sm" onClick={async () => {
              await Promise.all(alerts.filter(a => !a.isRead).map(a => api.put(`/alerts/${a.id}/read`)))
              load()
              toast.success('All marked as read')
            }}>Mark All Read</button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {[{ key: 'all', label: 'All' }, { key: 'low_stock', label: 'Low Stock' }, { key: 'near_expiry', label: 'Near Expiry' }, { key: 'high_expiry_risk', label: 'Expiry Risk' }, { key: 'demand_surge', label: 'High Demand' }].map(f => (
          <button key={f.key} className={`btn btn-sm ${filter === f.key ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setFilter(f.key)}>
            {f.label} {f.key === 'all' ? `(${alerts.length})` : `(${alerts.filter(a => a.alertType === f.key).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="chart-card text-center py-5">
          <MdNotifications style={{ fontSize: '3rem', color: '#cbd5e1' }} />
          <p className="text-muted mt-2">No alerts found</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filtered.map(alert => {
            const config = TYPE_CONFIG[alert.alertType] || TYPE_CONFIG.low_stock
            return (
              <div key={alert.id} className="chart-card" style={{ borderLeft: `4px solid ${SEVERITY_COLOR[alert.severity] || '#eab308'}`, opacity: alert.isRead ? 0.7 : 1 }}>
                <div className="d-flex align-items-start justify-content-between gap-3">
                  <div className="d-flex align-items-start gap-3">
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: config.bg, color: config.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                      {config.icon}
                    </div>
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{alert.medicine?.name || 'System Alert'}</span>
                        <span className="badge" style={{ background: config.bg, color: config.color, fontSize: '0.7rem' }}>{config.label}</span>
                        <span className="badge" style={{ background: SEVERITY_COLOR[alert.severity] + '20', color: SEVERITY_COLOR[alert.severity], fontSize: '0.7rem', textTransform: 'capitalize' }}>{alert.severity}</span>
                        {!alert.isRead && <span className="badge bg-primary" style={{ fontSize: '0.65rem' }}>New</span>}
                      </div>
                      <p className="mb-1" style={{ fontSize: '0.875rem', color: '#475569' }}>{alert.message}</p>
                      <small className="text-muted">{new Date(alert.createdAt).toLocaleString('en-IN')}</small>
                    </div>
                  </div>
                  <div className="d-flex gap-2 flex-shrink-0">
                    {!alert.isRead && (
                      <button className="btn btn-sm btn-outline-primary" onClick={() => markRead(alert.id)} title="Mark as read">
                        <MdNotifications size={16} />
                      </button>
                    )}
                    <button className="btn btn-sm btn-outline-success" onClick={() => resolve(alert.id)} title="Resolve">
                      <MdCheckCircle size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
