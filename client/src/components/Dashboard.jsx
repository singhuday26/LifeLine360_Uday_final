import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { useRealtimeData } from '../hooks/useRealtimeData';
import { getApiBaseUrl, getWebSocketUrl } from '../utils/apiConfig';
import GoogleMapsHotspotMap from './GoogleMapsHotspotMap';

const toNumber = (value) => {
    if (value == null) {
        return null;
    }

    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null;
    }

    if (typeof value === 'string') {
        const parsed = Number(value);
        return Number.isNaN(parsed) ? null : parsed;
    }

    if (typeof value === 'boolean') {
        return value ? 1 : 0;
    }

    return null;
};

const toDate = (value) => {
    if (!value) {
        return null;
    }

    const parsed = value instanceof Date ? value : new Date(value);
    return Number.isNaN(parsed?.getTime?.()) ? null : parsed;
};

const buildMetric = (latest, previous) => {
    if (!latest) {
        return {
            value: null,
            unit: null,
            latest: null,
            previousValue: null,
            timestamp: null,
            previousTimestamp: null
        };
    }

    const currentValue = toNumber(latest.value ?? latest.reading ?? latest.measurement);
    const previousValue = previous ? toNumber(previous.value ?? previous.reading ?? previous.measurement) : null;

    return {
        value: currentValue,
        unit: latest.unit || null,
        latest,
        previousValue,
        timestamp: toDate(latest.timestamp),
        previousTimestamp: toDate(previous?.timestamp)
    };
};

const computeSensorMetrics = (sensorData = []) => {
    if (!Array.isArray(sensorData) || sensorData.length === 0) {
        return {
            rawLatestByType: new Map()
        };
    }

    const latestByType = new Map();
    const previousByType = new Map();

    sensorData.forEach((reading) => {
        if (!reading) {
            return;
        }

        const typeKey = (reading.type || '').toString().toLowerCase();
        if (!typeKey) {
            return;
        }

        if (!latestByType.has(typeKey)) {
            latestByType.set(typeKey, reading);
        } else if (!previousByType.has(typeKey)) {
            previousByType.set(typeKey, reading);
        }
    });

    const getMetric = (...types) => {
        for (const type of types) {
            const key = type.toString().toLowerCase();
            if (latestByType.has(key)) {
                return buildMetric(latestByType.get(key), previousByType.get(key));
            }
        }
        return buildMetric(null, null);
    };

    const temperature = getMetric('temperature');
    const humidity = getMetric('humidity');
    const smoke = getMetric('smoke');
    const gas = getMetric('gas', 'gasvalue', 'mq2', 'lpg');
    const pm25 = getMetric('pm25', 'pm2.5', 'air_quality');
    const pm10 = getMetric('pm10');
    const rainfall = getMetric('rainfall', 'rain_level', 'rain');
    const flood = getMetric('flood', 'water', 'waterlevel');
    const seismic = getMetric('seismic', 'shake', 'vibration');
    const flame = getMetric('flame', 'isflame');

    return {
        rawLatestByType: latestByType,
        temperature,
        humidity,
        smoke,
        gas,
        pm25,
        pm10,
        rainfall,
        flood,
        seismic,
        flame,
        airQuality: getMetric('air_quality')
    };
};

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
function EnhancedHotspotMap({ hotspots, isConnected }) {
    return <GoogleMapsHotspotMap hotspots={hotspots} isConnected={isConnected} />;
}

// Enhanced Sensor Readings with better organization
function EnhancedSensorReadings({ sensorData, sensorMetrics = {}, loading, error, isConnected, lastUpdated, refetch }) {
    const latestReading = Array.isArray(sensorData) && sensorData.length > 0 ? sensorData[0] : null;

    const getSensorStatus = (sensorType, value) => {
        if (value == null || Number.isNaN(value)) {
            return 'normal';
        }

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
            case 'rainLevel':
                return value ? 'warning' : 'normal';
            default:
                return 'normal';
        }
    };

    const formatCardValue = (metric, fractionDigits = 1) => {
        if (!metric || metric.value == null || Number.isNaN(metric.value)) {
            return '--';
        }

        if (typeof metric.value !== 'number') {
            return metric.value;
        }

        return metric.value.toFixed(fractionDigits);
    };

    const calculateTrend = (metric) => {
        if (!metric || metric.value == null || metric.previousValue == null) {
            return 0;
        }

        if (Number.isNaN(metric.value) || Number.isNaN(metric.previousValue)) {
            return 0;
        }

        return metric.value - metric.previousValue;
    };

    if (loading && !latestReading) {
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

    const metricCards = [
        {
            key: 'temperature',
            label: 'Temperature',
            metric: sensorMetrics.temperature,
            unit: sensorMetrics.temperature?.unit || '°C',
            icon: Thermometer,
            type: 'temperature',
            precision: 1
        },
        {
            key: 'humidity',
            label: 'Humidity',
            metric: sensorMetrics.humidity,
            unit: '%',
            icon: Droplets,
            type: 'humidity',
            precision: 1
        },
        {
            key: 'gas',
            label: 'Gas Level',
            metric: sensorMetrics.gas,
            unit: sensorMetrics.gas?.unit || 'ppm',
            icon: Flame,
            type: 'gasValue',
            precision: 0
        },
        {
            key: 'smoke',
            label: 'Smoke Level',
            metric: sensorMetrics.smoke,
            unit: sensorMetrics.smoke?.unit || 'ppm',
            icon: Wind,
            type: 'smoke',
            precision: 0
        },
        {
            key: 'pm25',
            label: 'Air Quality PM2.5',
            metric: sensorMetrics.pm25?.latest ? sensorMetrics.pm25 : sensorMetrics.airQuality,
            unit: sensorMetrics.pm25?.unit || sensorMetrics.airQuality?.unit || 'μg/m³',
            icon: Activity,
            type: 'pm25',
            precision: 0
        },
        {
            key: 'pm10',
            label: 'Air Quality PM10',
            metric: sensorMetrics.pm10,
            unit: sensorMetrics.pm10?.unit || 'μg/m³',
            icon: Activity,
            type: 'pm10',
            precision: 0
        },
        {
            key: 'water',
            label: 'Water Level',
            metric: sensorMetrics.flood,
            unit: sensorMetrics.flood?.unit || 'm',
            icon: Waves,
            type: 'waterLevel',
            precision: 1
        },
        {
            key: 'rainfall',
            label: 'Rain Level',
            metric: sensorMetrics.rainfall,
            unit: sensorMetrics.rainfall?.unit || 'mm',
            icon: CloudRain,
            type: 'rainLevel',
            precision: 1
        },
        {
            key: 'flame',
            label: 'Flame Detection',
            metric: sensorMetrics.flame,
            unit: '',
            icon: Flame,
            type: 'isFlame',
            boolean: true
        },
        {
            key: 'seismic',
            label: 'Vibration',
            metric: sensorMetrics.seismic,
            unit: sensorMetrics.seismic?.unit || 'g',
            icon: Mountain,
            type: 'shake',
            precision: 2
        }
    ];

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
                                                    <p className="text-sm text-slate-600 font-medium">
                            {sensorData?.length || 0} data points • Real-time updates
                        </p>
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
            {latestReading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {metricCards.map((card) => {
                        const metric = card.metric;
                        const isBoolean = Boolean(card.boolean);
                        const displayValue = isBoolean
                            ? (metric && metric.value ? 'DETECTED' : 'CLEAR')
                            : formatCardValue(metric, card.precision ?? 1);
                        const unit = !isBoolean && displayValue !== '--' ? card.unit : '';
                        const trendValue = !isBoolean ? calculateTrend(metric) : 0;
                        const trend = trendValue !== 0 ? trendValue : null;

                        return (
                            <EnhancedSensorCard
                                key={card.key}
                                label={card.label}
                                value={displayValue}
                                unit={unit}
                                icon={card.icon}
                                status={getSensorStatus(card.type, metric?.value)}
                                trend={trend}
                            />
                        );
                    })}

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
                                    {latestReading.latitude?.toFixed(6) || '--'}, {latestReading.longitude?.toFixed(6) || '--'}
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

    // NLP State
    const [nlpCandidates, setNlpCandidates] = useState([]);
    const [nlpLoading, setNlpLoading] = useState(false);
    const [nlpError, setNlpError] = useState(null);

    const apiUrl = getApiBaseUrl();
    const wsUrl = getWebSocketUrl();
    const pollInterval = parseInt(import.meta.env.VITE_POLL_INTERVAL) || 30000;

    const {
        data: sensorData,
        stats,
        hotspots,
        loading,
        error,
        lastUpdated: realtimeLastUpdated,
        isConnected,
        refetch
    } = useRealtimeData(apiUrl, wsUrl, {
        pollInterval,
        enablePolling: isAutoRefresh
    });

    const sensorMetrics = useMemo(
        () => computeSensorMetrics(sensorData),
        [sensorData]
    );

    const formatMetricValue = useCallback((metric, fractionDigits = 1) => {
        if (!metric || metric.value == null || Number.isNaN(metric.value)) {
            return '--';
        }

        if (typeof metric.value !== 'number') {
            return metric.value;
        }

        return metric.value.toFixed(fractionDigits);
    }, []);

    const handleRefresh = () => {
        setLastUpdated(new Date());
        refetch();
    };

    // NLP Functions
    const fetchNlpCandidates = useCallback(async () => {
        try {
            setNlpLoading(true);
            setNlpError(null);
            const response = await fetch(`${apiUrl}/api/nlp/candidates?status=PENDING`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.success) {
                setNlpCandidates(result.data || []);
            } else {
                throw new Error(result.message || 'Failed to fetch NLP candidates');
            }
        } catch (err) {
            console.error('Error fetching NLP candidates:', err);
            setNlpError(err.message);
        } finally {
            setNlpLoading(false);
        }
    }, [apiUrl]);

    const handleNlpVerification = async (candidateId, decision, note = '') => {
        try {
            const response = await fetch(`${apiUrl}/api/alerts/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    candidateId,
                    decision,
                    note
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.success) {
                // Refresh candidates after verification
                fetchNlpCandidates();
            } else {
                throw new Error(result.message || 'Failed to verify candidate');
            }
        } catch (err) {
            console.error('Error verifying NLP candidate:', err);
            setNlpError(err.message);
        }
    };

    const formatLastUpdated = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour12: true,
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const criticalAlerts = stats?.activeAlerts || 0;
    const activeSensors = stats?.sensorsOnline || sensorData?.length || 0;

    const temperatureMetric = sensorMetrics.temperature || {};
    const smokeMetric = sensorMetrics.smoke || {};

    const isHighTemperature = temperatureMetric.value != null && temperatureMetric.value > 35;
    const temperatureDisplay = formatMetricValue(temperatureMetric, 1);

    const smokeValue = smokeMetric.value;
    const smokeSeverity = smokeValue != null
        ? smokeValue > 2000
            ? 'critical'
            : smokeValue > 1000
                ? 'warning'
                : 'normal'
        : 'normal';
    const smokeDisplay = smokeValue == null || Number.isNaN(smokeValue) ? '--' : smokeValue.toFixed(0);

    // Fetch NLP candidates on component mount
    useEffect(() => {
        fetchNlpCandidates();
    }, [fetchNlpCandidates]);

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
                                            Real-time monitoring • {activeSensors} active sensors
                                        </p>
                                    </div>
                                    <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border-2 backdrop-blur-sm ${
                                        isConnected
                                            ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200'
                                            : 'bg-red-50/80 text-red-700 border-red-200'
                                    } shadow-sm`}>
                                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></div>
                                        <span className="text-sm font-bold">
                                            {formatLastUpdated(realtimeLastUpdated || lastUpdated)}
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
                            <TrendingUp className={`w-6 h-6 ${isHighTemperature ? 'text-red-500' : 'text-emerald-500'}`} />
                        </div>
                        <div className="relative z-10">
                            <div className="text-4xl font-black text-slate-900 mb-2">
                                {temperatureDisplay}
                                {temperatureDisplay !== '--' && (
                                    <span className="text-2xl font-semibold text-slate-500 ml-1">
                                        {temperatureMetric.unit || '°C'}
                                    </span>
                                )}
                            </div>
                            <div className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">Temperature</div>
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${isHighTemperature ? 'text-red-700 bg-red-100' : 'text-emerald-700 bg-emerald-100'}`}>
                                {isHighTemperature ? 'HIGH TEMPERATURE' : 'NORMAL RANGE'}
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
                            <Activity className={`w-6 h-6 ${smokeSeverity === 'critical' ? 'text-red-500' : smokeSeverity === 'warning' ? 'text-amber-500' : 'text-emerald-500'}`} />
                        </div>
                        <div className="relative z-10">
                            <div className="text-4xl font-black text-slate-900 mb-2">
                                {smokeDisplay}
                                {smokeDisplay !== '--' && (
                                    <span className="text-2xl font-semibold text-slate-500 ml-1">
                                        {smokeMetric.unit || 'ppm'}
                                    </span>
                                )}
                            </div>
                            <div className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">Smoke Level</div>
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${smokeSeverity === 'critical' ? 'text-red-700 bg-red-100' : smokeSeverity === 'warning' ? 'text-amber-700 bg-amber-100' : 'text-emerald-700 bg-emerald-100'}`}>
                                {smokeSeverity === 'critical' ? 'CRITICAL LEVEL' : smokeSeverity === 'warning' ? 'WARNING LEVEL' : 'NORMAL RANGE'}
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
                            <div className="text-4xl font-black text-slate-900 mb-2">{activeSensors}</div>
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
                            <EnhancedHotspotMap hotspots={hotspots} isConnected={isConnected} />
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
                            <EnhancedSensorReadings
                                sensorData={sensorData}
                                loading={loading}
                                error={error}
                                isConnected={isConnected}
                                lastUpdated={realtimeLastUpdated}
                                refetch={refetch}
                            />
                        </div>
                    </div>
                </div>

                {/* NLP Alerts Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-slate-200/60 overflow-hidden shadow-2xl shadow-slate-500/10">
                    <div className="p-6 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-gray-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-3 rounded-xl shadow-sm">
                                    <AlertTriangle className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">NLP-Processed Alerts</h3>
                                    <p className="text-sm text-slate-600 font-medium">AI-generated emergency candidates</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {nlpLoading && (
                                    <div className="flex items-center gap-2">
                                        <RefreshCw className="w-4 h-4 animate-spin text-slate-600" />
                                        <span className="text-sm text-slate-600">Processing...</span>
                                    </div>
                                )}
                                <button
                                    onClick={fetchNlpCandidates}
                                    disabled={nlpLoading}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium text-slate-700 transition-colors disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-4 h-4 ${nlpLoading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {nlpError && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                    <span className="text-red-700 font-medium">Error loading NLP alerts</span>
                                </div>
                                <p className="text-red-600 text-sm mt-1">{nlpError}</p>
                            </div>
                        )}

                        {!nlpLoading && !nlpError && nlpCandidates.length === 0 && (
                            <div className="text-center py-12">
                                <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                <h4 className="text-lg font-semibold text-slate-600 mb-2">No Pending Alerts</h4>
                                <p className="text-slate-500">All emergency situations have been processed.</p>
                            </div>
                        )}

                        {nlpCandidates.length > 0 && (
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {nlpCandidates.map((candidate) => (
                                    <div key={candidate._id} className="bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200/60 rounded-xl p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${
                                                    candidate.severity === 'CRITICAL' ? 'bg-red-500' :
                                                    candidate.severity === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500'
                                                } animate-pulse`}></div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900">{candidate.hazard}</h4>
                                                    <p className="text-sm text-slate-600">
                                                        Confidence: {(candidate.confidence * 100).toFixed(1)}%
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                                candidate.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                                                candidate.severity === 'WARNING' ? 'bg-amber-100 text-amber-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                                {candidate.severity}
                                            </div>
                                        </div>

                                        {candidate.centroid && (
                                            <div className="text-sm text-slate-600 mb-2">
                                                Location: {candidate.centroid.lat.toFixed(4)}, {candidate.centroid.lng.toFixed(4)}
                                            </div>
                                        )}

                                        {candidate.explanation && (
                                            <p className="text-sm text-slate-700 mb-3">{candidate.explanation}</p>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <div className="text-xs text-slate-500">
                                                {new Date(candidate.createdAt).toLocaleString()}
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleNlpVerification(candidate._id, 'REJECT')}
                                                    className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => handleNlpVerification(candidate._id, 'VERIFY')}
                                                    className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    Verify
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
