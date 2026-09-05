const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const GalleryImage = sequelize.define('GalleryImage', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: true },
  category: { type: DataTypes.STRING, allowNull: false, defaultValue: 'General' },
  url: { type: DataTypes.STRING, allowNull: false }, // relative path e.g. /uploads/gallery/xxx.jpg
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'gallery_images',
});

module.exports = GalleryImage;
