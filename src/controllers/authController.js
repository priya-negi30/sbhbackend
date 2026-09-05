const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Admin } = require('../models');

function signToken(admin) {
  return jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role, name: admin.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(admin);
    res.json({
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const admin = await Admin.findByPk(req.admin.id, { attributes: ['id', 'name', 'email', 'role'] });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json(admin);
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findByPk(req.admin.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const valid = await bcrypt.compare(currentPassword, admin.password);
    if (!valid) return res.status(401).json({ message: 'Current password is incorrect' });

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};
