# ToolHub - Free Online Tools Suite

## 1. Concept & Vision

A lightning-fast, no-login-required toolkit for global users. The experience feels like a premium Swiss Army knife — each tool instantly accessible, beautifully simple, and surprisingly powerful. The brand communicates speed, reliability, and universal accessibility through a clean geometric aesthetic with purposeful motion.

## 2. Design Language

### Aesthetic Direction
**Minimal Geometric** — Inspired by Dieter Rams' functional design. Clean lines, generous whitespace, subtle depth through shadows, and purposeful micro-interactions. No decorative clutter — every pixel serves a purpose.

### Color Palette
```
Primary:     #0F172A  (Slate 900 - Deep navy for text)
Secondary:   #475569  (Slate 600 - Muted for secondary text)
Accent:      #3B82F6  (Blue 500 - Action blue, trust & speed)
Success:     #10B981  (Emerald 500 - Success states)
Warning:     #F59E0B  (Amber 500 - Warnings)
Error:       #EF4444  (Red 500 - Errors)
Background:  #F8FAFC  (Slate 50 - Light, clean)
Surface:     #FFFFFF  (Pure white cards)
Border:      #E2E8F0  (Slate 200 - Subtle borders)
```

### Typography
- **Headings:** Inter (700 weight) — Clean, modern, excellent readability
- **Body:** Inter (400/500 weight) — Consistent family
- **Mono:** JetBrains Mono — For technical displays (file sizes, codes)
- **Scale:** 14px base, 1.25 ratio (14, 18, 22, 28, 35, 44)

### Spatial System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96
- Container max-width: 1200px
- Card border-radius: 16px
- Button border-radius: 8px

### Motion Philosophy
- **Entrance:** Fade up with 300ms ease-out, staggered 50ms
- **Interactions:** Scale 0.98 on press, 150ms transitions
- **Feedback:** Subtle pulse on success, shake on error
- **Loading:** Skeleton shimmer, progress bars for processing
- **Speed:** All animations under 400ms, most under 200ms

### Visual Assets
- **Icons:** Lucide React — Consistent stroke width, minimal style
- **Illustrations:** Simple geometric shapes, no complex graphics
- **Decorative:** Subtle dot patterns, gradient meshes for hero

## 3. Layout & Structure

### Page Architecture
```
├── Header (Sticky, blur backdrop)
│   ├── Logo (Left)
│   ├── Navigation (Center - Desktop)
│   └── Language Selector (Right)
├── Hero Section (Home only)
│   ├── Headline + Subhead
│   └── Quick Search/Tagline
├── Main Content
│   ├── Tool Cards Grid (Home)
│   └── Tool Interface (Individual pages)
├── Footer
│   ├── Links
│   ├── Language Info
│   └── SEO Placeholder
└── Mobile Menu (Slide-in drawer)
```

### Responsive Strategy
- **Mobile First:** 320px base design
- **Breakpoints:** sm(640px), md(768px), lg(1024px), xl(1280px)
- **Navigation:** Hamburger below md, inline above
- **Grid:** 1 col (mobile) → 2 col (tablet) → 3 col (desktop)

## 4. Features & Interactions

### 4.1 Video Tools

#### URL Video Downloader
- **Input:** Paste URL from TikTok, Douyin, Kuaishou, YouTube, WeChat Video, REDnote
- **Process:**
  1. Validate URL format
  2. Call backend API to fetch video metadata
  3. Display preview (thumbnail, title, duration)
  4. Extract and offer download
- **States:**
  - Empty: Placeholder with supported platforms icons
  - Loading: Skeleton + spinner + "Fetching video..."
  - Success: Video preview + download buttons
  - Error: Shake + red border + specific error message

#### Video Compressor
- **Input:** Drag-drop zone or file picker
- **Options:** Quality preset (High/Medium/Low), custom bitrate
- **Process:**
  1. Client-side compression using FFmpeg.wasm
  2. Real-time progress bar
  3. Auto-download on complete
- **States:**
  - Empty: Dashed border zone + format info
  - Processing: Progress percentage + estimated time
  - Complete: Before/after size comparison + download
  - Error: Retry button + format warning

#### Audio Extractor
- **Input:** Video file upload
- **Options:** Format (MP3/WAV/M4A), quality
- **Process:** FFmpeg.wasm extraction
- **Output:** Direct download with filename

### 4.2 PDF Tools

#### PDF Converter
- **Input:** File picker / drag-drop (Word, Excel, PPT, Images → PDF)
- **Options:** Page size, orientation, margins
- **Process:** Client-side using pdf-lib + Mammoth.js
- **Output:** Download converted PDF

#### PDF Merger
- **Input:** Multi-file upload with reorder (drag)
- **Preview:** Thumbnail grid
- **Process:** Client-side using pdf-lib
- **Output:** Single merged PDF download

#### PDF Compressor
- **Input:** Single or batch file upload
- **Options:** Compression level (Extreme/Recommended/Low)
- **Process:** Client-side using pdf-lib
- **Output:** Download with size comparison

### 4.3 Conversion Tools

#### Currency Converter
- **Input:** Amount + From currency + To currency
- **Data:** Fetch from exchangerate-api.com (free tier)
- **Display:** Real-time calculation, swap button
- **Features:** 30+ currencies, auto-update hourly

#### Timezone Converter
- **Input:** Time + Source timezone
- **Display:** Converted time in multiple zones simultaneously
- **Features:** World clock, DST handling

#### Unit Converter
- **Categories:** Length, Weight, Temperature, Data, Speed, Area, Volume
- **Input:** Value + From unit + To unit
- **Display:** Instant conversion, swap button

### 4.4 Global Features

#### Language Support (i18n)
- **Languages:** English (en), Spanish (es), French (fr), German (de), Portuguese (pt), Japanese (ja), Korean (ko), Chinese (zh)
- **Implementation:** vue-i18n
- **Persistence:** localStorage preference

#### File Handling
- **Max size:** 500MB for video, 100MB for PDF
- **Supported formats:** Displayed in tooltips
- **Batch:** Up to 10 files simultaneously

## 5. Component Inventory

### Navigation
- **Header:** Sticky, backdrop-blur, 64px height
- **Mobile Menu:** Full-screen overlay, slide from right
- **Breadcrumb:** Tool pages only

### Cards (Home Page)
- **Size:** Full width on mobile, 1/3 on desktop
- **Content:** Icon, title, description, arrow
- **Hover:** Lift shadow, slight scale
- **Click:** Ripple effect

### Form Elements
- **Input:** 48px height, rounded-lg, focus ring blue
- **Select:** Native with custom arrow
- **Button Primary:** Blue bg, white text, 48px height
- **Button Secondary:** White bg, border, gray text
- **Button Icon:** 40px square, rounded-lg

### Upload Zone
- **Default:** Dashed border, light bg, centered content
- **Dragover:** Solid border blue, bg-blue-50
- **Uploading:** Progress bar overlay

### Progress Indicators
- **Linear:** Full width, rounded, animated gradient
- **Circular:** For small spaces
- **Skeleton:** Animated shimmer

### Modals
- **Backdrop:** Black 50% opacity
- **Container:** White, rounded-2xl, max-w-md
- **Animation:** Scale + fade in

### Toast Notifications
- **Position:** Bottom right
- **Types:** Success (green), Error (red), Info (blue)
- **Duration:** 4 seconds, dismissible

## 6. Technical Approach

### Frontend Stack
- **Framework:** Vue 3 (Composition API)
- **Build:** Vite 5
- **Styling:** TailwindCSS 3
- **Routing:** Vue Router 4
- **i18n:** vue-i18n 9
- **State:** Pinia (minimal usage)
- **Icons:** Lucide Vue

### Backend (Lightweight)
- **Runtime:** Node.js with Express
- **Video API:** ytdl-core (YouTube), custom scrapers for others
- **Rate Limiting:** express-rate-limit
- **CORS:** Configured for frontend origin

### Project Structure
```
toolhub/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/          # Reusable UI components
│   │   │   ├── tools/       # Tool-specific components
│   │   │   └── layout/      # Header, Footer, etc.
│   │   ├── views/           # Page components
│   │   ├── composables/     # Shared logic
│   │   ├── i18n/            # Translations
│   │   ├── utils/           # Helpers
│   │   ├── assets/          # Local assets
│   │   └── router/
│   ├── public/
│   ├── index.html
│   └── vite.config.js
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   └── index.js
│   └── package.json
├── package.json (workspace)
└── README.md
```

### API Design

#### Video Download
```
POST /api/video/fetch
Body: { url: string }
Response: {
  success: boolean,
  data: {
    title: string,
    thumbnail: string,
    duration: string,
    formats: [{ quality: string, url: string }]
  }
}
```

#### Currency Rates
```
GET /api/currency/rates
Response: {
  base: string,
  rates: { [currency]: number },
  updated: string
}
```

### Performance Targets
- **LCP:** < 2.5s
- **FID:** < 100ms
- **CLS:** < 0.1
- **Bundle:** < 200KB gzipped
- **TTI:** < 3s on 3G

### SEO Implementation
- **Meta tags:** Dynamic per page
- **Structured data:** JSON-LD for tools
- **Sitemap:** Auto-generated
- **OG tags:** For social sharing
