import { describe, it, expect } from 'vitest'
import {
  TEMPLATES,
  templateById,
  diagramKind,
  looksLikeMermaid,
  stripFences,
  slugForFile,
} from '../src/lib/templates'

describe('TEMPLATES', () => {
  it('ships all five diagram kinds', () => {
    const kinds = TEMPLATES.map((t) => t.kind).sort()
    expect(kinds).toEqual(['class', 'er', 'flowchart', 'gantt', 'sequence'])
  })

  it('every template body is recognized as mermaid', () => {
    for (const t of TEMPLATES) expect(looksLikeMermaid(t.code)).toBe(true)
  })

  it('templateById resolves and misses', () => {
    expect(templateById('gantt')?.kind).toBe('gantt')
    expect(templateById('nope')).toBeUndefined()
  })
})

describe('diagramKind', () => {
  it('reads the first non-empty, non-comment line keyword', () => {
    expect(diagramKind('flowchart TD\nA-->B')).toBe('flowchart')
    expect(diagramKind('%% comment\n\nsequenceDiagram\nA->>B: hi')).toBe('sequencediagram')
    expect(diagramKind('   \n  graph LR')).toBe('graph')
  })
  it('empty on blank', () => {
    expect(diagramKind('   \n\n')).toBe('')
  })
})

describe('looksLikeMermaid', () => {
  it('accepts graph + flowchart + erDiagram', () => {
    expect(looksLikeMermaid('graph TD\nA-->B')).toBe(true)
    expect(looksLikeMermaid('erDiagram\nA ||--o{ B : x')).toBe(true)
  })
  it('rejects prose', () => {
    expect(looksLikeMermaid('hello world this is not a diagram')).toBe(false)
    expect(looksLikeMermaid('')).toBe(false)
  })
})

describe('stripFences', () => {
  it('strips ```mermaid fences', () => {
    expect(stripFences('```mermaid\nflowchart TD\nA-->B\n```')).toBe('flowchart TD\nA-->B')
  })
  it('strips bare ``` fences', () => {
    expect(stripFences('```\ngraph LR\nX-->Y\n```')).toBe('graph LR\nX-->Y')
  })
  it('passes through unfenced text', () => {
    expect(stripFences('  flowchart TD\nA-->B  ')).toBe('flowchart TD\nA-->B')
  })
})

describe('slugForFile', () => {
  it('derives a safe filename slug from the kind', () => {
    expect(slugForFile('flowchart TD\nA-->B')).toBe('oriz-flowchart')
    expect(slugForFile('sequenceDiagram\nA->>B: x')).toBe('oriz-sequencediagram')
  })
  it('falls back to diagram on empty', () => {
    expect(slugForFile('')).toBe('oriz-diagram')
  })
})
