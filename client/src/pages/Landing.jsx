import { Link } from 'react-router-dom'
import { MdAutoGraph, MdWarning, MdInventory, MdSecurity, MdLocalHospital, MdArrowForward, MdCheck } from 'react-icons/md'

const features = [
  { icon: <MdAutoGraph />, color: '#0d6efd', bg: '#eff6ff', title: 'AI Demand Forecasting', desc: 'Random Forest ML model predicts medicine demand with high accuracy to prevent stockouts.' },
  { icon: <MdWarning />, color: '#f97316', bg: '#fff7ed', title: 'Expiry Risk Prediction', desc: 'Identify medicines at risk of expiring before being sold using intelligent classification.' },
  { icon: <MdInventory />, color: '#20c997', bg: '#f0fdf4', title: 'Smart Inventory', desc: 'Real-time inventory tracking with automated alerts for low stock and near-expiry medicines.' },
  { icon: <MdSecurity />, color: '#8b5cf6', bg: '#f5f3ff', title: 'Secure & Role-Based', desc: 'JWT authentication with admin and manager roles for secure access control.' },
]

const stats = [
  { value: '95%+', label: 'Prediction Accuracy' },
  { value: '50+', label: 'Medicine Categories' },
  { value: 'Real-time', label: 'Alerts & Monitoring' },
  { value: 'AI-Powered', label: 'Analytics Engine' },
]

export default function Landing() {
  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg position-absolute w-100" style={{ zIndex: 10 }}>
        <div className="container">
          <a className="navbar-brand d-flex align-items-center gap-2" href="/">
            <MdLocalHospital style={{ color: '#20c997', fontSize: '1.6rem' }} />
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem' }}>MediStock <span style={{ color: '#20c997' }}>AI</span></span>
          </a>
          <div className="d-flex gap-2">
            <Link to="/login" className="btn btn-outline-light btn-sm">Login</Link>
            <Link to="/register" className="btn btn-sm" style={{ background: '#20c997', color: '#fff', border: 'none' }}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="hero-badge">🤖 AI-Powered Pharmacy Intelligence</div>
              <h1 className="hero-title mb-3">
                Smart Medicine<br />
                <span style={{ color: '#20c997' }}>Demand Forecasting</span><br />
                & Expiry Prediction
              </h1>
              <p className="hero-subtitle mb-4">
                MediStock AI uses Machine Learning to predict medicine demand and identify expiry risks,
                helping pharmacies optimize inventory and reduce waste.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Link to="/register" className="btn btn-lg px-4" style={{ background: '#20c997', color: '#fff', border: 'none', borderRadius: 10 }}>
                  Start Free <MdArrowForward />
                </Link>
                <Link to="/login" className="btn btn-lg btn-outline-light px-4" style={{ borderRadius: 10 }}>
                  Login
                </Link>
              </div>
              <div className="d-flex gap-4 mt-4 flex-wrap">
                {stats.map((s, i) => (
                  <div key={i}>
                    <div style={{ color: '#20c997', fontWeight: 700, fontSize: '1.3rem' }}>{s.value}</div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-6 d-none d-lg-flex justify-content-center">
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: '2rem', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', maxWidth: 400, width: '100%' }}>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f43f5e' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fbbf24' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#34d399' }} />
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginLeft: 8 }}>AI Prediction Engine</span>
                </div>
                {[
                  { label: 'Paracetamol 500mg', demand: 420, risk: 'Low', color: '#20c997' },
                  { label: 'Amoxicillin 250mg', demand: 175, risk: 'Medium', color: '#fbbf24' },
                  { label: 'Vitamin C 500mg', demand: 490, risk: 'High', color: '#f43f5e' },
                  { label: 'Metformin 500mg', demand: 260, risk: 'Low', color: '#20c997' },
                ].map((item, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '0.75rem', marginBottom: '0.5rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 500 }}>{item.label}</span>
                      <span style={{ color: item.color, fontSize: '0.75rem', fontWeight: 600 }}>{item.risk} Risk</span>
                    </div>
                    <div className="d-flex align-items-center gap-2 mt-1">
                      <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                        <div style={{ width: `${(item.demand / 500) * 100}%`, height: '100%', background: item.color, borderRadius: 2 }} />
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>Demand: {item.demand}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-5" style={{ background: '#f8fafc' }}>
        <div className="container py-4">
          <div className="text-center mb-5">
            <span style={{ background: '#eff6ff', color: '#0d6efd', padding: '0.4rem 1rem', borderRadius: 50, fontSize: '0.85rem', fontWeight: 600 }}>Features</span>
            <h2 className="mt-3 fw-700" style={{ fontSize: '2rem', color: '#1e293b' }}>Everything Your Pharmacy Needs</h2>
            <p className="text-muted">Powered by Machine Learning and real-time analytics</p>
          </div>
          <div className="row g-4">
            {features.map((f, i) => (
              <div key={i} className="col-md-6 col-lg-3">
                <div className="feature-card">
                  <div className="feature-icon" style={{ background: f.bg, color: f.color }}>{f.icon}</div>
                  <h5 className="fw-600 mb-2" style={{ color: '#1e293b' }}>{f.title}</h5>
                  <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-5" style={{ background: '#fff' }}>
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span style={{ background: '#f0fdf4', color: '#20c997', padding: '0.4rem 1rem', borderRadius: 50, fontSize: '0.85rem', fontWeight: 600 }}>About MediStock</span>
              <h2 className="mt-3 fw-700" style={{ fontSize: '2rem', color: '#1e293b' }}>Built for Modern Pharmacies</h2>
              <p className="text-muted mb-4">MediStock helps pharmacies run smarter — manage stock, track sales, monitor suppliers, and get ahead of problems before they happen.</p>
              {[
                'Never run out of stock with smart low-stock alerts',
                'Know which medicines are about to expire before they run out',
                'Track every sale and generate invoices instantly',
                'Manage suppliers and purchase records in one place',
                'Get clear reports on inventory, revenue, and demand',
                'Control who can access what with role-based logins',
              ].map((item, i) => (
                <div key={i} className="d-flex align-items-center gap-2 mb-2">
                  <MdCheck style={{ color: '#20c997', fontSize: '1.1rem', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.9rem', color: '#475569' }}>{item}</span>
                </div>
              ))}
            </div>
            <div className="col-lg-6">
              <div style={{ background: 'linear-gradient(135deg, #0f2d5e, #1a4080)', borderRadius: 20, padding: '2rem', color: '#fff' }}>
                <h5 className="mb-4" style={{ color: '#20c997' }}>Who is it for?</h5>
                {[
                  { icon: '🏥', title: 'Pharmacy Owners', desc: 'Get full visibility into your inventory, sales, and revenue at a glance.' },
                  { icon: '👨‍💼', title: 'Store Managers', desc: 'Manage daily stock, record sales, and handle supplier orders efficiently.' },
                  { icon: '📦', title: 'Inventory Teams', desc: 'Stay on top of expiry dates, reorder levels, and stock movements.' },
                ].map((item, i) => (
                  <div key={i} className="d-flex gap-3 mb-3">
                    <div style={{ fontSize: '1.5rem' }}>{item.icon}</div>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{item.title}</div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #0f2d5e, #0d6efd)' }}>
        <div className="container text-center py-4">
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '2rem' }}>Ready to Optimize Your Pharmacy?</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)' }} className="mb-4">Start using AI-powered inventory management today</p>
          <Link to="/register" className="btn btn-lg px-5" style={{ background: '#20c997', color: '#fff', border: 'none', borderRadius: 10 }}>
            Get Started Free <MdArrowForward />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0f2d5e', color: 'rgba(255,255,255,0.6)', padding: '1.5rem 0', textAlign: 'center', fontSize: '0.85rem' }}>
        <div className="container">
          <MdLocalHospital style={{ color: '#20c997', marginRight: 6 }} />
          MediStock © 2024 — Smart Pharmacy Inventory & Sales Management
        </div>
      </footer>
    </div>
  )
}
