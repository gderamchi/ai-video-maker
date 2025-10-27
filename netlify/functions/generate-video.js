exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { photos, prompt } = JSON.parse(event.body);

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
        const apiKey = process.env.BLACKBOX_API;
        if (!apiKey) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'API key not configured' })
            };
        }

        // Prepare the request to Blackbox API
        // Note: The exact format may need adjustment based on Blackbox API documentation
        const apiPayload = {
            model: 'blackboxai/google/veo-3',
            messages: [
                {
                    role: 'user',
                    content: `Create a video based on the following prompt: ${prompt}\n\nI have ${photos.length} photo(s) to use as reference.`
                }
            ],
            // Include photo data if the API supports it
            images: photos.map(photo => photo.data),
            max_tokens: 4096,
            temperature: 0.7
        };

        // Call Blackbox API
        let response;
        let result;
        
        try {
            response = await fetch('https://api.blackbox.ai/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(apiPayload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Blackbox API error:', errorText);
                return {
                    statusCode: response.status,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        error: `API request failed: ${response.statusText}`,
                        details: errorText
                    })
                };
            }

            result = await response.json();
        } catch (fetchError) {
            console.error('Fetch error:', fetchError);
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    error: 'Failed to connect to Blackbox API',
                    message: fetchError.message
                })
            };
        }

        // Extract video URL or relevant data from the response
        // The exact structure depends on the Blackbox API response format
        let videoUrl = null;
        let message = null;

        // Try to extract video URL from various possible response structures
        if (result.choices && result.choices[0]) {
            const choice = result.choices[0];
            
            // Check if there's a video URL in the content
            if (choice.message && choice.message.content) {
                message = choice.message.content;
                
                // Try to extract URL from content
                const urlMatch = message.match(/https?:\/\/[^\s]+\.(mp4|mov|avi|webm)/i);
                if (urlMatch) {
                    videoUrl = urlMatch[0];
                }
            }
            
            // Check for video in other possible fields
            if (choice.video_url) {
                videoUrl = choice.video_url;
            }
        }

        // Check for video URL at top level
        if (result.video_url) {
            videoUrl = result.video_url;
        }

        if (result.data && result.data.video_url) {
            videoUrl = result.data.video_url;
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: true,
                videoUrl: videoUrl,
                message: message,
                fullResponse: result,
                photosProcessed: photos.length,
                prompt: prompt
            })
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
