import React, { useState } from 'react';
import {
    Shield,
    Activity,
    TrendingUp,
    AlertTriangle,
    Users,
    BarChart3,
    RefreshCw,
    Settings,
    Eye,
    Thermometer,
    Droplets,
    Flame,
    MapPin,
    Zap,
    CloudRain,
    Waves,
    Mountain,
    ChevronUp,
    ChevronDown,
    Wind
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSensorData } from '../hooks/useSensorData';

// Enhanced Premium Sensor Card Component
function EnhancedSensorCard({ label, value, unit, icon: IconComponent, status = 'normal', trend }) { // eslint-disable-line no-unused-vars
    const statusConfig = {
        normal: {
            bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
            border: 'border-emerald-200/60',
            shadow: 'shadow-lg shadow-emerald-500/10',
            text: 'text-emerald-700',
            valueText: 'text-slate-800',
            accent: 'bg-gradient-to-r from-emerald-500 to-teal-500',
            iconBg: 'bg-gradient-to-br from-emerald-100 to-teal-100',
            glow: 'shadow-emerald-500/20'
        },
        warning: {
            bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
            border: 'border-amber-200/60',
            shadow: 'shadow-lg shadow-amber-500/10',
            text: 'text-amber-700',
            valueText: 'text-slate-800',
            accent: 'bg-gradient-to-r from-amber-500 to-orange-500',
            iconBg: 'bg-gradient-to-br from-amber-100 to-orange-100',
            glow: 'shadow-amber-500/20'
        },
        critical: {
            bg: 'bg-gradient-to-br from-red-50 to-rose-50',
            border: 'border-red-200/60',
            shadow: 'shadow-lg shadow-red-500/10',
            text: 'text-red-700',
            valueText: 'text-slate-800',
            accent: 'bg-gradient-to-r from-red-500 to-rose-500',
            iconBg: 'bg-gradient-to-br from-red-100 to-rose-100',
            glow: 'shadow-red-500/20'
        }
    };

    const config = statusConfig[status];

    return (
        <div className={`${config.bg} ${config.border} border backdrop-blur-sm rounded-2xl p-5 relative overflow-hidden group hover:scale-[1.03] hover:rotate-1 transition-all duration-500 ${config.shadow} hover:${config.glow} cursor-pointer`}>
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Status accent line with animation */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${config.accent} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700`}></div>

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className={`${config.iconBg} p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`w-6 h-6 ${config.text}`} />
                </div>
                <div className="flex items-center gap-2">
                    {trend && (
                        <div className={`flex items-center gap-1 ${trend > 0 ? 'text-red-500' : trend < 0 ? 'text-green-500' : 'text-slate-400'}`}>
                            {trend > 0 ? <ChevronUp className="w-4 h-4" /> : trend < 0 ? <ChevronDown className="w-4 h-4" /> : null}
                            <span className="text-xs font-bold">{Math.abs(trend).toFixed(1)}</span>
                        </div>
                    )}
                    <div className={`w-3 h-3 rounded-full ${config.accent} animate-pulse shadow-sm`}></div>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-2 relative z-10">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {label}
                </div>
                <div className={`text-3xl font-black ${config.valueText} leading-none tracking-tight`}>
                    {value}
                    {unit && <span className="text-xl ml-1 text-slate-500 font-semibold">{unit}</span>}
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${config.text} ${config.iconBg} uppercase tracking-wide shadow-sm`}>
                    {status}
                </div>
            </div>

            {/* Subtle pattern overlay */}
            <div className="absolute bottom-0 right-0 w-24 h-24 opacity-5">
                <IconComponent className="w-full h-full" />
            </div>
        </div>
    );
}

// Enhanced Hotspot Map
function EnhancedHotspotMap() {
    const apiUrl = import.meta.env.VITE_API_URL;
    const { data, isConnected } = useSensorData(apiUrl, 5000);
    const latest = data && data.length > 0 ? data[0] : null;

    return (
        <div className="h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl relative overflow-hidden border border-slate-700/50">
            {/* Animated grid pattern */}
            <div className="absolute inset-0 opacity-20">
                <div className="grid grid-cols-16 h-full">
                    {Array.from({ length: 256 }).map((_, i) => (
                        <div key={i} className="border border-cyan-500/20 animate-pulse" style={{
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: '4s'
                        }}></div>
                    ))}
                </div>
            </div>

            {/* Central sensor pulse */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                    {/* Multiple pulse rings */}
                    <div className="absolute inset-0 w-8 h-8 rounded-full bg-cyan-400/30 animate-ping"></div>
                    <div className="absolute inset-0 w-8 h-8 rounded-full bg-cyan-400/40 animate-ping" style={{animationDelay: '0.5s'}}></div>
                    <div className="absolute inset-0 w-8 h-8 rounded-full bg-cyan-400/50 animate-ping" style={{animationDelay: '1s'}}></div>

                    <div className={`w-8 h-8 rounded-full shadow-xl shadow-cyan-500/50 ${
                        latest?.isFlame ? 'bg-gradient-to-br from-red-400 to-red-600' :
                            latest?.smoke > 2000 ? 'bg-gradient-to-br from-orange-400 to-red-500' :
                                latest?.temperature > 35 ? 'bg-gradient-to-br from-orange-400 to-red-500' :
                                    'bg-gradient-to-br from-cyan-400 to-blue-500'
                    } animate-pulse border-2 border-white/50`}></div>
                </div>
            </div>

            {/* Enhanced data overlays with glassmorphism */}
            {latest && (
                <>
                    <div className="absolute top-6 left-6 bg-black/40 backdrop-blur-md rounded-xl px-4 py-3 shadow-xl border border-white/10">
                        <div className="flex items-center gap-3">
                            <Thermometer className="w-5 h-5 text-red-400" />
                            <div>
                                <div className="text-xs text-slate-300 font-medium">Temperature</div>
                                <div className="text-lg font-bold text-white">{latest.temperature?.toFixed(1)}°C</div>
                            </div>
                        </div>
                    </div>

                    <div className="absolute top-6 right-6 bg-black/40 backdrop-blur-md rounded-xl px-4 py-3 shadow-xl border border-white/10">
                        <div className="flex items-center gap-3">
                            <Droplets className="w-5 h-5 text-blue-400" />
                            <div>
                                <div className="text-xs text-slate-300 font-medium">Humidity</div>
                                <div className="text-lg font-bold text-white">{latest.humidity?.toFixed(1)}%</div>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-20 left-6 bg-black/40 backdrop-blur-md rounded-xl px-4 py-3 shadow-xl border border-white/10">
                        <div className="flex items-center gap-3">
                            <Flame className="w-5 h-5 text-orange-400" />
                            <div>
                                <div className="text-xs text-slate-300 font-medium">Gas Level</div>
                                <div className="text-lg font-bold text-white">{latest.gasValue || 0}</div>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-20 right-6 bg-black/40 backdrop-blur-md rounded-xl px-4 py-3 shadow-xl border border-white/10">
                        <div className="flex items-center gap-3">
                            <Wind className="w-5 h-5 text-gray-400" />
                            <div>
                                <div className="text-xs text-slate-300 font-medium">Smoke</div>
                                <div className="text-lg font-bold text-white">{latest.smoke || 0}</div>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-6 right-6 bg-black/40 backdrop-blur-md rounded-xl px-4 py-3 shadow-xl border border-white/10">
                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-purple-400" />
                            <div>
                                <div className="text-xs text-slate-300 font-medium">Location</div>
                                <div className="text-sm font-bold text-white">
                                    {latest.latitude?.toFixed(2)}, {latest.longitude?.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Enhanced status badge */}
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
                <div className={`px-4 py-2 rounded-full text-sm font-bold border backdrop-blur-md ${
                    isConnected
                        ? 'bg-green-500/20 text-green-300 border-green-400/50 shadow-green-500/25'
                        : 'bg-red-500/20 text-red-300 border-red-400/50 shadow-red-500/25'
                } shadow-xl`}>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
                        {isConnected ? 'LIVE MONITORING' : 'CONNECTION LOST'}
                    </div>
                </div>
            </div>

            {/* Scanning line effect */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"
                     style={{
                         animation: 'scan 3s linear infinite',
                     }}>
                </div>
            </div>

            <style jsx>{`
                @keyframes scan {
                    0% { transform: translateY(0); opacity: 1; }
                    50% { opacity: 0.8; }
                    100% { transform: translateY(100vh); opacity: 0; }
                }
            `}</style>
        </div>
    );
}

// Enhanced Sensor Readings with better organization
function EnhancedSensorReadings() {
    const apiUrl = import.meta.env.VITE_API_URL;
    const { data, loading, error, isConnected, lastUpdated, refetch } = useSensorData(apiUrl, 3000);
    const latest = data && data.length > 0 ? data[0] : null;
    const previous = data && data.length > 1 ? data[1] : null;

    const getSensorStatus = (sensorType, value) => {
        switch (sensorType) {
            case 'temperature':
                return value > 35 ? 'critical' : value > 30 ? 'warning' : 'normal';
            case 'humidity':
                return value > 80 ? 'critical' : value > 60 ? 'warning' : 'normal';
            case 'gasValue':
                return value > 500 ? 'critical' : value > 300 ? 'warning' : 'normal';
            case 'smoke':
                return value > 2000 ? 'critical' : value > 1000 ? 'warning' : 'normal';
            case 'pm25':
                return value > 35 ? 'critical' : value > 12 ? 'warning' : 'normal';
            case 'pm10':
                return value > 50 ? 'critical' : value > 20 ? 'warning' : 'normal';
            case 'waterLevel':
                return value > 15 ? 'critical' : value > 10 ? 'warning' : 'normal';
            case 'shake':
                return value > 0.8 ? 'critical' : value > 0.3 ? 'warning' : 'normal';
            case 'isFlame':
                return value ? 'critical' : 'normal';
            case 'isRaining':
                return value ? 'warning' : 'normal';
            default:
                return 'normal';
        }
    };

    const calculateTrend = (current, previous, field) => {
        if (!previous || !current) return 0;
        return current[field] - previous[field];
    };

    if (loading && !latest) {
        return (
            <div className="p-8 flex items-center justify-center">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-8 h-8 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin" style={{animationDirection: 'reverse'}}></div>
                    </div>
                    <span className="text-slate-700 font-semibold text-lg">Initializing sensors...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-6 border border-red-200/50">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-red-700 mb-3">Connection Error</h3>
                    <p className="text-red-600 mb-4">Failed to connect to sensor network</p>
                    <button
                        onClick={refetch}
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl text-sm font-bold hover:from-red-600 hover:to-rose-600 transition-all duration-300 shadow-lg hover:shadow-red-500/25 transform hover:scale-105"
                    >
                        <RefreshCw className="w-4 h-4 inline mr-2" />
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Enhanced Status Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-slate-200/50">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse shadow-lg`}></div>
                    <div>
                        <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                            {isConnected ? 'LIVE SENSOR NETWORK' : 'NETWORK OFFLINE'}
                        </span>
                        <div className="text-xs text-slate-500 font-medium">
                            {data?.length || 0} data points • Updated every 3s
                        </div>
                    </div>
                </div>
                {lastUpdated && (
                    <div className="text-right">
                        <div className="text-xs text-slate-500 font-medium">Last Update</div>
                        <div className="text-sm font-bold text-slate-700">
                            {lastUpdated.toLocaleTimeString()}
                        </div>
                    </div>
                )}
            </div>

            {/* Enhanced Sensor Grid */}
            {latest ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <EnhancedSensorCard
                        label="Temperature"
                        value={latest.temperature?.toFixed(1) || '--'}
                        unit="°C"
                        icon={Thermometer}
                        status={getSensorStatus('temperature', latest.temperature)}
                        trend={calculateTrend(latest, previous, 'temperature')}
                    />
                    <EnhancedSensorCard
                        label="Humidity"
                        value={latest.humidity?.toFixed(1) || '--'}
                        unit="%"
                        icon={Droplets}
                        status={getSensorStatus('humidity', latest.humidity)}
                        trend={calculateTrend(latest, previous, 'humidity')}
                    />
                    <EnhancedSensorCard
                        label="Gas Level"
                        value={latest.gasValue || '--'}
                        unit="ppm"
                        icon={Flame}
                        status={getSensorStatus('gasValue', latest.gasValue)}
                        trend={calculateTrend(latest, previous, 'gasValue')}
                    />
                    <EnhancedSensorCard
                        label="Smoke Level"
                        value={latest.smoke || '--'}
                        unit="ppm"
                        icon={Wind}
                        status={getSensorStatus('smoke', latest.smoke)}
                        trend={calculateTrend(latest, previous, 'smoke')}
                    />
                    <EnhancedSensorCard
                        label="Air Quality PM2.5"
                        value={latest.pm25 || '--'}
                        unit="μg/m³"
                        icon={Activity}
                        status={getSensorStatus('pm25', latest.pm25)}
                        trend={calculateTrend(latest, previous, 'pm25')}
                    />
                    <EnhancedSensorCard
                        label="Air Quality PM10"
                        value={latest.pm10 || '--'}
                        unit="μg/m³"
                        icon={Activity}
                        status={getSensorStatus('pm10', latest.pm10)}
                        trend={calculateTrend(latest, previous, 'pm10')}
                    />
                    <EnhancedSensorCard
                        label="Water Level"
                        value={latest.waterLevel?.toFixed(1) || '--'}
                        unit="m"
                        icon={Waves}
                        status={getSensorStatus('waterLevel', latest.waterLevel)}
                        trend={calculateTrend(latest, previous, 'waterLevel')}
                    />
                    <EnhancedSensorCard
                        label="Rain Level"
                        value={latest.rainLevel?.toFixed(1) || latest.rainAnalog || '--'}
                        unit="mm"
                        icon={CloudRain}
                        status={getSensorStatus('rainLevel', latest.rainLevel || latest.rainAnalog)}
                        trend={calculateTrend(latest, previous, 'rainLevel')}
                    />
                    <EnhancedSensorCard
                        label="Flame Detection"
                        value={latest.isFlame ? 'DETECTED' : 'CLEAR'}
                        unit=""
                        icon={Flame}
                        status={getSensorStatus('isFlame', latest.isFlame)}
                    />
                    <EnhancedSensorCard
                        label="Vibration"
                        value={latest.shake?.toFixed(2) || '--'}
                        unit="g"
                        icon={Mountain}
                        status={getSensorStatus('shake', latest.shake)}
                        trend={calculateTrend(latest, previous, 'shake')}
                    />

                    {/* Enhanced Location Card */}
                    <div className="md:col-span-2 lg:col-span-3 bg-gradient-to-br from-purple-50 via-violet-50 to-purple-50 border border-purple-200/60 rounded-2xl p-6 relative overflow-hidden shadow-lg hover:shadow-purple-500/10 transition-all duration-500">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-violet-500"></div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-gradient-to-br from-purple-100 to-violet-100 p-3 rounded-xl">
                                <MapPin className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 animate-pulse"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                                    GPS COORDINATES
                                </div>
                                <div className="text-2xl font-black text-slate-800 mb-1">
                                    {latest.latitude?.toFixed(6) || '--'}, {latest.longitude?.toFixed(6) || '--'}
                                </div>
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-purple-700 bg-purple-100 uppercase tracking-wide">
                                    LIVE TRACKING
                                </div>
                            </div>
                            <div className="flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/25 mb-2">
                                        <Zap className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="text-xs font-bold text-purple-600">ACTIVE</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-8 border border-slate-200">
                        <AlertTriangle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-600 mb-2">No Data Available</h3>
                        <p className="text-slate-500">Waiting for sensor network connection...</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// Enhanced Main Dashboard
export default function EnhancedPremiumDashboard() {
    const [isAutoRefresh, setIsAutoRefresh] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const apiUrl = import.meta.env.VITE_API_URL || 'https://disaster-management-api-nwte.onrender.com';
    const pollInterval = parseInt(import.meta.env.VITE_POLL_INTERVAL) || 3000;

    const {
        data: sensorData,
        loading,
        error,
        isConnected,
        lastUpdated: sensorLastUpdated,
        refetch
    } = useSensorData(apiUrl, pollInterval);

    const handleRefresh = () => {
        setLastUpdated(new Date());
        refetch();
    };

    const formatLastUpdated = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour12: true,
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const latest = sensorData && sensorData.length > 0 ? sensorData[0] : null;

    const criticalAlerts = sensorData ? sensorData.filter(d =>
        d.isFlame || d.gasValue > 500 || d.smoke > 2000 || d.temperature > 35 || d.pm25 > 35 || d.waterLevel > 15
    ).length : 0;

    if (error) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Error Loading Dashboard</h1>
                    <p className="text-slate-600">{error.message || 'An error occurred while fetching sensor data.'}</p>
                    <button
                        onClick={handleRefresh}
                        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-x-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>

            {/* Enhanced Header */}
            <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/25 relative">
                                <BarChart3 className="w-9 h-9 text-white" />
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-bold text-white">{criticalAlerts}</span>
                                </div>
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                                    Emergency Response Dashboard
                                </h1>
                                <div className="flex items-center gap-6 mt-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <p className="text-slate-600 font-medium">
                                            Real-time monitoring • {sensorData?.length || 0} active sensors
                                        </p>
                                    </div>
                                    <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border-2 backdrop-blur-sm ${
                                        isConnected
                                            ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200'
                                            : 'bg-red-50/80 text-red-700 border-red-200'
                                    } shadow-sm`}>
                                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></div>
                                        <span className="text-sm font-bold">
                                            {formatLastUpdated(sensorLastUpdated || lastUpdated)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Link
                                to="/sensors"
                                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold text-sm transition-all duration-300 shadow-lg transform hover:scale-105 hover:shadow-blue-500/25"
                            >
                                <Activity className="w-5 h-5" />
                                View Sensors
                            </Link>
                            <Link
                                to="/how-it-works"
                                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-sm transition-all duration-300 shadow-lg transform hover:scale-105 hover:shadow-purple-500/25"
                            >
                                <Settings className="w-5 h-5" />
                                How It Works
                            </Link>
                            <button
                                onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg transform hover:scale-105 ${
                                    isAutoRefresh
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/25'
                                        : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-slate-300 shadow-slate-500/10'
                                }`}
                            >
                                <Eye className="w-5 h-5" />
                                {isAutoRefresh ? 'LIVE MONITORING' : 'MONITORING PAUSED'}
                            </button>

                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                className="flex items-center gap-3 px-6 py-3 bg-white border-2 border-slate-200 rounded-xl hover:border-slate-300 transition-all duration-300 disabled:opacity-50 shadow-lg transform hover:scale-105"
                            >
                                <RefreshCw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
                                <span className="text-sm font-bold text-slate-600">Refresh</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-8 relative z-10">
                {/* Enhanced Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-red-50 via-rose-50 to-red-50 border-2 border-red-200/60 rounded-2xl p-7 relative overflow-hidden shadow-xl shadow-red-500/10 hover:shadow-red-500/20 transition-all duration-500 group cursor-pointer">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-500"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="bg-gradient-to-br from-red-100 to-rose-100 p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                            <div className={`w-4 h-4 rounded-full ${criticalAlerts > 0 ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse shadow-lg`}></div>
                        </div>
                        <div className="relative z-10">
                            <div className="text-4xl font-black text-slate-900 mb-2">{criticalAlerts}</div>
                            <div className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">Critical Alerts</div>
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${criticalAlerts > 0 ? 'text-red-700 bg-red-100' : 'text-emerald-700 bg-emerald-100'}`}>
                                {criticalAlerts > 0 ? 'IMMEDIATE ACTION' : 'ALL SYSTEMS NORMAL'}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 via-sky-50 to-blue-50 border-2 border-blue-200/60 rounded-2xl p-7 relative overflow-hidden shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-500 group cursor-pointer">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-sky-500"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="bg-gradient-to-br from-blue-100 to-sky-100 p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <Thermometer className="w-8 h-8 text-blue-600" />
                            </div>
                            <TrendingUp className={`w-6 h-6 ${latest?.temperature > 35 ? 'text-red-500' : 'text-emerald-500'}`} />
                        </div>
                        <div className="relative z-10">
                            <div className="text-4xl font-black text-slate-900 mb-2">{latest?.temperature?.toFixed(1) || '--'}°C</div>
                            <div className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">Temperature</div>
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${latest?.temperature > 35 ? 'text-red-700 bg-red-100' : 'text-emerald-700 bg-emerald-100'}`}>
                                {latest?.temperature > 35 ? 'HIGH TEMPERATURE' : 'NORMAL RANGE'}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-200/60 rounded-2xl p-7 relative overflow-hidden shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-500 group cursor-pointer">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="bg-gradient-to-br from-emerald-100 to-teal-100 p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <Wind className="w-8 h-8 text-emerald-600" />
                            </div>
                            <Activity className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="text-4xl font-black text-slate-900 mb-2">{latest?.smoke || '--'}</div>
                            <div className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">Smoke Level</div>
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${latest?.smoke > 2000 ? 'text-red-700 bg-red-100' : latest?.smoke > 1000 ? 'text-amber-700 bg-amber-100' : 'text-emerald-700 bg-emerald-100'}`}>
                                {latest?.smoke > 2000 ? 'CRITICAL LEVEL' : latest?.smoke > 1000 ? 'WARNING LEVEL' : 'NORMAL RANGE'}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 via-violet-50 to-purple-50 border-2 border-purple-200/60 rounded-2xl p-7 relative overflow-hidden shadow-xl shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-500 group cursor-pointer">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-violet-500"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="bg-gradient-to-br from-purple-100 to-violet-100 p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <Activity className="w-8 h-8 text-purple-600" />
                            </div>
                            <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse shadow-lg`}></div>
                        </div>
                        <div className="relative z-10">
                            <div className="text-4xl font-black text-slate-900 mb-2">{sensorData?.length || 0}</div>
                            <div className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">Active Sensors</div>
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-purple-700 bg-purple-100 uppercase tracking-wide">
                                NETWORK ACTIVE
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Enhanced Map */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-slate-200/60 overflow-hidden shadow-2xl shadow-slate-500/10">
                        <div className="p-6 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-gray-50">
                            <div className="flex items-center gap-4">
                                <div className="bg-gradient-to-br from-emerald-100 to-teal-100 p-3 rounded-xl shadow-sm">
                                    <BarChart3 className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Real-Time Incident Map</h3>
                                    <p className="text-sm text-slate-600 font-medium">Live sensor network visualization</p>
                                </div>
                            </div>
                        </div>
                        <div className="h-96">
                            <EnhancedHotspotMap />
                        </div>
                    </div>

                    {/* Enhanced Sensors */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-slate-200/60 overflow-hidden shadow-2xl shadow-slate-500/10">
                        <div className="p-6 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-gray-50">
                            <div className="flex items-center gap-4">
                                <div className="bg-gradient-to-br from-blue-100 to-sky-100 p-3 rounded-xl shadow-sm">
                                    <Activity className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Sensor Network Status</h3>
                                    <p className="text-sm text-slate-600 font-medium">Live environmental monitoring</p>
                                </div>
                            </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            <EnhancedSensorReadings />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
