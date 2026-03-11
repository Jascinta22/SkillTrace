const db = require('../config/db');
const crypto = require('crypto');

// ============== AUDIT LOGGING MIDDLEWARE ==============
const auditLog = async (req, res, next) => {
    const originalJson = res.json;
    
    res.json = async function(data) {
        try {
            const userId = req.user?.userId || null;
            const ipAddress = req.ip || req.connection.remoteAddress;
            const userAgent = req.get('user-agent');
            const status = res.statusCode < 400 ? 'success' : 'failure';
            
            await db.query(
                `INSERT INTO audit_logs (user_id, action, resource_type, ip_address, user_agent, status, details) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [userId, `${req.method} ${req.path}`, req.baseUrl, ipAddress, userAgent, status, JSON.stringify(data)]
            );
        } catch (err) {
            console.error('Audit log error:', err);
        }
        
        return originalJson.call(this, data);
    };
    
    next();
};

// ============== RATE LIMITING MIDDLEWARE ==============
const rateLimit = (maxRequests = 100, windowMs = 60 * 60 * 1000) => {
    return async (req, res, next) => {
        const ipAddress = req.ip || req.connection.remoteAddress;
        const endpoint = req.path;
        
        try {
            const now = new Date();
            const windowStart = new Date(now - windowMs);
            
            // Clean old records
            await db.query(
                'DELETE FROM rate_limit_tracking WHERE window_end < $1',
                [now]
            );
            
            // Check current window
            const result = await db.query(
                `SELECT request_count FROM rate_limit_tracking 
                 WHERE ip_address = $1 AND endpoint = $2 AND window_start > $3`,
                [ipAddress, endpoint, windowStart]
            );
            
            let requestCount = 1;
            if (result.rows.length > 0) {
                requestCount = result.rows[0].request_count + 1;
                
                if (requestCount > maxRequests) {
                    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
                }
                
                await db.query(
                    `UPDATE rate_limit_tracking SET request_count = $1 
                     WHERE ip_address = $2 AND endpoint = $3`,
                    [requestCount, ipAddress, endpoint]
                );
            } else {
                await db.query(
                    `INSERT INTO rate_limit_tracking (ip_address, endpoint, request_count, window_start, window_end) 
                     VALUES ($1, $2, $3, $4, $5)`,
                    [ipAddress, endpoint, requestCount, now, new Date(now + windowMs)]
                );
            }
            
            res.setHeader('X-RateLimit-Limit', maxRequests);
            res.setHeader('X-RateLimit-Remaining', maxRequests - requestCount);
            next();
        } catch (err) {
            console.error('Rate limit error:', err);
            next();
        }
    };
};

// ============== IP WHITELISTING MIDDLEWARE ==============
const ipWhitelist = (whitelist = []) => {
    return (req, res, next) => {
        if (whitelist.length === 0) {
            return next();
        }
        
        const clientIp = req.ip || req.connection.remoteAddress;
        const isWhitelisted = whitelist.some(ip => {
            if (ip.includes('/')) {
                // CIDR notation - simple check
                return clientIp.startsWith(ip.split('/')[0]);
            }
            return clientIp === ip;
        });
        
        if (!isWhitelisted) {
            return res.status(403).json({ error: 'Access denied. IP not whitelisted.' });
        }
        
        next();
    };
};

// ============== ENCRYPTION/DECRYPTION UTILITIES ==============
const encrypt = (text, key) => {
    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        return iv.toString('hex') + ':' + encrypted;
    } catch (err) {
        console.error('Encryption error:', err);
        return null;
    }
};

const decrypt = (encryptedText, key) => {
    try {
        const parts = encryptedText.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
        
        let decrypted = decipher.update(parts[1], 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (err) {
        console.error('Decryption error:', err);
        return null;
    }
};

// ============== DATA ENCRYPTION MIDDLEWARE ==============
const dataEncryption = async (req, res, next) => {
    try {
        const keyResult = await db.query(
            'SELECT key_data FROM encryption_keys WHERE is_active = true LIMIT 1'
        );
        
        if (keyResult.rows.length === 0) {
            return res.status(500).json({ error: 'Encryption key not found' });
        }
        
        req.encryptionKey = keyResult.rows[0].key_data.toString('hex');
        next();
    } catch (err) {
        console.error('Encryption key error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// ============== SESSION SECURITY MIDDLEWARE ==============
const sessionSecurity = (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    
    next();
};

module.exports = {
    auditLog,
    rateLimit,
    ipWhitelist,
    encrypt,
    decrypt,
    dataEncryption,
    sessionSecurity
};
