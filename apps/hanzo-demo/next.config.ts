import type { NextConfig } from 'next'

import { withCMS } from '@hanzo/cms-next/withPayload'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle so the image can run `node
  // apps/hanzo-demo/server.js` (exactly what the operator CR invokes) without
  // node_modules. In a pnpm monorepo the standalone lands at
  // .next/standalone/apps/hanzo-demo/server.js, so file-tracing must root at the
  // workspace, not the app dir, or the traced runtime misses workspace deps.
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  output: 'standalone',
  outputFileTracingRoot: path.resolve(dirname, '../..'),
  turbopack: {
    // Monorepo root (two levels up from apps/hanzo-demo). In this pnpm
    // isolated-linker workspace `next` is symlinked from the root .pnpm store,
    // so its realpath lives at <root>/node_modules/.pnpm/... — outside the app
    // dir. Turbopack refuses to resolve packages outside its root, so the root
    // MUST be the monorepo root or `next build` fails with "couldn't find the
    // Next.js package (next/package.json)".
    root: path.resolve(dirname, '../..'),
  },
  typescript: {
    // Matches the monorepo root next.config.mjs. In-workspace the @hanzo/cms*
    // packages resolve to their raw TS `src/` (via `exports`), so a `next build`
    // type-check would re-check the ENTIRE Payload source tree — unbounded and
    // redundant: every package already validates its own types via `build:types`
    // (tsc --emitDeclarationOnly) during `turbo build`. The app's own types are
    // checked there too. Leaving this on OOMs / runs for many minutes.
    ignoreBuildErrors: true,
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withCMS(nextConfig, { devBundleServerPackages: false })
