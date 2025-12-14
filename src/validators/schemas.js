// src/validators/schemas.js
const { z } = require('zod');

// Schema Register
exports.registerSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Nama minimal 3 karakter"),
    email: z.string().email("Format email salah"),
    password: z.string().min(6, "Password minimal 6 karakter"),
  }),
});

// Schema Login
exports.loginSchema = z.object({
  body: z.object({
    email: z.string().email("Email wajib berformat valid"),
    password: z.string().min(1, "Password wajib diisi"),
  }),
});

// Schema Create Project
exports.createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Nama project minimal 3 karakter"),
    description: z.string().optional(),
  }),
});

// Schema Create Task
exports.createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Judul task harus diisi"),
    description: z.string().optional(),
  }),
});

// UPDATE TASK SCHEMA
exports.updateTaskSchema = z.object({
  // Body (Data yang dikirim di request body)
  body: z.object({
    // Judul dan Deskripsi dibuat optional, karena PATCH (update parsial)
    title: z.string().min(1, "Judul task harus diisi").optional(),
    description: z.string().optional(),
    
    // Status diizinkan, dan harus merupakan salah satu dari enum ini
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE'], { 
        message: "Status harus 'TODO', 'IN_PROGRESS', atau 'DONE'" 
    }).optional(),
  }).partial(),

  // Params (Data dari URL, yaitu ID Task)
  params: z.object({
    id: z.string().min(1, "ID task diperlukan"),
  })
});