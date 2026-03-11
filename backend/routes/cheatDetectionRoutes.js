const express = require('express');
const router = express.Router();
const cheatDetectionController = require('../controllers/cheatDetectionController');
const { verifyToken, isHR } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(verifyToken);

// Detect copy-paste (during challenge)
router.post('/detect-copy-paste', cheatDetectionController.detectCopyPaste);

// Detect external resources
router.post('/detect-external-resources', cheatDetectionController.detectExternalResources);

// Analyze keystroke pattern
router.post('/analyze-keystroke', cheatDetectionController.analyzeKeystrokePattern);

// Flag suspicious behavior
router.post('/flag-behavior', cheatDetectionController.flagSuspiciousBehavior);

// Get cheating flags for user
router.get('/flags', cheatDetectionController.getUserCheatingFlags);
router.get('/flags/:challengeId', cheatDetectionController.getUserCheatingFlags);

// Review flag (HR only)
router.put('/flags/:flagId/review', isHR, cheatDetectionController.reviewCheatingFlag);

// Detect plagiarism
router.post('/detect-plagiarism', cheatDetectionController.detectPlagiarism);

// Log behavior event (from ChallengeViewer telemetry)
router.post('/log-event', cheatDetectionController.logBehaviorEvent);

// HR: Get candidate flags for proctoring
router.get('/hr/candidate/:userId/flags', isHR, cheatDetectionController.getCandidateFlags);

module.exports = router;
