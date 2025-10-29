import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
    MapPin,
    Flame,
    Droplets,
    Wind,
    Zap,
    AlertTriangle,
    Filter,
    ZoomIn,
    ZoomOut,
    RefreshCw,
    Eye,
    EyeOff,
    Settings
} from "lucide-react";
import HotspotLegend from "./HotspotLegend";
import MapControls from "./MapControls";
import HotspotMarker from "./HotspotMarker";

const HOTSPOT_TYPES = {
    fire: { icon: Flame, color: "text-red-500", bg: "bg-red-100", label: "Fire Risk" },
    flood: { icon: Droplets, color: "text-blue-500", bg: "bg-blue-100", label: "Flood Risk" },
    storm: { icon: Wind, color: "text-purple-500", bg: "bg-purple-100", label: "Storm Risk" },
    power: { icon: Zap, color: "text-yellow-500", bg: "bg-yellow-100", label: "Power Outage" },
    emergency: { icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-100", label: "Emergency" }
};

const INTENSITY_LEVELS = {
    low: { opacity: "opacity-60", size: "w-4 h-4", pulse: "" },
    medium: { opacity: "opacity-80", size: "w-6 h-6", pulse: "animate-pulse" },
    high: { opacity: "opacity-100", size: "w-8 h-8", pulse: "animate-ping" },
    critical: { opacity: "opacity-100", size: "w-10 h-10", pulse: "animate-bounce" }
};

export default function HotspotMap() {
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isLiveUpdates, setIsLiveUpdates] = useState(true);
    const [selectedFilters, setSelectedFilters] = useState(Object.keys(HOTSPOT_TYPES));
    const [showSettings, setShowSettings] = useState(false);
    const [hotspots, setHotspots] = useState([]);
    const [viewMode, setViewMode] = useState('satellite'); // satellite, terrain, street

    // Generate random hotspots
    const generateHotspots = useCallback(() => {
        const types = Object.keys(HOTSPOT_TYPES);
        const intensities = Object.keys(INTENSITY_LEVELS);

        return Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            type: types[Math.floor(Math.random() * types.length)],
            intensity: intensities[Math.floor(Math.random() * intensities.length)],
            x: Math.random() * 80 + 10, // 10-90% position
            y: Math.random() * 70 + 15, // 15-85% position
            timestamp: Date.now() - Math.random() * 3600000, // Random time within last hour
            reports: Math.floor(Math.random() * 50) + 1,
            verified: Math.random() > 0.3
        }));
    }, []);

    // Initialize hotspots
    useEffect(() => {
        setHotspots(generateHotspots());
    }, [generateHotspots]);

    // Live updates simulation
    useEffect(() => {
        if (!isLiveUpdates) return;

        const interval = setInterval(() => {
            setHotspots(prev => {
                const updated = prev.map(hotspot => ({
                    ...hotspot,
                    reports: hotspot.reports + (Math.random() > 0.7 ? 1 : 0)
                }));

                // Occasionally add new hotspot
                if (Math.random() > 0.85) {
                    const types = Object.keys(HOTSPOT_TYPES);
                    const intensities = Object.keys(INTENSITY_LEVELS);
                    updated.push({
                        id: Date.now(),
                        type: types[Math.floor(Math.random() * types.length)],
                        intensity: intensities[Math.floor(Math.random() * intensities.length)],
                        x: Math.random() * 80 + 10,
                        y: Math.random() * 70 + 15,
                        timestamp: Date.now(),
                        reports: 1,
                        verified: false
                    });
                }

                return updated;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [isLiveUpdates]);

    const filteredHotspots = useMemo(() => {
        return hotspots.filter(hotspot => selectedFilters.includes(hotspot.type));
    }, [hotspots, selectedFilters]);

    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 2));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
    const handleRefresh = () => setHotspots(generateHotspots());

    const toggleFilter = useCallback((type) => {
        setSelectedFilters(prev =>
            prev.includes(type)
                ? prev.filter(f => f !== type)
                : [...prev, type]
        );
    }, []);

    const getMapBackground = () => {
        switch(viewMode) {
            case 'satellite':
                return 'bg-gradient-to-br from-green-200 via-blue-200 to-green-300';
            case 'terrain':
                return 'bg-gradient-to-br from-amber-200 via-green-200 to-brown-200';
            case 'street':
                return 'bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300';
            default:
                return 'bg-gradient-to-br from-slate-100 to-slate-200';
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">
                            Real-time Hotspot Map
                        </h3>
                        <p className="text-sm text-slate-600">
                            {filteredHotspots.length} active incidents across {selectedFilters.length} categories
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Live Status */}
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100">
                            <div className={`w-2 h-2 bg-green-500 rounded-full ${isLiveUpdates ? 'animate-pulse' : ''}`}></div>
                            <span className="text-xs font-medium text-green-700">
                                {isLiveUpdates ? 'Live' : 'Paused'}
                            </span>
                        </div>

                        {/* Settings Button */}
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                            aria-label="Toggle settings"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-slate-700">View:</label>
                            <select
                                value={viewMode}
                                onChange={(e) => setViewMode(e.target.value)}
                                className="px-3 py-1 rounded-lg border border-slate-300 text-sm"
                            >
                                <option value="satellite">Satellite</option>
                                <option value="terrain">Terrain</option>
                                <option value="street">Street</option>
                            </select>
                        </div>

                        <button
                            onClick={() => setIsLiveUpdates(!isLiveUpdates)}
                            className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                isLiveUpdates
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                        >
                            {isLiveUpdates ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            {isLiveUpdates ? 'Live Updates On' : 'Live Updates Off'}
                        </button>
                    </div>
                </div>
            )}

            {/* Map Container */}
            <div className="relative">
                <div
                    className={`w-full h-96 ${getMapBackground()} relative overflow-hidden`}
                    style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
                >
                    {/* Grid Pattern */}
                    <div className="absolute inset-0 opacity-20">
                        <svg width="100%" height="100%">
                            <defs>
                                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                    </div>

                    {/* Hotspot Markers */}
                    {filteredHotspots.map((hotspot) => (
                        <HotspotMarker
                            key={hotspot.id}
                            hotspot={hotspot}
                            config={HOTSPOT_TYPES[hotspot.type]}
                            intensity={INTENSITY_LEVELS[hotspot.intensity]}
                        />
                    ))}

                    {/* Center Crosshair */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-slate-400">
                        <MapPin className="w-6 h-6" />
                    </div>
                </div>

                {/* Map Controls */}
                <MapControls
                    zoomLevel={zoomLevel}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onRefresh={handleRefresh}
                />
            </div>

            {/* Legend and Filters */}
            <div className="p-6 bg-slate-50 border-t border-slate-200">
                <HotspotLegend
                    types={HOTSPOT_TYPES}
                    selectedFilters={selectedFilters}
                    onToggleFilter={toggleFilter}
                    hotspots={filteredHotspots}
                />
            </div>
        </div>
    );
}
