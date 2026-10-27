import { useState, useEffect } from 'react'
import { Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
import { toast } from 'react-toastify'
import api from '../services/api'
import { MdAutoGraph, MdWarning, MdHistory, MdPlayArrow } from 'react-icons/md'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const RISK_COLORS = { Critical: '#ef4444', High: '#f97316', Medium: '#eab308', Low: '#22c55e' }
const RISK_BG = { Critical: '#fef2f2', High: '#fff7ed', Medium: '#fefce8', Low: '#f0fdf4' }

export default function Predictions() {
  const [demandResults, setDemandResults] = useState(null)
  const [expiryResults, setExpiryResults] = useState(null)
  const [history, setHistory] = useState([])
  const [loadingDemand, setLoadingDemand] = useState(false)
  const [loadingExpiry, setLoadingExpiry] = useState(false)
  const [activeTab, setActiveTab] = useState('demand')

  useEffect(() => {
    api.get('/predictions/history').then(r => setHistory(r.data.data)).catch(() => {})
  }, [])

  const runDemandPrediction = async () => {
    setLoadingDemand(true)
    try {
      const { data } = await api.post('/predictions/demand')
      setDemandResults(data.data)
      setActiveTab('demand')
      toast.success('Demand prediction completed!')
      api.get('/predictions/history').then(r => setHistory(r.data.data)).catch(() => {})
    } catch (err) { toast.error(err.response?.data?.message || 'Prediction failed') }
    finally { setLoadingDemand(false) }
  }

  const runExpiryPrediction = async () => {
    setLoadingExpiry(true)
    try {
      const { data } = await api.post('/predictions/expiry-risk')
      setExpiryResults(data.data)
      setActiveTab('expiry')
      toast.success('Expiry risk prediction completed!')
      api.get('/predictions/history').then(r => setHistory(r.data.data)).catch(() => {})
    } catch (err) { toast.error(err.response?.data?.message || 'Prediction failed') }
    finally { setLoadingExpiry(false) }
  }

  const demandChartData = demandResults ? {
    labels: demandResults.predictions?.slice(0, 10).map(p => p.name?.split(' ').slice(0, 2).join(' ')),
    datasets: [
      { label: 'Current Stock', data: demandResults.predictions?.slice(0, 10).map(p => p.currentStock), backgroundColor: 'rgba(13,110,253,0.6)', borderRadius: 6 },
      { label: 'Predicted Demand', data: demandResults.predictions?.slice(0, 10).map(p => p.predictedDemand), backgroundColor: 'rgba(32,201,151,0.6)', borderRadius: 6 }
    ]
  } : null

  const expiryChartData = expiryResults ? {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [{
      data: [
        expiryResults.predictions?.filter(p => p.riskLevel === 'Critical').length || 0,
        expiryResults.predictions?.filter(p => p.riskLevel === 'High').length || 0,
        expiryResults.predictions?.filter(p => p.riskLevel === 'Medium').length || 0,
        expiryResults.predictions?.filter(p => p.riskLevel === 'Low').length || 0,
      ],
      backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e'],
      borderWidth: 0
    }]
  } : null

  return (
    <div>
      <div className="page-header">
        <div>
          <h4>AI Predictions</h4>
          <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>Machine Learning powered demand forecasting and expiry risk analysis</p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="chart-card" style={{ border: '2px solid #eff6ff' }}>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div style={{ width: 52, height: 52, borderRadius: 14, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d6efd', fontSize: '1.5rem' }}>
                <MdAutoGraph />
              </div>
              <div>
                <h6 className="mb-0">Demand Forecasting</h6>
                <small className="text-muted">Random Forest Regressor</small>
              </div>
            </div>
            <p className="text-muted mb-3" style={{ fontSize: '0.875rem' }}>Predict future medicine demand based on historical sales, stock levels, and seasonal patterns.</p>
            <button className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" onClick={runDemandPrediction} disabled={loadingDemand}>
              {loadingDemand ? <><span className="spinner-border spinner-border-sm" /> Running Prediction...</> : <><MdPlayArrow /> Predict Demand</>}
            </button>
          </div>
        </div>
        <div className="col-md-6">
          <div className="chart-card" style={{ border: '2px solid #fff7ed' }}>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div style={{ width: 52, height: 52, borderRadius: 14, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316', fontSize: '1.5rem' }}>
                <MdWarning />
              </div>
              <div>
                <h6 className="mb-0">Expiry Risk Prediction</h6>
                <small className="text-muted">Random Forest Classifier</small>
              </div>
            </div>
            <p className="text-muted mb-3" style={{ fontSize: '0.875rem' }}>Identify medicines at risk of expiring before being sold using intelligent classification.</p>
            <button className="btn w-100 d-flex align-items-center justify-content-center gap-2" style={{ background: '#f97316', color: '#fff', border: 'none' }} onClick={runExpiryPrediction} disabled={loadingExpiry}>
              {loadingExpiry ? <><span className="spinner-border spinner-border-sm" /> Running Prediction...</> : <><MdPlayArrow /> Predict Expiry Risk</>}
            </button>
          </div>
        </div>
      </div>

      {/* Results Tabs */}
      {(demandResults || expiryResults) && (
        <div className="chart-card mb-4">
          <div className="d-flex gap-2 mb-4">
            {demandResults && <button className={`btn btn-sm ${activeTab === 'demand' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setActiveTab('demand')}>Demand Results</button>}
            {expiryResults && <button className={`btn btn-sm ${activeTab === 'expiry' ? 'btn-warning' : 'btn-outline-secondary'}`} onClick={() => setActiveTab('expiry')}>Expiry Risk Results</button>}
          </div>

          {activeTab === 'demand' && demandResults && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Demand Forecast Results</h6>
                <span className="badge bg-primary">{demandResults.modelType}</span>
              </div>
              {demandChartData && <Bar data={demandChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } }, scales: { x: { grid: { display: false } } } }} height={80} />}
              <div className="row g-2 mt-3">
                {demandResults.predictions?.map((p, i) => (
                  <div key={i} className="col-md-6 col-lg-4">
                    <div className="prediction-card">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</div>
                        <span className="badge" style={{ background: '#eff6ff', color: '#0d6efd', fontSize: '0.7rem' }}>{p.category}</span>
                      </div>
                      <div className="row g-1 mb-2">
                        <div className="col-6"><small className="text-muted">Current Stock</small><div style={{ fontWeight: 600 }}>{p.currentStock}</div></div>
                        <div className="col-6"><small className="text-muted">Predicted Demand</small><div style={{ fontWeight: 600, color: '#0d6efd' }}>{p.predictedDemand}</div></div>
                      </div>
                      <div className="risk-bar mb-1">
                        <div className="risk-fill" style={{ width: `${Math.min(100, (p.confidence || 0) * 100)}%`, background: '#0d6efd' }} />
                      </div>
                      <small className="text-muted">Confidence: {((p.confidence || 0) * 100).toFixed(0)}%</small>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>{p.recommendation}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'expiry' && expiryResults && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Expiry Risk Results</h6>
                <span className="badge bg-warning text-dark">{expiryResults.modelType}</span>
              </div>
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  {expiryChartData && <Doughnut data={expiryChartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />}
                </div>
                <div className="col-md-8">
                  <div className="row g-2">
                    {['Critical', 'High', 'Medium', 'Low'].map(level => {
                      const count = expiryResults.predictions?.filter(p => p.riskLevel === level).length || 0
                      return (
                        <div key={level} className="col-6">
                          <div style={{ background: RISK_BG[level], border: `1px solid ${RISK_COLORS[level]}30`, borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: RISK_COLORS[level] }}>{count}</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{level} Risk</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              <div className="row g-2">
                {expiryResults.predictions?.map((p, i) => (
                  <div key={i} className="col-md-6 col-lg-4">
                    <div className="prediction-card" style={{ borderLeft: `4px solid ${RISK_COLORS[p.riskLevel] || '#64748b'}` }}>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</div>
                        <span className="badge" style={{ background: RISK_BG[p.riskLevel], color: RISK_COLORS[p.riskLevel], fontSize: '0.7rem' }}>{p.riskLevel}</span>
                      </div>
                      <div className="row g-1 mb-2">
                        <div className="col-6"><small className="text-muted">Stock</small><div style={{ fontWeight: 600 }}>{p.currentStock}</div></div>
                        <div className="col-6"><small className="text-muted">Days to Expiry</small><div style={{ fontWeight: 600, color: p.daysToExpiry < 30 ? '#ef4444' : '#64748b' }}>{p.daysToExpiry}d</div></div>
                      </div>
                      <div className="risk-bar mb-1">
                        <div className="risk-fill" style={{ width: `${(p.riskScore || 0) * 100}%`, background: RISK_COLORS[p.riskLevel] || '#64748b' }} />
                      </div>
                      <small className="text-muted">Risk Score: {((p.riskScore || 0) * 100).toFixed(0)}%</small>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>{p.recommendation}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History */}
      <div className="table-card">
        <div className="p-3 border-bottom d-flex align-items-center gap-2">
          <MdHistory />
          <h6 className="mb-0">Prediction History</h6>
        </div>
        <div className="table-responsive">
          <table className="table table-hover">
            <thead><tr><th>Medicine</th><th>Type</th><th>Predicted Value</th><th>Risk Level</th><th>Confidence</th><th>Date</th></tr></thead>
            <tbody>
              {history.length === 0 ? <tr><td colSpan={6} className="text-center py-4 text-muted">No prediction history yet</td></tr>
                : history.map(h => (
                  <tr key={h.id}>
                    <td style={{ fontSize: '0.875rem' }}>{h.medicine?.name || '—'}</td>
                    <td><span className={`badge ${h.predictionType === 'demand' ? 'bg-primary' : 'bg-warning text-dark'}`}>{h.predictionType}</span></td>
                    <td>{h.predictedValue?.toFixed(2)}</td>
                    <td>{h.riskLevel ? <span className="badge" style={{ background: RISK_BG[h.riskLevel], color: RISK_COLORS[h.riskLevel] }}>{h.riskLevel}</span> : '—'}</td>
                    <td>{h.confidence ? `${(h.confidence * 100).toFixed(0)}%` : '—'}</td>
                    <td style={{ fontSize: '0.8rem' }}>{new Date(h.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
