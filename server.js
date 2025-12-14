const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser'); // WAJIB: Untuk membaca refresh token dari cookie
const { PrismaClient } = require('@prisma/client');

// --- PERBAIKAN IMPORT PATH (Sekarang menunjuk ke src/routes/) ---
const authRoutes = require('./src/routes/authRoutes');
const projectRoutes = require('./src/routes/projectRoutes');
const taskRoutes = require('./src/routes/taskRoutes');

// Import Error Handler
const errorHandler = require('./src/middleware/errorHandler'); // Pastikan path ini juga benar

// Initialize App
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// =======================================================
// MIDDLEWARES GLOBAL
// =======================================================
app.use(cors());
app.use(express.json()); // Body parser
app.use(cookieParser()); // WAJIB: Cookie parser untuk Refresh Token
app.use(morgan('dev')); // Logger

// =======================================================
// ROUTES DEFINITION
// =======================================================

// Health Check Route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Auth Routes (Login, Register, Refresh Token, Me)
app.use('/api/auth', authRoutes);

// Project Routes (CRUD Project, Project List)
app.use('/api/projects', projectRoutes);

// Task Routes (CRUD Task by ID, Move Task)
// NOTE: Task routes yang di-nesting (Create, List Tasks) di-handle di projectRoutes
// sedangkan CRUD Task by ID (GET, PATCH, DELETE) di-handle di taskRoutes.
app.use('/api/tasks', taskRoutes); 
// Task routes yang di-nesting (untuk Create Task, Get All Tasks per Project)
// NOTE: Jika taskRoutes hanya berisi CRUD Task by ID, HAPUS baris di bawah ini.
// Karena kita nesting di projectController, kita biarkan saja di taskRoutes untuk menghindari konflik.

// Task routes yang di-nesting (untuk Create Task, Get All Tasks)
// Jika Anda memiliki route seperti router.post('/', ...) di taskRoutes,
// itu akan bentrok dengan /api/tasks (base route).
// Jika Anda ingin nesting, taskRoutes harus diubah untuk menerima { mergeParams: true }
app.use('/api/projects/:projectId/tasks', taskRoutes); 


// GLOBAL ERROR HANDLER (WAJIB DI POSISI PALING AKHIR)
app.use(errorHandler);

// =======================================================
// START SERVER
// =======================================================
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});