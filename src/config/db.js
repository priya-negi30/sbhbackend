const { Sequelize } = require('sequelize');
const tedious = require('tedious');
require('dotenv').config();

// Cloud SQL Server providers (Azure SQL, AWS RDS for SQL Server, etc.) almost
// always require an encrypted connection. DB_ENCRYPT defaults to true for
// that reason — only set it to "false" for a local/on-prem SQL Server that
// isn't configured with a valid TLS certificate.
const encrypt = process.env.DB_ENCRYPT !== 'false';
const trustServerCertificate = process.env.DB_TRUST_SERVER_CERTIFICATE === 'true';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'sbh_hospitalold',
  process.env.DB_USER || 'appadm',
  process.env.DB_PASSWORD || 'ad@0808',
  {
    host: process.env.DB_HOST || '110.227.194.109',
    port: process.env.DB_PORT || 2739,
    dialect: 'mssql',
    dialectModule: tedious,
    dialectOptions: {
      options: {
        encrypt:true,
        trustServerCertificate:true,
        requestTimeout: 30000,
      },
    },
    logging: false,
    define: {
      underscored: true,
      timestamps: true,
    },
  }
);

module.exports = sequelize;
