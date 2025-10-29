import React from "react";

export default function AlertFilters({ selectedFilters, onUpdateFilters, types, sources, categories }) {
    const handleFilterChange = (filterType, value, isChecked) => {
        onUpdateFilters(prev => ({
            ...prev,
            [filterType]: isChecked
                ? [...prev[filterType], value]
                : prev[filterType].filter(item => item !== value)
        }));
    };

    const handleTimeRangeChange = (timeRange) => {
        onUpdateFilters(prev => ({ ...prev, timeRange }));
    };

    return (
        <div className="p-6 bg-slate-50 border-b border-slate-200">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Alert Types */}
                <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Alert Types</h4>
                    <div className="space-y-2">
                        {Object.entries(types).map(([type, config]) => (
                            <label key={type} className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedFilters.types.includes(type)}
                                    onChange={(e) => handleFilterChange('types', type, e.target.checked)}
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <div className={`w-3 h-3 rounded ${config.bg} ${config.border} border`}></div>
                                <span className="text-sm text-slate-700">{config.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Time Range */}
                <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Time Range</h4>
                    <div className="space-y-2">
                        {[
                            { value: 'all', label: 'All Time' },
                            { value: '1h', label: 'Last Hour' },
                            { value: '6h', label: 'Last 6 Hours' },
                            { value: '24h', label: 'Last 24 Hours' },
                            { value: '7d', label: 'Last 7 Days' }
                        ].map((range) => (
                            <label key={range.value} className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="timeRange"
                                    value={range.value}
                                    checked={selectedFilters.timeRange === range.value}
                                    onChange={() => handleTimeRangeChange(range.value)}
                                    className="border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-slate-700">{range.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Sources */}
                <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Sources</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {sources.map((source) => (
                            <label key={source} className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedFilters.sources.includes(source)}
                                    onChange={(e) => handleFilterChange('sources', source, e.target.checked)}
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-slate-700">{source}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Categories */}
                <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Categories</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {categories.map((category) => (
                            <label key={category} className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedFilters.categories.includes(category)}
                                    onChange={(e) => handleFilterChange('categories', category, e.target.checked)}
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-slate-700">{category}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
