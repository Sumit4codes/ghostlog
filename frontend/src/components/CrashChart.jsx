import React from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

/**
 * CrashChart Component
 * Displays crashes per day using Chart.js
 */
export default function CrashChart({ dailyStats }) {
    // Sort data by date (oldest first)
    const sortedData = [...dailyStats].sort((a, b) =>
        new Date(a.date) - new Date(b.date)
    );

    const data = {
        labels: sortedData.map(item => {
            const date = new Date(item.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
        datasets: [
            {
                label: 'Crashes',
                data: sortedData.map(item => item.count),
                fill: true,
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: 'rgb(239, 68, 68)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 6,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                callbacks: {
                    label: (context) => `${context.parsed.y} crash${context.parsed.y !== 1 ? 'es' : ''}`,
                },
            },
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false,
                },
                ticks: {
                    color: '#94a3b8',
                    font: {
                        size: 11,
                    },
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false,
                },
                ticks: {
                    color: '#94a3b8',
                    font: {
                        size: 11,
                    },
                    precision: 0,
                },
            },
        },
        interaction: {
            intersect: false,
            mode: 'index',
        },
    };

    if (!dailyStats || dailyStats.length === 0) {
        return (
            <div className="glass rounded-lg p-6">
                <h3 className="text-white font-semibold text-lg mb-4">Crash Trend (Last 30 Days)</h3>
                <div className="h-64 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p>No crash data available</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="glass rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-lg">Crash Trend (Last 30 Days)</h3>
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-gray-400">Crashes per day</span>
                </div>
            </div>
            <div className="h-64">
                <Line data={data} options={options} />
            </div>
        </div>
    );
}

CrashChart.propTypes = {
    dailyStats: PropTypes.arrayOf(
        PropTypes.shape({
            date: PropTypes.string.isRequired,
            count: PropTypes.number.isRequired,
        })
    ),
};

CrashChart.defaultProps = {
    dailyStats: [],
};
