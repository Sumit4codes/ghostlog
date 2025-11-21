/**
 * @file database.js
 * @brief SQLite Database Initialization and Management
 */

const Database = require('better-sqlite3');
const path = require('path');

// Database file path
const DB_PATH = path.join(__dirname, 'ghostlog.db');

// Initialize database
const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

/**
 * Initialize database schema
 */
function initializeDatabase() {
    // Create devices table
    db.exec(`
        CREATE TABLE IF NOT EXISTS devices (
            device_id TEXT PRIMARY KEY,
            first_seen TEXT NOT NULL,
            last_seen TEXT NOT NULL,
            fw_version TEXT NOT NULL
        )
    `);

    // Create crashes table
    db.exec(`
        CREATE TABLE IF NOT EXISTS crashes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            device_id TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            fw_version TEXT NOT NULL,
            fingerprint TEXT NOT NULL,
            crash_log TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (device_id) REFERENCES devices(device_id)
        )
    `);

    // Create index on fingerprint for faster grouping
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_fingerprint ON crashes(fingerprint)
    `);

    // Create index on device_id for faster device queries
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_device_id ON crashes(device_id)
    `);

    console.log('✅ Database initialized successfully');
}

/**
 * Insert or update device
 */
function upsertDevice(deviceId, fwVersion, timestamp) {
    const stmt = db.prepare(`
        INSERT INTO devices (device_id, first_seen, last_seen, fw_version)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(device_id) DO UPDATE SET
            last_seen = excluded.last_seen,
            fw_version = excluded.fw_version
    `);

    return stmt.run(deviceId, timestamp, timestamp, fwVersion);
}

/**
 * Insert crash log
 */
function insertCrash(deviceId, timestamp, fwVersion, fingerprint, crashLog) {
    const stmt = db.prepare(`
        INSERT INTO crashes (device_id, timestamp, fw_version, fingerprint, crash_log)
        VALUES (?, ?, ?, ?, ?)
    `);

    return stmt.run(deviceId, timestamp, fwVersion, fingerprint, crashLog);
}

/**
 * Get all crashes
 */
function getAllCrashes() {
    const stmt = db.prepare(`
        SELECT 
            c.*,
            d.first_seen as device_first_seen
        FROM crashes c
        LEFT JOIN devices d ON c.device_id = d.device_id
        ORDER BY c.timestamp DESC
    `);

    return stmt.all();
}

/**
 * Get crashes for specific device
 */
function getCrashesByDevice(deviceId) {
    const stmt = db.prepare(`
        SELECT * FROM crashes
        WHERE device_id = ?
        ORDER BY timestamp DESC
    `);

    return stmt.all(deviceId);
}

/**
 * Get all devices with crash counts
 */
function getAllDevices() {
    const stmt = db.prepare(`
        SELECT 
            d.*,
            COUNT(c.id) as crash_count,
            MAX(c.timestamp) as last_crash
        FROM devices d
        LEFT JOIN crashes c ON d.device_id = c.device_id
        GROUP BY d.device_id
        ORDER BY d.last_seen DESC
    `);

    return stmt.all();
}

/**
 * Get crash groups (grouped by fingerprint)
 */
function getCrashGroups() {
    const stmt = db.prepare(`
        SELECT 
            fingerprint,
            crash_log,
            COUNT(*) as count,
            MIN(timestamp) as first_seen,
            MAX(timestamp) as last_seen,
            GROUP_CONCAT(DISTINCT device_id) as affected_devices
        FROM crashes
        GROUP BY fingerprint
        ORDER BY count DESC, last_seen DESC
    `);

    return stmt.all();
}

/**
 * Get crashes per day for charting
 */
function getCrashesPerDay() {
    const stmt = db.prepare(`
        SELECT 
            DATE(timestamp) as date,
            COUNT(*) as count
        FROM crashes
        GROUP BY DATE(timestamp)
        ORDER BY date DESC
        LIMIT 30
    `);

    return stmt.all();
}

/**
 * Get crash group details
 */
function getCrashGroupDetails(fingerprint) {
    const stmt = db.prepare(`
        SELECT * FROM crashes
        WHERE fingerprint = ?
        ORDER BY timestamp DESC
    `);

    return stmt.all(fingerprint);
}

// Initialize database on module load
initializeDatabase();

module.exports = {
    db,
    upsertDevice,
    insertCrash,
    getAllCrashes,
    getCrashesByDevice,
    getAllDevices,
    getCrashGroups,
    getCrashesPerDay,
    getCrashGroupDetails
};
