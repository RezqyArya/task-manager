# Task Manager API & Web Client

Aplikasi manajemen **Project dan Task berbasis tim** yang dibangun sebagai **REST API siap produksi**. Sistem ini menerapkan **Role-Based Access Control (RBAC)** dan **validasi kepemilikan data (ownership)** untuk memastikan keamanan serta pembatasan akses antar pengguna.

---

## Teknologi yang Digunakan
- **Backend:** Node.js v18+, Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (Access Token & Refresh Token)
- **Security:** Bcrypt Hashing (salt rounds 12), Rate Limiting
- **Validation:** Zod
- **Authorization:** RBAC (ADMIN, USER) & Ownership Validation
- **Deployment:** PM2 (AWS EC2)

---

## Fitur Utama
1. Autentikasi dan otorisasi berbasis JWT.
2. Role **ADMIN** dan **USER** dengan hak akses berbeda.
3. CRUD Project dan Task berbasis tim.
4. Validasi kepemilikan data untuk mencegah akses tidak sah.
5. REST API siap produksi dan dapat di-deploy ke cloud server.

---

### Production URL

- http://54.88.142.129:3000
- https://ec2-54-88-142-129.compute-1.amazonaws.com/

```

## Cara Menjalankan Aplikasi (Lokal)

### Prasyarat
- Node.js v18+
- PostgreSQL

### Instalasi
```
git clone <URL_REPO_ANDA>
cd <nama_folder_proyek>
npm install

```

### Konfigurasi & Database
```
cp .env.example .env
npx prisma migrate dev --name init
npx prisma db seed

```

### Menjalankan Server (Lokal)
```
npx nodemon server.js

```

### Aplikasi berjalan pada:
```
http://localhost:3000

```

### Akun Demo
``` bash
Password default: password123

Role,    Email,            Deskripsi
ADMIN,   admin@gmail.com,   "CRUD semua Project & Task"
USER,    user@gmail.com,    "Akses project tempat diundang"
```