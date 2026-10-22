# Operations

## Cloudflare release pipeline

GitHub stores the source. Repository GitHub Actions is disabled and the old workflow files are removed. Cloudflare Workers Builds is the production build/deploy provider for `Digidai/image-prompt`, branch `main`, existing Worker `image-prompt` in the Gene Dai account.

1. Edit source/data and preserve IDs, complete source text and attribution. Seed and verify any new D1/R2 content release first.
2. Validate locally with `npm run ci:build`. It runs build/output validation, unit/API tests, real local Workers/Static Assets checks and remote dataset readiness. The hosting check itself uses isolated local storage and no production data or credentials.
3. Push source changes to `main`. Cloudflare uses Node.js 22 from `.node-version`, runs build command `npm ci && npm run ci:build`, then deploy command `npm run ci:deploy` using an existing Cloudflare-managed build token. `SKIP_DEPENDENCY_INSTALL=1` avoids a separate automatic dependency install before `npm ci`.
4. The deploy command publishes with Wrangler and runs production checks. `WORKERS_CI_COMMIT_SHA` is embedded in `build-info.json` and compared with the live source commit. A healthy older deployment cannot satisfy the release check. Do not report queued/running builds as published.
5. Check the Cloudflare build log, active Worker version, live `build-info.json` and sitemap independently. Documentation/evidence-only commits can be excluded from build watch paths and remain ahead of the live source SHA.
6. Search promotion uses only the 52 approved collection entrances. Do not repeat accepted submissions for an infrastructure-only release. The homepage already has a successful Google `requested` receipt; its daily monitor is now read-only.

Local manual publication remains available via `npm run deploy`, using the existing local Wrangler login, followed by `npm run verify:live`. Never copy short-lived OAuth credentials into hosted build environments. Resource bindings serve production D1/R2; the build token is not a runtime application secret. The canonical site is lowercase HTTPS; workers.dev redirects to it, preview builds are disabled and unknown URLs must return genuine localized 404 bodies. See [the CI audit](ci-audit.md) for historical causes and the provider migration receipt.

## Search and agent discovery

Canonical sitemap: `https://prompt.genedai.me/sitemap.xml`. The `listing-landings-v1` policy promotes only **52 Chinese/English collection entrances**: homepage, prompt directory first page, category index and the first page of each of the 23 categories. Individual case details, later pagination pages, guide/about/source/agent documentation, query filters, API/data/Markdown alternates and 404s are excluded from both the sitemap and IndexNow. Case-image sitemap entries are removed as well. `dist/url-list.json` is this same allowlist; `dist/route-list.json` is the complete browsable route registry for link validation, never a search submission input. Build checks, a hard 52-URL budget, tests and production checks enforce the boundary. Adding a category beyond that budget requires deliberately reviewing the policy. Server-rendered HTML carries full prompt text and attribution; JSON-LD describes visible content. robots.txt allows crawlers and declares the sitemap. API/data/Markdown alternatives use `X-Robots-Tag: noindex, follow` to avoid duplicate search landing pages while remaining accessible to agents.

Details and later list pages remain accessible through the site with their existing canonical URLs and robots directives. This is a submission-scope change, not an index-removal request. Historical acceptance receipts remain intact; removing a URL from a sitemap does not establish that it has left an index. Google describes sitemap submission as a hint, not a crawl or indexing guarantee: [official sitemap documentation](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

The Google domain property `sc-domain:genedai.me` can cover this subdomain if the signed-in owner has access; verify the current property before submission. Bing requires the exact site/property to exist or be imported. IndexNow accepts public key-file validation; a 200 is a receipt, 202 is pending key validation. Neither establishes indexing.

`docs/evidence/search-submissions.json` records real provider receipts and boundaries. Do not record dry runs as submissions. Do not repeatedly submit an unchanged sitemap or exact URL merely because indexing is pending. There is no recurring bulk submission job; the separately authorized homepage retry/monitor is described below.

## Rollback and troubleshooting

Use Cloudflare's deployment history to roll back to a previously validated version, or redeploy the previous Git commit in a separate checkout. Inspect DNS, TLS, custom-domain bindings and live build-info independently. Keep the production host canonical; do not let preview hosts become search duplicates.

Historical collection values are fixed snapshot data. Serving health, CI, deployment, sitemap submission, URL indexing requests, actual indexed pages, ranking and visitor outcomes must be reported separately.

## OpenNana catalog releases

Only free, unlocked full prompts with attributed public original sources are in scope. Never add paid metadata-only placeholders or use unlock endpoints. The source importer uses public GET requests with bounded concurrency, retries and resumable private checkpoints. `source:prepare` requires the complete free manifest; an explicitly partial local development snapshot cannot pass the normal release gate.

Committed compressed snapshots are verified against SHA-256 digests. `catalog:prepare` generates the matching metadata and SQLite import. Seed private R2 content shards and D1 search rows for the new release before pushing/deploying code. The active release ID is embedded in the Worker; the Cloudflare build pipeline checks `/api/v1/releases/{releaseId}` before switching code, and the seeder writes its ready marker only after verifying D1/FTS counts and completing content uploads. The first migration uses the committed verified storage receipt because the previous static Worker has no readiness endpoint; search and content keys are version-specific. Old versions retain their content for rollback. Do not delete old data until its rollback retention is deliberately retired.

`node scripts/seed-catalog.mjs` requires an authorized Cloudflare API token with D1 write/import and R2 object write access. Local Wrangler OAuth may be used within its existing local session, never copied into a hosted build environment. The deployment token can bind existing D1/R2 resources without database management privileges; actual Worker version upload was tested separately from production publication. Production serving uses the bindings, not that token.

For local UI testing, `npm run catalog:prepare && npm run build && npm run preview` uses in-memory SQLite and committed content with no Cloudflare credential. `wrangler dev` instead requires locally populated D1/R2 resources. The original static pages remain available, but the expansion, global directory, search and complete streamed exports need the catalog bindings.

The thread heartbeat begins on 2026-10-21 at 10:00 Asia/Shanghai. It retries the homepage Google indexing request only when no successful request receipt exists, then reads actual Google/Bing index states. It stays quiet for unchanged waiting states and records only reliable observations. This monitor is distinct from site content deployment and does not repeatedly submit the sitemap or IndexNow.
