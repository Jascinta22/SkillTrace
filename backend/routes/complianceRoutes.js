const express = require('express');
const router = express.Router();
const complianceController = require('../controllers/complianceController');
const { verifyToken, isHR } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(verifyToken);

// User compliance routes
router.get('/consent-records', complianceController.getConsentRecords);
router.post('/consent', complianceController.recordConsent);
router.post('/consent-withdraw', complianceController.withdrawConsent);

// GDPR Data rights
router.post('/gdpr/deletion-request', complianceController.requestGDPRDeletion);
router.get('/gdpr/deletion-status', complianceController.checkGDPRStatus);
router.get('/export-data', complianceController.exportUserData);

// HR/Admin compliance routes
router.get('/audit-logs', isHR, complianceController.getAuditLogs);
router.put('/gdpr/:requestId/execute', isHR, complianceController.executeGDPRDeletion);
router.get('/retention-policies', isHR, complianceController.getRetentionPolicies);

module.exports = router;
