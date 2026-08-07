import { chromium } from 'file:///C:/g/ws/repos/own/oriz-home/node_modules/playwright/index.mjs'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'public', 'screenshots')
await mkdir(outDir, { recursive: true })

const url = 'https://diagram.oriz.in'
const browser = await chromium.launch({
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
})

const shot = async (name, width, height) => {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
  })
  const page = await ctx.newPage()
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(2500)
  await page.screenshot({ path: path.join(outDir, name), clip: { x: 0, y: 0, width, height } })
  await ctx.close()
  console.log('shot', name)
}

await shot('desktop.png', 1280, 800)
await shot('mobile.png', 390, 844)
await browser.close()
