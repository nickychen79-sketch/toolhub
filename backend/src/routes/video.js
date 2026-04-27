import express from 'express'
import axios from 'axios'
import * as cheerio from 'cheerio'

export const videoRouter = express.Router()

// Detect platform from URL
const detectPlatform = (url) => {
  if (url.includes('tiktok.com') || url.includes('vm.tiktok.com')) return 'tiktok'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('douyin.com')) return 'douyin'
  if (url.includes('kuaishou.com') || url.includes('ksurl.cn')) return 'kuaishou'
  if (url.includes('xiaohongshu.com') || url.includes('xhslink.com')) return 'xiaohongshu'
  if (url.includes('channels.weixin.qq.com') || url.includes('weixin.qq.com')) return 'wechat'
  return null
}

// TikTok downloader
const downloadTikTok = async (url) => {
  try {
    // Using a public TikTok API (for demo purposes)
    // In production, use a reliable third-party API or your own scraper
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`
    const response = await axios.get(apiUrl, {
      headers: {
        'Accept': 'application/json'
      },
      timeout: 10000
    })
    
    if (response.data.code === 0 && response.data.data) {
      const data = response.data.data
      return {
        title: data.title || 'TikTok Video',
        thumbnail: data.cover || data.cover_origin,
        duration: formatDuration(data.duration),
        formats: [
          { quality: 'HD', url: data.hdplay || data.play },
          { quality: 'SD', url: data.play },
          { quality: 'Audio', url: data.music || '' }
        ].filter(f => f.url)
      }
    }
    throw new Error('Failed to fetch TikTok video')
  } catch (error) {
    console.error('TikTok error:', error.message)
    throw error
  }
}

// YouTube downloader
const downloadYouTube = async (url) => {
  try {
    // Using a public YouTube API
    const videoId = extractYouTubeId(url)
    const apiUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    
    const response = await axios.get(apiUrl, { timeout: 10000 })
    const videoInfo = response.data
    
    // Get video ID for thumbnail
    const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    
    return {
      title: videoInfo.title,
      thumbnail,
      duration: 'Unknown',
      formats: [
        { quality: 'Download', url: `https://www.y2mate.com/youtube/${videoId}` }
      ]
    }
  } catch (error) {
    console.error('YouTube error:', error.message)
    throw error
  }
}

const extractYouTubeId = (url) => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Video fetch endpoint
videoRouter.post('/fetch', async (req, res) => {
  try {
    const { url } = req.body
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' })
    }

    const platform = detectPlatform(url)
    
    if (!platform) {
      return res.status(400).json({ 
        error: 'Unsupported platform. Supported: TikTok, YouTube, Douyin, Kuaishou, REDnote, WeChat' 
      })
    }

    let result
    
    switch (platform) {
      case 'tiktok':
        result = await downloadTikTok(url)
        break
      case 'youtube':
        result = await downloadYouTube(url)
        break
      case 'douyin':
      case 'kuaishou':
      case 'xiaohongshu':
      case 'wechat':
        // These require custom implementations
        result = {
          title: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Video`,
          thumbnail: '',
          duration: 'Unknown',
          formats: [
            { quality: 'Download', url: url }
          ]
        }
        break
      default:
        return res.status(400).json({ error: 'Platform not implemented' })
    }

    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Video fetch error:', error)
    res.status(500).json({ 
      error: error.message || 'Failed to fetch video' 
    })
  }
})

// Health check
videoRouter.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})
