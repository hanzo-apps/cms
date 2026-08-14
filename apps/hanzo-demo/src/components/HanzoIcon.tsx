/**
 * The Hanzo house mark, for the admin nav header.
 *
 * Path data is copied verbatim from @hanzo/logo (dist/logo-mono.svg) — the mark
 * is drawn once there and only ever copied, never redrawn. `currentColor` is
 * what makes one file serve both themes: the admin flips its foreground and the
 * mark follows, instead of needing a light and a dark copy that can drift.
 */
export const HanzoIcon = () => (
  <svg
    aria-label="Hanzo"
    fill="currentColor"
    height={24}
    role="img"
    viewBox="0 0 67 67"
    width={24}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M22.21 67V44.6369H0V67H22.21Z" />
    <path d="M66.7038 22.3184H22.2534L0.0878906 44.6367H44.4634L66.7038 22.3184Z" />
    <path d="M22.21 0H0V22.3184H22.21V0Z" />
    <path d="M66.7198 0H44.5098V22.3184H66.7198V0Z" />
    <path d="M66.7198 67V44.6369H44.5098V67H66.7198Z" />
  </svg>
)
