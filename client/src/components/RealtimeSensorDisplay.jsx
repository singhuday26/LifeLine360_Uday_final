import React from 'react';
import { useSocketData } from '../contexts/useSocketData';
import { Activity, Wifi, WifiOff, AlertTriangle } from 'lucide-react';

const RealtimeSensorDisplay = () => {
  const { latestSensorData, isConnected, connectionError } = useSocketData();

  // Helper function to determine status based on sensor values
  const getSensorStatus = (sensorType, value) => {
    if (!value) return 'normal';

    switch (sensorType) {
      case 'temperature':
        return value > 50 ? 'critical' : value > 40 ? 'warning' : 'normal';
      case 'rainfall':
        return value > 100 ? 'critical' : value > 50 ? 'warning' : 'normal';
      case 'seismic':
        return value > 5.0 ? 'critical' : value > 3.0 ? 'warning' : 'normal';
      case 'smoke':
        return value > 80 ? 'critical' : value > 50 ? 'warning' : 'normal';
      case 'flood':
        return value > 5.0 ? 'critical' : value > 3.0 ? 'warning' : 'normal';
      case 'air_quality':
        return value > 300 ? 'critical' : value > 150 ? 'warning' : 'normal';
      default:
        return 'normal';
    }
  };

  const status = getSensorStatus(latestSensorData.type, latestSensorData.value);

  const statusConfig = {
    normal: {
      bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
      border: 'border-emerald-200/60',
      text: 'text-emerald-700',
      valueText: 'text-slate-800',
      accent: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      iconBg: 'bg-gradient-to-br from-emerald-100 to-teal-100',
      glow: 'shadow-emerald-500/20'
    },
    warning: {
      bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
      border: 'border-amber-200/60',
      text: 'text-amber-700',
      valueText: 'text-slate-800',
      accent: 'bg-gradient-to-r from-amber-500 to-orange-500',
      iconBg: 'bg-gradient-to-br from-amber-100 to-orange-100',
      glow: 'shadow-amber-500/20'
    },
    critical: {
      bg: 'bg-gradient-to-br from-red-50 to-rose-50',
      border: 'border-red-200/60',
      text: 'text-red-700',
      valueText: 'text-slate-800',
      accent: 'bg-gradient-to-r from-red-500 to-rose-500',
      iconBg: 'bg-gradient-to-br from-red-100 to-rose-100',
      glow: 'shadow-red-500/20'
    }
  };

  const getSensorIcon = (sensorType) => {
    switch (sensorType) {
      case 'temperature': return '🌡️';
      case 'rainfall': return '🌧️';
      case 'seismic': return '🏔️';
      case 'smoke': return '💨';
      case 'flood': return '🌊';
      case 'air_quality': return '🌬️';
      default: return '📊';
    }
  };

  const formatValue = (value, unit) => {
    if (value === null || value === undefined) return '--';
    return `${typeof value === 'number' ? value.toFixed(2) : value} ${unit || ''}`;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className={`${statusConfig[status].bg} ${statusConfig[status].border} border-2 rounded-2xl p-6 shadow-xl ${statusConfig[status].glow} transition-all duration-300 hover:scale-105`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`${statusConfig[status].iconBg} p-3 rounded-xl shadow-sm`}>
            <span className="text-2xl" role="img" aria-label={latestSensorData.type}>
              {getSensorIcon(latestSensorData.type)}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 capitalize">
              {latestSensorData.type || 'No Data'}
            </h3>
            <p className="text-sm text-slate-600">
              Sensor ID: {latestSensorData.sensorId || 'Unknown'}
            </p>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="w-5 h-5 text-emerald-500" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-500" />
          )}
          {status === 'critical' && (
            <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
          )}
        </div>
      </div>

      {/* Value Display */}
      <div className="text-center mb-4">
        <div className={`text-4xl font-black ${statusConfig[status].valueText} mb-2`}>
          {formatValue(latestSensorData.value, latestSensorData.unit)}
        </div>
        <div className={`text-sm font-bold uppercase tracking-wider ${statusConfig[status].text}`}>
          {status === 'critical' ? 'CRITICAL ALERT' :
           status === 'warning' ? 'WARNING LEVEL' : 'NORMAL RANGE'}
        </div>
      </div>

      {/* Location & Timestamp */}
      <div className="space-y-2 text-sm">
        {latestSensorData.location?.address && (
          <div className="flex items-center gap-2">
            <span className="text-slate-500">📍</span>
            <span className="text-slate-700 font-medium">
              {latestSensorData.location.address}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">
              Last updated: {formatTimestamp(latestSensorData.timestamp)}
            </span>
          </div>

          <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusConfig[status].text} ${statusConfig[status].iconBg}`}>
            {isConnected ? 'LIVE' : 'OFFLINE'}
          </div>
        </div>
      </div>

      {/* Connection Error */}
      {connectionError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 font-medium">
            Connection Error: {connectionError}
          </p>
        </div>
      )}
    </div>
  );
};

export default RealtimeSensorDisplay;