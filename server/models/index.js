const sequelize = require('../config/database');
const User = require('./User');
const Medicine = require('./Medicine');
const Sale = require('./Sale');
const SaleItem = require('./SaleItem');
const Supplier = require('./Supplier');
const PredictionHistory = require('./PredictionHistory');
const InventoryLog = require('./InventoryLog');
const Alert = require('./Alert');

// Associations
Medicine.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });
Supplier.hasMany(Medicine, { foreignKey: 'supplierId', as: 'medicines' });

Sale.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Sale.hasMany(SaleItem, { foreignKey: 'saleId', as: 'items' });
SaleItem.belongsTo(Sale, { foreignKey: 'saleId' });
SaleItem.belongsTo(Medicine, { foreignKey: 'medicineId', as: 'medicine' });

Alert.belongsTo(Medicine, { foreignKey: 'medicineId', as: 'medicine' });
InventoryLog.belongsTo(Medicine, { foreignKey: 'medicineId', as: 'medicine' });
PredictionHistory.belongsTo(Medicine, { foreignKey: 'medicineId', as: 'medicine' });

module.exports = {
  sequelize,
  User,
  Medicine,
  Sale,
  SaleItem,
  Supplier,
  PredictionHistory,
  InventoryLog,
  Alert
};
