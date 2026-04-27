# ToolHub - Free Online Tools Suite

A fast, free, and no-login-required toolkit for video downloading, PDF processing, and conversions.

## Features

### Video Tools
- **Video Downloader**: Download videos from TikTok, YouTube, Douyin, Kuaishou, REDnote, and WeChat
- **Video Compressor**: Reduce video file sizes with quality options
- **Audio Extractor**: Extract audio from videos as MP3

### PDF Tools
- **PDF Converter**: Convert between PDF and Word, Excel, PowerPoint, Images
- **PDF Merger**: Combine multiple PDFs into one
- **PDF Compressor**: Reduce PDF file sizes

### Converters
- **Currency Converter**: Real-time exchange rates for 20+ currencies
- **Timezone Converter**: Convert time across global time zones
- **Unit Converter**: Length, weight, temperature, data, speed conversions

## Tech Stack

- **Frontend**: Vue 3 + Vite + TailwindCSS
- **Backend**: Express.js (Node.js)
- **Internationalization**: vue-i18n (8 languages)
- **Icons**: Lucide Vue

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone or navigate to project
cd toolhub

# Install all dependencies (frontend + backend)
npm install

# Start development servers
npm run dev:all
```

This will start:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Production Build

```bash
# Build frontend
npm run build

# Output will be in frontend/dist/
```

## Project Structure

```
toolhub/
├── frontend/                 # Vue 3 + Vite frontend
│   ├── src/
│   │   ├── components/      # Vue components
│   │   ├── views/          # Page views
│   │   ├── composables/     # Vue composables
│   │   ├── i18n/           # Translations
│   │   └── router/         # Vue Router
│   ├── public/             # Static assets
│   └── index.html
├── backend/                 # Express.js backend
│   └── src/
│       ├── routes/         # API routes
│       └── index.js        # Server entry
├── SPEC.md                  # Design specification
└── README.md
```

## Deployment

### Option 1: Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the frontend directory
3. Follow the prompts - that's it!

Or connect your GitHub repo at https://vercel.com/new

### Option 2: Netlify

1. Go to https://netlify.com
2. Connect your GitHub repo
3. Build command: `npm run build`
4. Publish directory: `frontend/dist`

### Option 3: Cloudflare Pages

1. Go to https://pages.cloudflare.com
2. Connect your GitHub repo
3. Build command: `npm run build`
4. Output directory: `dist`

### Option 4: Manual Static Hosting

```bash
npm run build
# Upload frontend/dist/ to any web server
```

For video downloading, use a third-party API service.

### Option 2: Full Stack Deployment

Deploy both frontend and backend:

#### Railway
```bash
# Connect GitHub repo
# Set start command: npm run backend
# Deploy backend first, then frontend
```

#### Render
1. Create Web Service for backend
   - Build command: `npm install`
   - Start command: `npm run backend`
2. Create Static Site for frontend
   - Build command: `npm install && npm run build`
   - Publish directory: `frontend/dist`

#### VPS (DigitalOcean, AWS, etc.)

```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone <your-repo>
cd toolhub
npm install

# Run with PM2
npm install -g pm2
pm2 start backend/src/index.js --name toolhub-api

# Serve frontend with nginx
# Copy frontend/dist/ to /var/www/toolhub/
# Configure nginx to proxy /api/ to localhost:3001
```

### Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /var/www/toolhub;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Environment Variables

### Backend (.env)
```
PORT=3001
NODE_ENV=production
```

### Frontend (Vite)
Create `frontend/.env`:
```
VITE_API_URL=https://your-api-domain.com/api
```

## SEO

The project includes SEO placeholder comments for:
- Meta tags (index.html)
- Structured data (Footer.vue)
- Dynamic meta per page

To fully implement SEO:
1. Add a meta plugin (vue-meta or @unhead)
2. Configure sitemap generation
3. Add Open Graph tags

## Performance

Target metrics:
- LCP < 2.5s
- FID < 100ms  
- CLS < 0.1
- Bundle < 200KB gzipped

Optimizations included:
- Lazy-loaded routes
- Code splitting for FFmpeg
- Font preloading
- CSS purging via TailwindCSS

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - Free for personal and commercial use.

## Support

For issues or feature requests, please open a GitHub issue.
