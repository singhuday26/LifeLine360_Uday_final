import { useState, useEffect, useRef, useCallback } from 'react';

export const useWebSocket = (url, options = {}) => {
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const [error, setError] = useState(null);
    const [connectionAttempts, setConnectionAttempts] = useState(0);
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const maxReconnectAttempts = options.maxReconnectAttempts || 5;
    const reconnectInterval = options.reconnectInterval || 3000;

    const connect = useCallback(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            return;
        }

        try {
            console.log('🔌 Connecting to WebSocket:', url);
            wsRef.current = new WebSocket(url);

            wsRef.current.onopen = () => {
                console.log('✅ WebSocket connected');
                setIsConnected(true);
                setError(null);
                setConnectionAttempts(0);
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('📨 WebSocket message received:', data);
                    setLastMessage(data);
                } catch (err) {
                    console.error('❌ Error parsing WebSocket message:', err);
                    setError('Invalid message format');
                }
            };

            wsRef.current.onclose = (event) => {
                console.log('🔌 WebSocket disconnected:', event.code, event.reason);
                setIsConnected(false);

                // Attempt to reconnect if not a normal closure and within max attempts
                if (event.code !== 1000 && connectionAttempts < maxReconnectAttempts) {
                    console.log(`🔄 Attempting to reconnect (${connectionAttempts + 1}/${maxReconnectAttempts})...`);
                    setConnectionAttempts(prev => prev + 1);
                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect();
                    }, reconnectInterval);
                } else if (connectionAttempts >= maxReconnectAttempts) {
                    setError('Maximum reconnection attempts reached');
                }
            };

            wsRef.current.onerror = (event) => {
                console.error('❌ WebSocket error:', event);
                setError('WebSocket connection error');
            };

        } catch (err) {
            console.error('❌ Error creating WebSocket connection:', err);
            setError('Failed to create WebSocket connection');
        }
    }, [url, connectionAttempts, maxReconnectAttempts, reconnectInterval]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        if (wsRef.current) {
            console.log('🔌 Disconnecting WebSocket');
            wsRef.current.close(1000, 'Client disconnecting');
        }
    }, []);

    const sendMessage = useCallback((message) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
            return true;
        }
        console.warn('⚠️ WebSocket not connected, cannot send message');
        return false;
    }, []);

    useEffect(() => {
        connect();

        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    return {
        isConnected,
        lastMessage,
        error,
        sendMessage,
        reconnect: connect,
        disconnect
    };
};