const express = require('express');
const mqtt = require('mqtt');
const WebSocket = require('ws');
const http = require('http');
const mongoose = require('mongoose');
const compression = require('compression');

// Import middleware
const logger = require('./middleware/logger');
const { errorHandler, catchAsync, handleUnhandledRejection, handleUncaughtException } = require('./middleware/errorHandler');
const { validate, schemas } = require('./middleware/validation');
const {
    securityHeaders,
    corsOptions,
    generalRateLimit,
    apiRateLimit,
    strictRateLimit,
    sanitizeInput,
    requestLogger
} = require('./middleware/security');

// Load environment variables
require('dotenv').config();

// Email service configuration
const nodemailer = require('nodemailer');

// Create email transporter
const emailTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false // For testing - remove in production
    }
});

// Email configuration
const EMAIL_FROM = process.env.EMAIL_FROM || 'lifeline360.alerts@gmail.com';
const ALERT_RECIPIENTS = (process.env.ALERT_RECIPIENTS || 'admin@lifeline360.com').split(',').map(email => email.trim());

// Initialize Express server
const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Middleware
app.use(compression()); // Compress responses
app.use(securityHeaders); // Security headers
app.use(corsOptions); // CORS
app.use(requestLogger); // Request logging
app.use(sanitizeInput); // Input sanitization
app.use(generalRateLimit); // General rate limiting
app.use(express.json({ limit: '10mb' })); // Parse JSON with size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded data

// Create HTTP server for WebSocket integration
const server = http.createServer(app);

// Initialize WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected WebSocket clients
const clients = new Map(); // Use Map to store client info
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const CLIENT_TIMEOUT = 60000; // 60 seconds

// MQTT Configuration for HiveMQ
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://broker.hivemq.com';
const MQTT_TOPIC = process.env.MQTT_TOPIC || 'testtopic1/shubhayusensordata';
const MQTT_USERNAME = process.env.MQTT_USERNAME;
const MQTT_PASSWORD = process.env.MQTT_PASSWORD;

// Connect to MQTT broker with retry logic
let mqttClient;
let mqttReconnectAttempts = 0;
const MAX_MQTT_RECONNECT_ATTEMPTS = 10;
const MQTT_RECONNECT_INTERVAL = 5000;

function connectMQTT() {
    try {
        const options = {
            clientId: `lifeline360-backend-${Date.now()}`,
            clean: true,
            connectTimeout: 4000,
            reconnectPeriod: 1000,
            keepalive: 60,
        };

        // Add authentication if provided
        if (MQTT_USERNAME && MQTT_PASSWORD) {
            options.username = MQTT_USERNAME;
            options.password = MQTT_PASSWORD;
        }

        mqttClient = mqtt.connect(MQTT_BROKER, options);

        mqttClient.on('connect', () => {
            logger.info('Connected to MQTT broker', { broker: MQTT_BROKER });
            mqttReconnectAttempts = 0;

            // Subscribe to the sensor data topic
            mqttClient.subscribe(MQTT_TOPIC, { qos: 1 }, (err) => {
                if (!err) {
                    logger.info('Subscribed to MQTT topic', { topic: MQTT_TOPIC });
                } else {
                    logger.error('Failed to subscribe to MQTT topic', { error: err.message, topic: MQTT_TOPIC });
                }
            });
        });

        mqttClient.on('message', async (topic, message) => {
            try {
                // Parse the JSON payload
                const sensorData = JSON.parse(message.toString());

                // Validate sensor data structure
                const { error } = schemas.sensorData.validate(sensorData, { abortEarly: false });
                if (error) {
                    logger.warn('Invalid sensor data received', {
                        topic,
                        errors: error.details.map(d => d.message),
                        rawData: message.toString()
                    });
                    return;
                }

                // Log the received JSON payload to console
                logger.info('Received sensor data', {
                    topic,
                    sensorId: sensorData.sensorId,
                    type: sensorData.type,
                    value: sensorData.value
                });

                // Save sensor data to MongoDB
                await saveSensorData(sensorData, topic);

                // Check for alert conditions and update stats/hotspots
                await processSensorData(sensorData);

                // Broadcast the sensor data to all connected WebSocket clients
                broadcastToClients(sensorData);

            } catch (error) {
                logger.error('Error processing MQTT message', {
                    error: error.message,
                    topic,
                    rawMessage: message.toString()
                });
            }
        });

        mqttClient.on('error', (error) => {
            logger.error('MQTT connection error', { error: error.message, broker: MQTT_BROKER });
        });

        mqttClient.on('offline', () => {
            logger.warn('MQTT client offline', { broker: MQTT_BROKER });
        });

        mqttClient.on('reconnect', () => {
            mqttReconnectAttempts++;
            logger.info('MQTT client reconnecting', {
                attempt: mqttReconnectAttempts,
                maxAttempts: MAX_MQTT_RECONNECT_ATTEMPTS,
                broker: MQTT_BROKER
            });
        });

        mqttClient.on('close', () => {
            logger.warn('MQTT connection closed', { broker: MQTT_BROKER });

            // Attempt to reconnect if under max attempts
            if (mqttReconnectAttempts < MAX_MQTT_RECONNECT_ATTEMPTS) {
                setTimeout(() => {
                    logger.info('Attempting MQTT reconnection', { attempt: mqttReconnectAttempts + 1 });
                    connectMQTT();
                }, MQTT_RECONNECT_INTERVAL);
            } else {
                logger.error('Max MQTT reconnection attempts reached', {
                    maxAttempts: MAX_MQTT_RECONNECT_ATTEMPTS,
                    broker: MQTT_BROKER
                });
            }
        });

    } catch (error) {
        logger.error('Failed to create MQTT connection', { error: error.message, broker: MQTT_BROKER });
    }
}

// WebSocket connection handling with heartbeat
// WebSocket heartbeat function
function heartbeat() {
    this.isAlive = true;
}

wss.on('connection', (ws, req) => {
    // Initialize client tracking
    const clientId = Date.now() + Math.random();
    const clientInfo = {
        id: clientId,
        ip: req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        connectedAt: new Date(),
        lastHeartbeat: new Date(),
        isAlive: true
    };

    clients.set(ws, clientInfo);

    logger.info('New WebSocket client connected', {
        clientId,
        ip: clientInfo.ip,
        totalClients: clients.size
    });

    // Set up heartbeat
    ws.isAlive = true;
    ws.on('pong', heartbeat);

    // Handle client disconnection
    ws.on('close', (code, reason) => {
        const info = clients.get(ws);
        if (info) {
            logger.info('WebSocket client disconnected', {
                clientId: info.id,
                code,
                reason: reason.toString(),
                connectedDuration: Date.now() - info.connectedAt.getTime(),
                totalClients: clients.size - 1
            });
            clients.delete(ws);
        }
    });

    // Handle client messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());
            const info = clients.get(ws);

            logger.debug('Received WebSocket message', {
                clientId: info?.id,
                messageType: data.type,
                messageSize: message.length
            });

            // Handle ping messages for heartbeat
            if (data.type === 'ping') {
                ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
                if (info) info.lastHeartbeat = new Date();
            }

        } catch (error) {
            logger.warn('Invalid WebSocket message received', {
                clientId: clients.get(ws)?.id,
                error: error.message,
                rawMessage: message.toString()
            });
        }
    });

    // Handle errors
    ws.on('error', (error) => {
        const info = clients.get(ws);
        logger.error('WebSocket client error', {
            clientId: info?.id,
            error: error.message
        });
        clients.delete(ws);
    });

    // Send welcome message to new client
    ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to LifeLine360 WebSocket server',
        clientId,
        timestamp: new Date().toISOString()
    }));
});

// WebSocket heartbeat check
const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
        const info = clients.get(ws);
        if (!ws.isAlive) {
            logger.warn('Terminating unresponsive WebSocket client', { clientId: info?.id });
            clients.delete(ws);
            return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
        if (info) info.lastHeartbeat = new Date();
    });
}, HEARTBEAT_INTERVAL);

// Function to broadcast data to all connected WebSocket clients
function broadcastToClients(data) {
    const message = JSON.stringify({
        type: 'sensor_data',
        data: data,
        timestamp: new Date().toISOString()
    });

    let sentCount = 0;
    let failedCount = 0;

    clients.forEach((clientInfo, ws) => {
        if (ws.readyState === WebSocket.OPEN) {
            try {
                ws.send(message);
                sentCount++;
            } catch (error) {
                logger.warn('Failed to send message to WebSocket client', {
                    clientId: clientInfo.id,
                    error: error.message
                });
                failedCount++;
                clients.delete(ws);
            }
        } else {
            failedCount++;
            clients.delete(ws);
        }
    });

    logger.debug('Broadcasted sensor data to WebSocket clients', {
        sent: sentCount,
        failed: failedCount,
        totalClients: clients.size
    });
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

// Alert Schema for tracking triggered alerts
const alertSchema = new mongoose.Schema({
    sensorId: { type: String, required: true },
    sensorType: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    threshold: { type: Number, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
    message: { type: String, required: true },
    location: {
        lat: { type: Number },
        lng: { type: Number },
        address: { type: String }
    },
    emailSent: { type: Boolean, default: false },
    emailRecipients: [{ type: String }],
    emailSentAt: { type: Date },
    acknowledged: { type: Boolean, default: false },
    acknowledgedAt: { type: Date },
    acknowledgedBy: { type: String },
    timestamp: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: Date }
});

const Alert = mongoose.model('Alert', alertSchema);

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

        // Broadcast stats update to WebSocket clients
        broadcastToClients({
            type: 'stats_update',
            data: {
                activeAlerts: stats.activeAlerts,
                sensorsOnline: stats.sensorsOnline,
                communityReports: stats.communityReports
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error updating sensors online:', error);
    }
}

// Function to check for alert conditions
async function checkForAlertConditions(sensorData) {
    const { type, value, sensorId, location } = sensorData;

    // Define alert thresholds
    const thresholds = {
        temperature: { critical: 50, warning: 40, low: 35 }, // °C
        rainfall: { critical: 100, warning: 50, low: 25 }, // mm
        seismic: { critical: 5.0, warning: 3.0, low: 2.0 }, // magnitude
        smoke: { critical: 80, warning: 50, low: 30 }, // %
        flood: { critical: 5.0, warning: 3.0, low: 2.0 }, // meters
        air_quality: { critical: 300, warning: 150, low: 100 } // PM2.5
    };

    if (thresholds[type]) {
        const threshold = thresholds[type];
        let severity = null;
        let thresholdValue = null;

        if (typeof value === 'number') {
            if (value >= threshold.critical) {
                severity = 'critical';
                thresholdValue = threshold.critical;
            } else if (value >= threshold.warning) {
                severity = 'high';
                thresholdValue = threshold.warning;
            } else if (value >= threshold.low) {
                severity = 'medium';
                thresholdValue = threshold.low;
            }
        }

        if (severity) {
            // Create alert record
            const alert = new Alert({
                sensorId: sensorId || sensorData.id || 'unknown',
                sensorType: type,
                value: value,
                threshold: thresholdValue,
                severity: severity,
                message: `${type.toUpperCase()} ALERT: ${value} exceeds threshold of ${thresholdValue}`,
                location: location,
                emailRecipients: ALERT_RECIPIENTS
            });

            await alert.save();

            // Send email alert
            await sendAlertEmail(alert);

            logger.warn('Alert triggered', {
                sensorId: alert.sensorId,
                type: alert.sensorType,
                value: alert.value,
                severity: alert.severity,
                threshold: alert.threshold
            });

            return {
                severity: severity,
                createHotspot: severity === 'critical' || severity === 'high',
                type: type,
                description: alert.message,
                alertId: alert._id
            };
        }
    }

    return null;
}

// Function to send alert email
async function sendAlertEmail(alert) {
    try {
        if (!alert.emailRecipients || alert.emailRecipients.length === 0) {
            logger.warn('No email recipients configured for alert', { alertId: alert._id });
            return;
        }

        const locationInfo = alert.location ?
            `\nLocation: ${alert.location.address || 'Unknown'} (${alert.location.lat}, ${alert.location.lng})` :
            '\nLocation: Not available';

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc3545;">🚨 LifeLine360 Alert Notification</h2>
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #${alert.severity === 'critical' ? 'dc3545' : alert.severity === 'high' ? 'fd7e14' : 'ffc107'}; margin-top: 0;">
                        ${alert.severity.toUpperCase()} ALERT
                    </h3>
                    <p><strong>Sensor ID:</strong> ${alert.sensorId}</p>
                    <p><strong>Sensor Type:</strong> ${alert.sensorType}</p>
                    <p><strong>Current Value:</strong> ${alert.value}</p>
                    <p><strong>Threshold:</strong> ${alert.threshold}</p>
                    <p><strong>Message:</strong> ${alert.message}</p>
                    <p><strong>Time:</strong> ${alert.timestamp.toLocaleString()}</p>
                    ${locationInfo ? `<p><strong>Location:</strong> ${alert.location.address || 'Unknown'}</p>` : ''}
                </div>
                <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Action Required:</strong> Please review the situation and take appropriate measures.</p>
                </div>
                <p style="color: #6c757d; font-size: 12px;">
                    This is an automated alert from LifeLine360 Disaster Management System.
                </p>
            </div>
        `;

        const mailOptions = {
            from: EMAIL_FROM,
            to: alert.emailRecipients.join(','),
            subject: `🚨 LifeLine360 ${alert.severity.toUpperCase()} ALERT: ${alert.sensorType} - ${alert.value}`,
            html: emailHtml
        };

        const info = await emailTransporter.sendMail(mailOptions);

        // Update alert record
        alert.emailSent = true;
        alert.emailSentAt = new Date();
        await alert.save();

        logger.info('Alert email sent successfully', {
            alertId: alert._id,
            messageId: info.messageId,
            recipients: alert.emailRecipients.length
        });

    } catch (error) {
        logger.error('Failed to send alert email', {
            alertId: alert._id,
            error: error.message,
            stack: error.stack
        });

        // Mark email as failed but don't throw
        try {
            alert.emailSent = false;
            await alert.save();
        } catch (saveError) {
            logger.error('Failed to update alert email status', { error: saveError.message });
        }
    }
}

// Sample data generator configuration
const SAMPLE_DATA_CONFIG = {
    enabled: process.env.USE_SAMPLE_DATA === 'true' || !process.env.MQTT_BROKER,
    interval: parseInt(process.env.SAMPLE_DATA_INTERVAL) || 30000, // 30 seconds
    sensors: [
        { id: 'temp_sensor_001', type: 'temperature', location: { lat: 28.6139, lng: 77.2090, address: 'Connaught Place, New Delhi' } },
        { id: 'rain_sensor_002', type: 'rainfall', location: { lat: 19.0760, lng: 72.8777, address: 'Bandra West, Mumbai' } },
        { id: 'seismic_sensor_003', type: 'seismic', location: { lat: 13.0827, lng: 80.2707, address: 'T. Nagar, Chennai' } },
        { id: 'smoke_sensor_004', type: 'smoke', location: { lat: 22.5726, lng: 88.3639, address: 'Salt Lake City, Kolkata' } },
        { id: 'flood_sensor_005', type: 'flood', location: { lat: 12.9716, lng: 77.5946, address: 'Whitefield, Bangalore' } },
        { id: 'air_quality_sensor_006', type: 'air_quality', location: { lat: 28.6139, lng: 77.2090, address: 'Karol Bagh, New Delhi' } }
    ]
};

// Function to generate sample sensor data
function generateSampleData() {
    const sensor = SAMPLE_DATA_CONFIG.sensors[Math.floor(Math.random() * SAMPLE_DATA_CONFIG.sensors.length)];

    let value;
    let unit;

    // Generate realistic values with occasional alerts
    switch (sensor.type) {
        case 'temperature':
            // Normal: 20-35°C, Alert: 35-60°C
            value = Math.random() < 0.8 ? 20 + Math.random() * 15 : 35 + Math.random() * 25;
            unit = '°C';
            break;
        case 'rainfall':
            // Normal: 0-20mm, Alert: 20-150mm
            value = Math.random() < 0.7 ? Math.random() * 20 : 20 + Math.random() * 130;
            unit = 'mm';
            break;
        case 'seismic':
            // Normal: 0-2.0, Alert: 2.0-7.0
            value = Math.random() < 0.9 ? Math.random() * 2 : 2 + Math.random() * 5;
            unit = 'magnitude';
            break;
        case 'smoke':
            // Normal: 0-30%, Alert: 30-100%
            value = Math.random() < 0.75 ? Math.random() * 30 : 30 + Math.random() * 70;
            unit = '%';
            break;
        case 'flood':
            // Normal: 0-2m, Alert: 2-8m
            value = Math.random() < 0.8 ? Math.random() * 2 : 2 + Math.random() * 6;
            unit = 'm';
            break;
        case 'air_quality':
            // Normal: 0-100, Alert: 100-400
            value = Math.random() < 0.7 ? Math.random() * 100 : 100 + Math.random() * 300;
            unit = 'PM2.5';
            break;
        default:
            value = Math.random() * 100;
            unit = 'units';
    }

    return {
        sensorId: sensor.id,
        id: sensor.id,
        type: sensor.type,
        value: Math.round(value * 100) / 100, // Round to 2 decimal places
        unit: unit,
        location: sensor.location,
        timestamp: new Date()
    };
}

// Function to start sample data generation
function startSampleDataGeneration() {
    if (!SAMPLE_DATA_CONFIG.enabled) {
        logger.info('Sample data generation disabled');
        return;
    }

    logger.info('Starting sample data generation', {
        interval: SAMPLE_DATA_CONFIG.interval,
        sensorCount: SAMPLE_DATA_CONFIG.sensors.length
    });

    // Generate initial data
    setTimeout(async () => {
        try {
            const sampleData = generateSampleData();
            await processSampleData(sampleData);
        } catch (error) {
            logger.error('Error processing initial sample data', { error: error.message });
        }
    }, 2000); // Start after 2 seconds

    // Set up interval for continuous data generation
    const sampleInterval = setInterval(async () => {
        try {
            const sampleData = generateSampleData();
            await processSampleData(sampleData);
        } catch (error) {
            logger.error('Error processing sample data', { error: error.message });
        }
    }, SAMPLE_DATA_CONFIG.interval);

    // Store interval reference for cleanup
    global.sampleDataInterval = sampleInterval;
}

// Function to process sample data (similar to MQTT message processing)
async function processSampleData(sensorData) {
    try {
        const topic = `sample/${sensorData.type}/${sensorData.sensorId}`;

        logger.debug('Processing sample sensor data', {
            sensorId: sensorData.sensorId,
            type: sensorData.type,
            value: sensorData.value
        });

        // Save to database
        await saveSensorData(sensorData, topic);

        // Process sensor data (check alerts, update stats, etc.)
        await processSensorData(sensorData);

        // Broadcast to WebSocket clients
        broadcastToClients({
            type: 'sensor_data',
            data: sensorData,
            source: 'sample'
        });

    } catch (error) {
        logger.error('Error processing sample data', {
            sensorId: sensorData.sensorId,
            error: error.message,
            stack: error.stack
        });
    }
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

        // Broadcast stats update to WebSocket clients
        broadcastToClients({
            type: 'stats_update',
            data: {
                activeAlerts: stats.activeAlerts,
                sensorsOnline: stats.sensorsOnline,
                communityReports: stats.communityReports
            },
            timestamp: new Date().toISOString()
        });
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
app.get('/api/stats', catchAsync(async (req, res) => {
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
}));

app.get('/api/alerts/hotspots', catchAsync(async (req, res) => {
    // Validate query parameters
    const { error } = schemas.hotspotQuery.validate(req.query, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Invalid query parameters',
                details: error.details.map(d => d.message)
            }
        });
    }

    // Build filter object from query parameters
    const filter = {};

    // Filter by type (e.g., ?type=flood,fire)
    if (req.query.type) {
        const types = req.query.type.split(',').map(t => t.trim());
        filter.type = { $in: types };
    }

    // Filter by severity (e.g., ?severity=high,critical)
    if (req.query.severity) {
        const severities = req.query.severity.split(',').map(s => s.trim());
        filter.severity = { $in: severities };
    }

    // Filter by status (e.g., ?status=active,monitoring)
    if (req.query.status) {
        const statuses = req.query.status.split(',').map(s => s.trim());
        filter.status = { $in: statuses };
    }

    // Filter by city/address (e.g., ?city=Delhi,Mumbai)
    if (req.query.city) {
        const cities = req.query.city.split(',').map(c => c.trim());
        filter['location.address'] = {
            $regex: new RegExp(cities.join('|'), 'i')
        };
    }

    // Filter by date range (e.g., ?startDate=2024-01-01&endDate=2024-12-31)
    if (req.query.startDate || req.query.endDate) {
        filter.timestamp = {};
        if (req.query.startDate) {
            filter.timestamp.$gte = new Date(req.query.startDate);
        }
        if (req.query.endDate) {
            filter.timestamp.$lte = new Date(req.query.endDate);
        }
    }

    // Build sort object
    let sort = { timestamp: -1 }; // Default: newest first
    if (req.query.sort) {
        const sortFields = req.query.sort.split(',').map(s => s.trim());
        sort = {};
        sortFields.forEach(field => {
            if (field.startsWith('-')) {
                sort[field.substring(1)] = -1; // Descending
            } else {
                sort[field] = 1; // Ascending
            }
        });
    }

    // Set limit (default 50, max 100)
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);

    // Execute query
    let hotspots = await Hotspot.find(filter)
        .sort(sort)
        .limit(limit);

    // If no hotspots found and no filters applied, initialize with defaults
    if (hotspots.length === 0 && Object.keys(filter).length === 0) {
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
        hotspots = await Hotspot.find(filter)
            .sort(sort)
            .limit(limit);
    }

    // Add metadata to response
    const response = {
        data: hotspots,
        metadata: {
            total: hotspots.length,
            filters: {
                type: req.query.type || null,
                severity: req.query.severity || null,
                status: req.query.status || null,
                city: req.query.city || null,
                startDate: req.query.startDate || null,
                endDate: req.query.endDate || null
            },
            sort: req.query.sort || 'timestamp:desc',
            limit: limit
        }
    };

    res.json(response);
}));

// GET endpoint to retrieve sensor data
app.get('/api/sensor-data', catchAsync(async (req, res) => {
    // Validate query parameters
    const { error } = schemas.sensorDataQuery.validate(req.query, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Invalid query parameters',
                details: error.details.map(d => d.message)
            }
        });
    }

    const limit = parseInt(req.query.limit) || 50;
    const sensorData = await SensorData.find()
        .sort({ timestamp: -1 })
        .limit(limit);
    res.json(sensorData);
}));

// POST endpoint to simulate sensor data (for testing)
app.post('/api/test-sensor-data', apiRateLimit, validate(schemas.sensorData), catchAsync(async (req, res) => {
    const sensorData = req.body;
    const topic = req.body.topic || 'test/sensor/data';

    logger.info('Simulating sensor data', { sensorId: sensorData.sensorId, type: sensorData.type });

    // Process the sensor data as if it came from MQTT
    await saveSensorData(sensorData, topic);
    await processSensorData(sensorData);

    // Broadcast to WebSocket clients
    broadcastToClients(sensorData);

    res.json({ message: 'Sensor data processed successfully' });
}));

// PUT endpoint to update stats
app.put('/api/stats', apiRateLimit, validate(schemas.statsUpdate), catchAsync(async (req, res) => {
    const { activeAlerts, sensorsOnline, communityReports } = req.body;

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

    // Broadcast stats update to WebSocket clients
    broadcastToClients({
        type: 'stats_update',
        data: {
            activeAlerts: stats.activeAlerts,
            sensorsOnline: stats.sensorsOnline,
            communityReports: stats.communityReports
        },
        timestamp: new Date().toISOString()
    });
}));

// POST endpoint to create new hotspot
app.post('/api/alerts/hotspots', apiRateLimit, validate(schemas.hotspot), catchAsync(async (req, res) => {
    const { type, severity, location, description, sensors, status } = req.body;

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

    logger.info('Created new hotspot', { id: newId, type, severity });

    res.status(201).json({
        ...newHotspot.toObject(),
        message: 'Hotspot created successfully'
    });

    // Broadcast the new hotspot to WebSocket clients
    broadcastToClients({
        type: 'new_hotspot',
        hotspot: newHotspot.toObject()
    });
}));

// PUT endpoint to update existing hotspot
app.put('/api/alerts/hotspots/:id', apiRateLimit, catchAsync(async (req, res) => {
    const hotspotId = parseInt(req.params.id);
    if (isNaN(hotspotId)) {
        return res.status(400).json({ error: 'Invalid hotspot ID' });
    }

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

    logger.info('Updated hotspot', { id: hotspotId, status: updatedHotspot.status });

    res.json({
        ...updatedHotspot.toObject(),
        message: 'Hotspot updated successfully'
    });
}));

// GET endpoint to retrieve alerts
app.get('/api/alerts', catchAsync(async (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    const status = req.query.status; // 'active', 'acknowledged', 'resolved'
    const severity = req.query.severity; // 'low', 'medium', 'high', 'critical'

    let filter = {};
    if (status) {
        if (status === 'active') {
            filter.acknowledged = false;
            filter.resolved = false;
        } else if (status === 'acknowledged') {
            filter.acknowledged = true;
            filter.resolved = false;
        } else if (status === 'resolved') {
            filter.resolved = true;
        }
    }

    if (severity) {
        filter.severity = severity;
    }

    const alerts = await Alert.find(filter)
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate('acknowledgedBy', 'name email');

    res.json({
        data: alerts,
        metadata: {
            total: alerts.length,
            filters: { status, severity },
            limit
        }
    });
}));

// PUT endpoint to acknowledge alert
app.put('/api/alerts/:id/acknowledge', catchAsync(async (req, res) => {
    const alertId = req.params.id;
    const { acknowledgedBy } = req.body;

    const alert = await Alert.findByIdAndUpdate(
        alertId,
        {
            acknowledged: true,
            acknowledgedAt: new Date(),
            acknowledgedBy: acknowledgedBy || 'system'
        },
        { new: true }
    );

    if (!alert) {
        return res.status(404).json({ error: 'Alert not found' });
    }

    logger.info('Alert acknowledged', { alertId, acknowledgedBy });

    res.json({
        ...alert.toObject(),
        message: 'Alert acknowledged successfully'
    });
}));

// PUT endpoint to resolve alert
app.put('/api/alerts/:id/resolve', catchAsync(async (req, res) => {
    const alertId = req.params.id;

    const alert = await Alert.findByIdAndUpdate(
        alertId,
        {
            resolved: true,
            resolvedAt: new Date()
        },
        { new: true }
    );

    if (!alert) {
        return res.status(404).json({ error: 'Alert not found' });
    }

    logger.info('Alert resolved', { alertId });

    res.json({
        ...alert.toObject(),
        message: 'Alert resolved successfully'
    });
}));

// GET endpoint to get alert statistics
app.get('/api/alerts/stats', catchAsync(async (req, res) => {
    const stats = await Alert.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                active: {
                    $sum: {
                        $cond: [
                            { $and: [{ $eq: ['$acknowledged', false] }, { $eq: ['$resolved', false] }] },
                            1,
                            0
                        ]
                    }
                },
                acknowledged: {
                    $sum: {
                        $cond: [
                            { $and: [{ $eq: ['$acknowledged', true] }, { $eq: ['$resolved', false] }] },
                            1,
                            0
                        ]
                    }
                },
                resolved: { $sum: { $cond: ['$resolved', true, 0] } },
                critical: { $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] } },
                high: { $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] } },
                medium: { $sum: { $cond: [{ $eq: ['$severity', 'medium'] }, 1, 0] } },
                low: { $sum: { $cond: [{ $eq: ['$severity', 'low'] }, 1, 0] } }
            }
        }
    ]);

    const result = stats[0] || {
        total: 0,
        active: 0,
        acknowledged: 0,
        resolved: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
    };

    res.json(result);
}));

// POST endpoint to send test alert email
app.post('/api/test-alert-email', catchAsync(async (req, res) => {
    const testAlert = new Alert({
        sensorId: 'test_sensor_001',
        sensorType: 'temperature',
        value: 55,
        threshold: 50,
        severity: 'critical',
        message: 'TEST ALERT: Temperature exceeds critical threshold',
        location: { lat: 28.6139, lng: 77.2090, address: 'Test Location, New Delhi' },
        emailRecipients: ALERT_RECIPIENTS
    });

    await sendAlertEmail(testAlert);

    res.json({
        message: 'Test alert email sent successfully',
        recipients: ALERT_RECIPIENTS
    });
}));

// Apply error handling middleware (must be last)
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    logger.error('Unhandled Promise Rejection', { error: err.message, stack: err.stack });
    // Close server & exit process
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
    process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
    logger.info(`Received ${signal}, shutting down gracefully`);

    // Stop accepting new connections
    server.close((err) => {
        if (err) {
            logger.error('Error during server shutdown', { error: err.message });
            process.exit(1);
        }

        logger.info('Server closed successfully');

        // Close MQTT connection
        if (mqttClient) {
            mqttClient.end(false, () => {
                logger.info('MQTT connection closed');
            });
        }

        // Close MongoDB connection
        mongoose.connection.close(() => {
            logger.info('MongoDB connection closed');
            process.exit(0);
        });

        // Force close after 10 seconds
        setTimeout(() => {
            logger.error('Forced shutdown after timeout');
            process.exit(1);
        }, 10000);
    });

    // Clear heartbeat interval
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
    }

    // Clear sample data interval
    if (global.sampleDataInterval) {
        clearInterval(global.sampleDataInterval);
        logger.info('Sample data generation stopped');
    }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server and initialize connections
server.listen(PORT, () => {
    logger.info('LifeLine360 Backend Server started', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        mongodb: 'mongodb://localhost:27017/lifeline360',
        sampleData: SAMPLE_DATA_CONFIG.enabled,
        mqtt: SAMPLE_DATA_CONFIG.enabled ? 'disabled (using sample data)' : {
            broker: MQTT_BROKER,
            topic: MQTT_TOPIC
        }
    });

    // Initialize data source
    if (SAMPLE_DATA_CONFIG.enabled) {
        startSampleDataGeneration();
    } else {
        connectMQTT();
    }
});
