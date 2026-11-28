// routes/ai.js — AI 文本处理路由（摘要 / 翻译）
// 上游：腾讯云大模型服务平台 TokenHub（OpenAI Chat Completions 兼容协议）
// 端点：https://tokenhub.tencentcloudmaas.com/v1/chat/completions（广州，可 env 覆盖）
// 鉴权：Authorization: Bearer <TOKENHUB_API_KEY>，密钥只放服务端 env，不下发前端
import { Router } from 'express'
import axios from 'axios'

const router = Router()

const TOKENHUB_BASE_URL = process.env.TOKENHUB_BASE_URL || 'https://tokenhub.tencentcloudmaas.com/v1'
const TOKENHUB_API_KEY = process.env.TOKENHUB_API_KEY || ''
const TOKENHUB_MODEL = process.env.TOKENHUB_MODEL || 'deepseek-v4.1-flash'

// 单次请求文本上限（字符）。PDF 前端抽文本后截断到这里，防滥用+控成本
const MAX_TEXT_CHARS = 60000

const buildPrompt = (mode, text, targetLang) => {
  if (mode === 'translate') {
    const lang = targetLang || 'English'
    return {
      system: 'You are a professional translator. Translate the user text faithfully, preserving formatting, paragraph breaks, lists and terminology. Output ONLY the translation, no explanations, no preambles.',
      user: `Translate the following text into ${lang}:\n\n${text}`
    }
  }
  // summarize（默认）：按文档语言输出结构化摘要
  return {
    system: 'You are an expert document analyst. Summarize the user text in the SAME language as the original document. Structure: first a 2-3 sentence overview, then 5-8 key bullet points, then (if present) key numbers/data. Be faithful to the source; do not invent content. Output plain text with simple markdown bullets.',
    user: `Summarize the following text:\n\n${text}`
  }
}

router.post('/pdf', async (req, res) => {
  if (!TOKENHUB_API_KEY) {
    return res.status(503).json({ error: 'AI service not configured (missing TOKENHUB_API_KEY on server)' })
  }

  const { text, mode, targetLang } = req.body || {}
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'text is required' })
  }
  const trimmed = text.slice(0, MAX_TEXT_CHARS)
  if (trimmed.trim().length < 20) {
    return res.status(400).json({ error: 'PDF text content too short — is it a scanned/image PDF?' })
  }
  if (mode && !['summarize', 'translate'].includes(mode)) {
    return res.status(400).json({ error: 'mode must be summarize or translate' })
  }
  const effectiveMode = mode || 'summarize'

  const { system, user } = buildPrompt(effectiveMode, trimmed, targetLang)

  try {
    const r = await axios.post(
      `${TOKENHUB_BASE_URL}/chat/completions`,
      {
        model: TOKENHUB_MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        temperature: 0.3,
        max_tokens: 4000
      },
      {
        headers: {
          Authorization: `Bearer ${TOKENHUB_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 120000,
        // 直连 TokenHub（广州区国内端点），不吃本机/环境代理——代理常解析不了国内域名
        proxy: false
      }
    )

    const content = r.data?.choices?.[0]?.message?.content
    if (!content) {
      return res.status(502).json({ error: 'Upstream returned no content', detail: JSON.stringify(r.data).slice(0, 500) })
    }
    res.json({
      result: content,
      model: r.data?.model || TOKENHUB_MODEL,
      usage: r.data?.usage || null,
      truncated: text.length > MAX_TEXT_CHARS
    })
  } catch (e) {
    const status = e.response?.status
    const upstream = e.response?.data
    console.error('TokenHub call failed:', status, JSON.stringify(upstream).slice(0, 500) || e.message)
    if (status === 401) {
      return res.status(502).json({ error: 'Upstream auth failed — check TOKENHUB_API_KEY / model free-quota activation' })
    }
    if (status === 429) {
      return res.status(502).json({ error: 'Upstream rate limited, try again later' })
    }
    res.status(502).json({ error: 'AI upstream request failed', detail: (upstream && JSON.stringify(upstream).slice(0, 300)) || e.message })
  }
})

export { router as aiRouter }
