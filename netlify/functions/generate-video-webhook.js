// This function will be called as a webhook and can run for up to 10 seconds
// We'll use it to actually generate the video
const { updateJob } = require('./job-storage');

exports.handler = async (event, context) => {
    // Allow function to complete even after returning
    context.callbackWaitsForEmptyEventLoop = false;
    
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { jobId, prompt, photos, apiKey } = JSON.parse(event.body);
        
        console.log(`[${jobId}] Webhook triggered for video generation`);
        console.log(`[${jobId}] Photos count:`, photos.length);
        
        const imageUrls = photos.map(photo => photo.data);
        
        // Call Blackbox API
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
            
            return {
                statusCode: 200,
                body: JSON.stringify({ success: false, error: errorText })
            };
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
            
            return {
                statusCode: 200,
                body: JSON.stringify({ success: true, videoUrl })
            };
        } else {
            updateJob(jobId, {
                status: 'failed',
                error: 'No video URL found in response',
                response: result
            });
            
            return {
                statusCode: 200,
                body: JSON.stringify({ success: false, error: 'No video URL found' })
            };
        }

    } catch (error) {
        console.error('Error in webhook:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                success: false,
                error: error.message 
            })
        };
    }
};
