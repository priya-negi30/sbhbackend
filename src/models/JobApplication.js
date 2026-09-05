const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const JobApplication = sequelize.define('JobApplication', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  job_id: { type: DataTypes.INTEGER, allowNull: false },
  job_title: { type: DataTypes.STRING, allowNull: true }, // snapshot at time of application
  fname: { type: DataTypes.STRING, allowNull: false },
  gender: { type: DataTypes.STRING, allowNull: true },
  current_location: { type: DataTypes.STRING, allowNull: true },
  address: { type: DataTypes.STRING, allowNull: true },
  current_company: { type: DataTypes.STRING, allowNull: true },
  current_designation: { type: DataTypes.STRING, allowNull: true },
  current_ctc: { type: DataTypes.STRING, allowNull: true },
  contact_no: { type: DataTypes.STRING, allowNull: true },
  marital_status: { type: DataTypes.STRING, allowNull: true },
  email: { type: DataTypes.STRING, allowNull: true },
  qualification: { type: DataTypes.STRING, allowNull: true },
  notice_period: { type: DataTypes.STRING, allowNull: true },
  resume_path: { type: DataTypes.STRING, allowNull: true }, // relative path e.g. /uploads/resumes/xxx.pdf
  status: { type: DataTypes.ENUM('new', 'reviewed', 'shortlisted', 'rejected'), defaultValue: 'new' },
}, {
  tableName: 'job_applications',
});

module.exports = JobApplication;
