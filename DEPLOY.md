# 🚀 Deploy to Vercel - Quick Guide

## Prerequisites
- Blackbox API key
- Git repository

## Step-by-Step Deployment

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```
Follow the prompts to authenticate.

### 3. Deploy the Project
```bash
vercel
```

You'll be asked:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No
- **Project name?** → ai-video-maker (or your choice)
- **Directory?** → ./ (press Enter)
- **Override settings?** → No

### 4. Add Environment Variable
```bash
vercel env add BLACKBOX_API
```

When prompted:
- **Value?** → Paste your Blackbox API key
- **Environment?** → Production (select with arrow keys)

### 5. Deploy to Production
```bash
vercel --prod
```

## ✅ Done!

Your site is now live at: `https://your-project.vercel.app`

## 🔧 Update Environment Variable Later

If you need to change your API key:

```bash
vercel env rm BLACKBOX_API production
vercel env add BLACKBOX_API production
vercel --prod
```

Or use the Vercel Dashboard:
1. Go to your project
2. Settings → Environment Variables
3. Edit BLACKBOX_API
4. Redeploy

## 📝 Local Development

```bash
# Create .env file
echo "BLACKBOX_API=your_key_here" > .env

# Run locally
vercel dev
```

Open http://localhost:3000

## 🐛 Troubleshooting

### "API key not configured"
- Make sure you added the environment variable
- Redeploy after adding it: `vercel --prod`

### "Function timeout"
- Video generation takes 1-3 minutes
- Vercel free tier has 60-second timeout
- If it times out, try with fewer/smaller photos

### "Build failed"
- Make sure all files are committed to git
- Check vercel.json is valid JSON
- Try: `vercel --debug`

## 📊 Monitor Your Deployment

View logs in real-time:
```bash
vercel logs --follow
```

Or check the Vercel Dashboard:
- https://vercel.com/dashboard
- Select your project
- Go to "Deployments" or "Logs"
