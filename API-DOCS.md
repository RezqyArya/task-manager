# API Endpoints Dokumentasi

Base URL: `http://localhost:3000/api`

# A. Autentikasi (`/api/auth`)

| Method | Endpoint | Deskripsi | Auth | Role |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Membuat akun pengguna baru. | Tidak | - |
| `POST` | `/auth/login` | Login, mengeluarkan Access Token (body) dan Refresh Token (cookie). | Tidak | - |
| `POST` | `/auth/refresh` | Memperbarui Access Token yang sudah kadaluarsa menggunakan Refresh Token di cookie. | Tidak | - |
| `GET` | `/auth/me` | Mengambil detail pengguna yang sedang login. | Wajib | USER/ADMIN |

# B. Project Management (`/api/projects`)

# 1. Create Project
* `POST /projects`
* Otorisasi: Hanya ADMIN yang dapat membuat Project baru.
* Body: `{"name": "Project A", "description": "Deskripsi"}`
* Success Response: 201 Created

# 2. List Projects & Filtering
`GET /projects`
Otorisasi: Wajib Login (USER/ADMIN).
Fitur Wajib:
    * Pagination: `?page=1&limit=10`
    * Search (Name/Description):** `?search=demo`
    * Sorting: `?sortBy=name&order=desc`

# 3. Update & Delete Project
* `PATCH /projects/:id`
* `DELETE /projects/:id`
* Otorisasi: Hanya Owner Project atau ADMIN. (Implementasi Validasi Kepemilikan)
* Error: Jika user bukan Owner dan bukan Admin, mengembalikan 403 Forbidden.

# C. Task Management (`/api/projects/:projectId/tasks` & `/api/tasks/:id`)

# 1. List & Create Task (Nesting)
* `GET /projects/:projectId/tasks` (List semua Task dalam satu Project)
* `POST /projects/:projectId/tasks` (Membuat Task baru di Project)
* Otorisasi (Create): Hanya Owner Project atau ADMIN.

# 2. Update Status & Detail Task
* `PATCH /tasks/:id`
* Otorisasi:
    * Mengubah Status (Move): Diizinkan untuk SEMUA Member Project.
    * Mengubah Detail/Judul: Hanya diizinkan untuk Owner Project atau ADMIN.

# 3. Delete Task
* `DELETE /tasks/:id`
* Otorisasi: Hanya Owner Project atau ADMIN.

# D. Format Response Standar

Semua *endpoint* menggunakan format respons terpusat (dikelola oleh Global Error Handler).

| Status Code | Success | Message | Contoh Penggunaan |
| :--- | :--- | :--- | :--- |
| 200 OK | `true` | `Data berhasil diambil.` | GET sukses, PUT sukses. |
| 201 Created | `true` | `Project berhasil dibuat.` | POST sukses. |
| 400 Bad Request | `false` | `Data validation failed.` | Zod error (input kurang/salah format). |
| 401 Unauthorized | `false` | `Token expired / Token hilang.` | JWT Error, User belum login. |
| 403 Forbidden | `false` | `Akses ditolak.` | RBAC/Ownership violation (User mencoba menghapus Project milik orang lain). |
| 404 Not Found | `false` | `Resource tidak ditemukan.` | ID yang diminta tidak ada di database. |