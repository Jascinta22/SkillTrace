const express = require('express');
const router = express.Router();
const { createChallenge, getAllChallenges, getChallengeById, getRandomQuestions } = require('../controllers/challengeController');
const { verifyToken, isHR } = require('../middleware/authMiddleware');

// GET /challenges/random (Protected)
router.get('/random', verifyToken, getRandomQuestions);

// POST /challenges (Protected, HR only)
router.post('/', verifyToken, isHR, createChallenge);

// GET /challenges (Protected, all logged in users)
router.get('/', verifyToken, getAllChallenges);

// GET /challenges/:id (Protected)
router.get('/:id', verifyToken, getChallengeById);

module.exports = router;

