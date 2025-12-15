Task Manager API & Web Client

Aplikasi manajemen proyek dan task berbasis tim dengan otorisasi Role-Based Access Control (RBAC) dan Validasi Kepemilikan (Ownership). Dibangun dengan Node.js, Express, dan Prisma.

Tech Stack & Fitur Utama

* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL (via Prisma ORM)
* **Authentication & Security:** JWT (Access Token & Refresh Token), Bcrypt Hashing (salt rounds 12), Rate Limiting.
* **Validasi:** Zod (Schema Validation Middleware).
* **Otorisasi:** Role-Based Access Control (RBAC) - ADMIN dan USER. Serta Validasi Kepemilikan (Owner Bypass).
* **Deployment:** PM2 (Process Manager) di AWS EC2.

Persiapan Lokal (Local Setup)

#1. Prasyarat
Pastikan Anda sudah menginstal:
Node.js (v18+)
PostgreSQL Server (Lokal atau menggunakan Docker)

#2. Instalasi

Clone repository
git clone <URL_REPO_ANDA>
cd <nama_folder_proyek>

Install dependencies
npm install

#3. Konfigurasi Database
Buat file .env (berdasarkan .env.example) dan atur DATABASE_URL Anda ke server PostgreSQL lokal.

#4. Setup Database Schema & Data Awal
Jalankan migrasi dan seeder untuk membuat tabel dan mengisi data Admin/User:
#Generate Prisma Client & Run Migrations
npx prisma migrate dev --name init
#Run Seeder (Membuat Admin: admin@gmail.com dan 4 User Regular)
npx prisma db seed

#5. Menjalankan Aplikasi
npx nodemon server.js #Start server dengan nodemon
Aplikasi akan berjalan di http://localhost:3000

#Akun Demo

Password default: 123456

Role,    Email,            Deskripsi
ADMIN,   admin@gmail.com,   "CRUD semua Project & Task"
USER,    user@gmail.com,    "Akses project tempat diundang"