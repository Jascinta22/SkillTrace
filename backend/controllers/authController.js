const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Register a new user
const register = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }

    if (role !== 'candidate' && role !== 'hr') {
        return res.status(400).json({ error: 'Invalid role' });
    }

    if (role === 'hr') {
        return res.status(403).json({ error: 'HR accounts cannot be created publicly. Contact an administrator for credentials.' });
    }

    try {
        // Check if user exists
        const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insert user
        const result = await db.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, passwordHash, role]
        );

        res.status(201).json({ message: 'User registered successfully', user: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Login user
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Please provide email and password' });
    }

    try {
        // Check for user
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Create token
        const payload = {
            userId: user.id,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            message: 'Logged in successfully',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        console.error('LOGIN ERROR DETAIL:', err);
        res.status(500).json({ error: 'Server error', detail: err.message });
    }
};

const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google Login/Signup
const googleLogin = async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({ error: 'ID Token is required' });
    }

    try {
        // Verify the Google ID Token
        const ticket = await googleClient.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Check if user exists in the database
        let result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        let user;

        if (result.rows.length === 0) {
            // If user doesn't exist, create a new one (as Candidate by default)
            const insertResult = await db.query(
                'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
                [name, email, 'GOOGLE_AUTH_NO_PASSWORD', 'candidate']
            );
            user = insertResult.rows[0];
        } else {
            user = result.rows[0];
        }

        // Create JWT token
        const jwtPayload = {
            userId: user.id,
            role: user.role
        };

        const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            message: 'Google login successful',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, picture }
        });

    } catch (err) {
        console.error('GOOGLE LOGIN ERROR:', err);
        res.status(500).json({ error: 'Google authentication failed', detail: err.message });
    }
};

module.exports = { register, login, googleLogin };
