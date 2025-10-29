const express = require('express');
const mqtt = require('mqtt');

// Initialize Express server
const app = express();
const PORT = process.env.PORT || 3001;

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

// Basic Express routes
app.get('/', (req, res) => {
    res.json({
        message: 'LifeLine360 Backend Server',
        status: 'running',
        mqtt: {
            broker: MQTT_BROKER,
            topic: MQTT_TOPIC,
            connected: mqttClient.connected
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
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`LifeLine360 Backend Server running on port ${PORT}`);
    console.log(`MQTT Broker: ${MQTT_BROKER}`);
    console.log(`Subscribed Topic: ${MQTT_TOPIC}`);
});
