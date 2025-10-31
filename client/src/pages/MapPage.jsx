import React from 'react';
import Navbar from "../components/Navbar";
import GoogleMapsHotspotMap from "../components/GoogleMapsHotspotMap";
import Footer from "../components/Footer";
import { useRealtimeData } from '../hooks/useRealtimeData';
import { getApiBaseUrl, getWebSocketUrl } from '../utils/apiConfig';

export default function MapPage() {
    // Get hotspots data from the real-time data hook
    const apiUrl = getApiBaseUrl();
    const wsUrl = getWebSocketUrl();

    const { hotspots, isConnected } = useRealtimeData(apiUrl, wsUrl, {
        enablePolling: true,
        pollInterval: 30000
    });

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col pb-20">
            <Navbar />

            {/* Map Header */}
            <div className="bg-white border-b border-slate-200/60 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                                Incident Map
                            </h1>
                            <p className="text-slate-600 mt-2 font-medium">
                                Real-time disaster hotspots and sensor locations
                            </p>
                        </div>
                        <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border-2 backdrop-blur-sm ${
                            isConnected
                                ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200'
                                : 'bg-red-50/80 text-red-700 border-red-200'
                        } shadow-sm`}>
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></div>
                            <span className="text-sm font-bold">
                                {isConnected ? 'LIVE DATA' : 'OFFLINE'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative">
                <GoogleMapsHotspotMap
                    hotspots={hotspots}
                    isConnected={isConnected}
                    className="w-full h-full"
                />
            </div>

            <Footer />
        </div>
    );
}