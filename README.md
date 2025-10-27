# 🎬 AI Video Maker

Transform your photos into amazing videos with AI! This web application uses Blackbox AI's Veo 3 model to generate creative videos from your uploaded photos based on your text prompts.

## ✨ Features

- 📸 **Multiple Photo Upload**: Upload one or more photos via drag-and-drop or file browser
- 🎨 **Photo Gallery**: Preview all uploaded photos with easy removal options
- ✍️ **AI Prompt Input**: Describe your desired video with no restrictions
- 🤖 **AI-Powered Generation**: Uses Blackbox AI's Veo 3 model for video creation
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🎥 **Video Preview & Download**: View and download your generated videos
- 🔒 **Secure API Calls**: API key stored securely in Netlify environment variables

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Netlify account
- Blackbox API key

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ai-video-maker-1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```
   BLACKBOX_API=your_blackbox_api_key_here
   ```

4. **Run locally with Netlify Dev**
   ```bash
   npm run dev
   ```
   
   The site will be available at `http://localhost:8888`

## 📦 Deployment to Netlify

### Option 1: Deploy via Netlify CLI

1. **Install Netlify CLI** (if not already installed)
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize and deploy**
   ```bash
   netlify init
   netlify deploy --prod
   ```

### Option 2: Deploy via Netlify Dashboard

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Configure build settings (should auto-detect from `netlify.toml`)

3. **Set Environment Variable**
   - In Netlify Dashboard, go to: Site settings → Environment variables
   - Add new variable:
     - **Key**: `BLACKBOX_API`
     - **Value**: Your Blackbox API key

4. **Deploy**
   - Click "Deploy site"
   - Your site will be live at `https://your-site-name.netlify.app`

## 🔧 Configuration

### Netlify Configuration (`netlify.toml`)

The project includes a `netlify.toml` file with the following settings:

- **Publish directory**: Root directory (`.`)
- **Functions directory**: `netlify/functions`
- **Node version**: 18
- **Function timeout**: 10 seconds (adjust if needed)

### API Configuration

The Blackbox API is configured to use:
- **Endpoint**: `https://api.blackbox.ai/chat/completions`
- **Model**: `blackboxai/google/veo-3`
- **Authentication**: Bearer token (from `BLACKBOX_API` environment variable)

## 📁 Project Structure

```
ai-video-maker-1/
├── index.html                          # Main HTML file
├── styles.css                          # Styling
├── script.js                           # Frontend with async/polling
├── package.json                        # Node.js dependencies
├── netlify.toml                        # Netlify configuration
├── README.md                           # Documentation
├── vercel.json                         # Vercel configuration (alternative)
├── VERCEL-DEPLOYMENT.md               # Vercel deployment guide
└── netlify/
    └── functions/
        ├── start-video.js             # Start async video generation
        ├── check-video-status.js      # Poll for job status
        ├── job-storage.js             # In-memory job storage
        └── generate-video.js          # Legacy sync function (deprecated)
```

## 🎯 How It Works (Async/Polling Architecture)

1. **Upload Photos**: Users upload one or more photos through the drag-and-drop interface
2. **Write Prompt**: Users describe the desired video in the text area
3. **Generate**: Click "Generate Video" to start the process
4. **Async Processing**: 
   - Frontend calls `/start-video` function which returns immediately with a job ID
   - Backend starts video generation asynchronously (no timeout issues!)
   - Blackbox API generates video using Veo 3 Fast model (30-60 seconds)
5. **Polling**: Frontend polls `/check-video-status` every 2 seconds to check job status
6. **Display**: When complete, video is displayed with download option

**Why Async/Polling?**
- Netlify free tier has 26-second timeout limit
- Video generation takes 30-60 seconds
- Async approach bypasses timeout by returning immediately
- Polling checks status until video is ready

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Netlify Serverless Functions (Node.js 18+)
- **AI Model**: Blackbox AI - Veo 3
- **Hosting**: Netlify
- **API**: Blackbox API (native fetch, no external dependencies)

## 🔐 Security

- API keys are stored securely in Netlify environment variables
- Never exposed to the client-side code
- All API calls are proxied through serverless functions

## 📝 Usage Tips

- **Photo Quality**: Use high-quality images for best results
- **Prompt Details**: Be specific about transitions, effects, mood, and style
- **Multiple Photos**: The AI will use all uploaded photos in sequence
- **Creative Freedom**: No content restrictions - describe exactly what you want

## 🐛 Troubleshooting

### 500 Internal Server Error
**FIXED in v1.1:** Removed node-fetch dependency, now using native fetch API
- If you still see this error, check `BLACKBOX_API` is set in Netlify
- Redeploy after setting environment variable
- See TROUBLESHOOTING.md for detailed solutions

### 401 Unauthorized Error
**This is normal** if using placeholder API key
- Get real API key from https://www.blackbox.ai/
- Update `BLACKBOX_API` environment variable
- Redeploy the site

### API Key Issues
- Ensure `BLACKBOX_API` is set in Netlify environment variables
- Verify the API key starts with `sk-`
- Verify the API key is valid and has proper permissions

### Async/Polling Implementation

**✅ SOLVED**: This project now uses async/polling to bypass Netlify's 26-second timeout!

**How it works:**
1. `/start-video` function starts generation and returns immediately (< 1 second)
2. Video generation runs in background
3. Frontend polls `/check-video-status` every 2 seconds
4. When complete, video URL is returned

**Note**: Job storage uses in-memory Map (jobs expire after 1 hour). For production, use:
- Netlify Blobs
- Redis
- MongoDB
- Any persistent storage

### Photo Upload Issues
- Ensure photos are in supported formats (JPG, PNG, GIF)
- Check file sizes aren't too large (recommended < 5MB each)

**For detailed troubleshooting, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)**

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Powered by Blackbox AI & Veo 3 Model** 🚀
