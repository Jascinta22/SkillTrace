const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { verifyToken, isHR } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(verifyToken);

// User analytics routes
router.get('/dashboard', analyticsController.getPerformanceDashboard);
router.get('/benchmark/:challengeId', analyticsController.getBenchmarkingData);
router.get('/skill-gaps', analyticsController.getSkillGapAnalysis);
router.get('/trends', analyticsController.getTrendAnalysis);

// HR analytics routes
router.get('/hr/candidates', isHR, analyticsController.getCandidates);
router.get('/hr/candidate/:userId', isHR, analyticsController.getCandidateAnalytics);
router.get('/hr/global', isHR, analyticsController.getGlobalHRAnalytics);
router.post('/hr/benchmark/:challengeId/update', isHR, analyticsController.updateBenchmarkScores);

module.exports = router;
