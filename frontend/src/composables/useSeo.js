/**
 * SEO Composable - Dynamic meta tag management
 * Use this composable to set page-specific meta tags
 */

const defaultMeta = {
  title: 'ToolHub - Free Online Video Downloader, PDF Tools & Converter Suite',
  description: 'Free online tools: Download videos from TikTok, YouTube, Instagram without watermark. Convert, merge & compress PDF files. Real-time currency exchange rates, timezone converter & unit calculator. No signup required.',
  keywords: 'video downloader, pdf tools, currency converter, free online tools',
  ogImage: '/og-image.png'
}

const pageMeta = {
  home: {
    title: 'ToolHub - Free Online Video Downloader, PDF Tools & Converter Suite',
    description: 'Download videos from TikTok, YouTube, Instagram without watermark. Convert, merge & compress PDFs. Real-time currency, timezone & unit converter. 100% free, no signup required.',
    keywords: 'video downloader without watermark, tiktok downloader, youtube downloader, instagram video download, pdf converter online, pdf merge tool, pdf compressor, currency converter, timezone converter, unit converter, free tools online',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'ToolHub',
      url: 'https://toolhub.app',
      description: 'Free online tools suite including video downloader, PDF tools and converters',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://toolhub.app/search?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    }
  },
  videoTools: {
    title: 'Video Downloader Without Watermark | TikTok, YouTube, Instagram - ToolHub',
    description: 'Free video downloader to save videos from TikTok, YouTube, Instagram, Douyin, Kuaishou, REDnote and WeChat without watermark. Also supports video compression and MP3 audio extraction. No signup required.',
    keywords: 'tiktok video downloader without watermark, youtube video downloader, instagram video downloader, douyin video download, kuaishou downloader, xiaohongshu video download, wechat video download, video compressor, mp3 extractor, extract audio from video, download tiktok video no watermark, save instagram video, youtube to mp3',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Video Tools - ToolHub',
      url: 'https://toolhub.app/video-tools',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'All',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      },
      featureList: ['TikTok Video Downloader', 'YouTube Video Downloader', 'Instagram Video Downloader', 'Video Compression', 'MP3 Audio Extraction']
    }
  },
  pdfTools: {
    title: 'PDF Tools Online Free | PDF Converter, Merge, Compress - ToolHub',
    description: 'Free PDF tools: Convert PDF to/from Word, Excel, PowerPoint, Images. Merge multiple PDFs into one document. Compress PDF files to reduce file size. No registration required, works in your browser.',
    keywords: 'pdf converter, pdf to word, pdf to excel, pdf to image, merge pdf, combine pdf files, pdf merger, compress pdf, reduce pdf size, pdf optimizer, free pdf tools, online pdf editor, convert pdf online',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'PDF Tools - ToolHub',
      url: 'https://toolhub.app/pdf-tools',
      applicationCategory: 'OfficeApplication',
      operatingSystem: 'All',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      },
      featureList: ['PDF Converter', 'PDF Merger', 'PDF Compressor']
    }
  },
  converters: {
    title: 'Currency, Timezone & Unit Converter Online | Real-time Rates - ToolHub',
    description: 'Real-time currency exchange rate converter with 20+ currencies (USD, EUR, GBP, JPY, etc.). Global timezone converter with daylight saving support. Length, weight, temperature, data and speed unit calculator. Instant conversion, always up-to-date.',
    keywords: 'currency converter, exchange rate calculator, usd to eur, gbp to usd, jpy to usd, timezone converter, world clock, time difference calculator, unit converter, length converter, weight converter, temperature converter, data size converter, speed converter, metric to imperial',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Converters - ToolHub',
      url: 'https://toolhub.app/converters',
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'All',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      },
      featureList: ['Currency Converter', 'Timezone Converter', 'Unit Converter']
    }
  }
}

export function useSeo() {

  /**
   * Set page meta tags
   * @param {string} pageKey - Page key from pageMeta object
   * @param {object} customMeta - Optional custom meta overrides
   */
  const setMeta = (pageKey, customMeta = {}) => {
    const meta = { ...defaultMeta, ...pageMeta[pageKey], ...customMeta }

    // Update document title
    document.title = meta.title

    // Update or create meta elements
    updateMetaTag('description', meta.description)
    updateMetaTag('keywords', meta.keywords)
    
    // Open Graph
    updateProperty('og:title', meta.title)
    updateProperty('og:description', meta.description)
    if (meta.ogImage) updateProperty('og:image', meta.ogImage)
    if (meta.url) updateProperty('og:url', meta.url)

    // Twitter
    updateName('twitter:title', meta.title)
    updateName('twitter:description', meta.description)

    // Canonical URL
    updateCanonical(meta.url || `https://toolhub.app${getPagePath(pageKey)}`)

    // Structured Data
    if (meta.schema) {
      updateSchema(meta.schema)
    }
  }

  const getPagePath = (pageKey) => {
    const paths = {
      home: '/',
      videoTools: '/video-tools',
      pdfTools: '/pdf-tools',
      converters: '/converters'
    }
    return paths[pageKey] || '/'
  }

  const updateMetaTag = (name, content) => {
    let element = document.querySelector(`meta[name="${name}"]`)
    if (!element) {
      element = document.createElement('meta')
      element.setAttribute('name', name)
      document.head.appendChild(element)
    }
    element.setAttribute('content', content)
  }

  const updateProperty = (property, content) => {
    let element = document.querySelector(`meta[property="${property}"]`)
    if (!element) {
      element = document.createElement('meta')
      element.setAttribute('property', property)
      document.head.appendChild(element)
    }
    element.setAttribute('content', content)
  }

  const updateName = (name, content) => {
    let element = document.querySelector(`meta[name="${name}"]`)
    if (!element) {
      element = document.createElement('meta')
      element.setAttribute('name', name)
      document.head.appendChild(element)
    }
    element.setAttribute('content', content)
  }

  const updateCanonical = (url) => {
    let element = document.querySelector('link[rel="canonical"]')
    if (!element) {
      element = document.createElement('link')
      element.setAttribute('rel', 'canonical')
      document.head.appendChild(element)
    }
    element.setAttribute('href', url)
  }

  const updateSchema = (schemaData) => {
    let element = document.querySelector('script[type="application/ld+json"]')
    if (!element) {
      element = document.createElement('script')
      element.setAttribute('type', 'application/ld+json')
      document.head.appendChild(element)
    }
    element.textContent = JSON.stringify(schemaData)
  }

  return {
    setMeta,
    pageMeta
  }
}

export default useSeo
