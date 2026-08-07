import { writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const iconsDir = path.join(root, 'public', 'icons')
await mkdir(iconsDir, { recursive: true })

// bespoke mark: node-graph (3 nodes + edges), electric blue on blueprint-dark tile
const mark = (pad) => {
  // viewBox 0..32; pad shrinks the drawing toward center for maskable safe-zone
  const s = 32
  const inset = pad // e.g. 0 for any, 4 for maskable
  const map = (v) => inset + (v / s) * (s - inset * 2)
  const L = (x1, y1, x2, y2) =>
    `<line x1="${map(x1)}" y1="${map(y1)}" x2="${map(x2)}" y2="${map(y2)}"/>`
  const C = (cx, cy) => `<circle cx="${map(cx)}" cy="${map(cy)}" r="${(3.2 / s) * (s - inset * 2)}"/>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="${pad ? 0 : 7}" fill="#0b1220"/>
  <g fill="none" stroke="#1f6bff" stroke-width="2" stroke-linecap="round">
    ${L(9, 9, 9, 23)}${L(9, 9, 23, 16)}${L(9, 23, 23, 16)}
  </g>
  <g fill="#4d8bff">
    ${C(9, 9)}${C(9, 23)}${C(23, 16)}
  </g>
</svg>`
}

const anySvg = Buffer.from(mark(0))
const maskSvg = Buffer.from(mark(4)) // safe-zone padding

const png = (svg, size) =>
  sharp(svg, { density: 512 }).resize(size, size, { fit: 'contain' }).png().toBuffer()

for (const size of [192, 256, 384, 512]) {
  await writeFile(path.join(iconsDir, `icon-${size}.png`), await png(anySvg, size))
}
await writeFile(path.join(iconsDir, 'maskable-512.png'), await png(maskSvg, 512))

console.log('icons written:', iconsDir)
