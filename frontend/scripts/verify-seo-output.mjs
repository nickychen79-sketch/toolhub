// verify-seo-output.mjs — 构建产物断言（在 vite build 之后跑，任何断言失败即退出码 1）
// 断言：① dist/convert/ 下 55 页齐全 ② 每页含 H1 / canonical / 表格数字 / FAQPage JSON-LD / gtag
//        ③ sitemap 覆盖全部页面 ④ 汇率页含日期标注、单位页含因子
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const DATA = path.join(ROOT, 'seo-data')

const cur = JSON.parse(fs.readFileSync(path.join(DATA, 'currency-pairs.json'), 'utf8'))
const unit = JSON.parse(fs.readFileSync(path.join(DATA, 'unit-pairs.json'), 'utf8'))
const snap = JSON.parse(fs.readFileSync(path.join(DATA, 'rates-snapshot.json'), 'utf8'))
const cfg = JSON.parse(fs.readFileSync(path.join(DATA, 'config.json'), 'utf8'))
const SITE = cfg.siteUrl.replace(/\/$/, '')

let fails = 0
const assert = (cond, label) => {
  if (cond) return
  fails++
  console.error(`  ✗ ${label}`)
}

const curSlugs = cur.pairs.map((p) => `${p[0]}-to-${p[1]}`.toLowerCase())
const unitSlugs = unit.pairs.map((p) => `${p[0]}-to-${p[1]}`.toLowerCase())
const expected = new Set([...curSlugs, ...unitSlugs])

console.log(`断言目标：${expected.size} 页（汇率 ${curSlugs.length} + 单位 ${unitSlugs.length}）`)

for (const s of expected) {
  const f = path.join(DIST, 'convert', s, 'index.html')
  assert(fs.existsSync(f), `${s}/index.html 不存在`)
  if (!fs.existsSync(f)) continue
  const html = fs.readFileSync(f, 'utf8')
  assert(html.includes('<h1>Convert'), `${s}: 缺 H1`)
  assert(html.includes(`rel="canonical" href="${SITE}/convert/${s}/"`), `${s}: canonical 错`)
  assert(html.includes('application/ld+json') && html.includes('FAQPage'), `${s}: 缺 FAQPage JSON-LD`)
  assert(html.includes(`id=${JSON.stringify(cfg.measurementId)}`) || html.includes(cfg.measurementId), `${s}: 缺 gtag`)
  assert(/<table>/.test(html) && /class="num"/.test(html), `${s}: 缺换算表`)
  assert(html.includes('<footer'), `${s}: 缺内链 footer`)
}

// 汇率页专项：必须标注汇率日期（数据新鲜度）
for (const s of curSlugs) {
  const f = path.join(DIST, 'convert', s, 'index.html')
  if (!fs.existsSync(f)) continue
  const html = fs.readFileSync(f, 'utf8')
  assert(html.includes(snap.date), `${s}: 未标注汇率日期 ${snap.date}`)
  assert(html.includes('mid-market'), `${s}: 缺 mid-market 说明`)
}
// 单位页专项：必须有因子或公式
for (const s of unitSlugs) {
  const f = path.join(DIST, 'convert', s, 'index.html')
  if (!fs.existsSync(f)) continue
  const html = fs.readFileSync(f, 'utf8')
  assert(/1 \S+ = [\d.,]+ \S+ \(multiply by|°F = °C|°C = \(°F|K = °C/.test(html), `${s}: 缺因子/公式`)
}

// sitemap
const sm = fs.readFileSync(path.join(DIST, 'sitemap-convert.xml'), 'utf8')
for (const s of expected) {
  assert(sm.includes(`/convert/${s}/`), `sitemap 缺 /convert/${s}/`)
}
// robots
const robots = fs.readFileSync(path.join(DIST, 'robots.txt'), 'utf8')
assert(robots.includes('Sitemap:'), 'robots.txt 缺 Sitemap 行')
// SPA 入口未被破坏
assert(fs.existsSync(path.join(DIST, 'index.html')), 'dist/index.html（SPA 入口）不存在')

if (fails) {
  console.error(`\n✗ 验证失败：${fails} 条断言未过`)
  process.exit(1)
}
console.log(`✔ 全部断言通过：${expected.size} 页 × 7 项 + sitemap/robots/SPA 入口`)
