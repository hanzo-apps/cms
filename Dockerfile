# cms.hanzo.ai — @hanzo/cms (Hanzo headless CMS; MIT fork owned in-tree).
#
# The deployed image runs `node apps/hanzo-demo/server.js` (the operator CR's
# command). That server.js only exists from a Next standalone build, which in
# this pnpm monorepo lands at .next/standalone/apps/hanzo-demo/server.js. This
# multi-stage build produces exactly that, CGO-free, and copies the standalone
# tree + static assets into a slim runner.
#
# Built by Hanzo CI/platform (hanzoai/ci reads hanzo.yml), never on a dev box.
# pnpm is pinned to 10.27 (engines gate) via corepack.

# ---- deps + build ----------------------------------------------------------
FROM node:22-bookworm-slim AS builder
WORKDIR /app
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV NEXT_TELEMETRY_DISABLED=1
# Node heap headroom: in-workspace the @hanzo/cms* packages resolve to raw src,
# so the webpack build graph is large.
ENV NODE_OPTIONS=--max-old-space-size=8192
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate

# Whole workspace (Turbopack/webpack resolve @hanzo/cms* from src via workspace
# links; the app's next.config roots file-tracing at the workspace).
COPY . .
RUN pnpm install --frozen-lockfile
# Build every package's dist (types + entry points), then the app's standalone
# bundle (next build --webpack — Turbopack can't do the .js->.tsx workspace
# remap; see apps/hanzo-demo/next.config.ts).
RUN pnpm build:all
RUN pnpm --filter @hanzo/cms-demo build

# ---- runner ----------------------------------------------------------------
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs

# Next standalone output (monorepo layout: server.js is nested under the app
# path, and the traced node_modules ride alongside it at the workspace root).
COPY --from=builder --chown=nextjs:nodejs /app/apps/hanzo-demo/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/hanzo-demo/.next/static ./apps/hanzo-demo/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/hanzo-demo/public ./apps/hanzo-demo/public

USER nextjs
EXPOSE 3000
# Matches the operator CR command exactly: `node apps/hanzo-demo/server.js`.
CMD ["node", "apps/hanzo-demo/server.js"]
