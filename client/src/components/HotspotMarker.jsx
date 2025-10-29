import React, { useState } from "react";

export default function HotspotMarker({ hotspot, config, intensity }) {
    const [showTooltip, setShowTooltip] = useState(false);
    const Icon = config.icon;

    const formatTimestamp = (timestamp) => {
        const minutes = Math.floor((Date.now() - timestamp) / 60000);
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        return `${Math.floor(minutes / 60)}h ago`;
    };

    return (
        <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
            style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {/* Marker */}
            <div className={`
                ${config.bg} ${config.color} ${intensity.size} ${intensity.opacity} ${intensity.pulse}
                rounded-full flex items-center justify-center border-2 border-white shadow-lg
                hover:scale-110 transition-transform
            `}>
                <Icon className="w-1/2 h-1/2" />
            </div>

            {/* Verification Badge */}
            {hotspot.verified && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
            )}

            {/* Tooltip */}
            {showTooltip && (
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-20">
                    <div className="font-semibold">{config.label}</div>
                    <div className="text-gray-300">
                        {hotspot.reports} reports • {formatTimestamp(hotspot.timestamp)}
                    </div>
                    <div className="text-gray-300 capitalize">
                        {hotspot.intensity} intensity
                        {hotspot.verified && ' • Verified'}
                    </div>

                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                </div>
            )}
        </div>
    );
}
