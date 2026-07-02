# @hanzo/cms demo (Content service) — production image.
# Monorepo build: context is the repo root; Next.js standalone output.
# Build:  --dockerfile=apps/hanzo-demo/Dockerfile  (context = git repo root)
#
# glibc (bookworm-slim), NOT alpine: @libsql/client + sharp ship prebuilt
# glibc binaries; musl would force a slow/native rebuild.

FROM node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

# ---- deps: full workspace install (turbo needs the whole graph) ------------
FROM base AS deps
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY . .
RUN pnpm install --frozen-lockfile

# ---- build: build the app + every workspace package it depends on ---------
FROM deps AS builder
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PAYLOAD_DISABLE_ADMIN=false
# turbo `...` builds all workspace deps of the app in order, then the app.
RUN pnpm turbo build --filter="@hanzo/cms-demo..."

# ---- runner: standalone server only --------------------------------------
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

# Standalone output is rooted at the monorepo root (outputFileTracingRoot).
COPY --from=builder --chown=nextjs:nodejs /app/apps/hanzo-demo/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/hanzo-demo/.next/static ./apps/hanzo-demo/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/hanzo-demo/public ./apps/hanzo-demo/public

# Per-org SQLite lives on a writable volume mounted at /data.
# DATABASE_URI is set per-deployment (e.g. file:/data/${org}.db) via the CR env.
RUN mkdir -p /data && chown nextjs:nodejs /data

USER nextjs
EXPOSE 3000
CMD ["node", "apps/hanzo-demo/server.js"]
