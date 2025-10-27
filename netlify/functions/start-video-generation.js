// Start video generation and return immediately
exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { photos, prompt } = JSON.parse(event.body);

        if (!photos || !Array.isArray(photos) || photos.length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'At least one photo is required' })
            };
        }

        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Prompt is required' })
            };
        }

        const apiKey = process.env.BLACKBOX_API;
        if (!apiKey) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'API key not configured' })
            };
        }

        console.log('Starting async video generation...');
        console.log('Photos count:', photos.length);
        console.log('Prompt:', prompt);

        // Start the video generation asynchronously (fire and forget)
        // We'll use Replicate's webhook feature or store the job ID
        const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Call Blackbox API asynchronously
        fetch('https://api.blackbox.ai/chat/completions', {
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
                        content: prompt
                    }
                ]
            })
        }).then(async (response) => {
            const result = await response.json();
            console.log('Video generation completed for job:', jobId);
            console.log('Result:', JSON.stringify(result, null, 2));
            
            // Store the result (you'd use a database in production)
            // For now, we'll just log it
            if (result.choices && result.choices[0] && result.choices[0].message) {
                const videoUrl = result.choices[0].message.content;
                console.log('Video URL:', videoUrl);
                // In production, store this in a database with jobId
            }
        }).catch(error => {
            console.error('Error generating video:', error);
        });

        // Return immediately with job ID
        return {
            statusCode: 202, // Accepted
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: true,
                jobId: jobId,
                status: 'processing',
                message: 'Video generation started. This may take 30-60 seconds.',
                estimatedTime: 45
            })
        };

    } catch (error) {
        console.error('Error in start-video-generation function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message 
            })
        };
    }
};
