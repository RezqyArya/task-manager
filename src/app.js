const express = require('express');
const cors = require('cors');
const path = require('path'); // <--- WAJIB ADA
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// --- MIDDLEWARES ---
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

if (process.env.NODE_ENV === 'development') {
  
}

// ==================================================================
// 1. PRIORITAS UTAMA: TAMPILKAN FRONTEND (HTML/CSS)
// ==================================================================
app.use(express.static(path.join(__dirname, '../public')));

// ==================================================================
// 2. PRIORITAS KEDUA: API ROUTES (Data)
// ==================================================================
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/tasks', taskRoutes);
app.use('/api/tasks', taskRoutes);

// ==================================================================
// 3. ERROR HANDLING
// ==================================================================
// Jika rute tidak ditemukan di Frontend maupun API
app.use((req, res, next) => {
  // Cek apakah request meminta API (JSON) atau Halaman Web
  if (req.originalUrl.startsWith('/api')) {
    res.status(404).json({ success: false, message: `API Not Found - ${req.originalUrl}` });
  } else {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  }
});

app.use((err, req, res, next) => {
  console.error('ERROR 💥', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;