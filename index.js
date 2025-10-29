const express = require('express');
const mqtt = require('mqtt');
const WebSocket = require('ws');
const http = require('http');
const mongoose = require('mongoose');

// Initialize Express server
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

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

mqttClient.on('message', async (topic, message) => {
    try {
        // Parse the JSON payload
        const sensorData = JSON.parse(message.toString());

        // Log the received JSON payload to console
        console.log('Received sensor data:', sensorData);
        console.log('Topic:', topic);
        console.log('Timestamp:', new Date().toISOString());
        console.log('---');

        // Save sensor data to MongoDB
        await saveSensorData(sensorData, topic);

        // Check for alert conditions and update stats/hotspots
        await processSensorData(sensorData);

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

// Hotspot Schema
const hotspotSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    type: { type: String, required: true },
    severity: { type: String, required: true },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        address: { type: String, required: true }
    },
    description: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    sensors: [{ type: String }],
    status: { type: String, required: true }
});

const Hotspot = mongoose.model('Hotspot', hotspotSchema);

// SensorData Schema for storing MQTT messages
const sensorDataSchema = new mongoose.Schema({
    sensorId: { type: String, required: true },
    type: { type: String, required: true }, // e.g., 'temperature', 'rainfall', 'seismic', etc.
    value: { type: mongoose.Schema.Types.Mixed, required: true }, // Can be number, string, or object
    unit: { type: String }, // e.g., '°C', 'mm', 'm/s²'
    location: {
        lat: { type: Number },
        lng: { type: Number },
        address: { type: String }
    },
    timestamp: { type: Date, default: Date.now },
    topic: { type: String, required: true },
    rawData: { type: mongoose.Schema.Types.Mixed } // Store the original MQTT payload
});

const SensorData = mongoose.model('SensorData', sensorDataSchema);

// Function to save sensor data to MongoDB
async function saveSensorData(sensorData, topic) {
    try {
        const sensorRecord = new SensorData({
            sensorId: sensorData.sensorId || sensorData.id || 'unknown',
            type: sensorData.type || sensorData.sensorType || 'unknown',
            value: sensorData.value || sensorData.reading || sensorData.data,
            unit: sensorData.unit,
            location: sensorData.location,
            topic: topic,
            rawData: sensorData
        });

        await sensorRecord.save();
        console.log('Sensor data saved to MongoDB:', sensorRecord._id);
    } catch (error) {
        console.error('Error saving sensor data:', error);
    }
}

// Function to process sensor data and update stats/hotspots
async function processSensorData(sensorData) {
    try {
        // Update sensors online count
        await updateSensorsOnline();

        // Check for alert conditions
        const alertTriggered = checkForAlertConditions(sensorData);

        if (alertTriggered) {
            await incrementActiveAlerts();

            // Create hotspot if it's a critical alert
            if (alertTriggered.createHotspot) {
                await createHotspotFromSensor(sensorData, alertTriggered);
            }
        }
    } catch (error) {
        console.error('Error processing sensor data:', error);
    }
}

// Function to update sensors online count
async function updateSensorsOnline() {
    try {
        // Count unique sensors that have sent data in the last hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const activeSensors = await SensorData.distinct('sensorId', {
            timestamp: { $gte: oneHourAgo }
        });

        const sensorsOnline = activeSensors.length;

        // Update stats
        let stats = await Stats.findOne();
        if (!stats) {
            stats = new Stats({ sensorsOnline });
        } else {
            stats.sensorsOnline = sensorsOnline;
            stats.lastUpdated = new Date();
        }
        await stats.save();

        console.log(`Updated sensors online count: ${sensorsOnline}`);
    } catch (error) {
        console.error('Error updating sensors online:', error);
    }
}

// Function to check for alert conditions
function checkForAlertConditions(sensorData) {
    const { type, value } = sensorData;

    // Define alert thresholds
    const thresholds = {
        temperature: { critical: 50, warning: 40 }, // °C
        rainfall: { critical: 100, warning: 50 }, // mm
        seismic: { critical: 5.0, warning: 3.0 }, // magnitude
        smoke: { critical: 80, warning: 50 }, // %
        flood: { critical: 5.0, warning: 3.0 }, // meters
        air_quality: { critical: 300, warning: 150 } // PM2.5
    };

    if (thresholds[type]) {
        const threshold = thresholds[type];
        if (value >= threshold.critical) {
            return {
                severity: 'critical',
                createHotspot: true,
                type: type,
                description: `${type} levels critically high: ${value}`
            };
        } else if (value >= threshold.warning) {
            return {
                severity: 'high',
                createHotspot: true,
                type: type,
                description: `${type} levels elevated: ${value}`
            };
        }
    }

    return null;
}

// Function to increment active alerts
async function incrementActiveAlerts() {
    try {
        let stats = await Stats.findOne();
        if (!stats) {
            stats = new Stats({ activeAlerts: 1 });
        } else {
            stats.activeAlerts += 1;
            stats.lastUpdated = new Date();
        }
        await stats.save();

        console.log(`Incremented active alerts: ${stats.activeAlerts}`);
    } catch (error) {
        console.error('Error incrementing active alerts:', error);
    }
}

// Function to create hotspot from sensor data
async function createHotspotFromSensor(sensorData, alertInfo) {
    try {
        // Generate new ID
        const maxHotspot = await Hotspot.findOne().sort({ id: -1 });
        const newId = maxHotspot ? maxHotspot.id + 1 : 1;

        // Map sensor types to hotspot types
        const typeMapping = {
            temperature: 'fire',
            rainfall: 'flood',
            seismic: 'earthquake',
            smoke: 'fire',
            flood: 'flood',
            air_quality: 'air_quality'
        };

        const hotspotType = typeMapping[sensorData.type] || sensorData.type;

        // Default locations for different cities (in a real app, this would come from sensor location)
        const defaultLocations = {
            'Delhi': { lat: 28.6139, lng: 77.2090, address: 'New Delhi' },
            'Mumbai': { lat: 19.0760, lng: 72.8777, address: 'Mumbai' },
            'Chennai': { lat: 13.0827, lng: 80.2707, address: 'Chennai' },
            'Kolkata': { lat: 22.5726, lng: 88.3639, address: 'Kolkata' },
            'Bangalore': { lat: 12.9716, lng: 77.5946, address: 'Bangalore' }
        };

        // Use sensor location or pick a random default
        const location = sensorData.location || Object.values(defaultLocations)[Math.floor(Math.random() * Object.values(defaultLocations).length)];

        const newHotspot = new Hotspot({
            id: newId,
            type: hotspotType,
            severity: alertInfo.severity,
            location: location,
            description: alertInfo.description,
            sensors: [sensorData.sensorId || sensorData.id || 'unknown_sensor'],
            status: 'active',
            timestamp: new Date()
        });

        await newHotspot.save();
        console.log(`Created new hotspot from sensor data: ID ${newId}, Type: ${hotspotType}`);

        // Broadcast the new hotspot to WebSocket clients
        broadcastToClients({
            type: 'new_hotspot',
            hotspot: newHotspot.toObject()
        });

    } catch (error) {
        console.error('Error creating hotspot from sensor:', error);
    }
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

app.get('/api/alerts/hotspots', async (req, res) => {
    try {
        let hotspots = await Hotspot.find();
        if (hotspots.length === 0) {
            // Initialize with default hotspots if collection is empty
            const defaultHotspots = [
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
                    timestamp: new Date(),
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
                    timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
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
                    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
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
                    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
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
                    timestamp: new Date(Date.now() - 900000), // 15 minutes ago
                    sensors: ['rain_sensor_009', 'water_level_010'],
                    status: 'active'
                }
            ];
            await Hotspot.insertMany(defaultHotspots);
            hotspots = await Hotspot.find();
        }
        res.json(hotspots);
    } catch (error) {
        console.error('Error fetching hotspots:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET endpoint to retrieve sensor data
app.get('/api/sensor-data', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const sensorData = await SensorData.find()
            .sort({ timestamp: -1 })
            .limit(limit);
        res.json(sensorData);
    } catch (error) {
        console.error('Error fetching sensor data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST endpoint to simulate sensor data (for testing)
app.post('/api/test-sensor-data', async (req, res) => {
    try {
        const sensorData = req.body;
        const topic = req.body.topic || 'test/sensor/data';

        console.log('Simulating sensor data:', sensorData);

        // Process the sensor data as if it came from MQTT
        await saveSensorData(sensorData, topic);
        await processSensorData(sensorData);

        // Broadcast to WebSocket clients
        broadcastToClients(sensorData);

        res.json({ message: 'Sensor data processed successfully' });
    } catch (error) {
        console.error('Error processing test sensor data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT endpoint to update stats
app.put('/api/stats', async (req, res) => {
    try {
        const { activeAlerts, sensorsOnline, communityReports } = req.body;

        // Validate input
        if (activeAlerts !== undefined && (typeof activeAlerts !== 'number' || activeAlerts < 0)) {
            return res.status(400).json({ error: 'activeAlerts must be a non-negative number' });
        }
        if (sensorsOnline !== undefined && (typeof sensorsOnline !== 'number' || sensorsOnline < 0)) {
            return res.status(400).json({ error: 'sensorsOnline must be a non-negative number' });
        }
        if (communityReports !== undefined && (typeof communityReports !== 'number' || communityReports < 0)) {
            return res.status(400).json({ error: 'communityReports must be a non-negative number' });
        }

        let stats = await Stats.findOne();
        if (!stats) {
            stats = new Stats({
                activeAlerts: activeAlerts || 0,
                sensorsOnline: sensorsOnline || 0,
                communityReports: communityReports || 0
            });
        } else {
            if (activeAlerts !== undefined) stats.activeAlerts = activeAlerts;
            if (sensorsOnline !== undefined) stats.sensorsOnline = sensorsOnline;
            if (communityReports !== undefined) stats.communityReports = communityReports;
            stats.lastUpdated = new Date();
        }

        await stats.save();
        res.json({
            activeAlerts: stats.activeAlerts,
            sensorsOnline: stats.sensorsOnline,
            communityReports: stats.communityReports,
            message: 'Stats updated successfully'
        });
    } catch (error) {
        console.error('Error updating stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST endpoint to create new hotspot
app.post('/api/alerts/hotspots', async (req, res) => {
    try {
        const { type, severity, location, description, sensors, status } = req.body;

        // Validate required fields
        if (!type || !severity || !location || !description || !status) {
            return res.status(400).json({ error: 'Missing required fields: type, severity, location, description, status' });
        }

        // Validate location structure
        if (!location.lat || !location.lng || !location.address) {
            return res.status(400).json({ error: 'Location must include lat, lng, and address' });
        }

        // Generate new ID (find max existing ID and increment)
        const maxHotspot = await Hotspot.findOne().sort({ id: -1 });
        const newId = maxHotspot ? maxHotspot.id + 1 : 1;

        const newHotspot = new Hotspot({
            id: newId,
            type,
            severity,
            location,
            description,
            sensors: sensors || [],
            status,
            timestamp: new Date()
        });

        await newHotspot.save();
        res.status(201).json({
            ...newHotspot.toObject(),
            message: 'Hotspot created successfully'
        });
    } catch (error) {
        console.error('Error creating hotspot:', error);
        if (error.code === 11000) { // Duplicate key error
            res.status(400).json({ error: 'Hotspot ID already exists' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// PUT endpoint to update existing hotspot
app.put('/api/alerts/hotspots/:id', async (req, res) => {
    try {
        const hotspotId = parseInt(req.params.id);
        const updateData = req.body;

        // Remove id from updateData to prevent changing the ID
        delete updateData.id;

        // Validate location if provided
        if (updateData.location) {
            if (!updateData.location.lat || !updateData.location.lng || !updateData.location.address) {
                return res.status(400).json({ error: 'Location must include lat, lng, and address' });
            }
        }

        const updatedHotspot = await Hotspot.findOneAndUpdate(
            { id: hotspotId },
            { ...updateData, lastUpdated: new Date() },
            { new: true, runValidators: true }
        );

        if (!updatedHotspot) {
            return res.status(404).json({ error: 'Hotspot not found' });
        }

        res.json({
            ...updatedHotspot.toObject(),
            message: 'Hotspot updated successfully'
        });
    } catch (error) {
        console.error('Error updating hotspot:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
server.listen(PORT, () => {
    console.log(`LifeLine360 Backend Server running on port ${PORT}`);
    console.log(`MQTT Broker: ${MQTT_BROKER}`);
    console.log(`Subscribed Topic: ${MQTT_TOPIC}`);
    console.log(`WebSocket server ready for connections`);
});
