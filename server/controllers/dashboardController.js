const { Op, fn, col, literal } = require('sequelize');
const { Medicine, Sale, SaleItem, Alert, Supplier, User } = require('../models');

const getDashboard = async (req, res) => {
  try {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const in90Days = new Date(); in90Days.setDate(today.getDate() + 90);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [totalMedicines, lowStock, nearExpiry, totalSuppliers, unreadAlerts, totalManagers, totalSales, todaySales] = await Promise.all([
      Medicine.count({ where: { isActive: true } }),
      Medicine.count({ where: { isActive: true, currentStock: { [Op.lte]: literal('"minStockLevel"') } } }),
      Medicine.count({ where: { isActive: true, expiryDate: { [Op.between]: [today, in90Days] } } }),
      Supplier.count({ where: { isActive: true } }),
      Alert.count({ where: { isRead: false, isResolved: false } }),
      User.count({ where: { role: 'manager', isActive: true } }),
      Sale.count(),
      Sale.count({ where: { saleDate: { [Op.gte]: todayStart } } })
    ]);

    const availableStock = await Medicine.sum('currentStock', { where: { isActive: true } });

    const monthlySales = await Sale.findOne({
      attributes: [[fn('SUM', col('netAmount')), 'revenue'], [fn('COUNT', col('id')), 'count']],
      where: { saleDate: { [Op.gte]: monthStart } },
      raw: true
    });

    const topMedicines = await SaleItem.findAll({
      attributes: ['medicineId', [fn('SUM', col('quantity')), 'totalSold'], [fn('SUM', col('totalPrice')), 'revenue']],
      include: [{ model: Medicine, as: 'medicine', attributes: ['name', 'category'] }],
      group: ['medicineId', 'medicine.id', 'medicine.name', 'medicine.category'],
      order: [[literal('"totalSold"'), 'DESC']], limit: 5,
      raw: true, nest: true
    });

    const recentAlerts = await Alert.findAll({
      where: { isResolved: false },
      include: [{ model: Medicine, as: 'medicine', attributes: ['name'] }],
      order: [['createdAt', 'DESC']], limit: 10
    });

    const monthlySalesChart = await Sale.findAll({
      attributes: [
        [fn('TO_CHAR', col('saleDate'), 'Mon YYYY'), 'month'],
        [fn('SUM', col('netAmount')), 'revenue']
      ],
      group: [literal("TO_CHAR(\"saleDate\", 'Mon YYYY')"), fn('DATE_TRUNC', 'month', col('saleDate'))],
      order: [[fn('DATE_TRUNC', 'month', col('saleDate')), 'ASC']], limit: 6,
      raw: true
    });

    const categoryDist = await Medicine.findAll({
      attributes: ['category', [fn('COUNT', col('id')), 'count']],
      where: { isActive: true },
      group: ['category'],
      order: [[literal('"count"'), 'DESC']],
      raw: true
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalMedicines, lowStock, nearExpiry, totalSuppliers, unreadAlerts,
          totalManagers, totalSales, todaySales,
          availableStock: availableStock || 0,
          monthlyRevenue: monthlySales?.revenue || 0,
          monthlySalesCount: monthlySales?.count || 0
        },
        topMedicines, recentAlerts, monthlySalesChart, categoryDist
      }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getDashboard };
