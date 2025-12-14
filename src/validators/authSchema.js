const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter")
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

module.exports = { registerSchema, loginSchema };