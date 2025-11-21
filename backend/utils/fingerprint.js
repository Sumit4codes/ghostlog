/**
 * @file fingerprint.js
 * @brief Crash fingerprinting using SHA-1 hash
 */

const crypto = require('crypto');

/**
 * Generate crash fingerprint from crash log
 * Uses SHA-1 hash of normalized crash log text
 * 
 * @param {string} crashLog - Raw crash log text
 * @returns {string} - SHA-1 hash (40 hex characters)
 */
function generateFingerprint(crashLog) {
    // Normalize the crash log:
    // 1. Remove timestamps (dates, times)
    // 2. Remove memory addresses (0x...)
    // 3. Remove specific register values
    // 4. Convert to lowercase
    // 5. Trim whitespace

    let normalized = crashLog
        .toLowerCase()
        .replace(/\d{4}-\d{2}-\d{2}t\d{2}:\d{2}:\d{2}z?/gi, 'TIMESTAMP') // ISO timestamps
        .replace(/0x[0-9a-f]+/gi, '0xADDR')                              // Hex addresses
        .replace(/\b\d+\b/g, 'NUM')                                      // Numbers
        .trim();

    // Generate SHA-1 hash
    const hash = crypto.createHash('sha1');
    hash.update(normalized);

    return hash.digest('hex');
}

/**
 * Extract crash type from log message
 * Useful for categorization
 * 
 * @param {string} crashLog - Raw crash log text
 * @returns {string} - Crash type (e.g., "panic", "hardfault", "assertion")
 */
function extractCrashType(crashLog) {
    const lower = crashLog.toLowerCase();

    if (lower.includes('panic')) return 'panic';
    if (lower.includes('hardfault') || lower.includes('hard fault')) return 'hardfault';
    if (lower.includes('assertion') || lower.includes('assert')) return 'assertion';
    if (lower.includes('null pointer') || lower.includes('nullptr')) return 'nullpointer';
    if (lower.includes('stack overflow')) return 'stackoverflow';
    if (lower.includes('watchdog')) return 'watchdog';
    if (lower.includes('memfault') || lower.includes('memory fault')) return 'memfault';
    if (lower.includes('busfault') || lower.includes('bus fault')) return 'busfault';

    return 'unknown';
}

module.exports = {
    generateFingerprint,
    extractCrashType
};
