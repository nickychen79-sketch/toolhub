// generate-seo-pages.mjs — ToolHub 批量 SEO 页面生成器（P0/Tier1）
// 输入：seo-data/{config,currency-pairs,unit-pairs}.json + 实时汇率
// 输出：public/convert/<slug>/index.html ×55、public/sitemap-convert.xml、public/robots.txt
// 汇率来源：exchangerate-api v4（与 backend/src/routes/currency.js 同源）。
//   构建时拉取；失败则回退到 seo-data/rates-snapshot.json；两者皆无 → 立即报错退出（禁止假数据上线）。
// 运行：node scripts/generate-seo-pages.mjs [--refresh]
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DATA = path.join(ROOT, 'seo-data')
const PUBLIC = path.join(ROOT, 'public')
const SNAPSHOT = path.join(DATA, 'rates-snapshot.json')

const cfg = JSON.parse(fs.readFileSync(path.join(DATA, 'config.json'), 'utf8'))
const cur = JSON.parse(fs.readFileSync(path.join(DATA, 'currency-pairs.json'), 'utf8'))
const unit = JSON.parse(fs.readFileSync(path.join(DATA, 'unit-pairs.json'), 'utf8'))
const SITE = cfg.siteUrl.replace(/\/$/, '')

// ---------- 汇率 ----------
async function getRates() {
  if (!process.argv.includes('--refresh')) {
    if (fs.existsSync(SNAPSHOT)) {
      const s = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'))
      // 快照超过 7 天仍可用（页面会如实标注汇率日期），只是警告
      const age = (Date.now() - new Date(s.fetched_at)) / 86400000
      if (age > 7) console.warn(`⚠ 汇率快照已 ${age.toFixed(1)} 天未更新（${s.date}），页面将标注旧日期`)
      return s
    }
  }
  try {
    const r = await fetch(cfg.ratesApi, { signal: AbortSignal.timeout(15000) })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const j = await r.json()
    const snap = { date: j.date, fetched_at: new Date().toISOString(), rates: j.rates }
    fs.writeFileSync(SNAPSHOT, JSON.stringify(snap, null, 1))
    console.log(`✔ 汇率已更新：${j.date}（${Object.keys(j.rates).length} 币种）`)
    return snap
  } catch (e) {
    if (fs.existsSync(SNAPSHOT)) {
      console.warn(`⚠ 汇率拉取失败（${e.message}），回退到快照`)
      return JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'))
    }
    console.error(`✗ 汇率拉取失败且无快照：${e.message}`)
    process.exit(1)
  }
}

// ---------- 通用 ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const slug = (...parts) => parts.join('-to-').toLowerCase()

function fmtNum(v) {
  const a = Math.abs(v)
  let d = 2
  if (a >= 1000) d = 0
  else if (a >= 1) d = 2
  else if (a >= 0.01) d = 4
  else d = 6
  return v.toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: 0 })
}

const GA = (id) => `
  <script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${id}');
  </script>`

const CSS = `
  :root{--accent:#3B82F6;--ink:#111827;--mut:#6b7280;--line:#e5e7eb}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Inter,system-ui,-apple-system,'Segoe UI',sans-serif;color:var(--ink);line-height:1.65;background:#fff}
  .wrap{max-width:760px;margin:0 auto;padding:24px 20px 64px}
  .crumb{font-size:13px;color:var(--mut);margin-bottom:20px}
  .crumb a{color:var(--accent);text-decoration:none}
  h1{font-size:30px;font-weight:700;margin-bottom:6px}
  .sub{color:var(--mut);margin-bottom:28px}
  h2{font-size:20px;font-weight:600;margin:36px 0 14px}
  .card{border:1px solid var(--line);border-radius:14px;padding:22px;margin-bottom:20px}
  table{width:100%;border-collapse:collapse;font-size:15px}
  th,td{padding:9px 12px;text-align:left;border-bottom:1px solid var(--line)}
  th{color:var(--mut);font-weight:500;font-size:13px}
  td.num{font-variant-numeric:tabular-nums;font-weight:600}
  .widget{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
  .widget input{flex:1;min-width:150px;font-size:18px;padding:12px 14px;border:1px solid var(--line);border-radius:10px}
  .widget .arrow{color:var(--mut);font-size:20px}
  .widget .out{font-size:22px;font-weight:700;color:var(--accent);min-width:120px;font-variant-numeric:tabular-nums}
  .rate-line{background:#eff6ff;border-radius:12px;padding:14px 18px;margin:16px 0;font-size:15px}
  .rate-line b{color:var(--accent)}
  .stamp{font-size:12px;color:var(--mut);margin-top:8px}
  .links{display:flex;flex-wrap:wrap;gap:8px}
  .links a{display:inline-block;padding:7px 13px;border:1px solid var(--line);border-radius:999px;font-size:14px;color:var(--accent);text-decoration:none}
  .links a:hover{background:#eff6ff}
  ol.steps{padding-left:20px}
  ol.steps li{margin-bottom:8px}
  .faq{margin-bottom:16px}
  .faq h3{font-size:16px;font-weight:600;margin-bottom:4px}
  .faq p{color:#374151}
  footer{margin-top:44px;padding-top:20px;border-top:1px solid var(--line);font-size:13px;color:var(--mut)}
  footer a{color:var(--accent);text-decoration:none;margin-right:16px}
`

function pageShell({ title, desc, canonical, h1, body, jsonld, gaId }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(canonical)}">
${GA(gaId)}
<script type="application/ld+json">${jsonld}</script>
<style>${CSS}</style>
</head>
<body>
<div class="wrap">
<nav class="crumb"><a href="/">ToolHub</a> › <a href="/converters/">Converters</a> › ${esc(h1)}</nav>
<h1>${esc(h1)}</h1>
${body}
<footer>
  <a href="/">Home</a><a href="/converters/">All Converters</a><a href="/pdf-tools/">PDF Tools</a><a href="/video-tools/">Video Tools</a>
  <p style="margin-top:10px">© ${new Date().getFullYear()} ToolHub — free online tools, no login required.</p>
</footer>
</div>
</body>
</html>`
}

function jsonldBlock(pageUrl, faqs, appName) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: appName,
        url: pageUrl,
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a }
        }))
      }
    ]
  })
}

// ---------- 汇率页 ----------
function rateOf(snap, from, to) {
  const rf = snap.rates[from]
  const rt = snap.rates[to]
  if (!rf || !rt) throw new Error(`快照缺币种：${from} 或 ${to}`)
  return rt / rf
}

const QUICK = [1, 5, 10, 50, 100, 500, 1000]

function currencyPage(pair, snap, links) {
  const [F, T] = pair
  const rate = rateOf(snap, F, T)
  const fN = cur.currencies[F]
  const tN = cur.currencies[T]
  const s = slug(F, T)
  const rev = slug(T, F)
  const url = `${SITE}/convert/${s}/`

  const rows = QUICK.map((v) => `<tr><td>${fmtNum(v)} ${F}</td><td class="num">${fmtNum(v * rate)} ${T}</td></tr>`).join('\n')

  const widget = `
<div class="card">
  <div class="widget">
    <input id="amt" type="number" value="1" min="0" step="any" inputmode="decimal" aria-label="Amount in ${esc(F)}">
    <span class="arrow">→</span>
    <span class="out" id="res"></span>
    <span style="color:var(--mut)">${T}</span>
  </div>
  <p class="stamp">Rate used by this widget: 1 ${F} = ${fmtNum(rate)} ${T}</p>
</div>
<script>
(function(){
  var RATE=${rate};
  var i=document.getElementById('amt'),o=document.getElementById('res');
  function fmt(v){var a=Math.abs(v);var d=a>=1000?0:a>=1?2:a>=0.01?4:6;
    return v.toLocaleString('en-US',{maximumFractionDigits:d});}
  function upd(){var v=parseFloat(i.value);o.textContent=isNaN(v)?'—':fmt(v*RATE);}
  i.addEventListener('input',upd);upd();
})();
</script>`

  const body = `
<p class="sub">Free ${F} → ${T} converter with the latest exchange rate. Type an amount, get the result instantly — no signup.</p>
<div class="rate-line"><b>1 ${F} = ${fmtNum(rate)} ${T}</b> &nbsp;·&nbsp; 1 ${T} = ${fmtNum(1 / rate)} ${F}
  <div class="stamp">Mid-market rate as of ${esc(snap.date)}. Banks and card networks add their own margin on top.</div>
</div>
${widget}
<h2>${esc(F)} to ${esc(T)} conversion table</h2>
<div class="card"><table><tr><th>${esc(F)}</th><th>${esc(T)}</th></tr>
${rows}
</table></div>
<h2>How to convert ${esc(F)} to ${esc(T)}</h2>
<div class="card"><ol class="steps">
<li>Type the amount of ${esc(F)} you want to convert into the box above.</li>
<li>The result in ${esc(T)} appears instantly, using the mid-market rate from ${esc(snap.date)}.</li>
<li>Need the other direction? Use the <a href="/convert/${rev}/">${T} to ${F} converter</a>.</li>
</ol></div>
<h2>Frequently asked questions</h2>
<div class="card">
<div class="faq"><h3>How much is 1 ${F} in ${T} today?</h3><p>As of ${esc(snap.date)}, 1 ${F} equals about ${fmtNum(rate)} ${T} at the mid-market rate. The exact amount you receive when exchanging money will differ slightly because providers add fees.</p></div>
<div class="faq"><h3>Why is my bank's ${F}/${T} rate different?</h3><p>The rate shown here is the mid-market rate — the midpoint between what buyers and sellers pay on global currency markets. Banks, cards and transfer services typically add a 1–4% margin, so your actual rate will be a little worse.</p></div>
<div class="faq"><h3>Is this ${F} to ${T} converter free?</h3><p>Yes. ToolHub requires no account, and this page runs entirely in your browser — your amounts are never sent to a server.</p></div>
</div>
<h2>Related conversions</h2>
<div class="links">${links}</div>`

  return pageShell({
    title: `${F} to ${T} — Convert ${fN} to ${tN} (${esc(snap.date)} Rate) | ToolHub`,
    desc: `Convert ${F} to ${T} instantly. 1 ${F} = ${fmtNum(rate)} ${T} as of ${esc(snap.date)}. Free online converter with conversion table — no signup required.`,
    canonical: url,
    h1: `Convert ${F} to ${T}`,
    body,
    jsonld: jsonldBlock(url, [
      { q: `How much is 1 ${F} in ${T} today?`, a: `As of ${snap.date}, 1 ${F} equals about ${fmtNum(rate)} ${T} at the mid-market rate.` },
      { q: `Why is my bank's ${F}/${T} rate different?`, a: 'This page shows the mid-market rate; banks and card providers add a 1-4% margin on top of it.' },
      { q: `Is this ${F} to ${T} converter free?`, a: 'Yes, it is free, requires no account, and runs entirely in your browser.' }
    ], `${F} to ${T} Converter`),
    gaId: cfg.measurementId
  })
}

// ---------- 单位页 ----------
function convertExpr(fromId, toId) {
  // 返回一段 JS：v(数值) → 结果。温度用公式，其余乘因子。
  const U = unit.units
  if (fromId === 'c' && toId === 'f') return 'v*9/5+32'
  if (fromId === 'f' && toId === 'c') return '(v-32)*5/9'
  if (fromId === 'c' && toId === 'k') return 'v+273.15'
  if (fromId === 'f' && toId === 'k') return '(v-32)*5/9+273.15'
  if (fromId === 'k' && toId === 'c') return 'v-273.15'
  if (fromId === 'k' && toId === 'f') return '(v-273.15)*9/5+32'
  return `v*${U[toId].factor / U[fromId].factor}`
}

function formulaText(fromId, toId) {
  const U = unit.units
  if (fromId === 'c' && toId === 'f') return '°F = °C × 9/5 + 32'
  if (fromId === 'f' && toId === 'c') return '°C = (°F − 32) × 5/9'
  if (fromId === 'c' && toId === 'k') return 'K = °C + 273.15'
  const f = U[toId].factor / U[fromId].factor
  return `1 ${U[fromId].symbol} = ${f} ${U[toId].symbol} (multiply by ${f})`
}

function unitPage(pair, links) {
  const [F, T] = pair
  const U = unit.units
  const fU = U[F]
  const tU = U[T]
  const cat = unit.categories[fU.category]
  const s = slug(F, T)
  const rev = slug(T, F)
  const url = `${SITE}/convert/${s}/`
  const expr = convertExpr(F, T)
  const factor = fU.category === 'temperature' ? null : tU.factor / fU.factor

  const tableVals = fU.category === 'temperature' ? [-40, -10, 0, 20, 37, 50, 100] : QUICK
  const rows = tableVals.map((v) => {
    const r = new Function('v', `return ${expr.startsWith('v') ? expr : '(' + expr + ')'};`)(v)
    return `<tr><td>${fmtNum(v)} ${esc(fU.symbol)}</td><td class="num">${fmtNum(r)} ${esc(tU.symbol)}</td></tr>`
  }).join('\n')

  const widget = `
<div class="card">
  <div class="widget">
    <input id="amt" type="number" value="1" step="any" inputmode="decimal" aria-label="Amount in ${esc(fU.label)}">
    <span class="arrow">→</span>
    <span class="out" id="res"></span>
    <span style="color:var(--mut)">${esc(tU.symbol)}</span>
  </div>
</div>
<script>
(function(){
  var i=document.getElementById('amt'),o=document.getElementById('res');
  function fmt(v){return v.toLocaleString('en-US',{maximumFractionDigits:4});}
  function upd(){var v=parseFloat(i.value);o.textContent=isNaN(v)?'—':fmt(${expr});}
  i.addEventListener('input',upd);upd();
})();
</script>`

  const body = `
<p class="sub">Convert ${esc(fU.label)} to ${esc(tU.label)} instantly. Enter a value, get the exact result — no signup, runs in your browser.</p>
${widget}
<div class="rate-line"><b>${esc(formulaText(F, T))}</b>
  <div class="stamp">${esc(cat.note)}</div>
</div>
<h2>${esc(fU.label)} to ${esc(tU.label)} conversion table</h2>
<div class="card"><table><tr><th>${esc(fU.label)} (${esc(fU.symbol)})</th><th>${esc(tU.label)} (${esc(tU.symbol)})</th></tr>
${rows}
</table></div>
<h2>How to convert ${esc(fU.label)} to ${esc(tU.label)}</h2>
<div class="card"><ol class="steps">
<li>Type the number of ${esc(fU.label.toLowerCase())} into the box above.</li>
<li>The result in ${esc(tU.label.toLowerCase())} is calculated instantly${factor ? ` by multiplying by ${factor}` : ' using the exact formula'}.</li>
<li>Need the other direction? Use the <a href="/convert/${rev}/">${esc(tU.label)} to ${esc(fU.label)} converter</a>.</li>
</ol></div>
<h2>Frequently asked questions</h2>
<div class="card">
<div class="faq"><h3>How many ${esc(tU.label.toLowerCase())} is 1 ${esc(fU.symbol)}?</h3><p>${esc(formulaText(F, T))}. ${factor ? `For example, ${fmtNum(10 * factor)} ${tU.symbol} equals 10 ${fU.symbol}.` : ''}</p></div>
<div class="faq"><h3>Is the ${esc(fU.symbol)} to ${esc(tU.symbol)} conversion exact?</h3><p>${esc(cat.note)}</p></div>
<div class="faq"><h3>What is ${esc(fU.symbol)} used to measure?</h3><p>${esc(fU.label)} is a ${esc(cat.label.toLowerCase())} unit${factor ? `; multiplying by ${factor} gives the equivalent in ${esc(tU.label.toLowerCase())}` : ''}. Common uses include everyday measurement, travel and cooking${fU.category === 'data' ? ', and file sizes' : fU.category === 'speed' ? ', and driving or sailing speed limits' : ''}.</p></div>
</div>
<h2>Related conversions</h2>
<div class="links">${links}</div>`

  return pageShell({
    title: `${esc(fU.label)} to ${esc(tU.label)} (${esc(fU.symbol)} to ${esc(tU.symbol)}) — Free Converter | ToolHub`,
    desc: `Convert ${esc(fU.label)} to ${esc(tU.label)} instantly. 1 ${esc(fU.symbol)} = ${factor ? fmtNum(factor) : ''} ${esc(tU.symbol)}${factor ? '' : ' — exact formula on page'}. Free, no signup, works in your browser.`,
    canonical: url,
    h1: `Convert ${esc(fU.label)} to ${esc(tU.label)}`,
    body,
    jsonld: jsonldBlock(url, [
      { q: `How many ${tU.label.toLowerCase()} is 1 ${fU.symbol}?`, a: formulaText(F, T) },
      { q: `Is the ${fU.symbol} to ${tU.symbol} conversion exact?`, a: cat.note },
      { q: `What is ${fU.symbol} used to measure?`, a: `${fU.label} is a ${cat.label.toLowerCase()} unit used in everyday measurement, travel and cooking.` }
    ], `${fU.label} to ${tU.label} Converter`),
    gaId: cfg.measurementId
  })
}

// ---------- 主流程 ----------
const EXPECTED = cur.pairs.length + unit.pairs.length
const CONVERT_DIR = path.join(PUBLIC, 'convert')
fs.rmSync(CONVERT_DIR, { recursive: true, force: true })
fs.mkdirSync(CONVERT_DIR, { recursive: true })

const snap = await getRates()

// 汇率页
const curSlugs = new Set()
const curByFrom = {}
for (const p of cur.pairs) {
  const s = slug(p[0], p[1])
  curSlugs.add(s)
  ;(curByFrom[p[0]] ||= []).push(s)
}
for (const p of cur.pairs) {
  const [F, T] = p
  const s = slug(F, T)
  const rev = slug(T, F)
  const related = [rev, ...(curByFrom[F] || []).filter((x) => x !== s && x !== rev).slice(0, 4)]
  const links = related.map((x) => `<a href="/convert/${x}/">${x.replace('-to-', ' → ').toUpperCase()}</a>`).join('\n')
  fs.mkdirSync(path.join(CONVERT_DIR, s), { recursive: true })
  fs.writeFileSync(path.join(CONVERT_DIR, s, 'index.html'), currencyPage(p, snap, links))
}

// 单位页
const unitSlugs = new Set()
const unitByCat = {}
for (const p of unit.pairs) {
  const s = slug(p[0], p[1])
  unitSlugs.add(s)
  const c = unit.units[p[0]].category
  ;(unitByCat[c] ||= []).push(s)
}
for (const p of unit.pairs) {
  const [F, T] = p
  const s = slug(F, T)
  const rev = slug(T, F)
  const cat = unit.units[F].category
  const related = [rev, ...(unitByCat[cat] || []).filter((x) => x !== s && x !== rev).slice(0, 4)]
  const links = related.map((x) => {
    const [a, b] = x.split('-to-')
    return `<a href="/convert/${x}/">${esc(unit.units[a].label)} → ${esc(unit.units[b].label)}</a>`
  }).join('\n')
  fs.mkdirSync(path.join(CONVERT_DIR, s), { recursive: true })
  fs.writeFileSync(path.join(CONVERT_DIR, s, 'index.html'), unitPage(p, links))
}

// sitemap + robots
const allSlugs = [...curSlugs, ...unitSlugs]
const urls = [
  `${SITE}/`,
  `${SITE}/converters/`,
  `${SITE}/pdf-tools/`,
  `${SITE}/video-tools/`,
  ...allSlugs.map((s) => `${SITE}/convert/${s}/`)
]
fs.writeFileSync(
  path.join(PUBLIC, 'sitemap-convert.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`
)
fs.writeFileSync(
  path.join(PUBLIC, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap-convert.xml\n`
)

console.log(`✔ 生成完成：${allSlugs.length} 页（汇率 ${curSlugs.size} + 单位 ${unitSlugs.size}），sitemap ${urls.length} 条`)
if (allSlugs.length !== EXPECTED) {
  console.error(`✗ 页数不符：期望 ${EXPECTED}，实际 ${allSlugs.length}（可能存在重复 slug）`)
  process.exit(1)
}
