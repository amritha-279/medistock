require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const authRoutes = require('./routes/auth');
const medicineRoutes = require('./routes/medicines');
const salesRoutes = require('./routes/sales');
const supplierRoutes = require('./routes/suppliers');
const predictionRoutes = require('./routes/predictions');
const reportRoutes = require('./routes/reports');
const dashboardRoutes = require('./routes/dashboard');
const alertRoutes = require('./routes/alerts');
const userRoutes = require('./routes/users');

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'MediStock API Running', timestamp: new Date() }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

// Suppress Sequelize deprecation warnings
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && warning.message.includes('sequelize')) return;
  // suppress all other warnings silently
});

sequelize.authenticate()
  .then(() => {
    console.log('✅ PostgreSQL connected');
    return sequelize.sync({ alter: true, logging: false });
  })
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 MediStock Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });
