// Test script to check Blackbox API response time
// Run with: node test-api-speed.js

const apiKey = process.env.BLACKBOX_API || 'your-api-key-here';

async function testAPISpeed() {
    console.log('Testing Blackbox API speed...');
    console.log('Model: blackboxai/google/veo-3-fast');
    console.log('Starting at:', new Date().toISOString());
    
    const startTime = Date.now();
    
    try {
        const response = await fetch('https://api.blackbox.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'blackboxai/google/veo-3-fast',
                messages: [
                    {
                        role: 'user',
                        content: 'A simple test video'
                    }
                ]
            })
        });
        
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        
        console.log('\n=== RESULTS ===');
        console.log('Status:', response.status);
        console.log('Duration:', duration, 'seconds');
        console.log('Finished at:', new Date().toISOString());
        
        if (response.ok) {
            const result = await response.json();
            console.log('\nResponse:', JSON.stringify(result, null, 2));
            
            if (result.choices && result.choices[0] && result.choices[0].message) {
                const videoUrl = result.choices[0].message.content;
                console.log('\nVideo URL:', videoUrl);
            }
        } else {
            const error = await response.text();
            console.log('\nError:', error);
        }
        
    } catch (error) {
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        console.log('\n=== ERROR ===');
        console.log('Duration before error:', duration, 'seconds');
        console.log('Error:', error.message);
    }
}

testAPISpeed();
