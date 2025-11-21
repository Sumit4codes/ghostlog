import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

/**
 * DeviceCard Component
 * Displays device information with crash statistics
 */
export default function DeviceCard({ device }) {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getStatusColor = () => {
        if (!device.last_crash) return 'bg-green-500';

        const lastCrash = new Date(device.last_crash);
        const now = new Date();
        const hoursSinceLastCrash = (now - lastCrash) / (1000 * 60 * 60);

        if (hoursSinceLastCrash < 1) return 'bg-red-500 animate-pulse';
        if (hoursSinceLastCrash < 24) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <Link to={`/device/${device.device_id}`} className="block group">
            <div className="modern-card p-6 animate-fade-in">
                {/* Header with status */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                        {/* Icon with gradient background */}
                        <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                </svg>
                            </div>
                            <div className={`absolute -top-1 -right-1 status-dot ${getStatusColor()}`}></div>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold text-lg group-hover:text-blue-300 transition-colors">{device.device_id}</h3>
                            <div className="text-gray-400 text-sm font-mono">Firmware v{device.fw_version}</div>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 rounded-lg p-4">
                        <div className="text-red-400 text-xs font-medium mb-1">Total Crashes</div>
                        <div className="text-white text-2xl font-bold">{device.crash_count || 0}</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                        <div className="text-blue-400 text-xs font-medium mb-1">Last Activity</div>
                        <div className="text-white text-sm font-semibold">
                            {device.last_crash ? formatDate(device.last_crash) : 'No crashes'}
                        </div>
                    </div>
                </div>

                {/* Timeline Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-gray-400">
                    <span>Active since {formatDate(device.first_seen)}</span>
                    <div className="flex items-center gap-2 text-blue-400 group-hover:text-blue-300 transition-colors">
                        <span className="font-medium">View Details</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    );
}

DeviceCard.propTypes = {
    device: PropTypes.shape({
        device_id: PropTypes.string.isRequired,
        first_seen: PropTypes.string.isRequired,
        last_seen: PropTypes.string.isRequired,
        fw_version: PropTypes.string.isRequired,
        crash_count: PropTypes.number,
        last_crash: PropTypes.string,
    }).isRequired,
};
