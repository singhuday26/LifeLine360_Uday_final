import React from "react";
import { MapPin, Zap, Users } from "lucide-react";

export default function MapVisualization({ isActive, isLiveFeed, alertCount }) {
    return (
        <div className="relative w-full">
            {/* Main Map Container - Much larger now */}
            <div className="w-full h-96 lg:h-[500px] xl:h-[600px] bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden relative">

                {/* Enhanced Background Grid */}
                <div className="absolute inset-0 opacity-20">
                    <svg width="100%" height="100%">
                        <defs>
                            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="1"/>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                {/* Dynamic Content */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
                    {/* Status Indicator */}
                    <div className={`mb-8 px-4 py-2 rounded-full text-sm font-medium ${
                        isLiveFeed
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : isActive
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                    }`}>
                        {isLiveFeed ? 'Live Data Stream Active' : isActive ? 'Simulation Running' : 'System Paused'}
                    </div>

                    {/* Map Title */}
                    <div className="text-center mb-8">
                        <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                            Real-time Disaster Intelligence Map
                        </h3>
                        <p className="text-slate-400 text-lg">
                            Monitoring global incidents across {alertCount} active zones
                        </p>
                    </div>

                    {/* Animated Indicators - Larger and more prominent */}
                    <div className="flex justify-center gap-8 mb-8">
                        <div className={`p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 ${isActive ? 'animate-pulse' : ''}`}>
                            <MapPin className={`w-8 h-8 ${isLiveFeed ? 'text-green-400' : 'text-blue-400'}`} />
                        </div>
                        <div className={`p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 ${isActive ? 'animate-bounce' : ''}`}>
                            <Zap className="w-8 h-8 text-yellow-400" />
                        </div>
                        <div className={`p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 ${isActive ? 'animate-pulse' : ''}`}>
                            <Users className="w-8 h-8 text-purple-400" />
                        </div>
                    </div>

                    {/* Enhanced Stats Display */}
                    <div className="grid grid-cols-3 gap-6 w-full max-w-md">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-400 mb-1">{alertCount}</div>
                            <div className="text-xs text-slate-400">Active Incidents</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-400 mb-1">847</div>
                            <div className="text-xs text-slate-400">Sensors Online</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-400 mb-1">2.4k</div>
                            <div className="text-xs text-slate-400">Reports/Hour</div>
                        </div>
                    </div>
                </div>

                {/* Enhanced overlay effects */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none"></div>
            </div>

            {/* Floating Alert Badge - Larger and more prominent */}
            {alertCount > 0 && (
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-2xl animate-pulse border-2 border-red-400">
                    {alertCount} Critical
                </div>
            )}

            {/* Additional decorative elements */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50 rounded-full"></div>
        </div>
    );
}
