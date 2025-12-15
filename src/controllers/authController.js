const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { promisify } = require('util'); // Dibutuhkan untuk jwt.verify async

const prisma = new PrismaClient();

// HELPER FUNCTIONS (Token Signing & Sending)
console.log("JWT_SECRET:", process.env.JWT_SECRET);
// 1. Helper untuk buat Access Token (Berlaku pendek)
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'rahasia-negara', {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m', // Akses token pendek
    });
};

// 2. Helper untuk buat Refresh Token (Berlaku panjang)
const signRefreshToken = (id) => {
    // Pastikan menggunakan variabel ENV yang benar, atau default yang sangat panjang
    return jwt.sign({ id }, process.env.JWT_SECRET || 'rahasia-negara', {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d', // Refresh token panjang
    });
};

// 3. Helper untuk mengirim Token dan menyetel Cookie
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    // Hitung durasi cookie (dari hari ke milidetik)
    const refreshExpiresInDays = parseInt(process.env.JWT_REFRESH_COOKIE_EXPIRES_IN) || 7;

    const cookieOptions = {
        expires: new Date(
            Date.now() + refreshExpiresInDays * 24 * 60 * 60 * 1000 
        ),
        httpOnly: true, // WAJIB: Melindungi dari XSS
        secure: process.env.NODE_ENV === 'production', // WAJIB: Hanya kirim via HTTPS di production
    };

    // Set Refresh Token di Cookie
    res.cookie('jwt_refresh', refreshToken, cookieOptions);

    // Kirim Access Token di response body
    user.password = undefined; // Sembunyikan password
    
    return res.status(statusCode).json({
        success: true,
        message: 'Login berhasil.',
        token,
        data: {
            user
        }
    });
};

// AUTHENTICATION HANDLERS

// 1. REGISTER
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    // Cek apakah email sudah ada
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        // Menggunakan status 409 Conflict lebih tepat untuk duplikat resource
        return res.status(409).json({ success: false, message: 'Email sudah terdaftar' });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Buat User Baru
    const newUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: 'USER', 
        },
    });

    // Menggunakan createSendToken untuk otomatisasi
    createSendToken(newUser, 201, res);
};


// 2. LOGIN
exports.login = async (req, res) => {
    const { email, password } = req.body;

    // 1. Cek keberadaan user
    const user = await prisma.user.findUnique({ where: { email } });

    // 2. Cek password
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ success: false, message: 'Email atau Password salah' });
    }

    // 3. Kirim Token (Access Token di body, Refresh Token di cookie)
    createSendToken(user, 200, res);
};

// 3. REFRESH TOKEN
exports.refreshToken = async (req, res, next) => {
    // 1. Ambil Refresh Token dari Cookie
    // Nama cookie: 'jwt_refresh'
    const refreshToken = req.cookies.jwt_refresh;

    if (!refreshToken) {
        return res.status(401).json({ success: false, message: 'Autentikasi diperlukan. Refresh token hilang.' });
    }

    try {
        // 2. Verifikasi Refresh Token
        // Menggunakan promisify(jwt.verify) agar kompatibel dengan async/await
        const decoded = await promisify(jwt.verify)(refreshToken, process.env.JWT_SECRET || 'rahasia-negara');

        // 3. Cari User berdasarkan ID di Token
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'User pemilik token ini sudah tidak ada.' });
        }
        
        // 4. Buat Access Token baru dan kirim kembali
        const newAccessToken = signToken(user.id);
        
        res.status(200).json({ 
            success: true, 
            message: 'Token berhasil diperbarui.',
            token: newAccessToken,
            data: { 
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            } 
        });

    } catch (err) {
        // TokenExpiredError atau JsonWebTokenError
        return res.status(401).json({ success: false, message: 'Refresh token tidak valid atau sudah kedaluwarsa. Mohon login ulang.' });
    }
};


// 4. PROTECT (Middleware untuk cek login)
exports.protect = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Anda belum login. Silakan login dulu.' });
    }

    try {
        // Verifikasi Token
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET || 'rahasia-negara');

        // Cek apakah user masih ada di DB
        const currentUser = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!currentUser) {
            return res.status(401).json({ success: false, message: 'User pemilik token ini sudah tidak ada.' });
        }

        req.user = currentUser;
        next();

    } catch (err) {
        // Error JWT (misal TokenExpiredError) akan dilempar ke Global Handler
        next(err); 
    }
};

// 5. GET ME (Mendapatkan data user yang sedang login)
exports.getMe = (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            user: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
            }
        }
    });
};