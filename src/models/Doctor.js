const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { safeParseJson } = require('../utils/safeJson');

const Doctor = sequelize.define('Doctor', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  specialities: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    get() {
      return safeParseJson(this.getDataValue('specialities'), []);
    },
  }, // string[]
  clinics: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    get() {
      return safeParseJson(this.getDataValue('clinics'), []);
    },
  }, // string[]
  degree: { type: DataTypes.STRING, allowNull: true },
  location: { type: DataTypes.STRING, allowNull: true },
  rating: { type: DataTypes.FLOAT, defaultValue: 5 },
  available: { type: DataTypes.BOOLEAN, defaultValue: true },
  languages: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    get() {
      return safeParseJson(this.getDataValue('languages'), []);
    },
  }, // string[]
  like_percentage: { type: DataTypes.STRING, allowNull: true },
  votes: { type: DataTypes.STRING, allowNull: true },
  experience: { type: DataTypes.INTEGER, defaultValue: 0 },
  fees: { type: DataTypes.INTEGER, defaultValue: 0 },
  next_available: { type: DataTypes.STRING, allowNull: true },
  image: { type: DataTypes.STRING, allowNull: true }, // relative path e.g. /uploads/doctors/xxx.png
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'doctors',
});

module.exports = Doctor;
