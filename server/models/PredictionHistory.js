const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PredictionHistory = sequelize.define('PredictionHistory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  medicineId: { type: DataTypes.INTEGER },
  predictionType: { type: DataTypes.ENUM('demand', 'expiry_risk') },
  predictedValue: { type: DataTypes.FLOAT },
  confidence: { type: DataTypes.FLOAT },
  riskLevel: { type: DataTypes.STRING(50) },
  inputFeatures: { type: DataTypes.JSONB },
  result: { type: DataTypes.JSONB }
}, { tableName: 'prediction_history', timestamps: true });

module.exports = PredictionHistory;
