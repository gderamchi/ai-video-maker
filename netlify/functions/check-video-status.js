const { getJob } = require('./job-storage');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Get jobId from query parameters
        const jobId = event.queryStringParameters?.jobId;
        
        if (!jobId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'jobId parameter is required' })
            };
        }

        console.log('Checking status for job:', jobId);

        // Get job from storage
        const job = getJob(jobId);

        if (!job) {
            return {
                statusCode: 404,
                body: JSON.stringify({ 
                    error: 'Job not found',
                    message: 'Job may have expired or does not exist'
                })
            };
        }

        // Return job status
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jobId: jobId,
                status: job.status,
                videoUrl: job.videoUrl,
                error: job.error,
                prompt: job.prompt,
                photosCount: job.photosCount,
                createdAt: job.createdAt,
                completedAt: job.completedAt
            })
        };

    } catch (error) {
        console.error('Error in check-video-status function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message 
            })
        };
    }
};
