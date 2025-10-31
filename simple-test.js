const http = require('http');

console.log('🚀 Testing LifeLine360 Authentication API Endpoints\n');

// Test registration
const registerData = JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    role: 'public'
});

const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': registerData.length
    }
};

console.log('📝 Testing User Registration...');

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);

    res.setEncoding('utf8');
    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });
    res.on('end', () => {
        console.log('Response:', body);
        try {
            const parsed = JSON.parse(body);
            if (parsed.success) {
                console.log('✅ Registration successful!');
                console.log('Token:', parsed.data.token.substring(0, 50) + '...');
            } else {
                console.log('❌ Registration failed:', parsed.message);
            }
        } catch (e) {
            console.log('❌ Invalid JSON response');
        }
    });
});

req.on('error', (e) => {
    console.error(`❌ Request failed: ${e.message}`);
    console.error('Full error:', e);
});

req.write(registerData);
req.end();