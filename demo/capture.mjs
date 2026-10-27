import { mkdirSync, writeFileSync } from 'node:fs'
import { PNG } from 'pngjs'
import gifenc from 'gifenc'
import { chromium } from 'playwright'

const { GIFEncoder, quantize, applyPalette } = gifenc

import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..')
mkdirSync(join(rootDir, 'docs/assets'), { recursive: true })

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 980 } })
await page.goto('http://127.0.0.1:18080', { waitUntil: 'networkidle' })
await page.screenshot({ path: join(rootDir, 'docs/assets/demo-ready.png'), fullPage: true })

const frames = [await page.screenshot()]
await page.locator('#run').click()
for (const delay of [350, 700, 700, 700, 900]) {
  await page.waitForTimeout(delay)
  frames.push(await page.screenshot())
}
await page.screenshot({ path: join(rootDir, 'docs/assets/demo-complete.png'), fullPage: true })
await browser.close()

const png = PNG.sync.read(frames[0])
const width = png.width
const height = png.height
const gif = GIFEncoder()
const allPixels = new Uint8Array(frames.length * width * height * 4)
frames.forEach((buffer, i) => allPixels.set(PNG.sync.read(buffer).data, i * width * height * 4))
const palette = quantize(allPixels, 256)
const delays = [700, 850, 850, 850, 1200, 1600]
frames.forEach((buffer, i) => {
  const data = PNG.sync.read(buffer).data
  const index = applyPalette(data, palette)
  gif.writeFrame(index, width, height, { palette, delay: delays[i] ?? 900 })
})
gif.finish()
writeFileSync(join(rootDir, 'docs/assets/bughunt-kit-demo.gif'), Buffer.from(gif.bytes()))
console.log(`captured ${frames.length} frames ${width}x${height}`)
