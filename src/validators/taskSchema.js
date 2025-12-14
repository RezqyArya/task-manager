const { z } = require('zod');

const createTaskSchema = z.object({
  title: z.string().min(3, "Judul task minimal 3 karakter"),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(), // Format ISO 8601
  assigneeId: z.number().optional()
});

const updateTaskSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"], {
    errorMap: () => ({ message: "Status harus TODO, IN_PROGRESS, atau DONE" })
  }).optional(),
  dueDate: z.string().datetime().optional(),
  assigneeId: z.number().nullable().optional() // Nullable untuk unassign
});

module.exports = { createTaskSchema, updateTaskSchema };