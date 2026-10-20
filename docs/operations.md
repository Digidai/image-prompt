# Operations

## Release

1. Edit source/data and preserve case IDs, original text and attribution.
2. Run `npm ci && npm run build && npm run check && npm test`.
3. Check desktop and mobile gallery, search, modal, workbench, a static detail and a category.
4. Commit and push; the Validate workflow must succeed.
5. Deploy with `npm run deploy`, or the Deploy Cloudflare workflow with the scoped `CLOUDFLARE_API_TOKEN` secret.
6. Check `https://prompt.genedai.me/build-info.json` against the intended commit and run `npm run verify:live`.
7. Run the IndexNow dry run against the approved listing entrances only. Submit only newly approved entrances without prior acceptance receipts, preserve the receipt, and use the existing Google/Bing sitemap registration. Never turn the full route registry into a submission queue.

Cloudflare credentials are required only for deployment. They are not runtime application secrets. A short-lived local OAuth token must not be stored in GitHub Actions. The canonical site is lowercase HTTPS; workers.dev redirects to it. Preview URLs are disabled. `404.html` must stay a genuine 404.

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

Committed compressed snapshots are verified against SHA-256 digests. `catalog:prepare` generates the matching metadata and SQLite import. Seed private R2 content shards and D1 search rows for the new release before pushing/deploying code. The active release ID is embedded in the Worker; the deploy workflow checks `/api/v1/releases/{releaseId}` before switching code, and the seeder writes its ready marker only after verifying D1/FTS counts and completing content uploads. The first migration uses the committed verified storage receipt because the previous static Worker has no readiness endpoint; search and content keys are version-specific. Old versions retain their content for rollback. Do not delete old data until its rollback retention is deliberately retired.

`node scripts/seed-catalog.mjs` requires an authorized Cloudflare API token with D1 write/import and R2 object write access. Local Wrangler OAuth may be used within its existing local session, never copied into GitHub Actions. The deployment token can bind existing D1/R2 resources without database management privileges; actual Worker version upload was tested separately from production publication. Production serving uses the bindings, not that token.

For local UI testing, `npm run catalog:prepare && npm run build && npm run preview` uses in-memory SQLite and committed content with no Cloudflare credential. `wrangler dev` instead requires locally populated D1/R2 resources. The original static pages remain available, but the expansion, global directory, search and complete streamed exports need the catalog bindings.

The thread heartbeat begins on 2026-10-21 at 10:00 Asia/Shanghai. It retries the homepage Google indexing request only when no successful request receipt exists, then reads actual Google/Bing index states. It stays quiet for unchanged waiting states and records only reliable observations. This monitor is distinct from site content deployment and does not repeatedly submit the sitemap or IndexNow.
