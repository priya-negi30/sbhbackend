require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Auto-create/alter tables based on models. For production, prefer proper migrations.
    // await sequelize.sync({ alter: true });
    await sequelize.sync();
    console.log('✅ Database synced.');

    app.listen(PORT, () => {
      console.log(`🚀 SBH Hospital backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Unable to start server:', err.message);
    process.exit(1);
  }
}

start();
