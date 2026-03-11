const express = require('express');
const router = express.Router();
const integrationController = require('../controllers/integrationController');
const { verifyToken, isHR } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(verifyToken);

// ATS Integration routes (HR only)
router.post('/ats', isHR, integrationController.createATSIntegration);
router.get('/ats', isHR, integrationController.getATSIntegrations);
router.post('/ats/:integrationId/sync', isHR, integrationController.syncWithATS);
router.post('/ats/webhook/queue', isHR, integrationController.queueWebhookEvent);

// Incoming webhook receiver
router.post('/webhook/:integrationId', integrationController.receiveWebhook);

// SSO Configuration (HR only)
router.post('/sso', isHR, integrationController.setupSSO);
router.get('/sso/:provider', integrationController.getSSOConfig);

// Slack Integration
router.post('/slack/configure', isHR, integrationController.configureSlackIntegration);
router.post('/slack/notify', isHR, integrationController.sendSlackNotification);

module.exports = router;
