import { complete } from '@chirag127/oz-ai'
import { stripFences } from './templates'

const GEN_SYSTEM = `You are a Mermaid.js diagram generator. Given a plain-English description of a process, system, or relationship, output ONLY valid Mermaid diagram code. Pick the best diagram type (flowchart, sequenceDiagram, erDiagram, classDiagram, gantt, stateDiagram-v2). No prose, no markdown fences, no explanation. Just the raw mermaid code.`

const FIX_SYSTEM = `You are a Mermaid.js syntax fixer. The user gives broken Mermaid code and (optionally) the parser error. Output ONLY the corrected, valid Mermaid code. Preserve intent and node labels. No prose, no markdown fences.`

/** Plain English -> mermaid code. Throws only if all AI providers fail. */
export async function describeToMermaid(prompt: string, signal?: AbortSignal): Promise<string> {
  const out = await complete(prompt, { system: GEN_SYSTEM, signal })
  return stripFences(out)
}

/** Broken mermaid + error -> fixed mermaid. Throws only if all providers fail. */
export async function fixMermaid(code: string, error?: string, signal?: AbortSignal): Promise<string> {
  const prompt = error ? `Parser error:\n${error}\n\nCode:\n${code}` : code
  const out = await complete(prompt, { system: FIX_SYSTEM, signal })
  return stripFences(out)
}
