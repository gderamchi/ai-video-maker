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
├── index.html                      # Main HTML file
├── styles.css                      # Styling
├── script.js                       # Frontend JavaScript
├── package.json                    # Node.js dependencies
├── netlify.toml                    # Netlify configuration
├── README.md                       # Documentation
└── netlify/
    └── functions/
        └── generate-video.js       # Serverless function for API calls
```

## 🎯 How It Works

1. **Upload Photos**: Users upload one or more photos through the drag-and-drop interface
2. **Write Prompt**: Users describe the desired video in the text area
3. **Generate**: Click "Generate Video" to send the request
4. **Processing**: 
   - Frontend sends photos (as base64) and prompt to Netlify function
   - Netlify function calls Blackbox API with Veo 3 model
   - API processes the request and generates video
5. **Display**: Generated video is displayed with download option

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Netlify Serverless Functions (Node.js)
- **AI Model**: Blackbox AI - Veo 3
- **Hosting**: Netlify
- **API**: Blackbox API

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

### API Key Issues
- Ensure `BLACKBOX_API` is set in Netlify environment variables
- Verify the API key is valid and has proper permissions

### Function Timeout
- If video generation takes too long, increase timeout in `netlify.toml`
- Note: Free tier has a 10-second limit

### Photo Upload Issues
- Ensure photos are in supported formats (JPG, PNG, GIF)
- Check file sizes aren't too large (recommended < 5MB each)

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Powered by Blackbox AI & Veo 3 Model** 🚀
