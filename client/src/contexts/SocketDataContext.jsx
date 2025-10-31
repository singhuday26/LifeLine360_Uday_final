import React, { useEffect, useState, useCallback, useMemo, createContext } from 'react';
import { getWebSocketUrl } from '../utils/apiConfig';

// Create the SocketDataContext
const SocketDataContext = createContext();

// Default sensor data structure with initial values
const DEFAULT_SENSOR_DATA = {
  sensorId: null,
  type: null,
  value: null,
  unit: null,
  location: {
    lat: null,
    lng: null,
    address: null
  },
  timestamp: null
};

// Default stats structure
const DEFAULT_STATS = {
  activeAlerts: 0,
  sensorsOnline: 0,
  communityReports: 0
};

// Default hotspots array
const DEFAULT_HOTSPOTS = [];

// SocketDataProvider component
export const SocketDataProvider = ({ children }) => {
  // State for the latest sensor data
  const [latestSensorData, setLatestSensorData] = useState(DEFAULT_SENSOR_DATA);

  // State for dashboard stats
  const [stats, setStats] = useState(DEFAULT_STATS);

  // State for hotspots
  const [hotspots, setHotspots] = useState(DEFAULT_HOTSPOTS);

  // State for WebSocket connection
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  // WebSocket instance
  const [ws, setWs] = useState(null);

  // Function to connect to WebSocket server
  const wsUrl = useMemo(() => getWebSocketUrl(), []);

  const connectWebSocket = useCallback(() => {
    try {
      const websocket = new WebSocket(wsUrl);

      websocket.onopen = () => {
        console.log('Connected to LifeLine360 WebSocket server');
        setIsConnected(true);
        setConnectionError(null);
      };

      websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          switch (message.type) {
            case 'sensor_data':
              // Update latest sensor data
              setLatestSensorData({
                sensorId: message.data.sensorId || message.data.id,
                type: message.data.type,
                value: message.data.value,
                unit: message.data.unit,
                location: message.data.location || DEFAULT_SENSOR_DATA.location,
                timestamp: message.data.timestamp || new Date().toISOString()
              });
              break;

            case 'stats_update':
              // Update dashboard stats
              setStats({
                activeAlerts: message.data.activeAlerts || 0,
                sensorsOnline: message.data.sensorsOnline || 0,
                communityReports: message.data.communityReports || 0
              });
              break;

            case 'new_hotspot':
              // Add new hotspot to the list
              setHotspots(prevHotspots => {
                const existingIndex = prevHotspots.findIndex(h => h.id === message.hotspot.id);
                if (existingIndex >= 0) {
                  // Update existing hotspot
                  const updatedHotspots = [...prevHotspots];
                  updatedHotspots[existingIndex] = message.hotspot;
                  return updatedHotspots;
                } else {
                  // Add new hotspot
                  return [...prevHotspots, message.hotspot];
                }
              });
              break;

            case 'connection':
              console.log('WebSocket connection acknowledged:', message.message);
              break;

            default:
              console.log('Received unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      websocket.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        setIsConnected(false);
        setWs(null);

        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          console.log('Attempting to reconnect to WebSocket...');
          connectWebSocket();
        }, 5000);
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('Failed to connect to WebSocket server');
        setIsConnected(false);
      };

      setWs(websocket);

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError('Failed to create WebSocket connection');
    }
  }, [wsUrl]);

  // Function to disconnect WebSocket
  const disconnectWebSocket = useCallback(() => {
    if (ws) {
      ws.close();
      setWs(null);
      setIsConnected(false);
    }
  }, [ws]);

  // Function to send ping to keep connection alive
  const sendPing = useCallback(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }));
    }
  }, [ws]);

  // Connect to WebSocket on component mount
  useEffect(() => {
    connectWebSocket();

    // Set up ping interval to keep connection alive
    const pingInterval = setInterval(sendPing, 30000); // Ping every 30 seconds

    // Cleanup on unmount
    return () => {
      clearInterval(pingInterval);
      disconnectWebSocket();
    };
  }, [connectWebSocket, disconnectWebSocket, sendPing]);

  // Context value
  const value = {
    // Sensor data
    latestSensorData,
    setLatestSensorData,

    // Dashboard stats
    stats,
    setStats,

    // Hotspots
    hotspots,
    setHotspots,

    // WebSocket connection status
    isConnected,
    connectionError,

    // WebSocket controls
    connectWebSocket,
    disconnectWebSocket,
    sendPing
  };

  return (
    <SocketDataContext.Provider value={value}>
      {children}
    </SocketDataContext.Provider>
  );
};

export default SocketDataContext;
