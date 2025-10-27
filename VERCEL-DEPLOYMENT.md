# Deploy to Vercel (Recommended for Video Generation)

Vercel has a **60-second timeout** on the free tier, which is better suited for video generation than Netlify's 26-second limit.

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Push your code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Add Vercel support for video generation"
   git push
   ```

2. **Go to [Vercel Dashboard](https://vercel.com/new)**
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration from `vercel.json`

3. **Add Environment Variable**
   - In the import screen, click "Environment Variables"
   - Add: `BLACKBOX_API` = `your_api_key_here`
   - Click "Deploy"

4. **Done!** Your site will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - What's your project's name? **ai-video-maker**
   - In which directory is your code located? **./**
   - Want to override settings? **N**

4. **Add Environment Variable**
   ```bash
   vercel env add BLACKBOX_API
   ```
   Paste your API key when prompted.

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Configuration

The project includes:
- `vercel.json` - Vercel configuration with 60-second timeout
- `api/generate-video.js` - Vercel serverless function
- Auto-detection in `script.js` to use correct endpoint

## Advantages of Vercel

✅ **60-second timeout** (vs Netlify's 26 seconds)
✅ **Free tier** with generous limits
✅ **Fast deployments** and edge network
✅ **Automatic HTTPS** and custom domains
✅ **Better suited for AI/ML workloads**

## Testing

After deployment:
1. Visit your Vercel URL
2. Upload a photo
3. Enter a prompt
4. Click "Generate Video"
5. Wait 30-60 seconds for the video to generate

## Troubleshooting

### Still timing out?
- Try using `veo-2` model (may be faster)
- Check Blackbox API status
- Verify API key is correct

### Environment variable not working?
```bash
vercel env ls
```
Should show `BLACKBOX_API` in production

### Need to update environment variable?
```bash
vercel env rm BLACKBOX_API production
vercel env add BLACKBOX_API production
```

## Cost Comparison

| Platform | Free Tier Timeout | Best For |
|----------|------------------|----------|
| Netlify  | 26 seconds       | Static sites, quick APIs |
| Vercel   | 60 seconds       | ✅ AI/ML, video generation |
| Railway  | No limit         | Long-running processes |
| AWS Lambda | 15 minutes     | Enterprise, complex workflows |

**Recommendation**: Use Vercel for this project due to the 60-second timeout.
