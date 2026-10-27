import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../services/api'
import { MdAutoGraph, MdPlayArrow, MdRefresh, MdCheckCircle, MdInfo } from 'react-icons/md'

export default function MLSettings() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [retrainingDemand, setRetrainingDemand] = useState(false)
  const [retrainingExpiry, setRetrainingExpiry] = useState(false)

  const loadMetrics = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/predictions/metrics')
      setMetrics(data.data)
    } catch { toast.error('Failed to load model metrics') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadMetrics() }, [])

  const retrain = async (type) => {
    const setter = type === 'demand' ? setRetrainingDemand : setRetrainingExpiry
    setter(true)
    try {
      const { data } = await api.post(`/predictions/retrain/${type}`)
      toast.success(data.message || `${type} model retrained successfully`)
      loadMetrics()
    } catch (err) { toast.error(err.response?.data?.message || 'Retraining failed') }
    finally { setter(false) }
  }

  const models = [
    {
      key: 'demand',
      title: 'Demand Forecasting Model',
      type: 'Random Forest Regressor',
      description: 'Predicts future medicine demand based on stock, price, expiry and seasonal patterns.',
      color: '#0d6efd', bg: '#eff6ff',
      metrics: metrics?.demand,
      metricLabels: [
        { key: 'r2', label: 'R² Score', format: v => (v * 100).toFixed(1) + '%' },
        { key: 'mae', label: 'MAE', format: v => v.toFixed(2) },
        { key: 'accuracy', label: 'Accuracy', format: v => v.toFixed(1) + '%' },
      ],
      retraining: retrainingDemand,
    },
    {
      key: 'expiry',
      title: 'Expiry Risk Model',
      type: 'Random Forest Classifier',
      description: 'Classifies medicines as high/low expiry risk before being sold.',
      color: '#f97316', bg: '#fff7ed',
      metrics: metrics?.expiry,
      metricLabels: [
        { key: 'accuracy', label: 'Accuracy', format: v => v.toFixed(1) + '%' },
      ],
      retraining: retrainingExpiry,
    },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h4>ML Model Settings</h4>
          <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>View model performance and retrain ML models</p>
        </div>
        <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={loadMetrics}>
          <MdRefresh /> Refresh
        </button>
      </div>

      {/* Info banner */}
      <div className="chart-card mb-4" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
        <div className="d-flex align-items-start gap-3">
          <MdInfo style={{ color: '#16a34a', fontSize: '1.4rem', flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: '0.875rem', color: '#166534' }}>
            <strong>About Retraining:</strong> Retraining uses the existing dataset in <code>ml-model/dataset/</code>.
            Models are retrained via Python scripts on the server. This may take 30–60 seconds.
            The system will use the new model immediately after retraining completes.
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
      ) : (
        <div className="row g-4">
          {models.map(model => (
            <div key={model.key} className="col-lg-6">
              <div className="chart-card h-100" style={{ borderTop: `4px solid ${model.color}` }}>
                <div className="d-flex align-items-start gap-3 mb-4">
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: model.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: model.color, fontSize: '1.5rem', flexShrink: 0 }}>
                    <MdAutoGraph />
                  </div>
                  <div>
                    <h6 className="mb-0">{model.title}</h6>
                    <small className="text-muted">{model.type}</small>
                    <p className="text-muted mb-0 mt-1" style={{ fontSize: '0.8rem' }}>{model.description}</p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <MdCheckCircle style={{ color: '#16a34a' }} />
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Model Performance</span>
                  </div>
                  {model.metrics ? (
                    <div className="row g-2">
                      {model.metricLabels.map(m => (
                        <div key={m.key} className="col-4">
                          <div style={{ background: model.bg, borderRadius: 10, padding: '0.75rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: model.color }}>
                              {model.metrics[m.key] != null ? m.format(model.metrics[m.key]) : '—'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{m.label}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                      No metrics available — model may not be trained yet.
                    </div>
                  )}
                </div>

                {/* Model status */}
                <div className="mb-4">
                  <div style={{ background: '#f8fafc', borderRadius: 8, padding: '0.75rem', fontSize: '0.8rem' }}>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Status</span>
                      <span className="badge bg-success">Active</span>
                    </div>
                    <div className="d-flex justify-content-between mt-1">
                      <span className="text-muted">Algorithm</span>
                      <span style={{ fontWeight: 600 }}>{model.type}</span>
                    </div>
                    <div className="d-flex justify-content-between mt-1">
                      <span className="text-muted">Estimators</span>
                      <span style={{ fontWeight: 600 }}>100 trees</span>
                    </div>
                  </div>
                </div>

                <button
                  className="btn w-100 d-flex align-items-center justify-content-center gap-2"
                  style={{ background: model.color, color: '#fff', border: 'none' }}
                  onClick={() => retrain(model.key)}
                  disabled={model.retraining}
                >
                  {model.retraining
                    ? <><span className="spinner-border spinner-border-sm" /> Retraining... (may take ~60s)</>
                    : <><MdPlayArrow /> Retrain {model.title.split(' ')[0]} Model</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
