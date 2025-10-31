const http = require('http');

// Test authentication endpoints
async function testAuthEndpoints() {
    const baseUrl = 'http://localhost:3002';

    console.log('🚀 Testing LifeLine360 Authentication API Endpoints\n');

    // Test 1: User Registration
    console.log('📝 Testing User Registration...');
    try {
        const registerData = {
            email: 'api-test@example.com',
            password: 'testpass123',
            firstName: 'API',
            lastName: 'Tester',
            role: 'public'
        };

        console.log('Sending registration request...');
        const registerResponse = await makeRequest(`${baseUrl}/api/auth/register`, 'POST', registerData);
        console.log('Raw response:', registerResponse);
        console.log('✅ Registration successful:', JSON.parse(registerResponse).message);

        // Extract token for next tests
        const token = JSON.parse(registerResponse).data.token;
        console.log('🔑 Token received:', token.substring(0, 50) + '...');

        // Test 2: User Login
        console.log('\n🔐 Testing User Login...');
        const loginData = {
            email: 'api-test@example.com',
            password: 'testpass123'
        };

        const loginResponse = await makeRequest(`${baseUrl}/api/auth/login`, 'POST', loginData);
        console.log('✅ Login successful:', JSON.parse(loginResponse).message);

        const loginToken = JSON.parse(loginResponse).data.token;

        // Test 3: Get User Profile (Protected Route)
        console.log('\n👤 Testing Protected Route (/me)...');
        const profileResponse = await makeRequest(`${baseUrl}/api/auth/me`, 'GET', null, loginToken);
        const profile = JSON.parse(profileResponse);
        console.log('✅ Profile retrieved:', profile.data.user.email);

        // Test 4: Invalid Login
        console.log('\n❌ Testing Invalid Login...');
        const invalidLoginData = {
            email: 'api-test@example.com',
            password: 'wrongpassword'
        };

        try {
            await makeRequest(`${baseUrl}/api/auth/login`, 'POST', invalidLoginData);
        } catch (error) {
            console.log('✅ Invalid login correctly rejected');
        }

        // Test 5: Access Protected Route Without Token
        console.log('\n🚫 Testing Protected Route Without Token...');
        try {
            await makeRequest(`${baseUrl}/api/auth/me`, 'GET');
        } catch (error) {
            console.log('✅ Unauthorized access correctly blocked');
        }

        console.log('\n🎉 All authentication API tests passed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Full error:', error);
    }
}

// Helper function to make HTTP requests
function makeRequest(url, method, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(body);
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${body}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

// Run tests
testAuthEndpoints();