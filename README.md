# 🏥 MediStock AI
## Medicine Demand Forecasting & Expiry Risk Prediction System for Pharmacies

> A production-ready full-stack web application built as a Final Year Data Science Project

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js (Vite) + Bootstrap 5 + Chart.js |
| Backend | Node.js + Express.js |
| Database | PostgreSQL + Sequelize ORM |
| Auth | JWT + Bcrypt |
| ML Engine | Python + Scikit-learn + Pandas + NumPy |
| Charts | Chart.js + React-Chartjs-2 |

---

## 📁 Project Structure

```
MediStock-AI/
├── client/                  # React Frontend (Vite)
│   ├── src/
│   │   ├── pages/           # All page components
│   │   ├── components/      # Reusable components
│   │   ├── context/         # Auth context
│   │   ├── services/        # Axios API service
│   │   └── index.css        # Global styles
│   └── package.json
├── server/                  # Node.js Backend
│   ├── config/              # Database config
│   ├── controllers/         # Business logic
│   ├── middleware/          # JWT auth middleware
│   ├── models/              # Sequelize models
│   ├── routes/              # Express routes
│   └── index.js             # Server entry point
├── ml-model/                # Python ML Module
│   ├── dataset/             # Training datasets
│   ├── models/              # Saved ML models (after training)
│   ├── train_demand.py      # Demand forecasting training
│   ├── train_expiry.py      # Expiry risk training
│   ├── predict.py           # Prediction script
│   └── requirements.txt
├── database/
│   └── init.sql             # PostgreSQL initialization
└── README.md
```

---

## ⚙️ Installation Guide

### Prerequisites
- Node.js v18+
- PostgreSQL v14+
- Python 3.8+
- npm or yarn

---

### Step 1: Clone & Setup

```bash
cd MediStock-AI
```

### Step 2: Setup PostgreSQL Database

```bash
# Open psql and run:
psql -U postgres -f database/init.sql

# Or manually:
psql -U postgres
CREATE DATABASE medistock_db;
\q
```

### Step 3: Configure Environment

Edit `server/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medistock_db
DB_USER=postgres
DB_PASSWORD=your_actual_password
JWT_SECRET=medistock_jwt_secret_key_2024
JWT_EXPIRES_IN=7d
PYTHON_PATH=python
```

### Step 4: Install Node.js Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Step 5: Install Python Dependencies

```bash
cd ml-model
pip install -r requirements.txt
```

### Step 6: Train ML Models

```bash
cd ml-model

# Train demand forecasting model
python train_demand.py

# Train expiry risk model
python train_expiry.py
```

### Step 7: Run the Application

```bash
# From root directory - runs both server and client
npm run dev

# Or separately:
npm run dev:server   # Backend on http://localhost:5000
npm run dev:client   # Frontend on http://localhost:5173
```

---

## 🔐 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@medistock.com | Admin@123 |
| Manager | manager@medistock.com | Admin@123 |

---

## 📊 Features

### Dashboard
- Real-time stats: Total Medicines, Low Stock, Near Expiry, Revenue
- Monthly Revenue Trend (Line Chart)
- Inventory Distribution (Doughnut Chart)
- Top Selling Medicines (Bar Chart)
- Recent Alerts Panel

### Medicine Management
- Full CRUD operations
- Search, filter by category and expiry
- Pagination
- Auto-alerts for low stock and near expiry

### Sales Management
- Record sales with multiple items
- Auto invoice generation
- Stock auto-deduction
- Invoice viewer

### Supplier Management
- Full CRUD with card-based UI

### AI Predictions
- **Demand Forecasting**: Random Forest Regressor predicts future demand
- **Expiry Risk**: Random Forest Classifier identifies at-risk medicines
- Prediction history tracking
- Visual charts for results

### Reports
- Inventory Report
- Sales Report with revenue summary
- Expiry Report (expired, 30-day, 90-day)
- Demand Report
- CSV Export

---

## 🤖 Machine Learning

### Demand Forecasting Model
- **Algorithm**: Random Forest Regressor
- **Features**: Category, Stock, Price, Days to Expiry, Month, Day of Week, Weekend flag, Avg Daily Sales
- **Target**: Predicted demand units
- **Metric**: R² Score, MAE

### Expiry Risk Model
- **Algorithm**: Random Forest Classifier
- **Features**: Category, Stock, Price, Days to Expiry, Avg Daily Sales, Stock Turnover Rate
- **Target**: Binary (0 = Low Risk, 1 = High Risk)
- **Metric**: Accuracy, Precision, Recall

---

## 🔌 API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/profile

GET    /api/medicines
POST   /api/medicines
PUT    /api/medicines/:id
DELETE /api/medicines/:id

GET    /api/sales
POST   /api/sales
GET    /api/sales/monthly

GET    /api/suppliers
POST   /api/suppliers
PUT    /api/suppliers/:id
DELETE /api/suppliers/:id

POST   /api/predictions/demand
POST   /api/predictions/expiry-risk
GET    /api/predictions/history

GET    /api/reports/inventory
GET    /api/reports/sales
GET    /api/reports/expiry
GET    /api/reports/demand

GET    /api/dashboard
GET    /api/alerts
```

---

## 🎨 UI Theme

- Primary: `#0d6efd` (Blue)
- Secondary: `#20c997` (Teal/Green)
- Background: `#f8fafc` (Light)
- Sidebar: `#0f2d5e` (Dark Navy)

---

## 📝 Notes

- The ML prediction endpoint calls Python scripts via Node.js `child_process`
- If Python models are not trained yet, the system uses intelligent simulation
- Alerts are auto-generated when medicines fall below min stock or near expiry
- All routes except login/register are JWT protected

---

*Built with ❤️ as a Final Year Data Science Project*
