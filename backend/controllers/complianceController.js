const db = require('../config/db');

// ============== GET AUDIT LOGS ==============
const getAuditLogs = async (req, res) => {
    const userId = req.user?.userId;
    const { action, startDate, endDate, limit = 100 } = req.query;

    try {
        let query = 'SELECT * FROM audit_logs WHERE 1=1';
        const params = [];

        if (userId) {
            query += ' AND user_id = $' + (params.length + 1);
            params.push(userId);
        }

        if (action) {
            query += ' AND action = $' + (params.length + 1);
            params.push(action);
        }

        if (startDate) {
            query += ' AND created_at >= $' + (params.length + 1);
            params.push(new Date(startDate));
        }

        if (endDate) {
            query += ' AND created_at <= $' + (params.length + 1);
            params.push(new Date(endDate));
        }

        query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1);
        params.push(parseInt(limit));

        const result = await db.query(query, params);

        res.json({
            message: 'Audit logs retrieved',
            count: result.rows.length,
            logs: result.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching audit logs' });
    }
};

// ============== GET CONSENT RECORDS ==============
const getConsentRecords = async (req, res) => {
    const userId = req.user.userId;

    try {
        const result = await db.query(
            `SELECT * FROM consent_records WHERE user_id = $1 ORDER BY consented_at DESC`,
            [userId]
        );

        res.json({
            message: 'Consent records retrieved',
            records: result.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching consent records' });
    }
};

// ============== RECORD CONSENT ==============
const recordConsent = async (req, res) => {
    const userId = req.user.userId;
    const { consentType, consentGiven, version } = req.body;

    if (!['privacy_policy', 'data_processing', 'marketing', 'analytics'].includes(consentType)) {
        return res.status(400).json({ error: 'Invalid consent type' });
    }

    try {
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('user-agent');

        const result = await db.query(
            `INSERT INTO consent_records (user_id, consent_type, consent_given, consent_version, consented_at, ip_address, user_agent) 
             VALUES ($1, $2, $3, $4, NOW(), $5, $6) RETURNING *`,
            [userId, consentType, consentGiven, version, ipAddress, userAgent]
        );

        // Audit log
        await db.query(
            `INSERT INTO audit_logs (user_id, action, details) 
             VALUES ($1, 'CONSENT_RECORDED', $2)`,
            [userId, JSON.stringify({ consentType, consentGiven })]
        );

        res.json({
            message: 'Consent recorded successfully',
            record: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error recording consent' });
    }
};

// ============== WITHDRAW CONSENT ==============
const withdrawConsent = async (req, res) => {
    const userId = req.user.userId;
    const { consentType } = req.body;

    if (!consentType) {
        return res.status(400).json({ error: 'Consent type required' });
    }

    try {
        const result = await db.query(
            `UPDATE consent_records SET consent_given = false WHERE user_id = $1 AND consent_type = $2 RETURNING *`,
            [userId, consentType]
        );

        await db.query(
            `INSERT INTO audit_logs (user_id, action, details) 
             VALUES ($1, 'CONSENT_WITHDRAWN', $2)`,
            [userId, JSON.stringify({ consentType })]
        );

        res.json({
            message: 'Consent withdrawn successfully',
            record: result.rows[0] || null
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error withdrawing consent' });
    }
};

// ============== REQUEST GDPR DATA DELETION ==============
const requestGDPRDeletion = async (req, res) => {
    const userId = req.user.userId;
    const { reason } = req.body;

    try {
        // Check if deletion request already exists
        const existingResult = await db.query(
            `SELECT * FROM gdpr_deletion_requests WHERE user_id = $1 AND request_status IN ('pending', 'processing')`,
            [userId]
        );

        if (existingResult.rows.length > 0) {
            return res.status(400).json({ error: 'Deletion request already in progress' });
        }

        const result = await db.query(
            `INSERT INTO gdpr_deletion_requests (user_id, request_reason, request_status, requested_at) 
             VALUES ($1, $2, 'pending', NOW()) RETURNING *`,
            [userId, reason || null]
        );

        // Audit log
        await db.query(
            `INSERT INTO audit_logs (user_id, action, details) 
             VALUES ($1, 'GDPR_DELETION_REQUESTED', $2)`,
            [userId, JSON.stringify({ reason })]
        );

        res.json({
            message: 'GDPR deletion request submitted',
            requestId: result.rows[0].id,
            status: 'pending'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error submitting deletion request' });
    }
};

// ============== CHECK GDPR DELETION STATUS ==============
const checkGDPRStatus = async (req, res) => {
    const userId = req.user.userId;

    try {
        const result = await db.query(
            `SELECT id, request_status, requested_at, processed_at FROM gdpr_deletion_requests WHERE user_id = $1 ORDER BY requested_at DESC LIMIT 1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.json({
                message: 'No deletion request found',
                status: 'none'
            });
        }

        res.json({
            message: 'Deletion request status retrieved',
            request: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error checking deletion status' });
    }
};

// ============== EXECUTE GDPR DELETION (ADMIN ONLY) ==============
const executeGDPRDeletion = async (req, res) => {
    const hrId = req.user.userId;
    const { requestId } = req.params;

    try {
        // Verify this is an HR user
        const userResult = await db.query('SELECT role FROM users WHERE id = $1', [hrId]);
        if (userResult.rows.length === 0 || userResult.rows[0].role !== 'hr') {
            return res.status(403).json({ error: 'Requires HR role' });
        }

        const requestResult = await db.query(
            `SELECT * FROM gdpr_deletion_requests WHERE id = $1 AND request_status = 'pending'`,
            [requestId]
        );

        if (requestResult.rows.length === 0) {
            return res.status(404).json({ error: 'Request not found or already processed' });
        }

        const deletionRequest = requestResult.rows[0];
        const userId = deletionRequest.user_id;

        try {
            await db.query('BEGIN');

            // Update deletion request status
            await db.query(
                `UPDATE gdpr_deletion_requests SET request_status = 'processing', processed_by = $1, processed_at = NOW() WHERE id = $2`,
                [hrId, requestId]
            );

            // Archive/Delete user data (depends on retention policy)
            const policies = await db.query('SELECT * FROM retention_policies');
            
            for (const policy of policies.rows) {
                if (policy.auto_delete) {
                    // Delete based on data type
                    switch (policy.data_type) {
                        case 'submissions':
                            await db.query('DELETE FROM submissions WHERE user_id = $1', [userId]);
                            break;
                        case 'behavior_logs':
                            await db.query('DELETE FROM behavior_logs WHERE user_id = $1', [userId]);
                            break;
                        case 'skill_scores':
                            await db.query('DELETE FROM skill_scores WHERE user_id = $1', [userId]);
                            break;
                    }
                }
            }

            // Delete user account
            await db.query('DELETE FROM users WHERE id = $1', [userId]);

            // Update deletion request status
            await db.query(
                `UPDATE gdpr_deletion_requests SET request_status = 'completed' WHERE id = $1`,
                [requestId]
            );

            // Audit log
            await db.query(
                `INSERT INTO audit_logs (user_id, action, details) 
                 VALUES ($1, 'GDPR_DELETION_EXECUTED', $2)`,
                [hrId, JSON.stringify({ deletedUserId: userId })]
            );

            await db.query('COMMIT');

            res.json({
                message: 'User data deleted successfully',
                status: 'completed'
            });
        } catch (err) {
            await db.query('ROLLBACK');
            throw err;
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error executing GDPR deletion' });
    }
};

// ============== GET DATA EXPORT (GDPR Right to Access) ==============
const exportUserData = async (req, res) => {
    const userId = req.user.userId;

    try {
        // Get user info
        const userResult = await db.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [userId]);

        // Get all submissions
        const submissionsResult = await db.query(
            'SELECT * FROM submissions WHERE user_id = $1 ORDER BY submitted_at DESC',
            [userId]
        );

        // Get all skill scores
        const skillsResult = await db.query(
            'SELECT * FROM skill_scores WHERE user_id = $1',
            [userId]
        );

        // Get behavior logs
        const behaviorResult = await db.query(
            'SELECT * FROM behavior_logs WHERE user_id = $1 ORDER BY recorded_at DESC',
            [userId]
        );

        // Get consent records
        const consentResult = await db.query(
            'SELECT * FROM consent_records WHERE user_id = $1',
            [userId]
        );

        // Get audit logs
        const auditResult = await db.query(
            'SELECT * FROM audit_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100',
            [userId]
        );

        const exportData = {
            exportDate: new Date().toISOString(),
            userInfo: userResult.rows[0],
            submissions: submissionsResult.rows,
            skillScores: skillsResult.rows,
            behaviorLogs: behaviorResult.rows,
            consentRecords: consentResult.rows,
            auditLogs: auditResult.rows
        };

        // Log the export
        await db.query(
            `INSERT INTO audit_logs (user_id, action) 
             VALUES ($1, 'DATA_EXPORT_REQUESTED')`,
            [userId]
        );

        res.json({
            message: 'User data exported',
            data: exportData
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error exporting user data' });
    }
};

// ============== GET DATA RETENTION POLICIES ==============
const getRetentionPolicies = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM retention_policies ORDER BY data_type');

        res.json({
            message: 'Retention policies retrieved',
            policies: result.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching retention policies' });
    }
};

module.exports = {
    getAuditLogs,
    getConsentRecords,
    recordConsent,
    withdrawConsent,
    requestGDPRDeletion,
    checkGDPRStatus,
    executeGDPRDeletion,
    exportUserData,
    getRetentionPolicies
};
