# @hanzo/cms-demo — the Content service (cms.hanzo.ai)

Brand-neutral headless CMS on the unified Hanzo stack. This app IS the deployed
`cms` service (`ghcr.io/hanzoai/cms`). Payload fork, wired to Hanzo primitives.

## What it is (real, proven — no stubs)
- **DATA**: Base/SQLite (libsql) via `@hanzo/cms-db-sqlite`, one DB per org on a
  block volume. `org == IAM org == tenant` (the multi-tenant plugin scopes every
  row; the ONE tenancy).
- **MEDIA**: SeaweedFS (`hanzoai/s3`) via `@hanzo/cms-storage-s3`, bucket
  `hanzo-cms`, per-org key prefix. A real upload lands as a real S3 object.
- **AUTH**: Hanzo IAM SSO only (`disableLocalStrategy`). Two strategies:
  - `hanzoIAMStrategy` — Bearer IAM token verified via JWKS (API / M2M).
  - `hanzoProxyStrategy` — same-origin console embed. The console proxy has
    verified the IAM session and injects `x-org-id` (== IAM org) + `x-actor-id`
    + `x-hanzo-proxy-secret` (== `HANZO_PROXY_SECRET`, KMS). Fail-secure:
    disabled unless the secret is set; a header alone never authenticates.
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
  (KMS-synced: `PAYLOAD_SECRET`, `HANZO_PROXY_SECRET`, S3 creds). Route
  `cms.hanzo.ai` via the Traefik file provider.
