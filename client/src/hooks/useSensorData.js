import { useState, useEffect, useCallback, useRef } from 'react';

export const useSensorData = (apiUrl, pollInterval = 3000) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const intervalRef = useRef(null);

    const fetchData = useCallback(async () => {
        if (!apiUrl) {
            setError('No API URL configured');
            setLoading(false);
            return;
        }

        try {
            const endpoint = import.meta.env.VITE_API_ENDPOINT || '/api/recent';
            const fullUrl = `${apiUrl}${endpoint}`;
            console.log('🔄 Fetching from:', fullUrl);

            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const sensorData = await response.json();
            console.log('✅ Data received:', sensorData);

            // Sort by timestamp (newest first)
            const sortedData = Array.isArray(sensorData)
                ? sensorData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                : [sensorData];

            setData(sortedData);
            setLastUpdated(new Date());
            setError(null);
            setIsConnected(true);
        } catch (err) {
            console.error('❌ Fetch error:', err);
            let errorMessage = err.message;

            if (err.message.includes('Failed to fetch')) {
                errorMessage = 'CORS Error - Backend not accessible from browser. Check CORS configuration.';
            }

            setError(errorMessage);
            setIsConnected(false);
        } finally {
            setLoading(false);
        }
    }, [apiUrl]);

    useEffect(() => {
        fetchData();

        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(fetchData, pollInterval);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [fetchData, pollInterval]);

    const refetch = useCallback(() => fetchData(), [fetchData]);

    return { data, loading, error, lastUpdated, isConnected, refetch };
};
