const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { safeParseJson } = require('../utils/safeJson');

const Blog = sequelize.define('Blog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  permalink: { type: DataTypes.STRING, allowNull: false, unique: true },
  title: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: true },
  author: { type: DataTypes.STRING, allowNull: true },
  author_role: { type: DataTypes.STRING, allowNull: true },
  date: { type: DataTypes.STRING, allowNull: true }, // display date, e.g. "17 Jul 2026"
  excerpt: { type: DataTypes.TEXT, allowNull: true },
  image: { type: DataTypes.STRING, allowNull: true },
  author_image: { type: DataTypes.STRING, allowNull: true },
  tags: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    get() {
      return safeParseJson(this.getDataValue('tags'), []);
    },
  }, // string[]
  meta: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {},
    get() {
      return safeParseJson(this.getDataValue('meta'), {});
    },
  }, // { title, description, keywords }
  content: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    get() {
      return safeParseJson(this.getDataValue('content'), []);
    },
  }, // ContentBlock[]
  status: { type: DataTypes.ENUM('draft', 'published'), defaultValue: 'published' },
}, {
  tableName: 'blogs',
});

module.exports = Blog;
