const express = require('express');
const router = express.Router();
const { getCandidates, getCandidateAnalytics } = require('../controllers/analyticsController');
const { verifyToken, isHR } = require('../middleware/authMiddleware');

// Validates token and HR role for all routes here
router.use(verifyToken, isHR);

// GET /hr/candidates
router.get('/candidates', getCandidates);

// GET /hr/analytics/:userId
router.get('/analytics/:userId', getCandidateAnalytics);

// GET /hr/analytics is broadly covered by candidates if it was an overall dashboard route
router.get('/analytics', getCandidates);

module.exports = router;
