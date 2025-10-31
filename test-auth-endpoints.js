const http = require('http');

// Test registration
const registerData = JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    role: 'public'
});

const req = http.request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': registerData.length
    }
}, (res) => {
    console.log('Registration Status:', res.statusCode);
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            console.log('Registration Response:', response.success ? 'SUCCESS' : 'FAILED');
            if (response.message) console.log('Message:', response.message);
        } catch (e) {
            console.log('Raw response:', data);
        }
    });
});

req.on('error', (e) => {
    console.error('Registration test failed - server not running:', e.message);
});

req.write(registerData);
req.end();