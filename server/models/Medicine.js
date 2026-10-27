const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Medicine = sequelize.define('Medicine', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  genericName: { type: DataTypes.STRING(200) },
  category: { type: DataTypes.STRING(100), allowNull: false },
  manufacturer: { type: DataTypes.STRING(150) },
  batchNumber: { type: DataTypes.STRING(100) },
  purchaseDate: { type: DataTypes.DATEONLY },
  expiryDate: { type: DataTypes.DATEONLY, allowNull: false },
  purchasePrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  sellingPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  currentStock: { type: DataTypes.INTEGER, defaultValue: 0 },
  minStockLevel: { type: DataTypes.INTEGER, defaultValue: 10 },
  unit: { type: DataTypes.STRING(50), defaultValue: 'tablets' },
  supplierId: { type: DataTypes.INTEGER },
  description: { type: DataTypes.TEXT },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'medicines', timestamps: true });

module.exports = Medicine;
