const { Op, fn, col, literal } = require('sequelize');
const { Sale, SaleItem, Medicine, User, InventoryLog } = require('../models');

const generateInvoice = () => `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, search } = req.query;
    const where = {};
    if (startDate && endDate) where.saleDate = { [Op.between]: [startDate, endDate] };
    if (search) where[Op.or] = [{ invoiceNumber: { [Op.iLike]: `%${search}%` } }, { customerName: { [Op.iLike]: `%${search}%` } }];
    const { count, rows } = await Sale.findAndCountAll({
      where, include: [{ model: SaleItem, as: 'items', include: [{ model: Medicine, as: 'medicine', attributes: ['id', 'name'] }] }, { model: User, as: 'user', attributes: ['id', 'name'] }],
      limit: parseInt(limit), offset: (parseInt(page) - 1) * parseInt(limit), order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: rows, total: count, pages: Math.ceil(count / limit) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getOne = async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id, {
      include: [{ model: SaleItem, as: 'items', include: [{ model: Medicine, as: 'medicine' }] }, { model: User, as: 'user', attributes: ['id', 'name'] }]
    });
    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });
    res.json({ success: true, data: sale });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const create = async (req, res) => {
  const { sequelize } = require('../models');
  const t = await sequelize.transaction();
  try {
    const { customerName, customerPhone, items, discount = 0, paymentMethod, notes } = req.body;
    let totalAmount = 0;
    for (const item of items) {
      const med = await Medicine.findByPk(item.medicineId, { transaction: t });
      if (!med || med.currentStock < item.quantity) throw new Error(`Insufficient stock for ${med?.name}`);
      totalAmount += item.quantity * parseFloat(med.sellingPrice);
    }
    const netAmount = totalAmount - discount;
    const sale = await Sale.create({ invoiceNumber: generateInvoice(), customerName, customerPhone, totalAmount, discount, netAmount, paymentMethod, userId: req.user.id, notes, saleDate: new Date() }, { transaction: t });
    for (const item of items) {
      const med = await Medicine.findByPk(item.medicineId, { transaction: t });
      await SaleItem.create({ saleId: sale.id, medicineId: item.medicineId, quantity: item.quantity, unitPrice: med.sellingPrice, totalPrice: item.quantity * parseFloat(med.sellingPrice) }, { transaction: t });
      const newStock = med.currentStock - item.quantity;
      await InventoryLog.create({ medicineId: item.medicineId, action: 'sold', quantityChange: -item.quantity, previousStock: med.currentStock, newStock }, { transaction: t });
      await med.update({ currentStock: newStock }, { transaction: t });
    }
    await t.commit();
    res.status(201).json({ success: true, data: sale });
  } catch (err) { await t.rollback(); res.status(500).json({ success: false, message: err.message }); }
};

const getMonthlySales = async (req, res) => {
  try {
    const data = await Sale.findAll({
      attributes: [
        [fn('DATE_TRUNC', 'month', col('saleDate')), 'month'],
        [fn('SUM', col('netAmount')), 'revenue'],
        [fn('COUNT', col('id')), 'count']
      ],
      group: [literal("DATE_TRUNC('month', \"saleDate\")")],
      order: [[literal("DATE_TRUNC('month', \"saleDate\")"), 'ASC']],
      limit: 12
    });
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getAll, getOne, create, getMonthlySales };
