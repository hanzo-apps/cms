import React from 'react'

/**
 * Brand-neutral default icon (nav sidebar home button, breadcrumb, OG route).
 *
 * No product mark. Adopters override via `admin.components.graphics.Icon`, or
 * the white-label resolver (@hanzo/cms-plugin-whitelabel) supplies one by
 * domain. Export name and `fill` prop are retained for API compatibility.
 */
export const CMSIcon: React.FC<{
  fill?: string
}> = ({ fill: fillFromProps }) => {
  const fill = fillFromProps || 'var(--theme-elevation-1000)'

  return (
    <svg
      className="graphic-icon"
      height="100%"
      viewBox="0 0 25 25"
      width="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* abstract content glyph — a rounded square with stacked lines */}
      <rect fill={fill} height="21" rx="5" width="21" x="2" y="2" />
      <rect fill="var(--theme-base-0, #fff)" height="2.4" rx="1.2" width="12" x="6.5" y="7.5" />
      <rect fill="var(--theme-base-0, #fff)" height="2.4" rx="1.2" width="12" x="6.5" y="11.3" />
      <rect fill="var(--theme-base-0, #fff)" height="2.4" rx="1.2" width="7.5" x="6.5" y="15.1" />
    </svg>
  )
}
