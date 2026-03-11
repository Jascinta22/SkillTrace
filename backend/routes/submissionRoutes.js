const express = require('express');
const router = express.Router();
const { submitChallenge, getUserSubmissions, logBehavior, getScores } = require('../controllers/submissionController');
const { verifyToken } = require('../middleware/authMiddleware');

// Validates token for all submission/telemetry related routes
router.use(verifyToken);

// POST /submissions
router.post('/', submitChallenge);

// GET /submissions/:userId
router.get('/:userId', getUserSubmissions);

// POST /behavior-log
router.post('/behavior-log', logBehavior);

// GET /scores/:userId
router.get('/scores/:userId', getScores);

module.exports = router;

