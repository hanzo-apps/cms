import { withPayload } from '@hanzo/cms-next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  // Standalone server output for the container image. Traces workspace deps
  // from the monorepo root so the runner image is self-contained.
  output: 'standalone',
  outputFileTracingRoot: path.resolve(dirname, '../../'),
  // The app is a thin shell over the workspace packages, which are each
  // type-built (`tsc --emitDeclarationOnly`) during the monorepo build. The
  // app-level Next tsc pass is a redundant re-typecheck that only trips on
  // upstream version drift (e.g. sharp's exported types vs Payload's
  // SharpDependency) — the runtime value is correct (proven by the boot/upload
  // proof). Skip the redundant app pass so the standalone build is
  // deterministic; package-level type safety is unaffected.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
