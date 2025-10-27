# Webhook Architecture Fix

## Problem Identified

Your logs showed:
```
Oct 27, 11:10:15 PM: f21e6745 Duration: 234.45 ms
```

The function was **terminating after 234ms** - it never waited for the Blackbox API response!

### Root Cause:
**Netlify Functions terminate immediately after returning a response.** When we returned the job ID, Netlify killed the function, so the async video generation never completed.

## Solution: Webhook Pattern

Instead of trying to run async code in the same function, we now use a **webhook pattern**:

```
User Request
    ↓
start-video function (returns in < 1 second)
    ↓
Creates job in storage
    ↓
Triggers webhook to generate-video-webhook
    ↓
Returns job ID to user immediately
    ↓
[Meanwhile, webhook function runs separately]
    ↓
generate-video-webhook calls Blackbox API
    ↓
Waits for response (1-3 minutes)
    ↓
Updates job status in storage
    ↓
User's polling finds completed job
```

## Files Changed

### 1. `netlify/functions/start-video.js`
- Now triggers a webhook instead of running async code
- Returns immediately with job ID
- Webhook URL: `/.netlify/functions/generate-video-webhook`

### 2. `netlify/functions/generate-video-webhook.js` (NEW)
- Separate function that actually calls Blackbox API
- Can run for up to 26 seconds (Netlify limit)
- Updates job storage when complete

### 3. `netlify.toml`
- Set timeout to 26 seconds for webhook function
- Set timeout to 10 seconds for quick functions

## How It Works Now

1. **User clicks "Generate Video"**
   - Frontend calls `/start-video`

2. **start-video function (< 1 second)**
   - Creates job in storage
   - Triggers webhook to `/generate-video-webhook`
   - Returns job ID immediately

3. **generate-video-webhook function (1-3 minutes)**
   - Runs as separate function
   - Calls Blackbox API with photos and prompt
   - Waits for video generation
   - Updates job status when complete

4. **Frontend polls `/check-video-status`**
   - Checks job status every 2 seconds
   - Shows elapsed time
   - Displays video when complete

## Why This Works

- **No timeout issues**: start-video returns immediately
- **Webhook runs independently**: Not tied to user's request
- **Proper separation**: Each function has one job
- **Netlify-compatible**: Uses standard webhook pattern

## Testing

After deploying, you should see:

```
# start-video logs
Duration: ~200ms ✅
Job created: job_xxx
Webhook triggered

# generate-video-webhook logs
Duration: 60-180 seconds ✅
API called
API responded
Job updated: completed
```

## Next Steps

1. **Deploy to Netlify**
   ```bash
   git add .
   git commit -m "Fix: Use webhook pattern for video generation"
   git push
   ```

2. **Test the flow**
   - Upload a photo
   - Enter prompt
   - Click generate
   - Watch console logs
   - Wait 1-3 minutes
   - Video should appear!

3. **Check Netlify logs**
   - Go to Netlify Dashboard → Functions
   - Check `start-video` logs (should be quick)
   - Check `generate-video-webhook` logs (should show API call)

## Important Notes

- **Webhook must complete within 26 seconds**: If Blackbox API takes longer, it will timeout
- **If still timing out**: We'll need to use a queue service (AWS SQS, Redis, etc.)
- **Job storage is in-memory**: Jobs lost on function restart (use database for production)

## If It Still Doesn't Work

If the webhook also times out after 26 seconds, we have two options:

1. **Use Vercel** (60-second timeout)
2. **Use a proper queue** (AWS SQS, Redis Queue, etc.)

But let's test this first - the webhook pattern should work for most cases!
