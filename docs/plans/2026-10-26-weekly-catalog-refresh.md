# Weekly catalog refresh and canonical preservation

The first authorized Monday refresh uses the existing public OpenNana source and the existing 52 collection entrances. It does not perform search submissions or expand the source/license boundary.

1. Verify the current live build, daily health, dependency audit and exact-site search/CLI metrics. Preserve the previous committed snapshot and release for comparison/rollback.
2. Acquire the complete source manifest and all eligible free details. Fail preparation on manifest count/ID inconsistencies; do not publish incomplete acquisition.
3. Reconcile against the published IDs, full prompts, translations, attribution, original citations and curated ordering. The initial local candidate exposed six existing URLs losing canonical status when source review ordering changed. Keep published records ahead of new duplicate candidates and verify that new-source ordering cannot displace existing canonical URLs.
4. Prepare complete versioned storage, verify D1/FTS counts and R2 readiness, then run the full build/test/real-hosting gates. Keep the previous dataset available for rollback.
5. Publish through Cloudflare Workers Builds, compare the exact deployed source and data release, then verify bilingual new-case HTML, original prompt/citation preservation, representative formerly displaced IDs, sitemap budget and read-only health. Record the final publication separately from indexation and traffic outcomes.

Growth evidence remains sparse: the exact-host Google report shows two impressions and no clicks through October 23, and the Bing report shows no clicks/impressions. These do not justify query-driven title expansion. Cloudflare CLI reports its first recorded beacons after the CSP repair; Worker invocations remain separate from visits. This run prioritizes the useful content delta and canonical preservation rather than inventing a growth result.
