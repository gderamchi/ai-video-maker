// Vercel serverless function for video generation
// This has a 60-second timeout on free tier (vs Netlify's 26 seconds)

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
            return res.status(500).json({ error: 'API key not configured' });
        }

        console.log('Function started');
        console.log('Photos count:', photos.length);
        console.log('Prompt length:', prompt.length);
        console.log('API key exists:', !!apiKey);

        // Call Blackbox API
        console.log('Calling Blackbox API...');
        const response = await fetch('https://api.blackbox.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'blackboxai/google/veo-2',
                messages: [
                    {
                        role: 'user',
                        content: prompt
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
            console.log('Message content:', message);
            
            // The content IS the video URL
            if (message && message.startsWith('http')) {
                videoUrl = message;
                console.log('Found video URL:', videoUrl);
            }
        }
        
        if (!videoUrl) {
            console.error('No video URL found in response');
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
        console.error('Error in generate-video function:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}
