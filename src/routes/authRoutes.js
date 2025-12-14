const express = require('express');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate'); // Import Middleware
const { registerSchema, loginSchema } = require('../validators/schemas'); // Import Schema

const router = express.Router();

// Pasang validate() sebelum controller
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refreshToken);

module.exports = router;