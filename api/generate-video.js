// Vercel serverless function for video generation
// 60-second timeout on free tier

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('=== Function Started ===');
        
        const { photos, prompt } = req.body;
        console.log('Photos:', photos ? photos.length : 'undefined');
        console.log('Prompt:', prompt ? prompt.substring(0, 50) + '...' : 'undefined');

        // Validate input
        if (!photos || !Array.isArray(photos) || photos.length === 0) {
            return res.status(400).json({ error: 'At least one photo is required' });
        }

        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Get API key from environment
        const apiKey = process.env.BLACKBOX_API;
        
        if (!apiKey) {
            return res.status(500).json({ 
                error: 'API key not configured. Add BLACKBOX_API environment variable in Vercel settings.' 
            });
        }

        // Try different models in order of preference
        const models = [
            'blackboxai/google/veo-3',      // Standard Veo 3
            'blackboxai/google/veo-2',      // Fallback to Veo 2
            'blackbox-ai'                    // Generic Blackbox model
        ];

        let lastError = null;
        
        for (const model of models) {
            try {
                console.log(`Trying model: ${model}`);
                
                // Prepare image URLs from base64 data
                const imageUrls = photos.map(photo => photo.data);

                // Prepare API payload
                const apiPayload = {
                    model: model,
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
                };

                console.log('Calling Blackbox API...');

                // Call Blackbox API
                const response = await fetch('https://api.blackbox.ai/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify(apiPayload)
                });

                console.log(`Response status: ${response.status}`);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`Model ${model} failed:`, errorText);
                    lastError = errorText;
                    continue; // Try next model
                }

                const result = await response.json();
                console.log('API response received successfully');

                // Extract video URL from response
                let videoUrl = null;
                let message = null;

                if (result.choices && result.choices[0] && result.choices[0].message) {
                    message = result.choices[0].message.content;
                    
                    // The content should be the video URL
                    if (message && typeof message === 'string' && message.startsWith('http')) {
                        videoUrl = message;
                        console.log('Video URL found:', videoUrl);
                    }
                }

                console.log(`=== Success with model: ${model} ===`);

                return res.status(200).json({
                    success: true,
                    videoUrl: videoUrl,
                    message: message,
                    modelUsed: model,
                    fullResponse: result,
                    photosProcessed: photos.length,
                    prompt: prompt
                });

            } catch (modelError) {
                console.error(`Error with model ${model}:`, modelError.message);
                lastError = modelError.message;
                continue; // Try next model
            }
        }

        // If we get here, all models failed
        console.error('All models failed');
        return res.status(500).json({
            error: 'All video generation models failed',
            lastError: lastError,
            triedModels: models
        });

    } catch (error) {
        console.error('=== Function Error ===');
        console.error('Error:', error.message);
        
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message
        });
    }
}
