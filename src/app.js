require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const blogRoutes = require('./routes/blogRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// CORS - restrict to configured frontend origins
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const defaultOrigins = [
  'https://sbhhospital.com',
  'https://www.sbhhospital.com',
  'https://admin.sbhhospital.com',
  'http://localhost:5173',
];

const corsOrigins = allowedOrigins.length > 0 ? allowedOrigins : defaultOrigins;

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (no origin header, e.g. curl/Postman)
    if (!origin || corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/blogs', blogRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
