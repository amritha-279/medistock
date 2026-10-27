const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { Medicine, PredictionHistory } = require('../models');

const runPython = (scriptName, inputData) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '../../ml-model', scriptName);
    const py = spawn(process.env.PYTHON_PATH || 'python', [scriptPath]);
    let output = '', error = '';
    py.stdout.on('data', d => output += d.toString());
    py.stderr.on('data', d => error += d.toString());
    py.on('close', code => {
      if (code !== 0) return reject(new Error(error || 'Python script failed'));
      try { resolve(JSON.parse(output)); } catch { reject(new Error('Invalid Python output')); }
    });
    py.stdin.write(JSON.stringify(inputData));
    py.stdin.end();
  });
};

const predictDemand = async (req, res) => {
  try {
    const medicines = await Medicine.findAll({ where: { isActive: true }, limit: 50 });
    const inputData = medicines.map(m => {
      const avgDailySales = parseFloat(m.currentStock) / 30.0;
      return {
        id: m.id, name: m.name, category: m.category,
        currentStock: m.currentStock,
        sellingPrice: parseFloat(m.sellingPrice),
        daysToExpiry: Math.ceil((new Date(m.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)),
        avgDailySales
      };
    });
    const result = await runPython('predict.py', { type: 'demand', data: inputData });
    for (const r of result.predictions || []) {
      await PredictionHistory.create({ medicineId: r.id, predictionType: 'demand', predictedValue: r.predictedDemand, confidence: r.confidence, inputFeatures: r, result: r });
    }
    res.json({ success: true, data: result });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const predictExpiryRisk = async (req, res) => {
  try {
    const medicines = await Medicine.findAll({ where: { isActive: true }, limit: 50 });
    const inputData = medicines.map(m => {
      const stock = parseFloat(m.currentStock);
      const avgDailySales = stock / 30.0;
      return {
        id: m.id, name: m.name, category: m.category,
        currentStock: m.currentStock,
        sellingPrice: parseFloat(m.sellingPrice),
        daysToExpiry: Math.ceil((new Date(m.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)),
        avgDailySales,
        stockTurnoverRate: avgDailySales / (stock + 0.001)
      };
    });
    const result = await runPython('predict.py', { type: 'expiry', data: inputData });
    for (const r of result.predictions || []) {
      await PredictionHistory.create({ medicineId: r.id, predictionType: 'expiry_risk', predictedValue: r.riskScore, confidence: r.confidence, riskLevel: r.riskLevel, inputFeatures: r, result: r });
    }
    res.json({ success: true, data: result });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getHistory = async (req, res) => {
  try {
    const history = await PredictionHistory.findAll({
      include: [{ model: Medicine, as: 'medicine', attributes: ['id', 'name', 'category'] }],
      order: [['createdAt', 'DESC']], limit: 50
    });
    res.json({ success: true, data: history });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getMetrics = async (req, res) => {
  try {
    const modelDir = path.join(__dirname, '../../ml-model/models');
    const readMetrics = (metricsPath) => new Promise((resolve) => {
      if (!fs.existsSync(metricsPath)) return resolve(null);
      const py = spawn(process.env.PYTHON_PATH || 'python', ['-c',
        `import joblib, json; m = joblib.load(r'${metricsPath}'); print(json.dumps(m))`
      ]);
      let out = '';
      py.stdout.on('data', d => out += d.toString());
      py.on('close', () => { try { resolve(JSON.parse(out)); } catch { resolve(null); } });
    });
    const result = {
      demand: await readMetrics(path.join(modelDir, 'demand_metrics.pkl')),
      expiry: await readMetrics(path.join(modelDir, 'expiry_metrics.pkl'))
    };
    res.json({ success: true, data: result });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const retrainModel = async (req, res) => {
  try {
    const { type } = req.params;
    if (!['demand', 'expiry'].includes(type))
      return res.status(400).json({ success: false, message: 'Invalid model type' });
    const script = type === 'demand' ? 'train_demand.py' : 'train_expiry.py';
    const scriptPath = path.join(__dirname, '../../ml-model', script);
    await new Promise((resolve, reject) => {
      const py = spawn(process.env.PYTHON_PATH || 'python', [scriptPath]);
      let out = '', err = '';
      py.stdout.on('data', d => out += d.toString());
      py.stderr.on('data', d => err += d.toString());
      py.on('close', code => code === 0 ? resolve(out) : reject(new Error(err || 'Training failed')));
    });
    res.json({ success: true, message: `${type} model retrained successfully` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { predictDemand, predictExpiryRisk, getHistory, getMetrics, retrainModel };
