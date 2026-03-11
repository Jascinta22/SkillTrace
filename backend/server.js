const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const mfaRoutes = require('./routes/mfaRoutes');
const cheatDetectionRoutes = require('./routes/cheatDetectionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const complianceRoutes = require('./routes/complianceRoutes');
const integrationRoutes = require('./routes/integrationRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Security middleware
const {
  auditLog,
  rateLimit,
  ipWhitelist,
  dataEncryption,
  sessionSecurity
} = require('./middleware/securityMiddleware');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============== CORE MIDDLEWARE ==============
app.use(cors({
  origin: 'http://localhost:5173', // Allow frontend Vite server
  credentials: true, // Allow passing cookies, authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// ============== SECURITY MIDDLEWARE ==============
// Security headers
app.use(sessionSecurity);

// Rate limiting (100 requests per hour by default)
app.use(rateLimit(100, 60 * 60 * 1000));

// Audit logging
app.use(auditLog);

// Data encryption middleware
app.use(dataEncryption);

// IP Whitelisting (optional - set specific IPs if needed)
// app.use(ipWhitelist(['192.168.1.1', '10.0.0.0/8']));

// ============== DATABASE CONNECTION ==============
// Application connects to PostgreSQL via DB pools in individual controllers.

// ============== ROUTES ==============
// Authentication
app.use('/api/auth', authRoutes);

// MFA
app.use('/api/mfa', mfaRoutes);

// Challenges & Submissions
app.use('/api/challenges', challengeRoutes);
app.use('/api/submissions', submissionRoutes);

// Analytics & Reporting
app.use('/api/analytics', analyticsRoutes);

// Cheating Detection
app.use('/api/cheat-detection', cheatDetectionRoutes);

// Compliance & Privacy
app.use('/api/compliance', complianceRoutes);

// Integrations
app.use('/api/integrations', integrationRoutes);

// AI Services
app.use('/api/ai', aiRoutes);

// ============== ERROR HANDLING ==============
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something broke!' : err.message
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
