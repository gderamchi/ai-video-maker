const { storeJob } = require('./job-storage');

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

        // Generate unique job ID
        const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        console.log('Starting video generation job:', jobId);
        console.log('Photos count:', photos.length);
        console.log('Prompt:', prompt);

        // Store initial job status
        storeJob(jobId, {
            status: 'processing',
            prompt: prompt,
            photosCount: photos.length,
            videoUrl: null,
            error: null
        });

        // Trigger webhook to generate video (fire and forget)
        const webhookUrl = `${event.headers.origin || 'https://' + event.headers.host}/.netlify/functions/generate-video-webhook`;
        
        console.log('Triggering webhook:', webhookUrl);
        
        // Fire webhook without waiting
        fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jobId,
                prompt,
                photos,
                apiKey
            })
        }).catch(err => {
            console.error('Error triggering webhook:', err);
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
                message: 'Video generation started. Poll /check-video-status with this jobId.',
                estimatedTime: '30-60 seconds'
            })
        };

    } catch (error) {
        console.error('Error in start-video function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message 
            })
        };
    }
};
