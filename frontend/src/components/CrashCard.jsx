import React from 'react';
import PropTypes from 'prop-types';

/**
 * CrashCard Component
 * Displays individual crash log information
 */
export default function CrashCard({ crash }) {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getCrashTypeBadge = (log) => {
        const lower = log.toLowerCase();
        if (lower.includes('panic')) return 'badge-panic';
        if (lower.includes('hardfault')) return 'badge-hardfault';
        if (lower.includes('assertion') || lower.includes('assert')) return 'badge-assertion';
        if (lower.includes('null pointer') || lower.includes('nullptr')) return 'badge-nullpointer';
        return 'badge-unknown';
    };

    const getCrashType = (log) => {
        const lower = log.toLowerCase();
        if (lower.includes('panic')) return 'PANIC';
        if (lower.includes('hardfault')) return 'HARDFAULT';
        if (lower.includes('assertion') || lower.includes('assert')) return 'ASSERTION';
        if (lower.includes('null pointer') || lower.includes('nullptr')) return 'NULL POINTER';
        if (lower.includes('stackoverflow')) return 'STACK OVERFLOW';
        if (lower.includes('watchdog')) return 'WATCHDOG';
        return 'UNKNOWN';
    };

    return (
        <div className="modern-card p-6 animate-slide-up">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-white font-semibold text-base">{crash.device_id}</span>
                        <span className={`badge ${getCrashTypeBadge(crash.crash_log)}`}>
                            {getCrashType(crash.crash_log)}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{formatDate(crash.timestamp)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span className="font-mono text-xs">v{crash.fw_version}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Crash Log */}
            <div className="code-block mb-4">
                <pre className="whitespace-pre-wrap break-words leading-relaxed">{crash.crash_log}</pre>
            </div>

            {/* Footer with fingerprint */}
            {crash.fingerprint && (
                <div className="flex items-center justify-between text-xs pt-3 border-t border-white/10">
                    <span className="text-gray-500">Fingerprint</span>
                    <span className="text-gray-400 font-mono">{crash.fingerprint.substring(0, 16)}...</span>
                </div>
            )}
        </div>
    );
}

CrashCard.propTypes = {
    crash: PropTypes.shape({
        id: PropTypes.number,
        device_id: PropTypes.string.isRequired,
        timestamp: PropTypes.string.isRequired,
        fw_version: PropTypes.string.isRequired,
        crash_log: PropTypes.string.isRequired,
        fingerprint: PropTypes.string,
    }).isRequired,
};
