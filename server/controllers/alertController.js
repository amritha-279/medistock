const { Alert, Medicine } = require('../models');

const getAll = async (req, res) => {
  try {
    const alerts = await Alert.findAll({
      where: { isResolved: false },
      include: [{ model: Medicine, as: 'medicine', attributes: ['id', 'name', 'category'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: alerts });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const markRead = async (req, res) => {
  try {
    await Alert.update({ isRead: true }, { where: { id: req.params.id } });
    res.json({ success: true, message: 'Alert marked as read' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const resolve = async (req, res) => {
  try {
    await Alert.update({ isResolved: true }, { where: { id: req.params.id } });
    res.json({ success: true, message: 'Alert resolved' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const generateAlerts = async (req, res) => {
  try {
    const medicines = await Medicine.findAll({ where: { isActive: true } });
    let created = 0;
    for (const med of medicines) {
      // Low stock alert
      if (med.currentStock <= med.minStockLevel) {
        const [, wasCreated] = await Alert.findOrCreate({
          where: { medicineId: med.id, alertType: 'low_stock', isResolved: false },
          defaults: { message: `${med.name} is low on stock (${med.currentStock} remaining)`, severity: med.currentStock === 0 ? 'critical' : 'high' }
        });
        if (wasCreated) created++;
      }

      const daysToExpiry = Math.ceil((new Date(med.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));

      // Near expiry alert
      if (daysToExpiry <= 90 && daysToExpiry > 0) {
        const [, wasCreated] = await Alert.findOrCreate({
          where: { medicineId: med.id, alertType: 'near_expiry', isResolved: false },
          defaults: { message: `${med.name} expires in ${daysToExpiry} days`, severity: daysToExpiry <= 30 ? 'critical' : 'high' }
        });
        if (wasCreated) created++;
      }

      // High expiry risk alert — stock won't sell before expiry
      const avgDailySales = med.currentStock / 30.0;
      const daysToSell = avgDailySales > 0 ? med.currentStock / avgDailySales : 9999;
      if (daysToExpiry > 0 && daysToSell > daysToExpiry) {
        const [, wasCreated] = await Alert.findOrCreate({
          where: { medicineId: med.id, alertType: 'high_expiry_risk', isResolved: false },
          defaults: { message: `${med.name} may expire before being sold (${daysToExpiry} days left, ~${Math.ceil(daysToSell)} days to sell)`, severity: daysToExpiry <= 30 ? 'critical' : 'high' }
        });
        if (wasCreated) created++;
      }

      // High demand alert — stock critically low relative to min level
      if (med.currentStock <= med.minStockLevel * 0.5 && med.minStockLevel > 0) {
        const [, wasCreated] = await Alert.findOrCreate({
          where: { medicineId: med.id, alertType: 'demand_surge', isResolved: false },
          defaults: { message: `${med.name} has critically low stock (${med.currentStock} units) — high demand likely`, severity: 'critical' }
        });
        if (wasCreated) created++;
      }
    }
    res.json({ success: true, message: `${created} alerts generated` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getAll, markRead, resolve, generateAlerts };
