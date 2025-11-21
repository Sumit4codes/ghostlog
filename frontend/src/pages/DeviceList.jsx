import React, { useState, useEffect } from 'react';
import DeviceCard from '../components/DeviceCard';
import apiClient from '../api/client';

/**
 * DeviceList Page
 * Home page displaying all devices
 */
export default function DeviceList() {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        try {
            setLoading(true);
            const response = await apiClient.getDevices();
            setDevices(response.devices || []);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch devices:', err);
            setError('Failed to load devices. Make sure the backend server is running.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading devices...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-6 py-8">
                <div className="bg-dark-800/30 border border-red-500/20 rounded-lg p-6 text-center">
                    <h3 className="text-white text-base font-medium mb-2">Error Loading Devices</h3>
                    <p className="text-gray-400 text-sm mb-4">{error}</p>
                    <button
                        onClick={fetchDevices}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-10">
            {/* Modern Header with gradient */}
            <div className="mb-10">
                <h1 className="text-4xl font-bold text-white mb-2 gradient-text">Dashboard</h1>
                <p className="text-gray-400">Monitor device crashes and system health in real-time</p>
            </div>

            {/* Modern Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="modern-card p-6 animate-fade-in">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-gray-400 text-sm mb-2">Total Devices</div>
                            <div className="text-white text-3xl font-bold">{devices.length}</div>
                        </div>
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
                            <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="modern-card p-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-gray-400 text-sm mb-2">Total Crashes</div>
                            <div className="text-white text-3xl font-bold">
                                {devices.reduce((sum, device) => sum + (device.crash_count || 0), 0)}
                            </div>
                        </div>
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30 flex items-center justify-center">
                            <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="modern-card p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-gray-400 text-sm mb-2">Active Devices</div>
                            <div className="text-white text-3xl font-bold">
                                {devices.filter(d => d.crash_count > 0).length}
                            </div>
                        </div>
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center">
                            <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
            {/* Devices Grid */}
            {devices.length > 0 ? (
                <div>
                    <h2 className="text-white text-2xl font-semibold mb-6">Connected Devices</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {devices.map((device) => (
                            <DeviceCard key={device.device_id} device={device} />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="modern-card p-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
                        <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                    </div>
                    <h3 className="text-white text-xl font-semibold mb-2">No Devices Connected</h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                        Devices will appear here when they start sending crash logs to the backend API.
                    </p>
                </div>
            )}
        </div>
    );
}
