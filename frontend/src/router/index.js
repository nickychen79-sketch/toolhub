import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: {
      seoKey: 'home',
      title: 'ToolHub - Free Online Video Downloader, PDF Tools & Converter Suite',
      description: 'Download videos from TikTok, YouTube without watermark. Convert, merge & compress PDFs. Real-time currency & unit converter. 100% free.'
    }
  },
  {
    path: '/video-tools',
    name: 'VideoTools',
    component: () => import('../views/VideoTools.vue'),
    meta: {
      seoKey: 'videoTools',
      title: 'Video Downloader Without Watermark | TikTok, YouTube, Instagram - ToolHub',
      description: 'Free video downloader to save videos from TikTok, YouTube, Instagram without watermark. Video compression & MP3 extraction. No signup required.',
      keywords: 'tiktok video downloader without watermark, youtube downloader, instagram video download, video compressor, mp3 extractor'
    }
  },
  {
    path: '/video-downloader',
    redirect: '/video-tools'
  },
  {
    path: '/pdf-tools',
    name: 'PdfTools',
    component: () => import('../views/PdfTools.vue'),
    meta: {
      seoKey: 'pdfTools',
      title: 'PDF Tools Online Free | PDF Converter, Merge, Compress - ToolHub',
      description: 'Free PDF tools: Convert PDF to/from Word, Excel, Images. Merge multiple PDFs. Compress PDF files. No registration required.',
      keywords: 'pdf converter, pdf to word, merge pdf, combine pdf, compress pdf, free pdf tools online'
    }
  },
  {
    path: '/pdf-converter',
    redirect: '/pdf-tools'
  },
  {
    path: '/converters',
    name: 'Converters',
    component: () => import('../views/Converters.vue'),
    meta: {
      seoKey: 'converters',
      title: 'Currency, Timezone & Unit Converter Online | Real-time Rates - ToolHub',
      description: 'Real-time currency exchange rates with 20+ currencies. Global timezone converter. Length, weight, temperature & data unit calculator. Instant conversion.',
      keywords: 'currency converter, exchange rate, timezone converter, world clock, unit converter, length weight temperature'
    }
  },
  {
    path: '/currency-converter',
    redirect: '/converters'
  },

  // SEO-friendly URL aliases for long-tail keywords
  {
    path: '/tiktok-downloader',
    name: 'TikTokDownloader',
    component: () => import('../views/VideoTools.vue'),
    meta: {
      title: 'TikTok Video Downloader Without Watermark (2026) - ToolHub',
      description: 'Download TikTok videos without watermark for free. Save HD videos from TikTok instantly. No watermark, no login, works on mobile & desktop.',
      keywords: 'tiktok downloader without watermark, download tiktok video no watermark, tiktok video saver, save tiktok video hd'
    }
  },
  {
    path: '/youtube-downloader',
    name: 'YoutubeDownloader',
    component: () => import('../views/VideoTools.vue'),
    meta: {
      title: 'Free YouTube Video Downloader Online (HD) - ToolHub',
      description: 'Download YouTube videos in HD quality for free. Fast and easy YouTube to MP4/MP3 converter. No registration needed.',
      keywords: 'youtube video downloader, youtube to mp4, download youtube videos free, youtube hd download, save youtube video'
    }
  },
  {
    path: '/instagram-downloader',
    name: 'InstagramDownloader',
    component: () => import('../views/VideoTools.vue'),
    meta: {
      title: 'Instagram Video & Photo Downloader Free - ToolHub',
      description: 'Download Instagram videos, photos, Reels and Stories for free. Save IG content without watermark. Works with all Instagram links.',
      keywords: 'instagram video downloader, instagram photo download, instagram reels downloader, save instagram story, ig downloader'
    }
  },
  {
    path: '/pdf-merge-online',
    name: 'PdfMerge',
    component: () => import('../views/PdfTools.vue'),
    meta: {
      title: 'PDF Merge Online Free - Combine Multiple PDF Files - ToolHub',
      description: 'Merge multiple PDF files into one document online for free. Combine PDFs easily in your browser. No upload limits, no registration required.',
      keywords: 'pdf merger, combine pdf files, merge pdfs online, join pdf documents, concatenate pdf'
    }
  },
  {
    path: '/pdf-compress',
    name: 'PdfCompress',
    component: () => import('../views/PdfTools.vue'),
    meta: {
      title: 'PDF Compressor Free Online | Reduce PDF File Size - ToolHub',
      description: 'Compress PDF files to reduce file size while maintaining quality. Free online PDF compression tool. No watermark, no file size limit.',
      keywords: 'compress pdf, reduce pdf size, pdf optimizer, shrink pdf file, make pdf smaller'
    }
  },
  {
    path: '/exchange-rate',
    name: 'ExchangeRate',
    component: () => import('../views/Converters.vue'),
    meta: {
      title: 'Live Currency Exchange Rates Calculator | USD EUR GBP JPY - ToolHub',
      description: 'Real-time currency exchange rate converter. Convert between USD, EUR, GBP, JPY, CNY and 20+ currencies with live market rates updated automatically.',
      keywords: 'exchange rate calculator, usd eur gbp jpy, live forex rates, currency conversion, dollar to euro, pound to dollar'
    }
  },
  {
    path: '/timezone-converter',
    name: 'TimezoneConverter',
    component: () => import('../views/Converters.vue'),
    meta: {
      title: 'Timezone Converter | World Clock & Time Difference Calculator - ToolHub',
      description: 'Convert time between global timezones instantly. Calculate time differences between cities worldwide. Supports daylight saving time (DST) adjustments.',
      keywords: 'timezone converter, world clock, time difference calculator, convert time zones, utc converter, dst time'
    }
  },
  
  // 404 catch-all
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    } else {
      return { top: 0 }
    }
  }
})

// Update meta tags on route change
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
  if (to.meta.description) {
    const descEl = document.querySelector('meta[name="description"]')
    if (descEl) descEl.setAttribute('content', to.meta.description)
    
    const ogDescEl = document.querySelector('meta[property="og:description"]')
    if (ogDescEl) ogDescEl.setAttribute('content', to.meta.description)
    
    const twitterDescEl = document.querySelector('meta[name="twitter:description"]')
    if (twitterDescEl) twitterDescEl.setAttribute('content', to.meta.description)
  }
  if (to.meta.keywords) {
    const kwEl = document.querySelector('meta[name="keywords"]')
    if (kwEl) kwEl.setAttribute('content', to.meta.keywords)
  }
  next()
})

export default router
