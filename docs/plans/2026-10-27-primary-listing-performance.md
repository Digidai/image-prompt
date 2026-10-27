# Remove storage waits from primary collection entrances

The October 27 health probe reproduced a 6,686 ms cold `/prompts/` response. Earlier runs measured 2.7–4.2 s cold responses while warm cache hits were much faster. These client samples do not identify a Bing blocker or establish field Core Web Vitals.

The four first-page collection entrances in Chinese and English are fixed by the committed catalog snapshot. Their current render path nevertheless counts/selects D1 rows and hydrates multi-megabyte R2 shards before rendering, even though those exact rows and counts are available during the build. The original shard is 2.63 MB; the first expansion shard is 4.86 MB uncompressed.

1. Capture the current four live pages, IDs, language, canonical and timings.
2. Pre-render only these four existing entrances with the same directory renderer, current total, case order, absolute previews and locale transformation. Include them in static output validation without adding browsable/search URLs or changing catalog dates.
3. Serve their verified HTML through the existing Static Assets binding, retaining security headers, GET/HEAD, query noindex and a dynamic fallback if the asset is unavailable. Later pagination, APIs, details, exports and the versioned directory cache retain their existing paths.
4. Verify all four entrances in a real local Worker with unseeded local D1/R2, proving that normal first-page delivery no longer depends on those resources. Compare build output to the previous visible card IDs/counts and verify dynamic fallback separately.
5. Run the full build/hosting/readiness gates, publish through Cloudflare, compare exact live source, and validate the four routes plus normal live/crawler checks. Report deployment and measured synthetic timing separately from indexing or traffic outcomes.

Content remains release `ea7708682eb63dd8`, snapshot October 26, 18,142 cases and 52 search entrances. No indexing, sitemap or IndexNow submission is part of this change.
