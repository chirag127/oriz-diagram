import sharp from 'sharp'
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b1220"/>
      <stop offset="1" stop-color="#111c33"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="#1c2b47" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <g transform="translate(96,150)">
    <g fill="none" stroke="#1f6bff" stroke-width="6">
      <line x1="30" y1="30" x2="30" y2="150"/>
      <line x1="30" y1="30" x2="180" y2="90"/>
      <line x1="30" y1="150" x2="180" y2="90"/>
    </g>
    <g fill="#4d8bff">
      <circle cx="30" cy="30" r="16"/>
      <circle cx="30" cy="150" r="16"/>
      <circle cx="180" cy="90" r="16"/>
    </g>
  </g>
  <text x="96" y="400" font-family="Inter, Segoe UI, sans-serif" font-size="78" font-weight="800" fill="#f4f7fc" letter-spacing="-2">Draw with text.</text>
  <text x="96" y="490" font-family="Inter, Segoe UI, sans-serif" font-size="78" font-weight="800" fill="#1f6bff" letter-spacing="-2">Ship SVG &amp; PNG.</text>
  <text x="96" y="560" font-family="JetBrains Mono, monospace" font-size="30" fill="#9fb2ce">oriz.in/diagram — free Mermaid editor · no signup</text>
</svg>`
await sharp(Buffer.from(svg)).png().toFile('public/og.png')
console.log('og.png written')
