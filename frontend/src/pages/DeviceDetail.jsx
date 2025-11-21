import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CrashCard from '../components/CrashCard';
import CrashChart from '../components/CrashChart';
import SearchFilterBar from '../components/SearchFilterBar';
import apiClient from '../api/client';

/**
 * DeviceDetail Page
 * Shows detailed information about a specific device
 */
export default function DeviceDetail() {
    const { deviceId } = useParams();
    const [crashes, setCrashes] = useState([]);
    const [dailyStats, setDailyStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchDeviceData();
    }, [deviceId]);

    const fetchDeviceData = async () => {
        try {
            setLoading(true);
            const [logsResponse, statsResponse] = await Promise.all([
                apiClient.getDeviceLogs(deviceId),
                apiClient.getDailyStats(),
            ]);
            setCrashes(logsResponse.crashes || []);
            setDailyStats(statsResponse.data || []);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch device data:', err);
            setError('Failed to load device data.');
        } finally {
            setLoading(false);
        }
    };

    const filterCrashes = () => {
        let filtered = crashes;

        // Apply search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(
                crash =>
                    crash.crash_log.toLowerCase().includes(search) ||
                    crash.device_id.toLowerCase().includes(search) ||
                    crash.fw_version.toLowerCase().includes(search)
            );
        }

        // Apply type filter
        if (filter !== 'all') {
            filtered = filtered.filter(crash =>
                crash.crash_log.toLowerCase().includes(filter)
            );
        }

        return filtered;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading device data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="glass rounded-lg p-8 text-center">
                    <h3 className="text-white text-xl font-semibold mb-2">Error</h3>
                    <p className="text-gray-400 mb-4">{error}</p>
                    <Link to="/" className="text-blue-400 hover:underline">
                        ← Back to devices
                    </Link>
                </div>
            </div>
        );
    }

    const filteredCrashes = filterCrashes();

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6">
                <Link to="/" className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Devices
                </Link>
                <h1 className="text-4xl font-bold text-white mb-2">{deviceId}</h1>
                <p className="text-gray-400">
                    Total crashes: <span className="text-white font-semibold">{crashes.length}</span>
                </p>
            </div>

            {/* Crash Chart */}
            {dailyStats.length > 0 && (
                <div className="mb-8">
                    <CrashChart dailyStats={dailyStats} />
                </div>
            )}

            {/* Search and Filter */}
            <SearchFilterBar
                onSearchChange={setSearchTerm}
                onFilterChange={setFilter}
            />

            {/* Crash Logs */}
            {filteredCrashes.length > 0 ? (
                <div>
                    <h2 className="text-white text-2xl font-semibold mb-4">
                        Crash Logs
                        {searchTerm || filter !== 'all' ? (
                            <span className="text-gray-400 text-lg ml-2">
                                ({filteredCrashes.length} of {crashes.length})
                            </span>
                        ) : null}
                    </h2>
                    <div className="space-y-6">
                        {filteredCrashes.map((crash) => (
                            <CrashCard key={crash.id} crash={crash} />
                        ))}
                    </div>
                </div>
            ) : crashes.length > 0 ? (
                <div className="glass rounded-lg p-8 text-center">
                    <p className="text-gray-400">No crashes match your search criteria.</p>
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setFilter('all');
                        }}
                        className="mt-4 text-blue-400 hover:underline"
                    >
                        Clear filters
                    </button>
                </div>
            ) : (
                <div className="glass rounded-lg p-8 text-center">
                    <svg className="w-16 h-16 text-green-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-white text-xl font-semibold mb-2">No Crashes</h3>
                    <p className="text-gray-400">This device has not reported any crashes yet.</p>
                </div>
            )}
        </div>
    );
}
