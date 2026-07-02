# @hanzo/cms-demo — the Content service (cms.hanzo.ai)

Brand-neutral headless CMS on the unified Hanzo stack. This app IS the deployed
`cms` service (`ghcr.io/hanzoai/cms`). Payload fork, wired to Hanzo primitives.

## What it is (real, proven — no stubs)

- **DATA**: Base/SQLite (libsql) via `@hanzo/cms-db-sqlite`, one DB per org on a
  block volume. `org == IAM org == tenant` (the multi-tenant plugin scopes every
  row; the ONE tenancy).
- **MEDIA**: SeaweedFS (`hanzoai/s3`) via `@hanzo/cms-storage-s3`, bucket
  `hanzo-cms`, per-org key prefix. A real upload lands as a real S3 object.
- **AUTH**: Hanzo IAM SSO only (`disableLocalStrategy` — no native signup). ONE
  identity path:
  - `hanzoIAMStrategy` — a Bearer IAM token verified via JWKS (signature +
    issuer + expiry, optionally `aud` via `HANZO_IAM_AUDIENCE`). The tenant is
    taken ONLY from the cryptographically-verified `owner` claim — never a
    request header — and the multi-tenant plugin scopes every read/write to it.
  - There is deliberately NO header-trust proxy strategy. A prior
    `hanzoProxyStrategy` derived the org from an `x-org-id` header gated only by
    a shared `HANZO_PROXY_SECRET`; over the public ingress that let any
    secret-holder set `x-org-id=<any org>` and read that org's content/media —
    a cross-tenant disclosure (RED CRITICAL). Removed: identity is proven by a
    signed token, full stop.
- **PUBLISH**: Payload-native versions/drafts — draft → publish.
- **BRAND**: white-label by hostname (`@hanzo/cms-plugin-whitelabel`); neutral
  when no brand matches. No Hanzo hardcode.

## Acceptance proof

`scripts/proof.ts` (headless, Local API) proves all five legs. Verified live:
boot on Base/SQLite; a real 70-byte object at `hanzo-cms/proofco/…`; a real IAM
token (Dave / org=maxpower) verified via JWKS with a negative control;
draft→publish (versions 0→1); per-org isolation.

    HANZO_ORG=proofco S3_ENDPOINT=… S3_ACCESS_KEY_ID=… S3_SECRET_ACCESS_KEY=… \
    IAM_TOKEN=<real IAM token> node --import tsx scripts/proof.ts

## Build / deploy

- Image: `ghcr.io/hanzoai/cms:<semver>` — arcd/Kaniko (BuildKit) on-cluster,
  context `github.com/hanzoai/cms.git#<branch>`, `apps/hanzo-demo/Dockerfile`.
- Next 16 standalone. **Build with webpack** (`next build --webpack`): Next 16
  defaults to Turbopack, which ignores the webpack `extensionAlias` the Payload
  monorepo relies on to resolve workspace packages from `src`.
- next pinned `16.2.10+` (16.2.3 has a `/_global-error` prerender
  `workStore` invariant).
- Deploy operator-native: `services.hanzo.ai/cms` (universe
  `infra/k8s/operator/crs/cms.yaml`). PVC `cms-app-db`, secret `cms-secrets`
  (KMS-synced: `PAYLOAD_SECRET`, S3 creds). `HANZO_PROXY_SECRET` is retired —
  the header-trust strategy it gated was removed (cross-tenant disclosure).
  Route `cms.hanzo.ai` via the Traefik file provider.
