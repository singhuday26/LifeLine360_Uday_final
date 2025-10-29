import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from './useWebSocket';

export const useRealtimeData = (apiUrl, wsUrl, options = {}) => {
    const [data, setData] = useState([]);
    const [stats, setStats] = useState(null);
    const [hotspots, setHotspots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    const pollInterval = options.pollInterval || 30000; // 30 seconds fallback
    const enablePolling = options.enablePolling !== false;

    const intervalRef = useRef(null);

    // WebSocket connection
    const { isConnected: wsConnected, lastMessage, error: wsError } = useWebSocket(
        wsUrl,
        {
            maxReconnectAttempts: 5,
            reconnectInterval: 3000
        }
    );

    // Fetch stats from REST API
    const fetchStats = useCallback(async () => {
        if (!apiUrl) return;

        try {
            const response = await fetch(`${apiUrl}/api/stats`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const statsData = await response.json();
            setStats(statsData);
            console.log('📊 Stats updated:', statsData);
        } catch (err) {
            console.error('❌ Error fetching stats:', err);
        }
    }, [apiUrl]);

    // Fetch hotspots from REST API
    const fetchHotspots = useCallback(async () => {
        if (!apiUrl) return;

        try {
            const response = await fetch(`${apiUrl}/api/alerts/hotspots`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const hotspotsData = await response.json();
            // Handle both old format (array) and new format (object with data/metadata)
            const hotspots = hotspotsData.data || hotspotsData;
            setHotspots(hotspots);
            console.log('🏮 Hotspots updated:', hotspots.length, 'items');
        } catch (err) {
            console.error('❌ Error fetching hotspots:', err);
        }
    }, [apiUrl]);

    // Fetch sensor data from REST API
    const fetchSensorData = useCallback(async () => {
        if (!apiUrl) return;

        try {
            const response = await fetch(`${apiUrl}/api/sensor-data?limit=20`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const sensorData = await response.json();
            setData(sensorData);
            setLastUpdated(new Date());
            console.log('📡 Sensor data updated:', sensorData.length, 'items');
        } catch (err) {
            console.error('❌ Error fetching sensor data:', err);
        }
    }, [apiUrl]);

    // Combined fetch function
    const fetchAllData = useCallback(async () => {
        setLoading(true);
        try {
            await Promise.all([fetchStats(), fetchHotspots(), fetchSensorData()]);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [fetchStats, fetchHotspots, fetchSensorData]);

    // Handle WebSocket messages
    useEffect(() => {
        if (lastMessage) {
            const { type, data: messageData, timestamp } = lastMessage;

            switch (type) {
                case 'sensor_data':
                    console.log('📡 Real-time sensor data:', messageData);
                    // Update sensor data with new real-time data
                    setData(prevData => {
                        const newData = [messageData, ...prevData.filter(item =>
                            item.timestamp !== messageData.timestamp
                        )].slice(0, 20); // Keep only latest 20 items
                        return newData;
                    });
                    setLastUpdated(new Date(timestamp));
                    break;

                case 'new_hotspot':
                    console.log('🏮 New hotspot created:', messageData);
                    // Add new hotspot to the list
                    setHotspots(prevHotspots => {
                        const updated = [messageData, ...prevHotspots];
                        return updated.slice(0, 50); // Keep only latest 50 hotspots
                    });
                    // Update stats (increment active alerts)
                    setStats(prevStats => prevStats ? {
                        ...prevStats,
                        activeAlerts: prevStats.activeAlerts + 1
                    } : null);
                    break;

                case 'stats_update':
                    console.log('📊 Stats updated via WebSocket:', messageData);
                    setStats(messageData);
                    break;

                default:
                    console.log('📨 Unknown WebSocket message type:', type);
            }
        }
    }, [lastMessage]);

    // Update connection status
    useEffect(() => {
        setIsConnected(wsConnected);
    }, [wsConnected]);

    // Handle WebSocket errors
    useEffect(() => {
        if (wsError) {
            console.warn('⚠️ WebSocket error:', wsError);
            // Don't set error state for WebSocket issues, just log them
        }
    }, [wsError]);

    // Set up polling fallback
    useEffect(() => {
        if (enablePolling) {
            fetchAllData(); // Initial fetch

            intervalRef.current = setInterval(() => {
                if (!wsConnected) {
                    console.log('🔄 Polling for updates (WebSocket disconnected)');
                    fetchAllData();
                }
            }, pollInterval);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [fetchAllData, pollInterval, enablePolling, wsConnected]);

    // Manual refresh function
    const refetch = useCallback(() => {
        fetchAllData();
    }, [fetchAllData]);

    return {
        data,           // Sensor data array
        stats,          // Dashboard stats
        hotspots,       // Hotspots array
        loading,
        error,
        lastUpdated,
        isConnected,    // WebSocket connection status
        refetch
    };
};