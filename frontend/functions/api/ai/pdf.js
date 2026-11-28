// Pages Function: POST /api/ai/pdf — AI 摘要/翻译，调腾讯 TokenHub
// 与 worker/src/index.js 同逻辑；Pages Functions 无需 zone 权限，部署即生效
// 密钥：wrangler pages secret put TOKENHUB_API_KEY --project-name toolhub
export async function onRequestPost(context) {
  const { request, env } = context
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }
  const json = (obj, status = 200) =>
    new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', ...cors } })

  if (!env.TOKENHUB_API_KEY) return json({ error: 'AI service not configured (missing TOKENHUB_API_KEY)' }, 503)

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'invalid JSON body' }, 400)
  }
  const { text, mode, targetLang } = body || {}
  if (!text || typeof text !== 'string' || !text.trim()) return json({ error: 'text is required' }, 400)
  const MAX_CHARS = 60000
  const trimmed = text.slice(0, MAX_CHARS)
  if (trimmed.trim().length < 20) return json({ error: 'PDF text content too short — is it a scanned/image PDF?' }, 400)
  if (mode && !['summarize', 'translate'].includes(mode)) return json({ error: 'mode must be summarize or translate' }, 400)
  const effMode = mode || 'summarize'

  const prompts = effMode === 'translate'
    ? {
        system: 'You are a professional translator. Translate the user text faithfully, preserving formatting, paragraph breaks, lists and terminology. Output ONLY the translation, no explanations, no preambles.',
        user: `Translate the following text into ${targetLang || 'English'}:\n\n${trimmed}`
      }
    : {
        system: 'You are an expert document analyst. Summarize the user text in the SAME language as the original document. Structure: first a 2-3 sentence overview, then 5-8 key bullet points, then (if present) key numbers/data. Be faithful to the source; do not invent content. Output plain text with simple markdown bullets.',
        user: `Summarize the following text:\n\n${trimmed}`
      }

  const base = env.TOKENHUB_BASE_URL || 'https://tokenhub.tencentmaas.com/v1'
  const model = env.TOKENHUB_MODEL || 'deepseek-v4.1-flash'

  try {
    const r = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.TOKENHUB_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: prompts.system },
          { role: 'user', content: prompts.user }
        ],
        temperature: 0.3,
        max_tokens: 4000
      }),
      signal: AbortSignal.timeout(120000)
    })
    if (!r.ok) {
      const detail = (await r.text()).slice(0, 300)
      if (r.status === 401) return json({ error: 'Upstream auth failed — check TOKENHUB_API_KEY / model free-quota activation' }, 502)
      if (r.status === 429) return json({ error: 'Upstream rate limited, try again later' }, 502)
      return json({ error: 'AI upstream request failed', detail }, 502)
    }
    const data = await r.json()
    const content = data?.choices?.[0]?.message?.content
    if (!content) return json({ error: 'Upstream returned no content' }, 502)
    return json({
      result: content,
      model: data?.model || model,
      usage: data?.usage || null,
      truncated: text.length > MAX_CHARS
    })
  } catch (e) {
    return json({ error: 'AI upstream request failed', detail: String(e).slice(0, 300) }, 502)
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  })
}
