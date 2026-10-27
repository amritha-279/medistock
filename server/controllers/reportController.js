const { Op, fn, col, literal } = require('sequelize');
const { Medicine, Sale, SaleItem, Supplier } = require('../models');

const inventoryReport = async (req, res) => {
  try {
    const medicines = await Medicine.findAll({
      where: { isActive: true },
      include: [{ model: Supplier, as: 'supplier', attributes: ['name'] }],
      order: [['name', 'ASC']]
    });
    res.json({ success: true, data: medicines });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const salesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate && endDate) where.saleDate = { [Op.between]: [startDate, endDate] };
    const sales = await Sale.findAll({
      where,
      include: [{ model: SaleItem, as: 'items', include: [{ model: Medicine, as: 'medicine', attributes: ['name', 'category'] }] }],
      order: [['saleDate', 'DESC']]
    });
    const summary = await Sale.findOne({
      attributes: [[fn('SUM', col('netAmount')), 'totalRevenue'], [fn('COUNT', col('id')), 'totalSales'], [fn('AVG', col('netAmount')), 'avgSaleValue']],
      where,
      raw: true
    });
    res.json({ success: true, data: sales, summary });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const expiryReport = async (req, res) => {
  try {
    const today = new Date();
    const in30 = new Date(); in30.setDate(today.getDate() + 30);
    const in90 = new Date(); in90.setDate(today.getDate() + 90);
    const [expired, expiring30, expiring90] = await Promise.all([
      Medicine.findAll({ where: { isActive: true, expiryDate: { [Op.lt]: today } }, order: [['expiryDate', 'ASC']] }),
      Medicine.findAll({ where: { isActive: true, expiryDate: { [Op.between]: [today, in30] } }, order: [['expiryDate', 'ASC']] }),
      Medicine.findAll({ where: { isActive: true, expiryDate: { [Op.between]: [in30, in90] } }, order: [['expiryDate', 'ASC']] })
    ]);
    res.json({ success: true, data: { expired, expiring30, expiring90 } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const demandReport = async (req, res) => {
  try {
    const topSelling = await SaleItem.findAll({
      attributes: ['medicineId', [fn('SUM', col('quantity')), 'totalSold'], [fn('SUM', col('totalPrice')), 'revenue']],
      include: [{ model: Medicine, as: 'medicine', attributes: ['name', 'category', 'currentStock'] }],
      group: ['medicineId', 'medicine.id', 'medicine.name', 'medicine.category', 'medicine.currentStock'],
      order: [[literal('"totalSold"'), 'DESC']], limit: 20,
      raw: true, nest: true
    });
    res.json({ success: true, data: topSelling });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { inventoryReport, salesReport, expiryReport, demandReport };
