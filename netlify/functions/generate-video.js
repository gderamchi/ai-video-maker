exports.handler = async (event, context) => {
    console.log('Function started');
    console.log('HTTP Method:', event.httpMethod);
    
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        console.log('Parsing request body...');
        const { photos, prompt } = JSON.parse(event.body);
        console.log('Photos count:', photos?.length);
        console.log('Prompt length:', prompt?.length);

        // Validate input
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

        // Get API key from environment
        console.log('Checking API key...');
        const apiKey = process.env.BLACKBOX_API;
        console.log('API key exists:', !!apiKey);
        console.log('API key starts with:', apiKey?.substring(0, 3));
        
        if (!apiKey) {
            console.error('API key not found in environment');
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: 'API key not configured' })
            };
        }

        // Prepare the request to Blackbox API
        console.log('Preparing API payload...');
        
        // For video generation with Veo 3 Fast
        const apiPayload = {
            model: 'blackboxai/google/veo-3-fast',
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            stream: false
        };
        
        console.log('API payload prepared');
        console.log('Model: blackboxai/google/veo-3-fast');
        console.log('Payload:', JSON.stringify(apiPayload, null, 2));

        // Call Blackbox API
        let response;
        let result;
        
        try {
            console.log('Calling Blackbox API...');
            console.log('API URL: https://api.blackbox.ai/chat/completions');
            
            response = await fetch('https://api.blackbox.ai/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(apiPayload)
            });
            
            console.log('API response status:', response.status);
            console.log('API response ok:', response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Blackbox API error status:', response.status);
                console.error('Blackbox API error:', errorText);
                return {
                    statusCode: response.status,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        error: `API request failed: ${response.statusText}`,
                        details: errorText,
                        status: response.status
                    })
                };
            }

            console.log('Parsing API response...');
            result = await response.json();
            console.log('API response parsed successfully');
        } catch (fetchError) {
            console.error('Fetch error type:', fetchError.name);
            console.error('Fetch error message:', fetchError.message);
            console.error('Fetch error stack:', fetchError.stack);
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    error: 'Failed to connect to Blackbox API',
                    message: fetchError.message,
                    type: fetchError.name,
                    stack: fetchError.stack
                })
            };
        }

        // Extract video URL or relevant data from the response
        console.log('Extracting video data from response...');
        console.log('Response structure:', JSON.stringify(result, null, 2));
        
        let videoUrl = null;
        let message = null;

        // Try to extract video URL from various possible response structures
        if (result.choices && result.choices[0]) {
            const choice = result.choices[0];
            console.log('Found choices[0]');
            
            if (choice.message && choice.message.content) {
                message = choice.message.content;
                console.log('Message content:', message);
                
                const urlMatch = message.match(/https?:\/\/[^\s]+\.(mp4|mov|avi|webm)/i);
                if (urlMatch) {
                    videoUrl = urlMatch[0];
                    console.log('Found video URL in content:', videoUrl);
                }
            }
            
            if (choice.video_url) {
                videoUrl = choice.video_url;
                console.log('Found video_url in choice:', videoUrl);
            }
        }

        if (result.video_url) {
            videoUrl = result.video_url;
            console.log('Found video_url at top level:', videoUrl);
        }

        if (result.data && result.data.video_url) {
            videoUrl = result.data.video_url;
            console.log('Found video_url in data:', videoUrl);
        }
        
        console.log('Final video URL:', videoUrl);

        console.log('Preparing success response...');
        const responseBody = {
            success: true,
            videoUrl: videoUrl,
            message: message,
            fullResponse: result,
            photosProcessed: photos.length,
            prompt: prompt
        };
        
        console.log('Function completed successfully');
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(responseBody)
        };

    } catch (error) {
        console.error('Error in generate-video function:', error);
        console.error('Error stack:', error.stack);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        };
    }
};
