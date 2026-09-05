const sequelize = require('../config/db');
const Admin = require('./Admin');
const Doctor = require('./Doctor');
const GalleryImage = require('./GalleryImage');
const Job = require('./Job');
const JobApplication = require('./JobApplication');
const Blog = require('./Blog');

Job.hasMany(JobApplication, { foreignKey: 'job_id', as: 'applications' });
JobApplication.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });

module.exports = {
  sequelize,
  Admin,
  Doctor,
  GalleryImage,
  Job,
  JobApplication,
  Blog,
};
