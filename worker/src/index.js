// ToolHub AI Worker — POST /api/ai/pdf（摘要 / 翻译）
// 上游：腾讯云 TokenHub（OpenAI 兼容），实测端点 https://tokenhub.tencentmaas.com/v1
// 部署：wrangler deploy（密钥用 wrangler secret put TOKENHUB_API_KEY）
export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
    const url = new URL(request.url)

    if (url.pathname === '/api/health') {
      return json({ status: 'ok', timestamp: new Date().toISOString() }, cors)
    }

    if (url.pathname === '/api/ai/pdf' && request.method === 'POST') {
      if (!env.TOKENHUB_API_KEY) return json({ error: 'AI service not configured (missing TOKENHUB_API_KEY)' }, cors, 503)

      let body
      try {
        body = await request.json()
      } catch {
        return json({ error: 'invalid JSON body' }, cors, 400)
      }
      const { text, mode, targetLang } = body || {}
      if (!text || typeof text !== 'string' || !text.trim()) {
        return json({ error: 'text is required' }, cors, 400)
      }
      const MAX_CHARS = 60000
      const trimmed = text.slice(0, MAX_CHARS)
      if (trimmed.trim().length < 20) {
        return json({ error: 'PDF text content too short — is it a scanned/image PDF?' }, cors, 400)
      }
      if (mode && !['summarize', 'translate'].includes(mode)) {
        return json({ error: 'mode must be summarize or translate' }, cors, 400)
      }
      const effMode = mode || 'summarize'

      const { system, user } = buildPrompt(effMode, trimmed, targetLang)
      const base = env.TOKENHUB_BASE_URL || 'https://tokenhub.tencentmaas.com/v1'
      const model = env.TOKENHUB_MODEL || 'deepseek-v4.1-flash'

      try {
        const r = await fetch(`${base}/chat/completions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.TOKENHUB_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: system },
              { role: 'user', content: user }
            ],
            temperature: 0.3,
            max_tokens: 4000
          }),
          signal: AbortSignal.timeout(120000)
        })
        if (!r.ok) {
          const detail = (await r.text()).slice(0, 300)
          if (r.status === 401) return json({ error: 'Upstream auth failed — check TOKENHUB_API_KEY / model free-quota activation' }, cors, 502)
          if (r.status === 429) return json({ error: 'Upstream rate limited, try again later' }, cors, 502)
          return json({ error: 'AI upstream request failed', detail }, cors, 502)
        }
        const data = await r.json()
        const content = data?.choices?.[0]?.message?.content
        if (!content) return json({ error: 'Upstream returned no content', detail: JSON.stringify(data).slice(0, 500) }, cors, 502)
        return json({
          result: content,
          model: data?.model || model,
          usage: data?.usage || null,
          truncated: text.length > MAX_CHARS
        }, cors)
      } catch (e) {
        return json({ error: 'AI upstream request failed', detail: String(e).slice(0, 300) }, cors, 502)
      }
    }

    return json({ error: 'not found' }, cors, 404)
  }
}

function json(obj, cors, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors }
  })
}

function buildPrompt(mode, text, targetLang) {
  if (mode === 'translate') {
    const lang = targetLang || 'English'
    return {
      system: 'You are a professional translator. Translate the user text faithfully, preserving formatting, paragraph breaks, lists and terminology. Output ONLY the translation, no explanations, no preambles.',
      user: `Translate the following text into ${lang}:\n\n${text}`
    }
  }
  return {
    system: 'You are an expert document analyst. Summarize the user text in the SAME language as the original document. Structure: first a 2-3 sentence overview, then 5-8 key bullet points, then (if present) key numbers/data. Be faithful to the source; do not invent content. Output plain text with simple markdown bullets.',
    user: `Summarize the following text:\n\n${text}`
  }
}
