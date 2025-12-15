// app.js (FILE KONFIGURASI APLIKASI)

const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

// --- Perhatikan path import, disesuaikan dengan asumsi path relatif ke server.js ---
// Anda harus memastikan path ini benar relatif terhadap posisi app.js
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined')); 
} else {
  app.use(morgan('dev')); 
}

// 2. CORS: Batasi Origin di Produksi untuk Keamanan
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['http://54.88.142.129'] 
  : '*'; 

app.use(cors({
    origin: allowedOrigins,
}));

// --- MIDDLEWARES (Global) ---
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// ==================================================================
// 1. PRIORITAS UTAMA: TAMPILKAN FRONTEND (HTML/CSS)
// Ini yang mencegah "cannot GET /" jika public/index.html ada
// ==================================================================
app.use(express.static(path.join(__dirname, '../public')));

// ==================================================================
// 2. PRIORITAS KEDUA: API ROUTES (Data)
// ==================================================================
app.get('/api/health', (req, res) => { // Tambahkan Health Check di sini
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// Task Routes: Pastikan taskRoutes menggunakan { mergeParams: true }
app.use('/api/projects/:projectId/tasks', taskRoutes);
app.use('/api/tasks', taskRoutes);


// ==================================================================
// 3. ERROR HANDLING 404 (WAJIB)
// ==================================================================
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(404).json({ success: false, message: `API Not Found - ${req.originalUrl}` });
  } else {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  }
});

// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error('ERROR 💥', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// --- EXPORT APLIKASI ---
module.exports = app;