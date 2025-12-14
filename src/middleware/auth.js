const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  
  // 1. Ambil token dari header Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Anda belum login. Silakan login untuk akses.', 401));
  }

  // 2. Verifikasi Token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3. Cek apakah user masih ada di database
  const currentUser = await prisma.user.findUnique({
    where: { id: decoded.id }
  });

  if (!currentUser) {
    return next(new AppError('Token milik user ini sudah tidak valid.', 401));
  }

  // 4. Simpan user ke request object
  req.user = currentUser;
  next();
});