import type { Brand } from './types.js'

/**
 * Pick the brand for a given host. Longest matching hostname suffix wins;
 * '*' is the fallback. Returns `undefined` when nothing matches and no '*'
 * fallback exists — callers then use the brand-neutral defaults.
 */
export const resolveBrand = (brands: Brand[], host?: null | string): Brand | undefined => {
  const normalized = ((host || '').toLowerCase().split(':')[0] || '').trim()

  let best: Brand | undefined
  let bestLen = -1
  let fallback: Brand | undefined

  for (const brand of brands) {
    for (const hn of brand.hostnames) {
      if (hn === '*') {
        fallback = fallback ?? brand
        continue
      }
      const h = hn.toLowerCase()
      const matches = normalized === h || normalized.endsWith(`.${h}`)
      if (matches && h.length > bestLen) {
        best = brand
        bestLen = h.length
      }
    }
  }

  return best ?? fallback
}

/**
 * Serialize a brand's theme map into a CSS string for a <style> tag.
 * Keys are CSS custom-property names without the leading `--`.
 */
export const brandThemeCSS = (brand?: Brand): string => {
  if (!brand?.theme || Object.keys(brand.theme).length === 0) {
    return ''
  }
  const decls = Object.entries(brand.theme)
    .map(([k, v]) => `  --${k}: ${v};`)
    .join('\n')
  return `:root {\n${decls}\n}\n`
}
