const express = require('express');
const mqtt = require('mqtt');
const WebSocket = require('ws');
const http = require('http');

// Initialize Express server
const app = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server for WebSocket integration
const server = http.createServer(app);

// Initialize WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected WebSocket clients
const clients = new Set();

// MQTT Configuration for HiveMQ
const MQTT_BROKER = 'mqtt://broker.hivemq.com'; // HiveMQ public broker
const MQTT_TOPIC = 'testtopic1/shubhayusensordata';

// Connect to MQTT broker
const mqttClient = mqtt.connect(MQTT_BROKER);

mqttClient.on('connect', () => {
    console.log('Connected to HiveMQ MQTT broker');

    // Subscribe to the sensor data topic
    mqttClient.subscribe(MQTT_TOPIC, (err) => {
        if (!err) {
            console.log(`Subscribed to topic: ${MQTT_TOPIC}`);
        } else {
            console.error('Failed to subscribe:', err);
        }
    });
});

mqttClient.on('message', (topic, message) => {
    try {
        // Parse the JSON payload
        const sensorData = JSON.parse(message.toString());

        // Log the received JSON payload to console
        console.log('Received sensor data:', sensorData);
        console.log('Topic:', topic);
        console.log('Timestamp:', new Date().toISOString());
        console.log('---');

        // Broadcast the sensor data to all connected WebSocket clients
        broadcastToClients(sensorData);

    } catch (error) {
        console.error('Error parsing MQTT message:', error);
        console.error('Raw message:', message.toString());
    }
});

mqttClient.on('error', (error) => {
    console.error('MQTT connection error:', error);
});

mqttClient.on('offline', () => {
    console.log('MQTT client offline');
});

mqttClient.on('reconnect', () => {
    console.log('MQTT client reconnecting...');
});

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');
    clients.add(ws);

    // Handle client disconnection
    ws.on('close', () => {
        console.log('WebSocket client disconnected');
        clients.delete(ws);
    });

    // Handle client messages (optional)
    ws.on('message', (message) => {
        console.log('Received message from WebSocket client:', message.toString());
    });

    // Send welcome message to new client
    ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to LifeLine360 WebSocket server',
        timestamp: new Date().toISOString()
    }));
});

// Function to broadcast data to all connected WebSocket clients
function broadcastToClients(data) {
    const message = JSON.stringify({
        type: 'sensor_data',
        data: data,
        timestamp: new Date().toISOString()
    });

    let sentCount = 0;
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
            sentCount++;
        }
    });

    console.log(`Broadcasted sensor data to ${sentCount} WebSocket clients`);
}

// Basic Express routes
app.get('/', (req, res) => {
    res.json({
        message: 'LifeLine360 Backend Server',
        status: 'running',
        mqtt: {
            broker: MQTT_BROKER,
            topic: MQTT_TOPIC,
            connected: mqttClient.connected
        },
        websocket: {
            clients: clients.size,
            endpoint: `ws://localhost:${PORT}`
        }
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        mqtt: {
            connected: mqttClient.connected,
            subscriptions: mqttClient.subscriptions || []
        },
        websocket: {
            clients: clients.size,
            ready: true
        }
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`LifeLine360 Backend Server running on port ${PORT}`);
    console.log(`MQTT Broker: ${MQTT_BROKER}`);
    console.log(`Subscribed Topic: ${MQTT_TOPIC}`);
    console.log(`WebSocket server ready for connections`);
});
