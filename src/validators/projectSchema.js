const { z } = require('zod');

const createProjectSchema = z.object({
  name: z.string().min(3, "Nama project minimal 3 karakter"),
  description: z.string().optional()
});

const updateProjectSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional()
});

const addMemberSchema = z.object({
  email: z.string().email("Format email member tidak valid")
});

module.exports = { createProjectSchema, updateProjectSchema, addMemberSchema };