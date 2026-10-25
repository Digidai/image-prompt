# Evidence-backed maintenance backlog

Updated 2026-10-25. Preserve the 52 collection-only search entrances and public-source content boundary.

| Priority | Observation | Next action / completion evidence |
| --- | --- | --- |
| P1 | Bing Index: discovered/not crawled since 2026-10-20; native Live URL test on 2026-10-25 fetched HTTP 200, can be indexed, no SEO/GEO issues. | Monitor actual state; do not resubmit or claim an unspecified quality/scheduling cause is proven. Check official evidence before considering any further intervention. |
| P1 | Public directory synthetic first response measured 3,200 ms during diagnosis. | Verify deployment/locale-aware edge cache MISS then HIT and compare repeated response timings. These are not field Core Web Vitals. |
| P1 | Cloudflare injects a Web Analytics beacon, while the former script/connect CSP allowed only self. | Confirm documented beacon origins are permitted after publication; verify browser beacon response and distinguish collection from delayed dashboard reporting. |
| P2 | Upstream OpenNana list reports 23,954 items, versus the imported manifest's 23,657; this includes paid entries and is not a free-content delta. | First weekly maintenance run: refresh/reconcile the public manifest and complete eligible free details, then seed/verify storage before any catalog publication. Never infer that all 297 are eligible additions. |
| P2 | Source list metadata has no update/review timestamps; old detail cache checked only ID/slug. | Seven-day detail-cache expiry and optional update-marker checks prevent indefinite stale bodies. Verify full source reconciliation on the next weekly refresh. |
| P2 | Cloudflare web dashboard session is signed out; local Wrangler OAuth remains valid. | Read genuine hostname-scoped traffic when a web session is available; do not invent a baseline or copy OAuth credentials into a browser/build environment. |
| P2 | GSC domain Page indexing totals cannot establish subdomain counts. | Use URL inspection for actual homepage state and hostname-filtered performance for growth; report site-wide indexed counts as unknown until scoped data is available. |
