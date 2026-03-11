const db = require('../config/db');
const { calculateIntegrityScore, calculateOverallScore, calculateCodeQualityScore } = require('../utils/calculateScores');

// @route   POST /submissions
// @desc    Submit challenge answers and process score/telemetry
const submitChallenge = async (req, res) => {
    const { challenge_id, question_id, answer, telemetry } = req.body;
    const userId = req.user.userId;

    if (!challenge_id || !answer) {
        return res.status(400).json({ error: 'Missing required submission fields' });
    }

    try {
        await db.query('BEGIN');

        // 1. Insert Submission
        // For simplicity, we assign a base score dependent on challenge data, mock calculated here
        let scoreResult = Math.floor(Math.random() * 40) + 60; // Random mock score between 60-100 for a particular answer

        // 1.5 Calculate Code Quality for coding challenges
        let codeQualityFeedback = null;
        if (answer && typeof answer === 'string' && answer.length > 10) {
            codeQualityFeedback = calculateCodeQualityScore(answer);
            // Factor into the base score (give it a 20% weight)
            scoreResult = Math.round((scoreResult * 0.8) + (codeQualityFeedback.qualityScore * 0.2));
        }

        const submissionResult = await db.query(
            'INSERT INTO submissions (user_id, challenge_id, question_id, answer, score) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, challenge_id, question_id || null, answer, scoreResult]
        );

        // 2. Insert Behavior Logs if provided
        let integrityScore = 100;
        if (telemetry) {
            await db.query(
                `INSERT INTO behavior_logs (user_id, challenge_id, tab_switch_count, copy_paste_count, focus_loss_count, ai_usage_flag) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [userId, challenge_id, telemetry.tab_switch_count || 0, telemetry.copy_paste_count || 0, telemetry.focus_loss_count || 0, telemetry.ai_usage_flag || false]
            );
            integrityScore = calculateIntegrityScore(telemetry);
        }

        // 3. Update Skill Scores Formatted record
        // Mock mapping the challenge type to a specific skill score
        const skillScoresResult = await db.query('SELECT * FROM skill_scores WHERE user_id = $1 AND challenge_id = $2', [userId, challenge_id]);

        let newSkillData = { coding_score: 0, debugging_score: 0, decision_score: 0, communication_score: 0, integrity_score: integrityScore };

        const cTypeRes = await db.query('SELECT type FROM challenges WHERE id = $1', [challenge_id]);
        const type = cTypeRes.rows[0]?.type;

        if (type === 'coding') newSkillData.coding_score = scoreResult;
        if (type === 'debugging') newSkillData.debugging_score = scoreResult;
        if (type === 'decision making') newSkillData.decision_score = scoreResult;
        if (type === 'communication scenario') newSkillData.communication_score = scoreResult;

        newSkillData.overall_score = calculateOverallScore(newSkillData);

        if (skillScoresResult.rows.length > 0) {
            // Update existing (highly simplified for now)
            await db.query(
                `UPDATE skill_scores SET coding_score=$1, debugging_score=$2, decision_score=$3, communication_score=$4, integrity_score=$5, overall_score=$6 
                 WHERE user_id=$7 AND challenge_id=$8`,
                [newSkillData.coding_score, newSkillData.debugging_score, newSkillData.decision_score, newSkillData.communication_score, newSkillData.integrity_score, newSkillData.overall_score, userId, challenge_id]
            );
        } else {
            // Insert new
            await db.query(
                `INSERT INTO skill_scores (user_id, challenge_id, coding_score, debugging_score, decision_score, communication_score, integrity_score, overall_score) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [userId, challenge_id, newSkillData.coding_score, newSkillData.debugging_score, newSkillData.decision_score, newSkillData.communication_score, newSkillData.integrity_score, newSkillData.overall_score]
            );
        }

        await db.query('COMMIT');
        await db.query('COMMIT');
        res.status(201).json({
            message: 'Submission processed',
            submission: submissionResult.rows[0],
            mappedSkills: newSkillData,
            feedback: codeQualityFeedback || { message: 'No code quality feedback available for this response type.' }
        });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error processing submission' });
    }
};

// @route   GET /submissions/:userId
// @desc    Get all submissions by a user
const getUserSubmissions = async (req, res) => {
    const { userId } = req.params;

    // Optional: add authorization to ensure a user only fetches their own, or HR fetches candidates
    // if (req.user.role !== 'hr' && req.user.userId !== userId) {
    //    return res.status(403).json({ error: 'Unauthorized view' });
    // }

    try {
        const result = await db.query('SELECT * FROM submissions WHERE user_id = $1 ORDER BY submitted_at DESC', [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching submissions' });
    }
};

// @route   POST /behavior-log
// @desc    Stand-alone route to log anti-cheat metrics mid-assessment
const logBehavior = async (req, res) => {
    const { challenge_id, tab_switch_count, copy_paste_count, focus_loss_count, ai_usage_flag } = req.body;
    const userId = req.user.userId;

    try {
        await db.query(
            `INSERT INTO behavior_logs (user_id, challenge_id, tab_switch_count, copy_paste_count, focus_loss_count, ai_usage_flag) 
              VALUES ($1, $2, $3, $4, $5, $6)`,
            [userId, challenge_id, tab_switch_count, copy_paste_count, focus_loss_count, ai_usage_flag]
        );
        res.status(201).json({ message: 'Behavior logged securely' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error logging behavior' });
    }
};

// @route   GET /scores/:userId
// @desc    Get skill scores for a user
const getScores = async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await db.query('SELECT * FROM skill_scores WHERE user_id = $1', [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching scores' });
    }
};

module.exports = { submitChallenge, getUserSubmissions, logBehavior, getScores };
