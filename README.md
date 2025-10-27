# 🎬 AI Video Maker

Transform your photos into amazing videos with AI using Blackbox AI's Veo 3 model!

## ✨ Features

- 📸 Upload multiple photos (drag & drop or file browser)
- ✍️ Describe your video with AI prompts (no restrictions)
- 🤖 AI-powered video generation using Veo 3 model
- 📱 Responsive design
- 🎥 Video preview and download

## 🚀 Deploy to Vercel

### Quick Deploy

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

4. **Add your Blackbox API key**
   ```bash
   vercel env add BLACKBOX_API
   ```
   Paste your API key when prompted.

5. **Deploy to production**
   ```bash
   vercel --prod
   ```

That's it! Your site will be live at `https://your-project.vercel.app`

### Environment Variables

You need to set one environment variable in Vercel:

- `BLACKBOX_API` - Your Blackbox API key

You can add it via:
- Vercel CLI: `vercel env add BLACKBOX_API`
- Vercel Dashboard: Project Settings → Environment Variables

## 🛠️ Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ai-video-maker-1
   ```

2. **Create `.env` file**
   ```
   BLACKBOX_API=your_api_key_here
   ```

3. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

4. **Run locally**
   ```bash
   vercel dev
   ```

5. **Open browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
ai-video-maker-1/
├── index.html              # Main webpage
├── styles.css              # Styling
├── script.js               # Frontend logic
├── vercel.json            # Vercel configuration
├── api/
│   └── generate-video.js  # Vercel serverless function
└── README.md              # This file
```

## 🎯 How It Works

1. User uploads photos and enters a prompt
2. Frontend sends request to `/api/generate-video`
3. Vercel function calls Blackbox API with Veo 3 model
4. API generates video (takes 1-3 minutes)
5. Video URL is returned and displayed

## 🔧 Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Vercel Serverless Functions (Node.js)
- **AI Model**: Blackbox AI - Veo 3
- **Hosting**: Vercel

## ⚙️ Configuration

### Vercel Function Settings

The function is configured in `vercel.json`:
- **Timeout**: 60 seconds (enough for most video generations)
- **Memory**: 1024 MB
- **Region**: Auto (closest to user)

### API Configuration

- **Endpoint**: `https://api.blackbox.ai/chat/completions`
- **Model**: `blackboxai/google/veo-3-fast`
- **Authentication**: Bearer token

## 🐛 Troubleshooting

### "API key not configured"
- Make sure you've added `BLACKBOX_API` environment variable
- Redeploy after adding the variable

### "Function timeout"
- Video generation takes 1-3 minutes
- If it times out, the API might be slow
- Try again or use fewer/smaller photos

### "Authentication Error"
- Check your API key is correct
- Make sure it starts with the correct prefix
- Verify the key has proper permissions

## 📝 Usage Tips

- **Photo Quality**: Use high-quality images for best results
- **Prompt Details**: Be specific about transitions, effects, and mood
- **Multiple Photos**: AI will use all photos in sequence
- **Creative Freedom**: No content restrictions

## 🔐 Security

- API keys stored securely in Vercel environment variables
- Never exposed to client-side code
- All API calls proxied through serverless functions

## 📄 License

MIT License - Free to use for personal or commercial projects

---

**Powered by Blackbox AI & Veo 3 Model** 🚀
