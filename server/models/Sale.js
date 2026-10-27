const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sale = sequelize.define('Sale', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  invoiceNumber: { type: DataTypes.STRING(50), unique: true },
  customerName: { type: DataTypes.STRING(150) },
  customerPhone: { type: DataTypes.STRING(20) },
  totalAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  discount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  netAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  paymentMethod: { type: DataTypes.ENUM('cash', 'card', 'upi'), defaultValue: 'cash' },
  userId: { type: DataTypes.INTEGER },
  notes: { type: DataTypes.TEXT },
  saleDate: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW }
}, { tableName: 'sales', timestamps: true });

module.exports = Sale;
