const express = require('express');
const mqtt = require('mqtt');
const WebSocket = require('ws');
const http = require('http');
const mongoose = require('mongoose');

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

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/lifeline360', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Stats Schema
const statsSchema = new mongoose.Schema({
    activeAlerts: { type: Number, default: 0 },
    sensorsOnline: { type: Number, default: 0 },
    communityReports: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
});

const Stats = mongoose.model('Stats', statsSchema);

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

// API Endpoints for Dashboard
app.get('/api/stats', async (req, res) => {
    try {
        let stats = await Stats.findOne();
        if (!stats) {
            // Initialize with default values if no stats exist
            stats = new Stats({
                activeAlerts: 12,
                sensorsOnline: 847,
                communityReports: 2400
            });
            await stats.save();
        }
        res.json({
            activeAlerts: stats.activeAlerts,
            sensorsOnline: stats.sensorsOnline,
            communityReports: stats.communityReports
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/alerts/hotspots', (req, res) => {
    // Hardcoded array of incident objects for the map
    const hotspots = [
        {
            id: 1,
            type: 'flood',
            severity: 'high',
            location: {
                lat: 28.6139,
                lng: 77.2090,
                address: 'Connaught Place, New Delhi'
            },
            description: 'Flash flood in central Delhi area',
            timestamp: new Date().toISOString(),
            sensors: ['rain_gauge_001', 'water_level_002'],
            status: 'active'
        },
        {
            id: 2,
            type: 'fire',
            severity: 'critical',
            location: {
                lat: 19.0760,
                lng: 72.8777,
                address: 'Bandra West, Mumbai'
            },
            description: 'Building fire reported with smoke detection',
            timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
            sensors: ['smoke_detector_005', 'temperature_003'],
            status: 'active'
        },
        {
            id: 3,
            type: 'earthquake',
            severity: 'medium',
            location: {
                lat: 13.0827,
                lng: 80.2707,
                address: 'T. Nagar, Chennai'
            },
            description: 'Minor seismic activity detected',
            timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            sensors: ['seismic_sensor_007', 'accelerometer_004'],
            status: 'monitoring'
        },
        {
            id: 4,
            type: 'air_quality',
            severity: 'low',
            location: {
                lat: 22.5726,
                lng: 88.3639,
                address: 'Salt Lake City, Kolkata'
            },
            description: 'Elevated PM2.5 levels detected',
            timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
            sensors: ['air_quality_008', 'pm25_sensor_006'],
            status: 'resolved'
        },
        {
            id: 5,
            type: 'flood',
            severity: 'high',
            location: {
                lat: 12.9716,
                lng: 77.5946,
                address: 'Whitefield, Bangalore'
            },
            description: 'Heavy rainfall causing water accumulation',
            timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
            sensors: ['rain_sensor_009', 'water_level_010'],
            status: 'active'
        }
    ];

    res.json(hotspots);
});

// Start the server
server.listen(PORT, () => {
    console.log(`LifeLine360 Backend Server running on port ${PORT}`);
    console.log(`MQTT Broker: ${MQTT_BROKER}`);
    console.log(`Subscribed Topic: ${MQTT_TOPIC}`);
    console.log(`WebSocket server ready for connections`);
});
