/** Lazy mermaid loader — heavy lib imported only on first render call. */
type MermaidApi = typeof import('mermaid')['default']

let mermaidPromise: Promise<MermaidApi> | null = null
let counter = 0

function preferDark(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches
}

async function getMermaid(): Promise<MermaidApi> {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then((m) => {
      const api = m.default
      api.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: preferDark() ? 'dark' : 'default',
        fontFamily: 'Inter Variable, system-ui, sans-serif',
        flowchart: { htmlLabels: true, curve: 'basis' },
      })
      return api
    })
  }
  return mermaidPromise
}

export interface RenderResult {
  svg: string
}

/** Validate + render mermaid code to SVG. Throws on syntax error (message = parser error). */
export async function renderMermaid(code: string): Promise<RenderResult> {
  const api = await getMermaid()
  await api.parse(code) // throws with a readable message on bad syntax
  const id = `dg-${Date.now()}-${counter++}`
  const { svg } = await api.render(id, code)
  return { svg }
}

/** Validate only. Returns null on ok, or the parser error message. */
export async function validateMermaid(code: string): Promise<string | null> {
  try {
    const api = await getMermaid()
    await api.parse(code)
    return null
  } catch (e) {
    return e instanceof Error ? e.message : String(e)
  }
}
