/**
 * @file routes/logs.js
 * @brief API Routes for Crash Logs
 */

const express = require('express');
const router = express.Router();
const db = require('../database');
const { generateFingerprint, extractCrashType } = require('../utils/fingerprint');

/**
 * POST /api/logs
 * Submit a new crash log
 * 
 * Body: {
 *   device_id: string,
 *   fw_version: string,
 *   timestamp: string (ISO 8601),
 *   crash_log: string
 * }
 */
router.post('/logs', (req, res) => {
    try {
        const { device_id, fw_version, timestamp, crash_log } = req.body;

        // Validate required fields
        if (!device_id || !fw_version || !timestamp || !crash_log) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['device_id', 'fw_version', 'timestamp', 'crash_log']
            });
        }

        // Generate crash fingerprint
        const fingerprint = generateFingerprint(crash_log);
        const crashType = extractCrashType(crash_log);

        // Upsert device
        db.upsertDevice(device_id, fw_version, timestamp);

        // Insert crash log
        const result = db.insertCrash(device_id, timestamp, fw_version, fingerprint, crash_log);

        console.log(`📥 New crash log received:`);
        console.log(`   Device: ${device_id}`);
        console.log(`   Type: ${crashType}`);
        console.log(`   Fingerprint: ${fingerprint}`);

        res.status(201).json({
            success: true,
            crash_id: result.lastInsertRowid,
            fingerprint: fingerprint,
            crash_type: crashType
        });

    } catch (error) {
        console.error('❌ Error storing crash log:', error);
        res.status(500).json({
            error: 'Failed to store crash log',
            message: error.message
        });
    }
});

/**
 * GET /api/logs
 * Get all crash logs
 */
router.get('/logs', (req, res) => {
    try {
        const crashes = db.getAllCrashes();

        res.json({
            success: true,
            count: crashes.length,
            crashes: crashes
        });
    } catch (error) {
        console.error('❌ Error fetching crash logs:', error);
        res.status(500).json({
            error: 'Failed to fetch crash logs',
            message: error.message
        });
    }
});

/**
 * GET /api/logs/device/:deviceId
 * Get crash logs for specific device
 */
router.get('/logs/device/:deviceId', (req, res) => {
    try {
        const { deviceId } = req.params;
        const crashes = db.getCrashesByDevice(deviceId);

        res.json({
            success: true,
            device_id: deviceId,
            count: crashes.length,
            crashes: crashes
        });
    } catch (error) {
        console.error('❌ Error fetching device crashes:', error);
        res.status(500).json({
            error: 'Failed to fetch device crashes',
            message: error.message
        });
    }
});

/**
 * GET /api/devices
 * Get all devices with crash counts
 */
router.get('/devices', (req, res) => {
    try {
        const devices = db.getAllDevices();

        res.json({
            success: true,
            count: devices.length,
            devices: devices
        });
    } catch (error) {
        console.error('❌ Error fetching devices:', error);
        res.status(500).json({
            error: 'Failed to fetch devices',
            message: error.message
        });
    }
});

/**
 * GET /api/crashes/groups
 * Get grouped crashes by fingerprint
 */
router.get('/crashes/groups', (req, res) => {
    try {
        const groups = db.getCrashGroups();

        // Add crash type to each group
        const groupsWithType = groups.map(group => ({
            ...group,
            crash_type: extractCrashType(group.crash_log),
            affected_devices_count: group.affected_devices ? group.affected_devices.split(',').length : 0
        }));

        res.json({
            success: true,
            count: groupsWithType.length,
            groups: groupsWithType
        });
    } catch (error) {
        console.error('❌ Error fetching crash groups:', error);
        res.status(500).json({
            error: 'Failed to fetch crash groups',
            message: error.message
        });
    }
});

/**
 * GET /api/crashes/group/:fingerprint
 * Get all crashes for a specific fingerprint
 */
router.get('/crashes/group/:fingerprint', (req, res) => {
    try {
        const { fingerprint } = req.params;
        const crashes = db.getCrashGroupDetails(fingerprint);

        res.json({
            success: true,
            fingerprint: fingerprint,
            count: crashes.length,
            crashes: crashes
        });
    } catch (error) {
        console.error('❌ Error fetching crash group details:', error);
        res.status(500).json({
            error: 'Failed to fetch crash group details',
            message: error.message
        });
    }
});

/**
 * GET /api/stats/daily
 * Get crashes per day for charting
 */
router.get('/stats/daily', (req, res) => {
    try {
        const dailyStats = db.getCrashesPerDay();

        res.json({
            success: true,
            data: dailyStats
        });
    } catch (error) {
        console.error('❌ Error fetching daily stats:', error);
        res.status(500).json({
            error: 'Failed to fetch daily stats',
            message: error.message
        });
    }
});

module.exports = router;
