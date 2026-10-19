# Operations

## Release

1. Edit source/data and preserve case IDs, original text and attribution.
2. Run `npm ci && npm run build && npm run check && npm test`.
3. Check desktop and mobile gallery, search, modal, workbench, a static detail and a category.
4. Commit and push; the Validate workflow must succeed.
5. Deploy with `npm run deploy`, or the Deploy Cloudflare workflow with the scoped `CLOUDFLARE_API_TOKEN` secret.
6. Check `https://prompt.genedai.me/build-info.json` against the intended commit and run `npm run verify:live`.
7. Submit changed canonical URLs to IndexNow, preserve the receipt, and submit sitemap changes through Google/Bing Webmaster properties as appropriate.

Cloudflare credentials are required only for deployment. They are not runtime application secrets. A short-lived local OAuth token must not be stored in GitHub Actions. The canonical site is lowercase HTTPS; workers.dev redirects to it. Preview URLs are disabled. `404.html` must stay a genuine 404.

## Search and agent discovery

Canonical sitemap: `https://prompt.genedai.me/sitemap.xml`. It contains all HTML pages and preview image URLs. It excludes query filters, API/data/Markdown alternates and 404s. Static HTML carries full prompt text and attribution; JSON-LD describes visible content. robots.txt allows crawlers and declares the sitemap. API/data/Markdown alternatives use `X-Robots-Tag: noindex, follow` to avoid duplicate search landing pages while remaining accessible to agents.

The Google domain property `sc-domain:genedai.me` can cover this subdomain if the signed-in owner has access; verify the current property before submission. Bing requires the exact site/property to exist or be imported. IndexNow accepts public key-file validation; a 200 is a receipt, 202 is pending key validation. Neither establishes indexing.

`docs/evidence/search-submissions.json` records real provider receipts and boundaries. Do not record dry runs as submissions. Do not repeatedly submit an unchanged sitemap or exact URL merely because indexing is pending. The project includes no automatic daily submission schedule.

## Rollback and troubleshooting

Use Cloudflare's deployment history to roll back to a previously validated version, or redeploy the previous Git commit in a separate checkout. Inspect DNS, TLS, custom-domain bindings and live build-info independently. Keep the production host canonical; do not let preview hosts become search duplicates.

Historical collection values are fixed snapshot data. Serving health, CI, deployment, sitemap submission, URL indexing requests, actual indexed pages, ranking and visitor outcomes must be reported separately.
