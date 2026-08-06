import { describe, it, expect } from 'vitest'
import { normalizeSvg, svgDimensions } from '../src/lib/export'

describe('normalizeSvg', () => {
  it('strips a max-width style so intrinsic size wins', () => {
    const svg = '<svg style="max-width: 100px; color: red" width="200" height="100"></svg>'
    expect(normalizeSvg(svg)).not.toMatch(/max-width/)
  })
  it('leaves clean svg untouched', () => {
    const svg = '<svg width="200" height="100"></svg>'
    expect(normalizeSvg(svg)).toBe(svg)
  })
})

describe('svgDimensions', () => {
  it('reads width/height attrs', () => {
    expect(svgDimensions('<svg width="640" height="480"></svg>')).toEqual({ w: 640, h: 480 })
  })
  it('reads px-suffixed dimensions', () => {
    expect(svgDimensions('<svg width="320px" height="240px"></svg>')).toEqual({ w: 320, h: 240 })
  })
  it('falls back to viewBox', () => {
    expect(svgDimensions('<svg viewBox="0 0 800 600"></svg>')).toEqual({ w: 800, h: 600 })
  })
  it('defaults when nothing parses', () => {
    expect(svgDimensions('<svg></svg>')).toEqual({ w: 800, h: 600 })
  })
})
