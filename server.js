// server.js (FILE SERVER STARTUP)

const app = require('./src/app');
const { PrismaClient } = require('@prisma/client');

// Initialize Database
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // 1. Koneksi ke Database
        await prisma.$connect();
        console.log('Database connected successfully.');

        // 2. Start Server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
        });

    } catch (error) {
        console.error('Failed to connect to the database or start server:', error);
        process.exit(1); 
    }
}

startServer();