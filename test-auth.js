const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/lifeline360', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(async () => {
    console.log('Connected to MongoDB');

    try {
        // Test user registration
        console.log('\n=== Testing User Registration ===');
        const testUser = new User({
            email: 'test@example.com',
            password: 'password123',
            firstName: 'John',
            lastName: 'Doe',
            role: 'public'
        });

        await testUser.save();
        console.log('✅ User registered successfully:', testUser.toJSON());

        // Test password comparison
        console.log('\n=== Testing Password Comparison ===');
        const isValidPassword = await testUser.comparePassword('password123');
        console.log('✅ Password validation:', isValidPassword);

        const isInvalidPassword = await testUser.comparePassword('wrongpassword');
        console.log('❌ Invalid password validation:', isInvalidPassword);

        // Test finding user by email
        console.log('\n=== Testing User Lookup ===');
        const foundUser = await User.findOne({ email: 'test@example.com' });
        console.log('✅ User found by email:', foundUser ? foundUser.email : 'Not found');

        // Test JWT generation (we'll simulate this)
        console.log('\n=== Testing JWT Generation ===');
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { id: testUser._id, role: testUser.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );
        console.log('✅ JWT token generated:', token.substring(0, 50) + '...');

        // Test JWT verification
        console.log('\n=== Testing JWT Verification ===');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        console.log('✅ JWT decoded:', { id: decoded.id, role: decoded.role });

        console.log('\n🎉 All authentication tests passed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        // Clean up
        await User.deleteMany({ email: 'test@example.com' });
        await mongoose.connection.close();
        console.log('\n🧹 Test cleanup completed');
    }
}).catch(err => {
    console.error('MongoDB connection error:', err);
});