const db = require('../config/db');

// ============== GET PERFORMANCE DASHBOARD ==============
const getPerformanceDashboard = async (req, res) => {
    const userId = req.user.userId;

    try {
        // Get overall stats
        const statsResult = await db.query(
            `SELECT 
                COUNT(DISTINCT s.challenge_id) as challenges_attempted,
                AVG(ss.overall_score) as avg_score,
                MAX(ss.overall_score) as highest_score,
                COUNT(s.id) as total_submissions
            FROM submissions s
            LEFT JOIN skill_scores ss ON s.user_id = ss.user_id AND s.challenge_id = ss.challenge_id
            WHERE s.user_id = $1`,
            [userId]
        );

        // Get skill breakdown
        const skillsResult = await db.query(
            `SELECT 
                AVG(coding_score) as coding,
                AVG(debugging_score) as debugging,
                AVG(decision_score) as decision_making,
                AVG(communication_score) as communication,
                AVG(integrity_score) as integrity
            FROM skill_scores
            WHERE user_id = $1`,
            [userId]
        );

        // Get recent submissions
        const recentResult = await db.query(
            `SELECT s.*, c.title, c.type, ss.overall_score 
             FROM submissions s
             JOIN challenges c ON s.challenge_id = c.id
             LEFT JOIN skill_scores ss ON s.user_id = ss.user_id AND s.challenge_id = ss.challenge_id
             WHERE s.user_id = $1
             ORDER BY s.submitted_at DESC
             LIMIT 10`,
            [userId]
        );

        res.json({
            stats: statsResult.rows[0],
            skillBreakdown: skillsResult.rows[0],
            recentSubmissions: recentResult.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching performance dashboard' });
    }
};

// @route   GET /hr/candidates
// @desc    Get all candidates and their aggregated skill scores
const getCandidates = async (req, res) => {
    try {
        const query = `
            SELECT 
                u.id as user_id, 
                u.name, 
                u.email,
                ROUND(AVG(ss.overall_score), 2) as aggregated_skill_index,
                ROUND(AVG(ss.integrity_score), 2) as average_integrity
            FROM users u
            LEFT JOIN skill_scores ss ON u.id = ss.user_id
            WHERE u.role = 'candidate'
            GROUP BY u.id, u.name, u.email
            ORDER BY aggregated_skill_index DESC NULLS LAST
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching candidates' });
    }
};

// ============== GET BENCHMARKING DATA ==============
const getBenchmarkingData = async (req, res) => {
    const { challengeId } = req.params;
    const userId = req.user.userId;

    if (!challengeId) {
        return res.status(400).json({ error: 'Challenge ID required' });
    }

    try {
        // Get user's score
        const userScoreResult = await db.query(
            `SELECT ss.overall_score FROM skill_scores ss
             WHERE ss.user_id = $1 AND ss.challenge_id = $2`,
            [userId, challengeId]
        );

        // Get benchmark data
        const benchmarkResult = await db.query(
            `SELECT * FROM benchmark_scores WHERE challenge_id = $1`,
            [challengeId]
        );

        // Calculate percentile
        let percentile = null;
        if (userScoreResult.rows.length > 0 && benchmarkResult.rows.length > 0) {
            const userScore = userScoreResult.rows[0].overall_score;
            const benchmark = benchmarkResult.rows[0];

            if (userScore <= benchmark.percentile_10) percentile = 10;
            else if (userScore <= benchmark.percentile_25) percentile = 25;
            else if (userScore <= benchmark.percentile_50) percentile = 50;
            else if (userScore <= benchmark.percentile_75) percentile = 75;
            else if (userScore <= benchmark.percentile_90) percentile = 90;
            else percentile = 95;
        }

        res.json({
            userScore: userScoreResult.rows[0] || null,
            benchmarkData: benchmarkResult.rows[0] || null,
            percentile: percentile
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching benchmark data' });
    }
};

// ============== GET SKILL GAP ANALYSIS ==============
const getSkillGapAnalysis = async (req, res) => {
    const userId = req.user.userId;

    try {
        // Get user's average scores per skill
        const userSkillsResult = await db.query(
            `SELECT 
                ROUND(AVG(coding_score)::numeric, 2) as coding,
                ROUND(AVG(debugging_score)::numeric, 2) as debugging,
                ROUND(AVG(decision_score)::numeric, 2) as decision_making,
                ROUND(AVG(communication_score)::numeric, 2) as communication
            FROM skill_scores
            WHERE user_id = $1`,
            [userId]
        );

        // Get benchmark averages across all users
        const benchmarkResult = await db.query(
            `SELECT 
                ROUND(AVG(percentile_50)::numeric, 2) as coding_benchmark,
                ROUND(AVG(percentile_50)::numeric, 2) as debugging_benchmark,
                ROUND(AVG(percentile_50)::numeric, 2) as decision_benchmark,
                ROUND(AVG(percentile_50)::numeric, 2) as communication_benchmark
            FROM benchmark_scores`
        );

        const userSkills = userSkillsResult.rows[0];
        const benchmarks = benchmarkResult.rows[0];

        // Calculate gaps
        const gaps = {
            coding: {
                userScore: userSkills.coding || 0,
                benchmark: benchmarks.coding_benchmark || 0,
                gap: (benchmarks.coding_benchmark || 0) - (userSkills.coding || 0)
            },
            debugging: {
                userScore: userSkills.debugging || 0,
                benchmark: benchmarks.debugging_benchmark || 0,
                gap: (benchmarks.debugging_benchmark || 0) - (userSkills.debugging || 0)
            },
            decision_making: {
                userScore: userSkills.decision_making || 0,
                benchmark: benchmarks.decision_benchmark || 0,
                gap: (benchmarks.decision_benchmark || 0) - (userSkills.decision_making || 0)
            },
            communication: {
                userScore: userSkills.communication || 0,
                benchmark: benchmarks.communication_benchmark || 0,
                gap: (benchmarks.communication_benchmark || 0) - (userSkills.communication || 0)
            }
        };

        // Generate recommendations
        const recommendations = Object.entries(gaps)
            .filter(([_, data]) => data.gap > 5)
            .map(([skill, data]) => ({
                skill,
                recommendation: `Improve your ${skill} skills. Current: ${data.userScore}, Target: ${data.benchmark}`,
                priority: data.gap > 20 ? 'high' : data.gap > 10 ? 'medium' : 'low'
            }));

        res.json({
            skillGaps: gaps,
            recommendations: recommendations
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error analyzing skill gaps' });
    }
};

// ============== GET TREND ANALYSIS ==============
const getTrendAnalysis = async (req, res) => {
    const userId = req.user.userId;
    const { days = 30 } = req.query;

    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        // Get daily scores
        const result = await db.query(
            `SELECT 
                DATE(s.submitted_at) as submission_date,
                ROUND(AVG(ss.overall_score)::numeric, 2) as daily_avg,
                COUNT(DISTINCT s.challenge_id) as challenges_completed,
                ROUND(AVG(ss.integrity_score)::numeric, 2) as avg_integrity
            FROM submissions s
            LEFT JOIN skill_scores ss ON s.user_id = ss.user_id AND s.challenge_id = ss.challenge_id
            WHERE s.user_id = $1 AND s.submitted_at >= $2
            GROUP BY DATE(s.submitted_at)
            ORDER BY submission_date ASC`,
            [userId, startDate]
        );

        // Calculate trend (improvement or decline)
        let trend = 'stable';
        if (result.rows.length > 1) {
            const firstWeekAvg = result.rows.slice(0, Math.ceil(result.rows.length / 3))
                .reduce((sum, r) => sum + parseFloat(r.daily_avg), 0) / Math.ceil(result.rows.length / 3);

            const lastWeekAvg = result.rows.slice(-Math.ceil(result.rows.length / 3))
                .reduce((sum, r) => sum + parseFloat(r.daily_avg), 0) / Math.ceil(result.rows.length / 3);

            const improvement = lastWeekAvg - firstWeekAvg;

            if (improvement > 5) trend = 'improving';
            else if (improvement < -5) trend = 'declining';
        }

        res.json({
            trend: trend,
            timeframe: `Last ${days} days`,
            dailyData: result.rows,
            insights: {
                totalAttempts: result.rows.reduce((sum, r) => sum + parseInt(r.challenges_completed), 0),
                averageIntegrity: result.rows.length > 0 ?
                    (result.rows.reduce((sum, r) => sum + parseFloat(r.avg_integrity), 0) / result.rows.length).toFixed(2) : 0
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error analyzing trends' });
    }
};

// @route   GET /hr/analytics/:userId
// @desc    Get comprehensive analytics for a specific candidate
const getCandidateAnalytics = async (req, res) => {
    const { userId } = req.params;

    try {
        // Fetch specific scores
        const scoresResult = await db.query('SELECT * FROM skill_scores WHERE user_id = $1', [userId]);

        // Fetch precise telemetry for deeper dive
        const logsResult = await db.query('SELECT * FROM behavior_logs WHERE user_id = $1 ORDER BY recorded_at DESC', [userId]);

        // Fetch submissions joined with question info
        const submissionsResult = await db.query(`
            SELECT s.*, q.question_text, c.title as challenge_title 
            FROM submissions s
            LEFT JOIN questions q ON s.question_id = q.id
            LEFT JOIN challenges c ON s.challenge_id = c.id
            WHERE s.user_id = $1
            ORDER BY s.submitted_at DESC
        `, [userId]);

        res.json({
            scores: scoresResult.rows,
            telemetryLogs: logsResult.rows,
            submissions: submissionsResult.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching analytics' });
    }
};

// ============== UPDATE BENCHMARK SCORES ==============
const updateBenchmarkScores = async (req, res) => {
    const { challengeId } = req.params;

    if (!challengeId) {
        return res.status(400).json({ error: 'Challenge ID required' });
    }

    try {
        // Calculate percentiles from all submissions
        const result = await db.query(
            `SELECT 
                PERCENTILE_CONT(0.10) WITHIN GROUP (ORDER BY overall_score) as p10,
                PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY overall_score) as p25,
                PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY overall_score) as p50,
                PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY overall_score) as p75,
                PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY overall_score) as p90,
                ROUND(AVG(overall_score)::numeric, 2) as avg_score,
                COUNT(*) as total_submissions
            FROM skill_scores
            WHERE challenge_id = $1`,
            [challengeId]
        );

        const data = result.rows[0];

        await db.query(
            `INSERT INTO benchmark_scores (challenge_id, percentile_10, percentile_25, percentile_50, percentile_75, percentile_90, avg_score, total_submissions, updated_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
             ON CONFLICT (challenge_id) DO UPDATE SET 
             percentile_10 = $2, percentile_25 = $3, percentile_50 = $4, percentile_75 = $5, percentile_90 = $6, avg_score = $7, total_submissions = $8, updated_at = NOW()`,
            [challengeId, data.p10, data.p25, data.p50, data.p75, data.p90, data.avg_score, data.total_submissions]
        );

        res.json({
            message: 'Benchmark scores updated',
            benchmarkData: data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error updating benchmark scores' });
    }
};

// @route   GET /hr/global
// @desc    Get aggregated global analytics for HR dashboard
const getGlobalHRAnalytics = async (req, res) => {
    try {
        // 1. Total counts
        const countsResult = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM users WHERE role = 'candidate') as total_candidates,
                (SELECT COUNT(*) FROM challenges) as total_challenges,
                (SELECT COUNT(*) FROM submissions) as total_submissions
        `);

        // 2. Global Skill Averages
        const skillAvgResult = await db.query(`
            SELECT 
                ROUND(AVG(coding_score), 2) as avg_coding,
                ROUND(AVG(debugging_score), 2) as avg_debugging,
                ROUND(AVG(decision_score), 2) as avg_decision,
                ROUND(AVG(communication_score), 2) as avg_communication,
                ROUND(AVG(integrity_score), 2) as avg_integrity
            FROM skill_scores
        `);

        // 3. Risk Distribution
        // We calculate avg integrity per candidate and then categorize them
        const riskDistResult = await db.query(`
            WITH candidate_integrity AS (
                SELECT user_id, AVG(integrity_score) as avg_i
                FROM skill_scores
                GROUP BY user_id
            )
            SELECT 
                COUNT(*) FILTER (WHERE avg_i >= 80) as low_risk,
                COUNT(*) FILTER (WHERE avg_i >= 50 AND avg_i < 80) as medium_risk,
                COUNT(*) FILTER (WHERE avg_i < 50) as high_risk
            FROM candidate_integrity
        `);

        // 4. Recent Global Activity
        const recentActivity = await db.query(`
            SELECT s.id, s.submitted_at, u.name as candidate_name, c.title as challenge_title, ss.overall_score
            FROM submissions s
            JOIN users u ON s.user_id = u.id
            JOIN challenges c ON s.challenge_id = c.id
            LEFT JOIN skill_scores ss ON s.user_id = ss.user_id AND s.challenge_id = ss.challenge_id
            ORDER BY s.submitted_at DESC
            LIMIT 10
        `);

        res.json({
            summary: countsResult.rows[0],
            skillAverages: skillAvgResult.rows[0],
            riskDistribution: riskDistResult.rows[0],
            recentActivity: recentActivity.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching global analytics' });
    }
};

module.exports = {
    getCandidates,
    getCandidateAnalytics,
    getPerformanceDashboard,
    getBenchmarkingData,
    getSkillGapAnalysis,
    getTrendAnalysis,
    updateBenchmarkScores,
    getGlobalHRAnalytics
};
