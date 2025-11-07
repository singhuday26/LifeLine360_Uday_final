const mongoose = require('mongoose');
const AlertCandidate = require('./models/AlertCandidate');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/lifeline360', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(async () => {
    console.log('Connected to MongoDB');

    try {
        // Clear existing candidates
        await AlertCandidate.deleteMany({});
        console.log('Cleared existing candidates');

        // Create sample NLP candidates
        const sampleCandidates = [
            {
                sectorId: 'sector_001',
                centroid: { lat: 28.6139, lng: 77.2090 },
                hazard: 'FIRE',
                severity: 'CRITICAL',
                confidence: 0.95,
                evidence: [
                    {
                        type: 'SENSOR',
                        refId: 'temp_sensor_001',
                        label: 'High temperature reading',
                        score: 0.9,
                        timestamp: new Date()
                    },
                    {
                        type: 'COMM',
                        refId: 'comm_001',
                        label: 'Fire reported in downtown',
                        score: 0.85,
                        timestamp: new Date()
                    }
                ],
                status: 'PENDING',
                explanation: 'Multiple indicators suggest active fire in sector 001'
            },
            {
                sectorId: 'sector_002',
                centroid: { lat: 28.7041, lng: 77.1025 },
                hazard: 'FLOOD',
                severity: 'WARNING',
                confidence: 0.78,
                evidence: [
                    {
                        type: 'SENSOR',
                        refId: 'water_sensor_001',
                        label: 'Rising water levels',
                        score: 0.8,
                        timestamp: new Date()
                    }
                ],
                status: 'PENDING',
                explanation: 'Water level sensors indicate potential flooding'
            },
            {
                sectorId: 'sector_003',
                centroid: { lat: 28.5355, lng: 77.3910 },
                hazard: 'GAS_LEAK',
                severity: 'CRITICAL',
                confidence: 0.88,
                evidence: [
                    {
                        type: 'SENSOR',
                        refId: 'gas_sensor_001',
                        label: 'High gas concentration',
                        score: 0.9,
                        timestamp: new Date()
                    }
                ],
                status: 'PENDING',
                explanation: 'Gas sensors detected dangerous levels of LPG'
            },
            {
                sectorId: 'sector_004',
                centroid: { lat: 28.4595, lng: 77.0266 },
                hazard: 'EARTHQUAKE',
                severity: 'WARNING',
                confidence: 0.65,
                evidence: [
                    {
                        type: 'SENSOR',
                        refId: 'vibration_sensor_001',
                        label: 'Unusual seismic activity',
                        score: 0.7,
                        timestamp: new Date()
                    }
                ],
                status: 'PENDING',
                explanation: 'Vibration sensors detected potential seismic activity'
            }
        ];

        for (const candidate of sampleCandidates) {
            const newCandidate = new AlertCandidate(candidate);
            await newCandidate.save();
            console.log(`Created candidate: ${newCandidate._id} - ${candidate.hazard}`);
        }

        console.log('Sample NLP candidates created successfully');

    } catch (error) {
        console.error('Error creating sample data:', error);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}).catch(err => {
    console.error('MongoDB connection error:', err);
});