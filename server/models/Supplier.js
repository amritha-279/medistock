const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Supplier = sequelize.define('Supplier', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  contactPerson: { type: DataTypes.STRING(100) },
  email: { type: DataTypes.STRING(150) },
  phone: { type: DataTypes.STRING(20) },
  address: { type: DataTypes.TEXT },
  city: { type: DataTypes.STRING(100) },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'suppliers', timestamps: true });

module.exports = Supplier;
