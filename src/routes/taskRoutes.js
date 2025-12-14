const express = require('express');
const taskController = require('../controllers/taskController');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { createTaskSchema, updateTaskSchema } = require('../validators/schemas');

const router = express.Router({ mergeParams: true });

// Semua route di bawah task harus login
router.use(authController.protect);

// --- ROUTE UTAMA PROJECT/TASKS ---
// URL: /api/projects/:projectId/tasks
router.route('/')
  // Middleware otorisasi: Cek apakah user punya akses ke :projectId
  .get(taskController.checkProjectAccess, taskController.getTasksByProject)
  .post(
      taskController.checkProjectAccess, // Cek akses project
      validate(createTaskSchema), // Validasi body input
      taskController.createTask
  );

// --- ROUTE TASK SPESIFIK (by :id) ---
// URL: /api/tasks/:id
router.route('/:id')
  .patch(
      validate(updateTaskSchema), // Validasi body & params
      taskController.updateTask
  )
  .delete(taskController.deleteTask);

module.exports = router;