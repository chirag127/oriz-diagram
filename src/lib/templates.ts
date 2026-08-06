export interface Template {
  id: string
  label: string
  kind: 'flowchart' | 'sequence' | 'er' | 'gantt' | 'class'
  code: string
}

export const TEMPLATES: Template[] = [
  {
    id: 'flowchart',
    label: 'Flowchart',
    kind: 'flowchart',
    code: `flowchart TD
    A([Start]) --> B{Input valid?}
    B -- Yes --> C[Process data]
    B -- No --> D[Show error]
    C --> E[(Save result)]
    D --> F([End])
    E --> F`,
  },
  {
    id: 'sequence',
    label: 'Sequence',
    kind: 'sequence',
    code: `sequenceDiagram
    participant U as User
    participant A as App
    participant S as Server
    U->>A: Click export
    A->>S: POST /render
    S-->>A: 200 SVG
    A-->>U: Download file`,
  },
  {
    id: 'er',
    label: 'ER diagram',
    kind: 'er',
    code: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE_ITEM : contains
    PRODUCT ||--o{ LINE_ITEM : "listed in"
    CUSTOMER {
        int id PK
        string name
        string email
    }
    ORDER {
        int id PK
        date created
    }`,
  },
  {
    id: 'gantt',
    label: 'Gantt',
    kind: 'gantt',
    code: `gantt
    title Project timeline
    dateFormat YYYY-MM-DD
    section Design
    Research      :done,    r1, 2026-01-01, 5d
    Wireframes    :active,  w1, after r1, 4d
    section Build
    Implement     :         b1, after w1, 10d
    QA            :         q1, after b1, 5d`,
  },
  {
    id: 'class',
    label: 'Class',
    kind: 'class',
    code: `classDiagram
    class Shape {
      +String id
      +area() float
    }
    class Circle {
      +float radius
      +area() float
    }
    class Rect {
      +float w
      +float h
      +area() float
    }
    Shape <|-- Circle
    Shape <|-- Rect`,
  },
]

export function templateById(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id)
}

/** First non-empty line's diagram keyword, lowercased. '' if none. */
export function diagramKind(code: string): string {
  const line = code
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 0 && !l.startsWith('%%'))
  if (!line) return ''
  const first = line.split(/\s+/)[0]?.toLowerCase() ?? ''
  // flowchart accepts `graph` or `flowchart`
  return first
}

const KNOWN_HEADERS = [
  'graph',
  'flowchart',
  'sequencediagram',
  'classdiagram',
  'statediagram',
  'statediagram-v2',
  'erdiagram',
  'gantt',
  'pie',
  'journey',
  'gitgraph',
  'mindmap',
  'timeline',
  'quadrantchart',
  'requirementdiagram',
  'c4context',
]

/** Cheap client-side sanity check before handing to mermaid.parse. */
export function looksLikeMermaid(code: string): boolean {
  const kind = diagramKind(code)
  if (!kind) return false
  return KNOWN_HEADERS.includes(kind)
}

/** Strip ```mermaid fences an LLM may wrap around code. */
export function stripFences(text: string): string {
  const t = text.trim()
  const fence = t.match(/^```(?:mermaid)?\s*\n([\s\S]*?)\n```$/i)
  if (fence?.[1]) return fence[1].trim()
  return t
}

export function slugForFile(code: string): string {
  const kind = diagramKind(code) || 'diagram'
  const clean = kind.replace(/[^a-z0-9]/gi, '') || 'diagram'
  return `oriz-${clean}`
}
