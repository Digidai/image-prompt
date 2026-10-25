# Evidence-backed maintenance backlog

Updated 2026-10-25. Preserve the 52 collection-only search entrances and public-source content boundary.

| Priority | Observation | Next action / completion evidence |
| --- | --- | --- |
| P1 | Bing Index: discovered/not crawled since 2026-10-20; native Live URL test on 2026-10-25 fetched HTTP 200, can be indexed, no SEO/GEO issues. | Monitor actual state; do not resubmit or claim an unspecified quality/scheduling cause is proven. Check official evidence before considering any further intervention. |
| P1 | Public directory synthetic first response measured 3,200 ms during diagnosis. | Verify deployment/locale-aware edge cache MISS then HIT and compare repeated response timings. These are not field Core Web Vitals. |
| P1 | Cloudflare injects a Web Analytics beacon, while the former script/connect CSP allowed only self. | Confirm documented beacon origins are permitted after publication; verify browser beacon response and distinguish collection from delayed dashboard reporting. |
| P2 | Upstream OpenNana list reports 23,954 items, versus the imported manifest's 23,657; this includes paid entries and is not a free-content delta. | First weekly maintenance run: refresh/reconcile the public manifest and complete eligible free details, then seed/verify storage before any catalog publication. Never infer that all 297 are eligible additions. |
| P2 | Source list metadata has no update/review timestamps; old detail cache checked only ID/slug. | Seven-day detail-cache expiry and optional update-marker checks prevent indefinite stale bodies. Verify full source reconciliation on the next weekly refresh. |
| P1 | Dependabot could not resolve the pinned build tool's vulnerable `undici` transitive dependency. | Exact `undici` 7.30.1 override; verify npm audit and the real Workers hosting checks. Retain security alerts and keep application CI on Cloudflare. |
| P2 | Existing Wrangler OAuth can read GraphQL metrics without a dashboard login. For 2026-10-24 Beijing time: 647 Worker requests, 0 script errors; exact-host RUM returned no recorded groups. | Use `node docs/tools/cloudflare-metrics.mjs`; Worker requests are not human PV/UV, and empty pre-repair RUM data is not zero visitors. Compare future complete-day beacon data after the CSP repair. |
| P2 | GSC domain Page indexing totals cannot establish subdomain counts. | Use URL inspection for actual homepage state and hostname-filtered performance for growth; report site-wide indexed counts as unknown until scoped data is available. |
