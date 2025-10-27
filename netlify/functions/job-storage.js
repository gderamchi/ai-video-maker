// Simple in-memory job storage
// In production, use a database like Redis, MongoDB, or Netlify Blobs
const jobs = new Map();

// Store job with TTL of 1 hour
function storeJob(jobId, data) {
    jobs.set(jobId, {
        ...data,
        createdAt: Date.now()
    });
    
    // Clean up after 1 hour
    setTimeout(() => {
        jobs.delete(jobId);
    }, 60 * 60 * 1000);
}

function getJob(jobId) {
    return jobs.get(jobId);
}

function updateJob(jobId, updates) {
    const job = jobs.get(jobId);
    if (job) {
        jobs.set(jobId, { ...job, ...updates });
    }
}

module.exports = { storeJob, getJob, updateJob };
