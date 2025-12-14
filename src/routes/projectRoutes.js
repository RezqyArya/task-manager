const express = require('express');
const projectController = require('../controllers/projectController');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate'); 
const { createProjectSchema } = require('../validators/schemas'); 

const router = express.Router(); 

router.use(authController.protect); // Kunci semua route

// List & Create
router.route('/')
  .get(projectController.getAllProjects)
  .post(validate(createProjectSchema), projectController.createProject);

// Delete
router.route('/:id')
  .delete(projectController.deleteProject);

// --- ROUTE BARU: INVITE MEMBER ---
router.post('/:id/invite', projectController.inviteMember);

module.exports = router;