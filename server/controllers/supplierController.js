const { Op } = require('sequelize');
const { Supplier, Medicine } = require('../models');

const getAll = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const where = { isActive: true };
    if (search) where.name = { [Op.iLike]: `%${search}%` };
    const { count, rows } = await Supplier.findAndCountAll({ where, limit: parseInt(limit), offset: (parseInt(page) - 1) * parseInt(limit), order: [['name', 'ASC']] });
    res.json({ success: true, data: rows, total: count, pages: Math.ceil(count / limit) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getOne = async (req, res) => {
  try {
    const s = await Supplier.findByPk(req.params.id, { include: [{ model: Medicine, as: 'medicines', where: { isActive: true }, required: false }] });
    if (!s) return res.status(404).json({ success: false, message: 'Supplier not found' });
    res.json({ success: true, data: s });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const create = async (req, res) => {
  try {
    const s = await Supplier.create(req.body);
    res.status(201).json({ success: true, data: s });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const update = async (req, res) => {
  try {
    const s = await Supplier.findByPk(req.params.id);
    if (!s) return res.status(404).json({ success: false, message: 'Supplier not found' });
    await s.update(req.body);
    res.json({ success: true, data: s });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const remove = async (req, res) => {
  try {
    await Supplier.update({ isActive: false }, { where: { id: req.params.id } });
    res.json({ success: true, message: 'Supplier deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getAll, getOne, create, update, remove };
