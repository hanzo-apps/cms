'use client'

/**
 * Minimal global error boundary. Overrides Next's auto-generated `/_global-error`
 * so its static prerender does not pull the Payload server config into the error
 * page module graph (which fails at build time). A global-error must render its
 * own <html>/<body> because it replaces the root layout when it fires.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body
        style={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'system-ui, sans-serif',
          gap: '1rem',
          justifyContent: 'center',
          minHeight: '100vh',
          margin: 0,
        }}
      >
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Something went wrong</h1>
        {error?.digest ? (
          <p style={{ color: '#888', fontSize: '0.875rem' }}>Ref: {error.digest}</p>
        ) : null}
        <button
          onClick={() => reset()}
          style={{
            border: '1px solid currentColor',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            padding: '0.5rem 1rem',
          }}
          type="button"
        >
          Try again
        </button>
      </body>
    </html>
  )
}
