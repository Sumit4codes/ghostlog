/**
 * @file server.js
 * @brief GhostLog Backend Server
 * 
 * Express server for crash log collection and management
 */

const express = require('express');
const cors = require('cors');
const logsRouter = require('./routes/logs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());                    // Enable CORS for frontend
app.use(express.json());            // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'ghostlog-backend',
        timestamp: new Date().toISOString()
    });
});

// API routes
app.use('/api', logsRouter);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        service: 'GhostLog Backend API',
        version: '1.0.0',
        endpoints: {
            health: 'GET /health',
            logs: {
                submit: 'POST /api/logs',
                getAll: 'GET /api/logs',
                getByDevice: 'GET /api/logs/device/:deviceId'
            },
            devices: {
                getAll: 'GET /api/devices'
            },
            crashes: {
                groups: 'GET /api/crashes/groups',
                groupDetails: 'GET /api/crashes/group/:fingerprint',
                dailyStats: 'GET /api/stats/daily'
            }
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        path: req.path
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║          🔥 GhostLog Backend Server             ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.log('');
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log('');
    console.log('📌 API Endpoints:');
    console.log(`   POST   http://localhost:${PORT}/api/logs`);
    console.log(`   GET    http://localhost:${PORT}/api/logs`);
    console.log(`   GET    http://localhost:${PORT}/api/devices`);
    console.log(`   GET    http://localhost:${PORT}/api/crashes/groups`);
    console.log('');
    console.log('💡 Press Ctrl+C to stop');
    console.log('');
});

module.exports = app;
