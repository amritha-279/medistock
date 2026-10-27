const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventoryLog = sequelize.define('InventoryLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  medicineId: { type: DataTypes.INTEGER },
  action: { type: DataTypes.ENUM('added', 'sold', 'adjusted', 'expired', 'returned') },
  quantityChange: { type: DataTypes.INTEGER },
  previousStock: { type: DataTypes.INTEGER },
  newStock: { type: DataTypes.INTEGER },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'inventory_logs', timestamps: true });

module.exports = InventoryLog;
