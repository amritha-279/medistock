const bcrypt = require('bcryptjs');
const { User } = require('../models');

const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({ where: { role: 'manager' }, attributes: { exclude: ['password'] }, order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed, role: 'manager', phone });
    res.status(201).json({ success: true, data: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const updateUser = async (req, res) => {
  try {
    const { name, phone, isActive } = req.body;
    await User.update({ name, phone, isActive }, { where: { id: req.params.id } });
    res.json({ success: true, message: 'Manager updated' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const deleteUser = async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id)
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    await User.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Manager deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    const hashed = await bcrypt.hash(password, 12);
    await User.update({ password: hashed }, { where: { id: req.params.id } });
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getUsers, createUser, updateUser, deleteUser, resetPassword };
