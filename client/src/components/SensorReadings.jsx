import React from 'react';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { useSensorData } from '../hooks/useSensorData';

function SensorCard({ label, value, unit, icon, status = 'normal' }) {
    const statusColors = {
        normal: 'bg-gray-800 border-gray-600',
        warning: 'bg-yellow-800 border-yellow-600',
        critical: 'bg-red-800 border-red-600'
    };

    const textColors = {
        normal: 'text-white',
        warning: 'text-yellow-200',
        critical: 'text-red-200'
    };

    return (
        <div className={`p-4 ${statusColors[status]} border rounded-xl shadow-lg flex flex-col items-center justify-center transition-transform hover:scale-105`}>
            <div className="text-3xl mb-2" role="img" aria-label={label}>
                {icon}
            </div>
            <div className="text-xs text-gray-300 mb-1 font-medium text-center">
                {label}
            </div>
            <div className={`text-lg font-bold text-center ${textColors[status]}`}>
                {value} {unit}
            </div>
        </div>
    );
}

export default function SensorReadings() {
    // 🚀 CONNECT TO YOUR BACKEND
    const apiUrl = import.meta.env.VITE_API_URL || 'https://disaster-management-api-nwte.onrender.com';
    const pollInterval = parseInt(import.meta.env.VITE_POLL_INTERVAL) || 3000;

    const { data, loading, error, isConnected, lastUpdated, refetch } = useSensorData(apiUrl, pollInterval);
    const latest = data && data.length > 0 ? data[0] : null;

    // Helper function to determine status based on sensor values
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

    if (loading && !latest) {
        return (
            <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-3"></div>
                <p className="text-slate-400 text-sm">Connecting to live sensors...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-red-300 mb-2">Connection Failed</h3>
                <p className="text-red-400 text-xs mb-3">{error}</p>
                <button
                    onClick={refetch}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-medium hover:bg-red-200 transition-colors"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    return (
        <div className="p-4">
            {/* Connection Status */}
            <div className="mb-6 text-center">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                    isConnected
                        ? 'bg-green-100 border border-green-200 text-green-700'
                        : 'bg-red-100 border border-red-200 text-red-700'
                }`}>
                    {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    <span className="font-medium">
                        {isConnected ? 'Live Data Connected' : 'Connecting...'}
                    </span>
                    {lastUpdated && isConnected && (
                        <span className="text-slate-500">
                            • {lastUpdated.toLocaleTimeString()}
                        </span>
                    )}
                </div>
            </div>

            {/* Sensor Cards Grid */}
            {latest ? (
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <SensorCard
                        label="Temperature"
                        value={latest.temperature?.toFixed(1) || '--'}
                        unit="°C"
                        icon="🌡️"
                        status={getSensorStatus('temperature', latest.temperature)}
                    />
                    <SensorCard
                        label="Humidity"
                        value={latest.humidity?.toFixed(1) || '--'}
                        unit="%"
                        icon="💧"
                        status={getSensorStatus('humidity', latest.humidity)}
                    />
                    <SensorCard
                        label="Gas Level"
                        value={latest.gasValue || '--'}
                        unit="ppm"
                        icon="💨"
                        status={getSensorStatus('gasValue', latest.gasValue)}
                    />
                    <SensorCard
                        label="Smoke Level"
                        value={latest.smoke || '--'}
                        unit="ppm"
                        icon="🚭"
                        status={getSensorStatus('smoke', latest.smoke)}
                    />
                    <SensorCard
                        label="PM2.5"
                        value={latest.pm25 || '--'}
                        unit="μg/m³"
                        icon="🌫️"
                        status={getSensorStatus('pm25', latest.pm25)}
                    />
                    <SensorCard
                        label="PM10"
                        value={latest.pm10 || '--'}
                        unit="μg/m³"
                        icon="🌫️"
                        status={getSensorStatus('pm10', latest.pm10)}
                    />
                    <SensorCard
                        label="Water Level"
                        value={latest.waterLevel?.toFixed(1) || '--'}
                        unit="m"
                        icon="🌊"
                        status={getSensorStatus('waterLevel', latest.waterLevel)}
                    />
                    <SensorCard
                        label="Rain Intensity"
                        value={latest.rainIntensity?.toFixed(1) || (latest.rainAnalog ? ((4095 - latest.rainAnalog) / 4095 * 100).toFixed(1) : '--')}
                        unit="%"
                        icon="🌧️"
                        status={getSensorStatus('rainLevel', latest.rainIntensity || ((4095 - latest.rainAnalog) / 4095 * 100))}
                    />
                    <SensorCard
                        label="Flame"
                        value={latest.isFlame ? 'Yes' : 'No'}
                        unit=""
                        icon="🔥"
                        status={getSensorStatus('isFlame', latest.isFlame)}
                    />
                    <SensorCard
                        label="Shake"
                        value={latest.shake?.toFixed(2) || '--'}
                        unit="g"
                        icon="🌋"
                        status={getSensorStatus('shake', latest.shake)}
                    />

                    {/* Location Card */}
                    <div className="col-span-2 p-4 bg-slate-700 rounded-xl shadow-lg flex flex-col items-center justify-center">
                        <div className="text-xs text-slate-300 mb-1 font-medium text-center">
                            Location (Lat, Lon)
                        </div>
                        <div className="text-white font-bold text-center">
                            {latest.latitude?.toFixed(4) || '--'}, {latest.longitude?.toFixed(4) || '--'}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-6">
                    <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">No sensor data available</p>
                </div>
            )}

            {/* Data Info */}
            {latest && (
                <div className="mt-4 text-center text-xs text-slate-500">
                    Last reading: {new Date(latest.timestamp).toLocaleString()}
                    <br />
                    Rain Level: {latest.rainAnalog || 'N/A'}
                </div>
            )}
        </div>
    );
}
