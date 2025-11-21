import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * SearchFilterBar Component
 * Search and filter crash logs
 */
export default function SearchFilterBar({ onSearchChange, onFilterChange }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (onSearchChange) {
            onSearchChange(value);
        }
    };

    const handleFilterChange = (filter) => {
        setSelectedFilter(filter);
        if (onFilterChange) {
            onFilterChange(filter);
        }
    };

    const filters = [
        { value: 'all', label: 'All', icon: '🔘' },
        { value: 'panic', label: 'Panic', icon: '🔥' },
        { value: 'hardfault', label: 'HardFault', icon: '⚠️' },
        { value: 'assertion', label: 'Assertion', icon: '✋' },
        { value: 'nullpointer', label: 'Null Ptr', icon: '🎯' },
    ];

    return (
        <div className="glass rounded-lg p-4 mb-6">
            {/* Search Input */}
            <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search crash logs, devices, or error messages..."
                    className="w-full pl-10 pr-4 py-3 bg-dark-900 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {searchTerm && (
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            if (onSearchChange) onSearchChange('');
                        }}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                    <button
                        key={filter.value}
                        onClick={() => handleFilterChange(filter.value)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${selectedFilter === filter.value
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'bg-dark-900 text-gray-400 hover:bg-dark-800 hover:text-white'
                            }`}
                    >
                        <span className="mr-2">{filter.icon}</span>
                        {filter.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

SearchFilterBar.propTypes = {
    onSearchChange: PropTypes.func,
    onFilterChange: PropTypes.func,
};

SearchFilterBar.defaultProps = {
    onSearchChange: null,
    onFilterChange: null,
};
