import React from 'react'

/**
 * Brand-neutral default logo.
 *
 * This fork ships NO product wordmark in the admin chrome. The default is an
 * abstract, letter-free content mark that reads as a placeholder for ANY brand.
 * Adopters set their own logo via `admin.components.graphics.Logo`, or let the
 * white-label resolver (@hanzo/cms-plugin-whitelabel) pick one by domain.
 *
 * The exported symbol name is retained for API compatibility with the wiring in
 * `@hanzo/cms-next` (packages/next/src/elements/Logo). Only what it RENDERS is
 * neutral.
 */
const css = `
  .graphic-logo .cms-logo-mark { fill: var(--theme-elevation-1000); }
  .graphic-logo .cms-logo-mark--muted { fill: var(--theme-elevation-400); }
`

export const CMSLogo: React.FC = () => (
  <svg
    className="graphic-logo"
    fill="none"
    height="40"
    viewBox="0 0 40 40"
    width="40"
    xmlns="http://www.w3.org/2000/svg"
  >
    <style>{css}</style>
    {/* abstract "stacked content" mark — no letters, no brand */}
    <rect className="cms-logo-mark" height="7" rx="2" width="30" x="5" y="6" />
    <rect className="cms-logo-mark--muted" height="7" rx="2" width="30" x="5" y="16.5" />
    <rect className="cms-logo-mark" height="7" rx="2" width="18" x="5" y="27" />
  </svg>
)
