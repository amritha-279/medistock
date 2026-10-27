const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SaleItem = sequelize.define('SaleItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  saleId: { type: DataTypes.INTEGER, allowNull: false },
  medicineId: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  unitPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  totalPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
}, { tableName: 'sale_items', timestamps: false });

module.exports = SaleItem;
