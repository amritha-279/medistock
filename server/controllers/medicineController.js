const { Op } = require('sequelize');
const { Medicine, Supplier, InventoryLog, Alert } = require('../models');

const getAll = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 10, expiryFilter } = req.query;
    const where = { isActive: true };
    if (search) where.name = { [Op.iLike]: `%${search}%` };
    if (category) where.category = category;
    if (expiryFilter === 'near') {
      const d = new Date(); d.setDate(d.getDate() + 90);
      where.expiryDate = { [Op.lte]: d, [Op.gte]: new Date() };
    } else if (expiryFilter === 'expired') {
      where.expiryDate = { [Op.lt]: new Date() };
    }
    const { count, rows } = await Medicine.findAndCountAll({
      where, include: [{ model: Supplier, as: 'supplier', attributes: ['id', 'name'] }],
      limit: parseInt(limit), offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: rows, total: count, page: parseInt(page), pages: Math.ceil(count / limit) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getOne = async (req, res) => {
  try {
    const med = await Medicine.findByPk(req.params.id, { include: [{ model: Supplier, as: 'supplier' }] });
    if (!med) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.json({ success: true, data: med });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const create = async (req, res) => {
  try {
    const med = await Medicine.create(req.body);
    await InventoryLog.create({ medicineId: med.id, action: 'added', quantityChange: med.currentStock, previousStock: 0, newStock: med.currentStock, notes: 'Initial stock' });
    await checkAndCreateAlerts(med);
    res.status(201).json({ success: true, data: med });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const update = async (req, res) => {
  try {
    const med = await Medicine.findByPk(req.params.id);
    if (!med) return res.status(404).json({ success: false, message: 'Medicine not found' });
    const prevStock = med.currentStock;
    // Strip any undefined/null date fields to avoid overwriting with bad values
    const updateData = Object.fromEntries(Object.entries(req.body).filter(([, v]) => v !== undefined && v !== null && v !== ''));
    await med.update(updateData);
    if (req.body.currentStock !== undefined && parseInt(req.body.currentStock) !== prevStock) {
      await InventoryLog.create({ medicineId: med.id, action: 'adjusted', quantityChange: parseInt(req.body.currentStock) - prevStock, previousStock: prevStock, newStock: parseInt(req.body.currentStock) });
    }
    await checkAndCreateAlerts(med);
    res.json({ success: true, data: med });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const remove = async (req, res) => {
  try {
    await Medicine.update({ isActive: false }, { where: { id: req.params.id } });
    res.json({ success: true, message: 'Medicine deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getCategories = async (req, res) => {
  try {
    const cats = await Medicine.findAll({ attributes: ['category'], group: ['category'], where: { isActive: true } });
    res.json({ success: true, data: cats.map(c => c.category) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

async function checkAndCreateAlerts(med) {
  if (med.currentStock <= med.minStockLevel) {
    await Alert.findOrCreate({ where: { medicineId: med.id, alertType: 'low_stock', isResolved: false }, defaults: { message: `${med.name} is low on stock (${med.currentStock} remaining)`, severity: med.currentStock === 0 ? 'critical' : 'high' } });
  }
  const daysToExpiry = Math.ceil((new Date(med.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
  if (daysToExpiry <= 90 && daysToExpiry > 0) {
    await Alert.findOrCreate({ where: { medicineId: med.id, alertType: 'near_expiry', isResolved: false }, defaults: { message: `${med.name} expires in ${daysToExpiry} days`, severity: daysToExpiry <= 30 ? 'critical' : 'high' } });
  }
}

module.exports = { getAll, getOne, create, update, remove, getCategories };
