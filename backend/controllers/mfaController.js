const db = require('../config/db');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');

// ============== SETUP MFA ==============
const setupMFA = async (req, res) => {
    const userId = req.user.userId;
    const { mfaType = 'totp' } = req.body;

    if (!['totp', 'sms', 'email'].includes(mfaType)) {
        return res.status(400).json({ error: 'Invalid MFA type' });
    }

    try {
        // Generate secret for TOTP
        const secret = speakeasy.generateSecret({
            name: `SimuWork (${userId})`,
            length: 32
        });

        let qrCode = null;
        if (mfaType === 'totp') {
            qrCode = await QRCode.toDataURL(secret.otpauth_url);
        }

        res.json({
            message: 'MFA setup initiated',
            secret: secret.base32,
            qrCode: qrCode,
            mfaType: mfaType
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error setting up MFA' });
    }
};

// ============== VERIFY & ENABLE MFA ==============
const enableMFA = async (req, res) => {
    const userId = req.user.userId;
    const { secret, token, mfaType = 'totp' } = req.body;

    if (!secret || !token) {
        return res.status(400).json({ error: 'Missing secret or token' });
    }

    try {
        // Verify token
        const verified = speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: token,
            window: 2
        });

        if (!verified) {
            return res.status(400).json({ error: 'Invalid MFA token' });
        }

        // Generate backup codes
        const backupCodes = Array.from({ length: 10 }, () =>
            Math.random().toString(36).substring(2, 10).toUpperCase()
        );

        // Save MFA settings
        await db.query(
            `INSERT INTO mfa_settings (user_id, mfa_enabled, mfa_type, secret_key, backup_codes) 
             VALUES ($1, true, $2, $3, $4)
             ON CONFLICT (user_id) DO UPDATE SET 
             mfa_enabled = true, mfa_type = $2, secret_key = $3, backup_codes = $4`,
            [userId, mfaType, secret, backupCodes]
        );

        // Log audit
        await db.query(
            `INSERT INTO audit_logs (user_id, action, status) 
             VALUES ($1, 'MFA_ENABLED', 'success')`,
            [userId]
        );

        res.json({
            message: 'MFA enabled successfully',
            backupCodes: backupCodes
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error enabling MFA' });
    }
};

// ============== VERIFY MFA TOKEN ==============
const verifyMFAToken = async (req, res) => {
    const userId = req.user.userId;
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Token required' });
    }

    try {
        const result = await db.query(
            'SELECT secret_key, backup_codes FROM mfa_settings WHERE user_id = $1 AND mfa_enabled = true',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'MFA not enabled for this user' });
        }

        const { secret_key, backup_codes } = result.rows[0];

        // Check against TOTP token
        const verified = speakeasy.totp.verify({
            secret: secret_key,
            encoding: 'base32',
            token: token,
            window: 2
        });

        if (verified) {
            return res.json({ message: 'MFA token verified', verified: true });
        }

        // Check against backup codes
        if (backup_codes.includes(token)) {
            // Remove used backup code
            const updatedCodes = backup_codes.filter(code => code !== token);
            await db.query(
                'UPDATE mfa_settings SET backup_codes = $1 WHERE user_id = $2',
                [updatedCodes, userId]
            );

            return res.json({ message: 'Backup code verified', verified: true, isBackupCode: true });
        }

        return res.status(400).json({ error: 'Invalid MFA token' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error verifying MFA token' });
    }
};

// ============== DISABLE MFA ==============
const disableMFA = async (req, res) => {
    const userId = req.user.userId;

    try {
        await db.query(
            'UPDATE mfa_settings SET mfa_enabled = false WHERE user_id = $1',
            [userId]
        );

        await db.query(
            `INSERT INTO audit_logs (user_id, action, status) 
             VALUES ($1, 'MFA_DISABLED', 'success')`,
            [userId]
        );

        res.json({ message: 'MFA disabled successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error disabling MFA' });
    }
};

// ============== GET MFA STATUS ==============
const getMFAStatus = async (req, res) => {
    const userId = req.user.userId;

    try {
        const result = await db.query(
            'SELECT mfa_enabled, mfa_type FROM mfa_settings WHERE user_id = $1',
            [userId]
        );

        const mfaEnabled = result.rows.length > 0 && result.rows[0].mfa_enabled;
        const mfaType = result.rows.length > 0 ? result.rows[0].mfa_type : null;

        res.json({
            mfaEnabled: mfaEnabled,
            mfaType: mfaType
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching MFA status' });
    }
};

module.exports = {
    setupMFA,
    enableMFA,
    verifyMFAToken,
    disableMFA,
    getMFAStatus
};
