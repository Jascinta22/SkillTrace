const db = require('../config/db');

// @route   POST /challenges
// @desc    Create a new challenge (HR only)
const createChallenge = async (req, res) => {
    const { title, description, type, difficulty, questions } = req.body;
    const userId = req.user.userId;

    if (!title || !description || !type || !difficulty) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }

    try {
        await db.query('BEGIN'); // Start transaction

        // Insert Challenge
        const challengeResult = await db.query(
            'INSERT INTO challenges (title, description, type, difficulty, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, description, type, difficulty, userId]
        );
        const newChallenge = challengeResult.rows[0];

        // Insert Questions if any
        if (questions && questions.length > 0) {
            for (let q of questions) {
                await db.query(
                    'INSERT INTO questions (challenge_id, question_text, code_snippet, expected_answer, points) VALUES ($1, $2, $3, $4, $5)',
                    [newChallenge.id, q.question_text, q.code_snippet, q.expected_answer, q.points || 10]
                );
            }
        }

        await db.query('COMMIT'); // Commit transaction
        res.status(201).json({ message: 'Challenge created successfully', challenge: newChallenge });
    } catch (err) {
        await db.query('ROLLBACK'); // Rollback on error
        console.error(err);
        res.status(500).json({ error: 'Server error creating challenge' });
    }
};

// @route   GET /challenges
// @desc    Get all challenges
const getAllChallenges = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT c.*, u.name as company_name 
             FROM challenges c 
             LEFT JOIN users u ON c.created_by = u.id 
             ORDER BY c.created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching challenges' });
    }
};

// @route   GET /challenges/:id
// @desc    Get specific challenge with related questions
const getChallengeById = async (req, res) => {
    const { id } = req.params;

    try {
        const challengeResult = await db.query('SELECT * FROM challenges WHERE id = $1', [id]);

        if (challengeResult.rows.length === 0) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        const challenge = challengeResult.rows[0];

        const questionsResult = await db.query('SELECT * FROM questions WHERE challenge_id = $1', [id]);
        challenge.questions = questionsResult.rows;

        res.json(challenge);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching challenge' });
    }
};

// @route   GET /challenges/random
// @desc    Get 10 random questions for a specific skill and difficulty
const getRandomQuestions = async (req, res) => {
    const { skill, difficulty } = req.query;

    if (!skill || !difficulty) {
        return res.status(400).json({ error: 'Please provide skill and difficulty' });
    }

    try {
        const query = `
            SELECT q.*, c.title as skill_name, c.difficulty 
            FROM questions q 
            JOIN challenges c ON q.challenge_id = c.id 
            WHERE LOWER(c.title) = LOWER($1) AND LOWER(c.difficulty) = LOWER($2)
            ORDER BY RANDOM()
            LIMIT 10
        `;
        const result = await db.query(query, [skill, difficulty]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No questions found for this skill and difficulty' });
        }

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching random questions' });
    }
};

module.exports = { createChallenge, getAllChallenges, getChallengeById, getRandomQuestions };
