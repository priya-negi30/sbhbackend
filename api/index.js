// Vercel serverless entry point.
//
// Vercel needs a file that plainly exports the Express app (no app.listen(),
// no blocking startup work) so it can wrap each request as a function
// invocation. Local development still uses src/server.js (npm run dev),
// which additionally verifies the DB connection and runs sequelize.sync()
// before calling app.listen() — that startup pattern doesn't apply here.
const app = require('../src/app');

module.exports = app;
