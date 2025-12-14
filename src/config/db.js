// src/config/db.js
const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.NODE_ENV === 'production') {
  // Di production, buat instance baru biasa
  prisma = new PrismaClient();
} else {
  // Di development, cek apakah sudah ada instance global (Singleton Pattern)
  // Ini mencegah error "Too many connections" saat nodemon melakukan restart
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

module.exports = prisma;