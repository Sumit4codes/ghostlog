import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchFilterBar from '../components/SearchFilterBar';
import apiClient from '../api/client';

/**
 * CrashGroups Page
 * Shows all crashes grouped by fingerprint
 */
export default function CrashGroups() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchCrashGroups();
    }, []);

    const fetchCrashGroups = async () => {
        try {
            setLoading(true);
            const response = await apiClient.getCrashGroups();
            setGroups(response.groups || []);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch crash groups:', err);
            setError('Failed to load crash groups.');
        } finally {
            setLoading(false);
        }
    };

    const filterGroups = () => {
        let filtered = groups;

        // Apply search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(
                group =>
                    group.crash_log.toLowerCase().includes(search) ||
                    group.affected_devices.toLowerCase().includes(search)
            );
        }

        // Apply type filter
        if (filter !== 'all') {
            filtered = filtered.filter(group =>
                group.crash_type.toLowerCase().includes(filter)
            );
        }

        return filtered;
    };

    const getCrashTypeBadge = (crashType) => {
        const type = crashType.toLowerCase();
        if (type.includes('panic')) return 'badge-panic';
        if (type.includes('hardfault')) return 'badge-hardfault';
        if (type.includes('assertion')) return 'badge-assertion';
        if (type.includes('nullpointer')) return 'badge-nullpointer';
        return 'badge-unknown';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading crash groups...</p>
                </div>
            </div>
        );
    }

    const filteredGroups = filterGroups();

    return (
        <div className="container mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-6">
                <Link to="/" className="text-blue-400 hover:text-blue-300 flex items-center gap-1 mb-4 text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </Link>
                <h1 className="text-2xl font-semibold text-white mb-1">Crash Groups</h1>
                <p className="text-gray-500 text-sm">
                    {groups.length} unique crash types
                </p>
            </div>

            {/* Search and Filter */}
            <SearchFilterBar
                onSearchChange={setSearchTerm}
                onFilterChange={setFilter}
            />

            {/* Crash Groups */}
            {filteredGroups.length > 0 ? (
                <div className="space-y-6">
                    {filteredGroups.map((group) => (
                        <div key={group.fingerprint} className="glass rounded-lg p-6 card-hover animate-slide-up">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`badge ${getCrashTypeBadge(group.crash_type)}`}>
                                            {group.crash_type.toUpperCase()}
                                        </span>
                                        <span className="text-white font-mono text-sm">
                                            {group.fingerprint.substring(0, 12)}...
                                        </span>
                                    </div>
                                    <div className="code-block mt-3">
                                        <pre className="whitespace-pre-wrap break-words text-sm">
                                            {group.crash_log.substring(0, 200)}
                                            {group.crash_log.length > 200 ? '...' : ''}
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="bg-dark-900/50 rounded-lg p-3 text-center">
                                    <div className="text-gray-400 text-xs mb-1">Occurrences</div>
                                    <div className="text-white text-2xl font-bold">{group.count}</div>
                                </div>
                                <div className="bg-dark-900/50 rounded-lg p-3 text-center">
                                    <div className="text-gray-400 text-xs mb-1">Devices Affected</div>
                                    <div className="text-white text-2xl font-bold">{group.affected_devices_count}</div>
                                </div>
                                <div className="bg-dark-900/50 rounded-lg p-3 text-center">
                                    <div className="text-gray-400 text-xs mb-1">Last Seen</div>
                                    <div className="text-white text-sm font-medium">{formatDate(group.last_seen)}</div>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="pt-4 border-t border-white/10">
                                <div className="flex items-center justify-between text-xs text-gray-400">
                                    <div>
                                        <span>First seen: </span>
                                        <span className="text-gray-300">{formatDate(group.first_seen)}</span>
                                    </div>
                                    <div>
                                        <span>Affected devices: </span>
                                        <span className="text-gray-300 font-mono">
                                            {group.affected_devices.split(',').slice(0, 3).join(', ')}
                                            {group.affected_devices_count > 3 && ` +${group.affected_devices_count - 3} more`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="bg-dark-800/30 border border-red-500/20 rounded-lg p-6 text-center">
                    <h3 className="text-white text-base font-medium mb-2">Error Loading Crash Groups</h3>
                    <p className="text-gray-400 text-sm mb-4">{error}</p>
                    <button
                        onClick={fetchCrashGroups}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition-colors"
                    >
                        Retry
                    </button>
                </div>
            ) : searchTerm || filter !== 'all' ? (
                <div className="bg-dark-800/30 border border-white/5 rounded-lg p-6 text-center">
                    <p className="text-gray-500 text-sm">No crash groups match your search criteria.</p>
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setFilter('all');
                        }}
                        className="mt-3 text-blue-400 hover:text-blue-300 text-sm"
                    >
                        Clear filters
                    </button>
                </div>
            ) : (
                <div className="bg-dark-800/30 border border-white/5 rounded-lg p-8 text-center">
                    <div className="text-gray-600 text-sm mb-2">No crash groups</div>
                    <p className="text-gray-500 text-xs max-w-md mx-auto">
                        Crash groups will appear when devices send crash logs to the backend.
                    </p>
                </div>
            )}
        </div>
    );
}
