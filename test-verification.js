const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testVerification() {
    try {
        const response = await fetch('http://localhost:5000/api/alerts/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                candidateId: '690d9736b4f119b119d6ec04',
                decision: 'VERIFY',
                note: 'Verified gas leak alert from automated test'
            })
        });

        const result = await response.json();
        console.log('Verification result:', result);

        // Check remaining candidates
        const candidatesResponse = await fetch('http://localhost:5000/api/nlp/candidates');
        const candidatesResult = await candidatesResponse.json();
        console.log('Remaining candidates:', candidatesResult.data.length);

    } catch (error) {
        console.error('Error:', error);
    }
}

testVerification();