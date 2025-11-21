/**
 * API Client for GhostLog Backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class APIClient {
    /**
     * Submit crash log
     */
    async submitLog(logData) {
        const response = await fetch(`${API_BASE_URL}/logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logData),
        });

        if (!response.ok) {
            throw new Error('Failed to submit log');
        }

        return response.json();
    }

    /**
     * Get all crash logs
     */
    async getAllLogs() {
        const response = await fetch(`${API_BASE_URL}/logs`);

        if (!response.ok) {
            throw new Error('Failed to fetch logs');
        }

        return response.json();
    }

    /**
     * Get logs for specific device
     */
    async getDeviceLogs(deviceId) {
        const response = await fetch(`${API_BASE_URL}/logs/device/${deviceId}`);

        if (!response.ok) {
            throw new Error('Failed to fetch device logs');
        }

        return response.json();
    }

    /**
     * Get all devices
     */
    async getDevices() {
        const response = await fetch(`${API_BASE_URL}/devices`);

        if (!response.ok) {
            throw new Error('Failed to fetch devices');
        }

        return response.json();
    }

    /**
     * Get crash groups
     */
    async getCrashGroups() {
        const response = await fetch(`${API_BASE_URL}/crashes/groups`);

        if (!response.ok) {
            throw new Error('Failed to fetch crash groups');
        }

        return response.json();
    }

    /**
     * Get crash group details
     */
    async getCrashGroupDetails(fingerprint) {
        const response = await fetch(`${API_BASE_URL}/crashes/group/${fingerprint}`);

        if (!response.ok) {
            throw new Error('Failed to fetch crash group details');
        }

        return response.json();
    }

    /**
     * Get daily statistics
     */
    async getDailyStats() {
        const response = await fetch(`${API_BASE_URL}/stats/daily`);

        if (!response.ok) {
            throw new Error('Failed to fetch daily stats');
        }

        return response.json();
    }
}

export default new APIClient();
