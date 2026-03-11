const db = require('../config/db');

// ============== DETECT COPY-PASTE ==============
const detectCopyPaste = async (req, res) => {
    const userId = req.user.userId;
    const { challengeId, copyPasteCount, sourceIndicators } = req.body;

    if (!challengeId) {
        return res.status(400).json({ error: 'Challenge ID required' });
    }

    try {
        const severity = copyPasteCount > 5 ? 'high' : copyPasteCount > 2 ? 'medium' : 'low';

        const result = await db.query(
            `INSERT INTO cheating_flags (user_id, challenge_id, flag_type, severity, details) 
             VALUES ($1, $2, 'copy_paste', $3, $4) RETURNING *`,
            [userId, challengeId, severity, JSON.stringify({ copyPasteCount, sourceIndicators })]
        );

        res.json({
            message: 'Copy-paste detection logged',
            flag: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error logging copy-paste detection' });
    }
};

// ============== DETECT EXTERNAL RESOURCES ==============
const detectExternalResources = async (req, res) => {
    const userId = req.user.userId;
    const { challengeId, detectedResources } = req.body;

    if (!challengeId || !detectedResources) {
        return res.status(400).json({ error: 'Challenge ID and resources required' });
    }

    try {
        // Check against known forbidden domains
        const forbiddenDomains = [
            'stackoverflow.com',
            'chatgpt.openai.com',
            'github.com',
            'google.com/search',
            'youtube.com',
            'reddit.com'
        ];

        const flaggedResources = detectedResources.filter(resource =>
            forbiddenDomains.some(domain => resource.includes(domain))
        );

        if (flaggedResources.length > 0) {
            const severity = flaggedResources.length > 3 ? 'critical' : 'high';

            const result = await db.query(
                `INSERT INTO cheating_flags (user_id, challenge_id, flag_type, severity, details) 
                 VALUES ($1, $2, 'external_resource', $3, $4) RETURNING *`,
                [userId, challengeId, severity, JSON.stringify({ flaggedResources, totalDetected: detectedResources.length })]
            );

            return res.json({
                message: 'External resource usage detected',
                severity: severity,
                flag: result.rows[0]
            });
        }

        res.json({
            message: 'No forbidden resources detected',
            detected: detectedResources
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error detecting external resources' });
    }
};

// ============== KEYSTROKE DYNAMICS ANALYSIS ==============
const analyzeKeystrokePattern = async (req, res) => {
    const userId = req.user.userId;
    const { challengeId, keystrokeData } = req.body;

    if (!challengeId || !keystrokeData) {
        return res.status(400).json({ error: 'Challenge ID and keystroke data required' });
    }

    try {
        // Calculate keystroke metrics
        const typingSpeed = calculateTypingSpeed(keystrokeData);
        const dwellTime = calculateDwellTime(keystrokeData);
        const flightTime = calculateFlightTime(keystrokeData);

        // Check for anomalies
        const isAnomalous = detectKeystrokeAnomalies(typingSpeed, dwellTime, flightTime);

        if (isAnomalous) {
            await db.query(
                `INSERT INTO cheating_flags (user_id, challenge_id, flag_type, severity, details) 
                 VALUES ($1, $2, 'keystroke_anomaly', 'medium', $3)`,
                [userId, challengeId, JSON.stringify({ typingSpeed, dwellTime, flightTime })]
            );
        }

        // Store keystroke pattern for future reference
        await db.query(
            `INSERT INTO keystroke_analysis (user_id, challenge_id, keystroke_pattern, typing_speed, dwell_time, flight_time) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [userId, challengeId, JSON.stringify(keystrokeData), typingSpeed, dwellTime, flightTime]
        );

        res.json({
            message: 'Keystroke analysis complete',
            metrics: {
                typingSpeed,
                dwellTime,
                flightTime,
                isAnomalous
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error analyzing keystroke pattern' });
    }
};

// ============== FLAG SUSPICIOUS BEHAVIOR ==============
const flagSuspiciousBehavior = async (req, res) => {
    const userId = req.user.userId;
    const { challengeId, behaviorType, details, severity = 'medium' } = req.body;

    if (!challengeId || !behaviorType) {
        return res.status(400).json({ error: 'Challenge ID and behavior type required' });
    }

    try {
        const result = await db.query(
            `INSERT INTO cheating_flags (user_id, challenge_id, flag_type, severity, details) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [userId, challengeId, behaviorType, severity, JSON.stringify(details)]
        );

        // Audit log
        await db.query(
            `INSERT INTO audit_logs (user_id, action, details) 
             VALUES ($1, 'SUSPICIOUS_BEHAVIOR_FLAGGED', $2)`,
            [userId, JSON.stringify({ behaviorType, challengeId })]
        );

        res.json({
            message: 'Suspicious behavior flagged',
            flag: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error flagging behavior' });
    }
};

// ============== GET CHEATING FLAGS FOR USER ==============
const getUserCheatingFlags = async (req, res) => {
    const userId = req.user.userId;
    const { challengeId } = req.params;

    try {
        let query = 'SELECT * FROM cheating_flags WHERE user_id = $1';
        let params = [userId];

        if (challengeId) {
            query += ' AND challenge_id = $2';
            params.push(challengeId);
        }

        query += ' ORDER BY flagged_at DESC';

        const result = await db.query(query, params);

        res.json({
            message: 'User cheating flags retrieved',
            flags: result.rows,
            totalFlags: result.rows.length
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error retrieving cheating flags' });
    }
};

// ============== GET CANDIDATE FLAGS FOR HR ==============
const getCandidateFlags = async (req, res) => {
    const { userId } = req.params;

    try {
        const flagsResult = await db.query(
            'SELECT * FROM cheating_flags WHERE user_id = $1 ORDER BY flagged_at DESC',
            [userId]
        );

        const userResult = await db.query(
            'SELECT id, name, email FROM users WHERE id = $1',
            [userId]
        );

        const submissionsResult = await db.query(
            `SELECT s.*, c.title as challenge_title 
             FROM submissions s
             LEFT JOIN challenges c ON s.challenge_id = c.id
             WHERE s.user_id = $1
             ORDER BY s.submitted_at DESC`,
            [userId]
        );

        res.json({
            candidate: userResult.rows[0] || null,
            flags: flagsResult.rows,
            totalFlags: flagsResult.rows.length,
            submissions: submissionsResult.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error retrieving candidate flags' });
    }
};

// ============== LOG BEHAVIOR EVENT (from ChallengeViewer) ==============
const logBehaviorEvent = async (req, res) => {
    const userId = req.user.userId;
    const { challengeId, eventType, details } = req.body;

    if (!eventType) {
        return res.status(400).json({ error: 'Event type required' });
    }

    try {
        await db.query(
            `INSERT INTO behavior_logs (user_id, challenge_id, event_type, event_data)
             VALUES ($1, $2, $3, $4)`,
            [userId, challengeId || null, eventType, JSON.stringify(details || {})]
        );

        res.json({ message: 'Behavior event logged' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error logging behavior event' });
    }
};

// ============== REVIEW CHEATING FLAG (HR) ==============
const reviewCheatingFlag = async (req, res) => {
    const hrId = req.user.userId;
    const { flagId } = req.params;
    const { action, notes } = req.body; // action: 'dismiss', 'confirm'

    if (!['dismiss', 'confirm'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action' });
    }

    try {
        const result = await db.query(
            `UPDATE cheating_flags SET reviewed = true, reviewed_by = $1, details = jsonb_set(details, '{notes}', $2) 
             WHERE id = $3 RETURNING *`,
            [hrId, JSON.stringify(notes), flagId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Flag not found' });
        }

        // Audit log
        await db.query(
            `INSERT INTO audit_logs (user_id, action, details) 
             VALUES ($1, 'CHEATING_FLAG_REVIEWED', $2)`,
            [hrId, JSON.stringify({ flagId, action, notes })]
        );

        res.json({
            message: 'Flag reviewed successfully',
            flag: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error reviewing flag' });
    }
};

// ============== DETECT PLAGIARISM ==============
const detectPlagiarism = async (req, res) => {
    const userId = req.user.userId;
    const { challengeId, code } = req.body;

    if (!challengeId || !code) {
        return res.status(400).json({ error: 'Challenge ID and code required' });
    }

    try {
        // **Simulated** AST-based Plagiarism Detection (e.g. MOSS)
        // In a real system, this would make an external API call to a code similarity engine
        // Here we simulate a random similarity score, leaning towards lower scores for realism
        const isPlagiarized = Math.random() > 0.85; // 15% chance to simulate catching plagiarism for demo purposes
        const similarityScore = isPlagiarized ? Math.floor(Math.random() * 15) + 85 : Math.floor(Math.random() * 40); // If plagiarized, >85%, else <40%
        const matchedWithUserId = isPlagiarized ? Math.floor(Math.random() * 1000) + 1 : null; // Mock matched user

        if (similarityScore >= 85) {
            const severity = 'critical';

            const result = await db.query(
                `INSERT INTO cheating_flags (user_id, challenge_id, flag_type, severity, details) 
                 VALUES ($1, $2, 'plagiarism', $3, $4) RETURNING *`,
                [userId, challengeId, severity, JSON.stringify({ similarityScore, matchedWithUserId })]
            );

            return res.json({
                message: 'Plagiarism detected',
                similarityScore,
                flag: result.rows[0]
            });
        }

        res.json({
            message: 'Code appears original',
            similarityScore
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error detecting plagiarism' });
    }
};

// ============== HELPER FUNCTIONS ==============

const calculateTypingSpeed = (keystrokeData) => {
    if (!keystrokeData || keystrokeData.length < 2) return 0;

    const totalTime = keystrokeData[keystrokeData.length - 1].timestamp - keystrokeData[0].timestamp;
    const characterCount = keystrokeData.length;
    return (characterCount / (totalTime / 60000)).toFixed(2); // WPM
};

const calculateDwellTime = (keystrokeData) => {
    if (!keystrokeData || keystrokeData.length === 0) return 0;

    const times = keystrokeData.map(k => k.downTime || 0);
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    return avg.toFixed(2);
};

const calculateFlightTime = (keystrokeData) => {
    if (!keystrokeData || keystrokeData.length < 2) return 0;

    const intervals = [];
    for (let i = 1; i < keystrokeData.length; i++) {
        intervals.push(keystrokeData[i].timestamp - keystrokeData[i - 1].timestamp);
    }

    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    return avg.toFixed(2);
};

const detectKeystrokeAnomalies = (typingSpeed, dwellTime, flightTime) => {
    // Extremely fast typing (bot-like)
    if (parseFloat(typingSpeed) > 200) return true;

    // Extremely slow typing (suspicious)
    if (parseFloat(typingSpeed) < 10) return true;

    // Unusual dwell times (very short = copy-paste, very long = suspicious)
    if (parseFloat(dwellTime) < 50 || parseFloat(dwellTime) > 2000) return true;

    return false;
};

module.exports = {
    detectCopyPaste,
    detectExternalResources,
    analyzeKeystrokePattern,
    flagSuspiciousBehavior,
    getUserCheatingFlags,
    getCandidateFlags,
    logBehaviorEvent,
    reviewCheatingFlag,
    detectPlagiarism
};
