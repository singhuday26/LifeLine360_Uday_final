const mongoose = require('mongoose');
const User = require('./models/User');

async function createUser() {
    try {
        await mongoose.connect('mongodb://localhost:27017/lifeline360');

        const user = new User({
            email: 'uday.singh240818@gmail.com',
            password: 'udayuday',
            firstName: 'Uday',
            lastName: 'Singh',
            role: 'super_admin'
        });

        await user.save();
        console.log('User created successfully');
    } catch (error) {
        console.error('Error creating user:', error);
    } finally {
        await mongoose.disconnect();
    }
}

createUser();