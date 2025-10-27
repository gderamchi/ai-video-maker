// Vercel serverless function for video generation
// 60-second timeout on free tier (enough for most video generations)

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { photos, prompt } = req.body;

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
            return res.status(500).json({ error: 'API key not configured. Add BLACKBOX_API environment variable in Vercel.' });
        }

        console.log('Starting video generation...');
        console.log('Photos:', photos.length);
        console.log('Prompt:', prompt);

        // Prepare image URLs from base64 data
        const imageUrls = photos.map(photo => photo.data);

        // Call Blackbox API with Veo 3 model
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

        console.log('API response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Blackbox API error:', errorText);
            return res.status(response.status).json({ 
                error: `API request failed: ${response.statusText}`,
                details: errorText
            });
        }

        const result = await response.json();
        console.log('API response received');

        // Extract video URL from response
        let videoUrl = null;
        let message = null;

        if (result.choices && result.choices[0] && result.choices[0].message) {
            message = result.choices[0].message.content;
            
            // The content should be the video URL
            if (message && message.startsWith('http')) {
                videoUrl = message;
                console.log('Video URL found:', videoUrl);
            }
        }

        return res.status(200).json({
            success: true,
            videoUrl: videoUrl,
            message: message,
            fullResponse: result,
            photosProcessed: photos.length,
            prompt: prompt
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}
