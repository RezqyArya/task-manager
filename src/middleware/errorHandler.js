// src/middleware/errorHandler.js
const { ZodError } = require('zod');

// Middleware Error Handler Global (memiliki 4 parameter)
const errorHandler = (err, req, res, next) => {
    
    // 1. Default Status dan Message
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Terjadi kesalahan internal server.';
    let errors = null; // Untuk menampung detail error (misal dari Zod)

    // 2. Penanganan Error Zod (Validasi)
    if (err instanceof ZodError) {
        statusCode = 400; // Bad Request
        message = 'Validasi data gagal.';
        // Map error Zod menjadi array string yang mudah dibaca
        errors = err.errors.map(error => ({
            path: error.path.join('.'),
            message: error.message
        }));
    }

    // 3. Penanganan Error JWT (Token Invalid/Expired)
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        statusCode = 401; // Unauthorized
        message = 'Akses ditolak. Token tidak valid atau sudah kadaluarsa.';
    }

    // 4. Penanganan Error Prisma (Duplikasi unik, dll.)
    if (err.code && err.code.startsWith('P')) {
        if (err.code === 'P2002') {
            statusCode = 409; // Conflict
            message = `Data duplikat. ${err.meta.target.join(', ')} sudah terdaftar.`;
        } else if (err.code === 'P2025') {
            statusCode = 404; // Not Found
            message = 'Data yang diminta tidak ditemukan.';
        }
    }


    // 5. Kirim Response JSON
    res.status(statusCode).json({
        success: false,
        message: message,
        ...(errors && { errors }) 
    });
};

module.exports = errorHandler;