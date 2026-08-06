/** Browser-only export helpers: SVG string -> download, SVG -> PNG blob. */

/** Ensure an SVG string carries width/height so canvas rasterization works. */
export function normalizeSvg(svg: string): string {
  let out = svg
  // mermaid often sets style max-width; strip so exported size is intrinsic
  out = out.replace(/style="[^"]*max-width:[^"]*"/i, '')
  return out
}

export function svgToBlob(svg: string): Blob {
  return new Blob([normalizeSvg(svg)], { type: 'image/svg+xml;charset=utf-8' })
}

/** Parse width/height from an SVG string; fall back to viewBox, then defaults. */
export function svgDimensions(svg: string): { w: number; h: number } {
  const wM = svg.match(/\bwidth="([\d.]+)(px)?"/i)
  const hM = svg.match(/\bheight="([\d.]+)(px)?"/i)
  let w = wM ? parseFloat(wM[1]) : NaN
  let h = hM ? parseFloat(hM[1]) : NaN
  if (!Number.isFinite(w) || !Number.isFinite(h)) {
    const vb = svg.match(/viewBox="([\d.\s-]+)"/i)
    if (vb) {
      const parts = vb[1].split(/\s+/).map(Number)
      if (parts.length === 4) {
        w = parts[2]
        h = parts[3]
      }
    }
  }
  if (!Number.isFinite(w) || w <= 0) w = 800
  if (!Number.isFinite(h) || h <= 0) h = 600
  return { w, h }
}

/** Rasterize an SVG string to a PNG Blob at the given scale. Browser only. */
export async function svgToPngBlob(svg: string, scale = 2, bg = '#ffffff'): Promise<Blob> {
  const norm = normalizeSvg(svg)
  const { w, h } = svgDimensions(norm)
  const url = URL.createObjectURL(new Blob([norm], { type: 'image/svg+xml;charset=utf-8' }))
  try {
    const img = new Image()
    img.decoding = 'async'
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('SVG failed to load for rasterization'))
      img.src = url
    })
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(w * scale))
    canvas.height = Math.max(1, Math.round(h * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context unavailable')
    if (bg) {
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG encode failed'))), 'image/png')
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}
