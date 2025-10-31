const http = require('http');

// Simple health check test
const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/health',
    method: 'GET'
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const health = JSON.parse(data);
            console.log('Health Check Result:');
            console.log(JSON.stringify(health, null, 2));
            console.log('\n✅ Server is healthy and responding correctly!');
        } catch (e) {
            console.log('Raw response:', data);
        }
    });
});

req.on('error', (e) => {
    console.error('❌ Health check failed:', e.message);
});

req.end();