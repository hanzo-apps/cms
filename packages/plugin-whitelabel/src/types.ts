/**
 * A single brand definition for the white-label registry.
 *
 * Everything is optional: unset fields fall through to the brand-neutral
 * defaults that this fork already ships (no product name, abstract mark).
 */
export type Brand = {
  /**
   * Hostnames this brand owns. Matched against the request Host header
   * (exact or suffix). e.g. ['maxpower.hanzo.cms', 'cms.maxpower.co'].
   * The special value '*' makes this the fallback brand.
   */
  hostnames: string[]
  /** Import-map path to a Logo server component, e.g. '@myorg/brand/Logo'. */
  logo?: string
  /** Import-map path to an Icon server component. */
  icon?: string
  /** Human name, appended to admin page titles as "… — {name}". */
  name?: string
  /** Path to a favicon asset served by the app (e.g. '/brand/favicon.svg'). */
  favicon?: string
  /** Path to an OpenGraph share image. */
  ogImage?: string
  /**
   * CSS custom properties applied to :root, keyed WITHOUT the leading `--`.
   * e.g. { 'theme-elevation-1000': '#0b1220', 'color-success-500': '#12b76a' }.
   * Injected as a <style> tag so a brand can theme colors with zero rebuild.
   */
  theme?: Record<string, string>
}

export type WhiteLabelPluginConfig = {
  /** Set false to disable without unwiring the plugin. */
  enabled?: boolean
  /**
   * The brand registry. Order matters only for readability; resolution is by
   * hostname specificity (longest matching suffix wins, then '*').
   */
  brands: Brand[]
  /**
   * Env var holding the current request host when SSR can't read it directly.
   * Defaults to reading the standard Host/x-forwarded-host at request time.
   */
  hostEnvVar?: string
}
