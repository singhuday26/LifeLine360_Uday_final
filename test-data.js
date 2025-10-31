const mongoose = require('mongoose');
const Alert = require('./models/Alert');
const IncidentReport = require('./models/IncidentReport');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/lifeline360', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(async () => {
    console.log('Connected to MongoDB');

    try {
        // Create test alert
        const testAlert = new Alert({
            sensorId: 'test_sensor_001',
            sensorType: 'temperature',
            value: 55,
            threshold: 50,
            severity: 'critical',
            message: 'TEST ALERT: Temperature exceeds critical threshold',
            location: { lat: 28.6139, lng: 77.2090, address: 'Test Location, New Delhi' },
            status: 'pending',
            assignedToDept: 'fire'
        });
        await testAlert.save();
        console.log('Test alert created:', testAlert._id);

        // Create test incident report
        const testReport = new IncidentReport({
            incidentType: 'flood',
            severity: 'high',
            description: 'Heavy flooding in downtown area',
            location: 'Main Street, City Center',
            contactName: 'John Doe',
            contactPhone: '+1234567890',
            status: 'pending',
            assignedToDept: 'flood'
        });
        await testReport.save();
        console.log('Test incident report created:', testReport._id);

        console.log('Test data created successfully');

    } catch (error) {
        console.error('Error creating test data:', error);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}).catch(err => {
    console.error('MongoDB connection error:', err);
});