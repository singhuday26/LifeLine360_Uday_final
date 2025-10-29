import React from "react";

export default function HotspotLegend({ types, selectedFilters, onToggleFilter, hotspots }) {
    const getTypeCount = (type) => {
        return hotspots.filter(h => h.type === type).length;
    };

    return (
        <div>
            <h4 className="font-semibold text-slate-900 mb-4">Incident Types</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {Object.entries(types).map(([type, config]) => {
                    const Icon = config.icon;
                    const isSelected = selectedFilters.includes(type);
                    const count = getTypeCount(type);

                    return (
                        <button
                            key={type}
                            onClick={() => onToggleFilter(type)}
                            className={`
                                flex items-center gap-3 p-3 rounded-xl border-2 transition-all
                                ${isSelected
                                ? `${config.bg} ${config.color} border-current`
                                : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                            }
                            `}
                        >
                            <Icon className="w-5 h-5" />
                            <div className="text-left">
                                <div className="font-medium text-sm">{config.label}</div>
                                <div className="text-xs opacity-75">{count} active</div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
