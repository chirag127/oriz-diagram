import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { downloadBlob, onDropZone, readAsText } from '@chirag127/oz-file'
import { TEMPLATES, slugForFile, type Template } from '../lib/templates'
import { svgToBlob, svgToPngBlob } from '../lib/export'

type Status = 'idle' | 'rendering' | 'ok' | 'error'
type AiTask = null | 'generate' | 'fix'

const STORAGE_KEY = 'oriz-diagram:code'

export default function Editor() {
  const [code, setCode] = useState<string>(TEMPLATES[0].code)
  const [svg, setSvg] = useState<string>('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string>('')
  const [libLoading, setLibLoading] = useState(false)
  const [activeTpl, setActiveTpl] = useState<string>(TEMPLATES[0].id)
  const [aiTask, setAiTask] = useState<AiTask>(null)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiOpen, setAiOpen] = useState(false)
  const [aiError, setAiError] = useState('')
  const [zoom, setZoom] = useState(1)

  const previewRef = useRef<HTMLDivElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // restore last code
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setCode(saved)
        setActiveTpl('')
      }
    } catch {
      /* ignore */
    }
  }, [])

  const loadedRef = useRef(false)

  const render = useCallback(async (src: string) => {
    if (!src.trim()) {
      setSvg('')
      setStatus('idle')
      setError('')
      return
    }
    setStatus('rendering')
    if (!loadedRef.current) setLibLoading(true)
    try {
      const { renderMermaid } = await import('../lib/mermaid')
      loadedRef.current = true
      setLibLoading(false)
      const res = await renderMermaid(src)
      setSvg(res.svg)
      setStatus('ok')
      setError('')
    } catch (e) {
      setLibLoading(false)
      setStatus('error')
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [])

  // debounced live render
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      render(code)
      try {
        localStorage.setItem(STORAGE_KEY, code)
      } catch {
        /* ignore quota */
      }
    }, 350)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [code, render])

  // drag-drop .mmd / .txt files onto preview
  useEffect(() => {
    const el = dropRef.current
    if (!el) return
    return onDropZone(el, async (files) => {
      const f = files[0]
      if (!f) return
      const text = await readAsText(f)
      setCode(text)
      setActiveTpl('')
    })
  }, [])

  const pickTemplate = (t: Template) => {
    setCode(t.code)
    setActiveTpl(t.id)
  }

  const exportSvg = () => {
    if (!svg) return
    downloadBlob(svgToBlob(svg), `${slugForFile(code)}.svg`)
  }

  const exportPng = async () => {
    if (!svg) return
    try {
      const blob = await svgToPngBlob(svg, 2)
      downloadBlob(blob, `${slugForFile(code)}.png`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'PNG export failed')
    }
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      /* clipboard blocked */
    }
  }

  const startGenerate = () => {
    setAiOpen(true)
    setAiError('')
  }

  const submitGenerate = async () => {
    if (!aiPrompt.trim()) return
    setAiTask('generate')
    setAiError('')
    const controller = new AbortController()
    try {
      const { describeToMermaid } = await import('../lib/ai')
      const out = await describeToMermaid(aiPrompt.trim(), controller.signal)
      if (out.trim()) {
        setCode(out.trim())
        setActiveTpl('')
        setAiOpen(false)
      }
    } catch {
      setAiError('AI unavailable right now (all providers busy). Core editor still works — edit manually.')
    } finally {
      setAiTask(null)
    }
  }

  const startFix = async () => {
    setAiTask('fix')
    setAiError('')
    const controller = new AbortController()
    try {
      const { fixMermaid } = await import('../lib/ai')
      const out = await fixMermaid(code, error || undefined, controller.signal)
      if (out.trim()) setCode(out.trim())
    } catch {
      setAiError('AI unavailable right now (all providers busy). Edit manually.')
    } finally {
      setAiTask(null)
    }
  }

  const lineCount = useMemo(() => code.split('\n').length, [code])

  return (
    <section className="dg-editor">
      <div className="dg-toolbar" role="toolbar" aria-label="Templates and actions">
        <div className="dg-templates" role="group" aria-label="Diagram templates">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`dg-chip${activeTpl === t.id ? ' dg-chip--active' : ''}`}
              aria-pressed={activeTpl === t.id}
              onClick={() => pickTemplate(t)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="dg-actions">
          <button type="button" className="dg-btn" onClick={startGenerate}>
            <span aria-hidden>✦</span> AI: describe
          </button>
          <button
            type="button"
            className="dg-btn"
            onClick={startFix}
            disabled={aiTask === 'fix' || status !== 'error'}
            title="Ask AI to fix the current syntax error"
          >
            {aiTask === 'fix' ? 'Fixing…' : 'AI: fix syntax'}
          </button>
          <button type="button" className="dg-btn" onClick={copyCode}>Copy code</button>
          <button type="button" className="dg-btn" onClick={exportSvg} disabled={!svg}>Export SVG</button>
          <button type="button" className="dg-btn dg-btn--primary" onClick={exportPng} disabled={!svg}>Export PNG</button>
        </div>
      </div>

      {aiOpen && (
        <div className="dg-ai-panel dg-panel">
          <label htmlFor="dg-ai-prompt" className="dg-ai-label">
            Describe your process in plain English — AI writes the Mermaid for you
          </label>
          <div className="dg-ai-row">
            <textarea
              id="dg-ai-prompt"
              className="dg-ai-input"
              rows={2}
              placeholder="e.g. User signs up, verifies email, then can log in; if verification fails, retry up to 3 times"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <div className="dg-ai-buttons">
              <button
                type="button"
                className="dg-btn dg-btn--primary"
                onClick={submitGenerate}
                disabled={aiTask === 'generate' || !aiPrompt.trim()}
              >
                {aiTask === 'generate' ? 'Thinking…' : 'Generate'}
              </button>
              <button type="button" className="dg-btn" onClick={() => setAiOpen(false)}>Close</button>
            </div>
          </div>
          <p className="dg-ai-note">AI is optional polish. If providers are down, keep editing by hand — nothing breaks.</p>
        </div>
      )}
      {aiError && <p className="dg-ai-error" role="status">{aiError}</p>}

      <div className="dg-split">
        <div className="dg-pane dg-panel">
          <div className="dg-pane-head">
            <span className="dg-node-badge">code</span>
            <span className="dg-pane-meta">{lineCount} lines</span>
          </div>
          <textarea
            className="dg-code-input"
            spellCheck={false}
            value={code}
            onChange={(e) => {
              setCode(e.target.value)
              setActiveTpl('')
            }}
            aria-label="Mermaid diagram source"
          />
        </div>

        <div className="dg-pane dg-panel" ref={dropRef}>
          <div className="dg-pane-head">
            <span className="dg-node-badge">preview</span>
            <span className="dg-pane-meta" aria-live="polite">
              {status === 'rendering' ? 'rendering…' : status === 'error' ? 'error' : status === 'ok' ? 'valid' : 'ready'}
            </span>
            <span className="dg-zoom">
              <button type="button" className="dg-icon-btn" onClick={() => setZoom((z) => Math.max(0.25, +(z - 0.25).toFixed(2)))} aria-label="Zoom out">−</button>
              <span className="dg-zoom-val">{Math.round(zoom * 100)}%</span>
              <button type="button" className="dg-icon-btn" onClick={() => setZoom((z) => Math.min(4, +(z + 0.25).toFixed(2)))} aria-label="Zoom in">+</button>
            </span>
          </div>

          <div className="dg-preview-wrap">
            {libLoading && (
              <div className="dg-loading">
                <span className="dg-spinner" aria-hidden />
                Loading renderer… (~loads once)
              </div>
            )}
            {status === 'error' && !libLoading && (
              <div className="dg-error-box" role="alert">
                <strong>Syntax error</strong>
                <pre>{error}</pre>
                <p>Fix the code, pick a template, or hit <em>AI: fix syntax</em>.</p>
              </div>
            )}
            {status !== 'error' && !svg && !libLoading && (
              <div className="dg-empty">
                <p className="dg-empty-title">Drop a <code>.mmd</code> file or start typing</p>
                <p>Live preview renders as you type. Pick a template above to begin.</p>
              </div>
            )}
            {svg && status !== 'error' && (
              <div
                ref={previewRef}
                className="dg-preview"
                style={{ transform: `scale(${zoom})` }}
                // mermaid output is sanitized (securityLevel: 'strict')
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
