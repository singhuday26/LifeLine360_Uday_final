const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

// Helper to resolve the SensorData model registered in index.js
function getSensorDataModel() {
  try {
    return mongoose.model('SensorData');
  } catch (error) {
    throw new Error('SensorData model is not registered. Ensure index.js defines it before loading routes.');
  }
}

// POST new sensor reading
router.post('/ingest', async (req, res) => {
  try {
    const SensorData = getSensorDataModel();
    const reading = new SensorData({
      ...req.body,
      timestamp: req.body.timestamp ? new Date(req.body.timestamp) : new Date(),
      topic: req.body.topic || 'manual_ingest',
      rawData: req.body
    });

    await reading.save();
    res.status(201).json({
      message: 'Sensor reading stored successfully',
      reading
    });
  } catch (error) {
    console.error('Error saving sensor reading via sensorRoutes:', error.message);
    res.status(500).json({
      message: 'Failed to save sensor reading',
      error: error.message
    });
  }
});

// GET latest sensor readings
router.get('/latest', async (req, res) => {
  try {
    const SensorData = getSensorDataModel();
    const limit = Number(req.query.limit) || 20;

    const readings = await SensorData.find()
      .sort({ timestamp: -1 })
      .limit(limit);

    res.json({
      count: readings.length,
      readings
    });
  } catch (error) {
    console.error('Error fetching latest sensor readings:', error.message);
    res.status(500).json({
      message: 'Failed to fetch sensor readings',
      error: error.message
    });
  }
});

module.exports = router;
