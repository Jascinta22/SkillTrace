const express = require('express');
const router = express.Router();
const mfaController = require('../controllers/mfaController');
const { verifyToken } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(verifyToken);

// GET MFA status
router.get('/status', mfaController.getMFAStatus);

// Setup MFA
router.post('/setup', mfaController.setupMFA);

// Enable MFA
router.post('/enable', mfaController.enableMFA);

// Verify MFA token
router.post('/verify', mfaController.verifyMFAToken);

// Disable MFA
router.delete('/disable', mfaController.disableMFA);

module.exports = router;
