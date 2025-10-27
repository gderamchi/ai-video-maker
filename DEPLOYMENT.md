'
# 🚀 Deployment Guide - AI Video Maker

## Quick Deployment Steps

### Option 1: Deploy via Netlify Dashboard (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: AI Video Maker"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Go to [https://app.netlify.com/](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub" and authorize Netlify
   - Select your repository
   - Netlify will auto-detect settings from `netlify.toml`

3. **Set Environment Variable**
   - In Netlify Dashboard: Site settings → Environment variables
   - Click "Add a variable"
   - Key: `BLACKBOX_API`
   - Value: Your Blackbox API key (starts with 'sk-')
   - Click "Save"

4. **Deploy**
   - Click "Deploy site"
   - Wait for deployment to complete
   - Your site will be live at `https://your-site-name.netlify.app`

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI** (if not already installed)
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Site**
   ```bash
   netlify init
   ```
   - Choose "Create & configure a new site"
   - Select your team
   - Choose a site name (or leave blank for random)

4. **Set Environment Variable**
   ```bash
   netlify env:set BLACKBOX_API "your-api-key-here"
   ```

5. **Deploy**
   ```bash
   netlify deploy --prod
   ```

## Getting Your Blackbox API Key

1. Visit [Blackbox AI](https://www.blackbox.ai/)
2. Sign up or log in to your account
3. Navigate to API settings or developer dashboard
4. Generate a new API key
5. Copy the key (it should start with 'sk-')

## Verify Deployment

After deployment, test your site:

1. **Visit your site URL**
2. **Upload a test photo**
3. **Enter a prompt** (e.g., "Create a smooth video transition")
4. **Click "Generate Video"**
5. **Check the result**

## Troubleshooting

### Issue: "API key not configured"
- **Solution**: Ensure `BLACKBOX_API` is set in Netlify environment variables
- Redeploy after setting the variable

### Issue: "Authentication Error"
- **Solution**: Verify your API key is correct and starts with 'sk-'
- Check if the key has proper permissions

### Issue: Function timeout
- **Solution**: Increase timeout in `netlify.toml` (max 10s for free tier)
- Consider upgrading to Pro plan for longer timeouts

### Issue: Large photo uploads fail
- **Solution**: Compress photos before upload
- Recommended max size: 5MB per photo

## Post-Deployment

### Custom Domain (Optional)
1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

### Monitoring
- Check function logs in Netlify Dashboard
- Monitor usage and errors
- Set up notifications for failures

## Local Development

To run locally:
```bash
npm install
netlify dev
```

Visit `http://localhost:8888`

## Support

For issues:
- Check Netlify function logs
- Review browser console for frontend errors
- Verify API key is valid
- Check Blackbox API status

---

**Your AI Video Maker is now live! 🎉**
