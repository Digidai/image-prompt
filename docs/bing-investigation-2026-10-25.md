# Bing indexing investigation — 2026-10-25

## Finding

Bing has discovered the exact canonical homepage but has not yet added it to the index. In the authenticated native Live URL test, Bing itself fetched the homepage with **HTTP 200**, reported **URL can be indexed by Bing**, and found **No SEO/GEO issues**. The fetched document contains index/follow, the exact self canonical, source-linked server-rendered HTML, Chinese language metadata and reciprocal English links. Robots permits crawling and the sitemap contains exactly 52 collection entrances.

There is no demonstrated current homepage fetch, robots, canonical or noindex blocker. Bing does not expose a specific scheduling/quality decision explaining the remaining wait. The site launched approximately five days before this investigation; age and syndicated-content/quality evaluation are possibilities, not established causes. Do not claim that a technical repair has made Bing index the site. [Bing's indexing guidance](https://www.bing.com/webmasters/help/why-is-my-site-not-in-the-index-2141dfab) explains that discovery/submission still requires crawling and assessment.

Bing's markup-insights panel returned a service loading error, so that panel does not independently confirm or reject the structured data. Local output validation parses the JSON-LD. Synthetic user-agent requests also return 200, but are weaker evidence than Bing's native fetch. Cloudflare's local OAuth could not read zone settings/custom-rule configuration; historical firewall interception has not been ruled out. No firewall or bot exceptions were added.

## Repairs and maintenance

- The real browser beacon request was blocked with `blockedReason: csp`. The Worker CSP now permits only the documented Cloudflare Analytics script/connect HTTPS origins, while retaining the inline-script prohibition. Chinese and English privacy notices now disclose the existing analytics integration. Collection configuration is distinct from observed visits; pre-repair RUM is empty and does not prove zero visitors.
- Catalog directory requests originally included a 3,200 ms first sample. Public directory HTML now has a five-minute Cloudflare cache isolated by deployment version, data release and language. Query/authorization/Range/HEAD fills, Markdown, errors and cookie-bearing responses cannot populate this directory cache. Warm responses are checked independently; timings are synthetic, not field Core Web Vitals.
- The source importer previously trusted ID/slug matches indefinitely. It now refreshes expired detail caches after seven days and detects source update/review markers when supplied. Upstream listing metadata currently has no such markers, so expiry is necessary. The source count increased from 23,657 to 23,954, but paid/non-public/duplicate exclusions mean 297 cannot be called eligible additions. Weekly reconciliation will determine the actual delta.
- The native Dependabot updater failed resolving a pinned development-tool dependency. An exact `undici` 7.30.1 override addresses its three reported advisory paths without downgrading Wrangler. Audit status, real local hosting checks and native publication are recorded in the final receipt. Security alerts remain enabled.
- The existing daily 10:00 Asia/Shanghai heartbeat now performs health checks, direct tested repairs, weekly eligible-source updates, dependency review and measured improvements to existing entrances and flows. It stays quiet for healthy/no-change runs. Index completion ends only that watch, not product maintenance.

## CLI/API operations

Cloudflare operations no longer require a dashboard login. Existing Wrangler credentials can read GraphQL Analytics, Worker deployment history and the live build identity. `node docs/tools/cloudflare-metrics.mjs` records the previous complete Beijing day, distinguishes Worker requests from human visits, and scopes RUM to the exact hostname. For 2026-10-24 Beijing time, the provider returned 647 Worker invocations and zero script errors, with no recorded exact-host RUM groups. PV, UV and organic growth remain unproven.

Metrics and catalog seeding reuse `wrangler auth token --json`, which selects/refreshes the existing local profile without logging its secret output. A unique private R2 maintenance probe was written, read back identically and deleted successfully; a D1 query also succeeded. The active dataset was untouched. This verifies actual CLI resource access rather than leaving future content publication dependent on an unconfigured manual token.

Application CI remains on Cloudflare Workers Builds. Repository GitHub Actions is disabled. Provider checks are read through the GitHub API using app `cloudflare-workers-and-pages`; this does not run GitHub application CI. GitHub's separate Dependabot security service can still create its own update diagnostics.

There were **zero** Google/Bing indexing requests, Sitemap resubmissions or IndexNow submissions during this work. The `listing-landings-v1` 52-URL boundary, dataset release `465e0259274b1b15`, case IDs, original prompts and source rights are preserved. See `docs/evidence/bing-diagnosis-2026-10-25.json` for publication, validation and local evidence checksums.

## Verified publication

Final source `2b3ed991bc740b651aa8cd56053cf14cd7f819fa` was published by native Cloudflare build `3be7b217-75fd-4cbf-a544-83c46859a2b3`. Active version `3d74bdb7-484e-434e-9572-5049fc6223f6` receives 100% of traffic and live build-info matches the exact source. Local validation passed 25 tests and 13 real hosting checks plus remote release readiness; independent production validation passed 52 checks and all 12 crawler-health probes. Documentation-only closeout commits may be ahead of this deployed source and do not republish the site.
