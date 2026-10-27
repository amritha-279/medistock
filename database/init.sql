-- MediStock AI Database Initialization Script
-- Run this script to create the database and seed initial data

CREATE DATABASE medistock_db;

\c medistock_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'manager' CHECK (role IN ('admin', 'manager')),
    phone VARCHAR(20),
    "isActive" BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    "contactPerson" VARCHAR(100),
    email VARCHAR(150),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    "isActive" BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Medicines table
CREATE TABLE IF NOT EXISTS medicines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    "genericName" VARCHAR(200),
    category VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(150),
    "batchNumber" VARCHAR(100),
    "purchaseDate" DATE,
    "expiryDate" DATE NOT NULL,
    "purchasePrice" DECIMAL(10,2) NOT NULL,
    "sellingPrice" DECIMAL(10,2) NOT NULL,
    "currentStock" INTEGER DEFAULT 0,
    "minStockLevel" INTEGER DEFAULT 10,
    unit VARCHAR(50) DEFAULT 'tablets',
    "supplierId" INTEGER REFERENCES suppliers(id),
    description TEXT,
    "isActive" BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    "invoiceNumber" VARCHAR(50) UNIQUE,
    "customerName" VARCHAR(150),
    "customerPhone" VARCHAR(20),
    "totalAmount" DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    "netAmount" DECIMAL(10,2) DEFAULT 0,
    "paymentMethod" VARCHAR(20) DEFAULT 'cash' CHECK ("paymentMethod" IN ('cash', 'card', 'upi')),
    "userId" INTEGER REFERENCES users(id),
    notes TEXT,
    "saleDate" DATE DEFAULT CURRENT_DATE,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Sale Items table
CREATE TABLE IF NOT EXISTS sale_items (
    id SERIAL PRIMARY KEY,
    "saleId" INTEGER REFERENCES sales(id) ON DELETE CASCADE,
    "medicineId" INTEGER REFERENCES medicines(id),
    quantity INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL
);

-- Prediction History table
CREATE TABLE IF NOT EXISTS prediction_history (
    id SERIAL PRIMARY KEY,
    "medicineId" INTEGER REFERENCES medicines(id),
    "predictionType" VARCHAR(20) CHECK ("predictionType" IN ('demand', 'expiry_risk')),
    "predictedValue" FLOAT,
    confidence FLOAT,
    "riskLevel" VARCHAR(50),
    "inputFeatures" JSONB,
    result JSONB,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Inventory Logs table
CREATE TABLE IF NOT EXISTS inventory_logs (
    id SERIAL PRIMARY KEY,
    "medicineId" INTEGER REFERENCES medicines(id),
    action VARCHAR(20) CHECK (action IN ('added', 'sold', 'adjusted', 'expired', 'returned')),
    "quantityChange" INTEGER,
    "previousStock" INTEGER,
    "newStock" INTEGER,
    notes TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    "medicineId" INTEGER REFERENCES medicines(id),
    "alertType" VARCHAR(30) CHECK ("alertType" IN ('low_stock', 'near_expiry', 'high_expiry_risk', 'demand_surge')),
    message TEXT,
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    "isRead" BOOLEAN DEFAULT FALSE,
    "isResolved" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Seed admin user (password: Admin@123)
INSERT INTO users (name, email, password, role, phone) VALUES
('Admin User', 'admin@medistock.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2i', 'admin', '9876543210'),
('Manager User', 'manager@medistock.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2i', 'manager', '9876543211')
ON CONFLICT (email) DO NOTHING;

-- Seed suppliers
INSERT INTO suppliers (name, "contactPerson", email, phone, address, city) VALUES
('PharmaCorp Ltd', 'Rajesh Kumar', 'rajesh@pharmacorp.com', '9876543210', '123 Industrial Area', 'Mumbai'),
('MediSupply Co', 'Priya Sharma', 'priya@medisupply.com', '9876543211', '456 Trade Center', 'Delhi'),
('HealthDist Inc', 'Amit Patel', 'amit@healthdist.com', '9876543212', '789 Commerce Street', 'Bangalore'),
('DrugMart Wholesale', 'Sunita Rao', 'sunita@drugmart.com', '9876543213', '321 Market Road', 'Chennai')
ON CONFLICT DO NOTHING;

-- Seed medicines
INSERT INTO medicines (name, "genericName", category, manufacturer, "batchNumber", "purchaseDate", "expiryDate", "purchasePrice", "sellingPrice", "currentStock", "minStockLevel", unit, "supplierId") VALUES
('Paracetamol 500mg', 'Acetaminophen', 'Analgesic', 'Sun Pharma', 'BATCH001', '2024-01-01', '2026-01-01', 3.50, 5.50, 150, 20, 'tablets', 1),
('Amoxicillin 250mg', 'Amoxicillin', 'Antibiotic', 'Cipla', 'BATCH002', '2024-01-15', '2025-06-15', 30.00, 45.00, 80, 15, 'capsules', 2),
('Metformin 500mg', 'Metformin HCl', 'Antidiabetic', 'Dr Reddys', 'BATCH003', '2024-02-01', '2026-02-01', 8.00, 12.00, 200, 25, 'tablets', 1),
('Atorvastatin 10mg', 'Atorvastatin', 'Cardiovascular', 'Lupin', 'BATCH004', '2024-02-15', '2026-08-15', 22.00, 35.00, 120, 20, 'tablets', 3),
('Omeprazole 20mg', 'Omeprazole', 'Gastrointestinal', 'Zydus', 'BATCH005', '2024-03-01', '2025-09-01', 15.00, 22.00, 90, 15, 'capsules', 2),
('Cetirizine 10mg', 'Cetirizine HCl', 'Antihistamine', 'Mankind', 'BATCH006', '2024-03-15', '2025-03-15', 5.00, 8.00, 60, 10, 'tablets', 4),
('Ibuprofen 400mg', 'Ibuprofen', 'Analgesic', 'Abbott', 'BATCH007', '2024-04-01', '2026-04-01', 5.00, 7.50, 180, 20, 'tablets', 1),
('Azithromycin 500mg', 'Azithromycin', 'Antibiotic', 'Pfizer', 'BATCH008', '2024-04-15', '2025-10-15', 55.00, 85.00, 45, 10, 'tablets', 3),
('Vitamin C 500mg', 'Ascorbic Acid', 'Supplement', 'Himalaya', 'BATCH009', '2024-05-01', '2026-05-01', 4.00, 6.00, 200, 30, 'tablets', 4),
('Losartan 50mg', 'Losartan Potassium', 'Cardiovascular', 'Torrent', 'BATCH010', '2024-05-15', '2026-11-15', 18.00, 28.00, 100, 15, 'tablets', 2),
('Pantoprazole 40mg', 'Pantoprazole', 'Gastrointestinal', 'Sun Pharma', 'BATCH011', '2024-06-01', '2026-06-01', 12.00, 18.00, 110, 15, 'tablets', 1),
('Dolo 650mg', 'Paracetamol', 'Analgesic', 'Micro Labs', 'BATCH012', '2024-06-01', '2026-06-01', 4.00, 6.50, 250, 30, 'tablets', 2),
('Montelukast 10mg', 'Montelukast', 'Respiratory', 'Cipla', 'BATCH013', '2024-06-15', '2026-06-15', 20.00, 32.00, 75, 10, 'tablets', 2),
('Amlodipine 5mg', 'Amlodipine', 'Cardiovascular', 'Lupin', 'BATCH014', '2024-07-01', '2026-07-01', 10.00, 16.00, 130, 20, 'tablets', 3),
('Metronidazole 400mg', 'Metronidazole', 'Antibiotic', 'Abbott', 'BATCH015', '2024-07-01', '2025-12-01', 6.00, 10.00, 90, 15, 'tablets', 1),
('Glimepiride 2mg', 'Glimepiride', 'Antidiabetic', 'Sanofi', 'BATCH016', '2024-07-15', '2026-07-15', 14.00, 22.00, 85, 15, 'tablets', 4),
('Levothyroxine 50mcg', 'Levothyroxine', 'Thyroid', 'Abbott', 'BATCH017', '2024-08-01', '2026-08-01', 18.00, 28.00, 70, 10, 'tablets', 1),
('Vitamin D3 60000IU', 'Cholecalciferol', 'Supplement', 'Mankind', 'BATCH018', '2024-08-01', '2026-08-01', 25.00, 40.00, 100, 15, 'capsules', 4),
('Clopidogrel 75mg', 'Clopidogrel', 'Cardiovascular', 'Dr Reddys', 'BATCH019', '2024-08-15', '2026-08-15', 20.00, 32.00, 95, 15, 'tablets', 3),
('Ranitidine 150mg', 'Ranitidine', 'Gastrointestinal', 'Zydus', 'BATCH020', '2024-09-01', '2025-09-01', 8.00, 13.00, 60, 10, 'tablets', 2),
('Ciprofloxacin 500mg', 'Ciprofloxacin', 'Antibiotic', 'Cipla', 'BATCH021', '2024-09-01', '2026-03-01', 18.00, 28.00, 80, 15, 'tablets', 2),
('Aspirin 75mg', 'Acetylsalicylic Acid', 'Cardiovascular', 'Bayer', 'BATCH022', '2024-09-15', '2026-09-15', 3.00, 5.00, 200, 25, 'tablets', 3),
('Folic Acid 5mg', 'Folic Acid', 'Supplement', 'Himalaya', 'BATCH023', '2024-10-01', '2026-10-01', 2.50, 4.00, 150, 20, 'tablets', 4),
('Diclofenac 50mg', 'Diclofenac Sodium', 'Analgesic', 'Novartis', 'BATCH024', '2024-10-01', '2026-10-01', 6.00, 9.50, 120, 15, 'tablets', 1),
('Salbutamol 4mg', 'Salbutamol', 'Respiratory', 'GSK', 'BATCH025', '2024-10-15', '2026-10-15', 10.00, 16.00, 65, 10, 'tablets', 3),
('Insulin Glargine 100IU', 'Insulin Glargine', 'Antidiabetic', 'Sanofi', 'BATCH026', '2024-11-01', '2025-11-01', 450.00, 650.00, 30, 5, 'vials', 4),
('Ondansetron 4mg', 'Ondansetron', 'Gastrointestinal', 'Sun Pharma', 'BATCH027', '2024-11-01', '2026-11-01', 12.00, 20.00, 85, 10, 'tablets', 1),
('Calcium + D3 500mg', 'Calcium Carbonate', 'Supplement', 'Pfizer', 'BATCH028', '2024-11-15', '2026-11-15', 8.00, 13.00, 140, 20, 'tablets', 3),
('Levocetirizine 5mg', 'Levocetirizine', 'Antihistamine', 'UCB', 'BATCH029', '2024-12-01', '2026-12-01', 7.00, 11.00, 95, 10, 'tablets', 2),
('Pantop D 40mg', 'Pantoprazole + Domperidone', 'Gastrointestinal', 'Aristo', 'BATCH030', '2024-12-01', '2026-12-01', 16.00, 25.00, 75, 10, 'capsules', 4)
ON CONFLICT DO NOTHING;

COMMIT;
