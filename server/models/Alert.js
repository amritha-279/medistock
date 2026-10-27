const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Alert = sequelize.define('Alert', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  medicineId: { type: DataTypes.INTEGER },
  alertType: { type: DataTypes.ENUM('low_stock', 'near_expiry', 'high_expiry_risk', 'demand_surge') },
  message: { type: DataTypes.TEXT },
  severity: { type: DataTypes.ENUM('low', 'medium', 'high', 'critical'), defaultValue: 'medium' },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  isResolved: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { tableName: 'alerts', timestamps: true });

module.exports = Alert;
