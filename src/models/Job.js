const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Job = sequelize.define('Job', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, defaultValue: 'Full Time' },
  date: { type: DataTypes.STRING, allowNull: true }, // display date string, e.g. "02-02-2026"
  experience: { type: DataTypes.STRING, allowNull: true },
  qualification: { type: DataTypes.STRING, allowNull: true },
  note: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  link: { type: DataTypes.STRING, allowNull: true }, // e.g. mailto:hr@sbhhospital.com
  status: { type: DataTypes.ENUM('open', 'closed'), defaultValue: 'open' },
}, {
  tableName: 'jobs',
});

module.exports = Job;
