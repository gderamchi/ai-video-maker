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

        // Start async video generation (don't await)
        generateVideoAsync(jobId, prompt, photos, apiKey).catch(error => {
            console.error('Error in async video generation:', error);
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

// Async function that runs in background
async function generateVideoAsync(jobId, prompt, photos, apiKey) {
    const { updateJob } = require('./job-storage');
    
    try {
        console.log(`[${jobId}] Calling Blackbox API...`);
        console.log(`[${jobId}] Photos count:`, photos.length);
        
        // Build the content with images
        // Format: text prompt + image data
        const imageUrls = photos.map(photo => photo.data);
        
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
                        content: [
                            {
                                type: 'text',
                                text: prompt
                            },
                            ...imageUrls.map(url => ({
                                type: 'image_url',
                                image_url: {
                                    url: url
                                }
                            }))
                        ]
                    }
                ]
            })
        });

        console.log(`[${jobId}] API response status:`, response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[${jobId}] API error:`, errorText);
            
            updateJob(jobId, {
                status: 'failed',
                error: `API request failed: ${response.statusText}`,
                details: errorText
            });
            return;
        }

        const result = await response.json();
        console.log(`[${jobId}] API response received`);

        // Extract video URL
        let videoUrl = null;
        if (result.choices && result.choices[0] && result.choices[0].message) {
            const message = result.choices[0].message.content;
            if (message && message.startsWith('http')) {
                videoUrl = message;
                console.log(`[${jobId}] Video URL:`, videoUrl);
            }
        }

        if (videoUrl) {
            updateJob(jobId, {
                status: 'completed',
                videoUrl: videoUrl,
                completedAt: Date.now()
            });
            console.log(`[${jobId}] Job completed successfully`);
        } else {
            updateJob(jobId, {
                status: 'failed',
                error: 'No video URL found in response',
                response: result
            });
            console.error(`[${jobId}] No video URL found`);
        }

    } catch (error) {
        console.error(`[${jobId}] Error:`, error);
        updateJob(jobId, {
            status: 'failed',
            error: error.message
        });
    }
}
