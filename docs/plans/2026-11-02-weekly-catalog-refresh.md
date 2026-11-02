# Weekly catalog refresh — 2026-11-02

Authorized recurring maintenance, using the existing free/public OpenNana source and Cloudflare release pipeline. No new source, search submission or GitHub Actions run is in scope.

## Baseline and evidence

- Clean `main` and fetched `origin/main`: `e767dff1abaca79a37c6611c5dd225b94a1b8e67`.
- Production source: `8dc0b84a645dfc1ba98da379179c81c86fb2ac6e`; dataset `ea7708682eb63dd8`, snapshot October 26, 18,142 cases and 52 search entrances.
- Digest-verified published shards and complete case data are backed up locally under `.cache/maintenance/2026-11-02/`. Do not replace this backup.
- Fresh complete manifest: 24,328 unique entries, 18,701 free candidates and 5,627 paid exclusions. The 305 additional free candidates are not yet counted as eligible imports.
- Initial health: 12 probes passed. Dependency audit: zero vulnerabilities. Existing CLI can read the deployed Worker version, 18,142 D1/FTS rows and the R2 ready marker.
- Google homepage remains indexed; Bing's already-notified login remains pending. Scoped Google weekly performance is sparse; do not infer growth from Worker requests or expand SEO entrances.

## Release gates

1. Refresh all expired public detail caches. Preserve resumable checkpoints; do not publish an incomplete acquisition.
2. Prepare the complete source snapshot with the existing importer. Check source access, full prompt text, public original citations, attribution, duplicate reconciliation and all shard digests.
3. Compare against the saved published cases. Preserve canonical IDs and curated order; inspect any removed case, changed original prompt, translation, author or citation before publication. Do not release solely to advance dates or engagement counters.
4. Prepare the versioned catalog metadata and storage. Seed the new R2 objects and D1/FTS rows, verify counts and ready marker, and confirm the previous release remains ready for rollback.
5. Run `npm run ci:build`; review only intended data/source changes. Push the validated source, then require native Cloudflare build success and matching live source SHA.
6. Verify the live bilingual catalog, representative new/retained cases, storage readiness and unchanged 52-entry search policy. Append evidence and publish the maintenance result only after actual verification.

If acquisition or validation fails, retain the last verified production release and record the precise failed gate. Do not deploy partial content, resubmit search URLs or remove rollback data.

## Completed acquisition and comparison

- Full refresh completed at `2026-11-02T03:27:04.133Z`: all 18,701 free details match manifest IDs/slugs, are unlocked and have full text; no missing or failed detail. Paid entries were not read.
- Candidate dataset `a3953d426135812f` contains 18,444 cases: 474 original and 17,970 OpenNana. There are 302 eligible additions, all image prompts with public X original-post references. Three new duplicates merge into their stable canonical records. Reconciliation excludes 694 duplicates and 37 records without eligible original references.
- Full comparison against the saved published dataset found no removed canonical IDs and no changed original text, translations, authors, primary citations, curated order or other substantive existing content. Six additional-source arrays have four reorder-only changes and two added citations; no citation was removed. All original 474 records are preserved.
- Initial versioned R2 upload completed the 46 content shards, then failed with a connection timeout before the large exports or D1 import. Existing shard sizes and MD5/ETags match. Missing exports are being recovered separately; storage readiness, build and publication remain mandatory gates. The active production dataset remains unchanged during preparation.

## Evidence-backed release tooling repair

- Large uncompressed export transport failed three ways: Node connect timeout, curl HTTP/2 framing error, then HTTP/1.1 reset. No production code switched during these attempts.
- Store complete exports as deterministic gzip objects and stream-decompress them to the unchanged public JSON/text URLs. Preserve legacy plain-object fallback and HEAD behavior. Add three focused stream/compatibility tests and three real local Worker/R2 export checks. Full decoded live SHA-256/byte counts are required after publication.
- The one-off D1 recovery import regenerates every catalog row from the new snapshot, copies 18,142 exactly unchanged indexed search texts within D1 and adds 302 new texts. Full input equality and complete SQLite/FTS5 import logic passed locally; require remote counts plus equality before writing the ready marker. Recovery SQL and credentials remain private/ignored. The regular seeder still uses its standard full import.
- Per the maintainer's new instruction, the existing automation is now weekly Monday 10:00 Asia/Shanghai, ACTIVE in this chat. Next run November 9; no duplicate automation was created. Notification scope is unchanged.

The first D1 recovery import hit the provider CPU limit. A read-only follow-up confirmed transaction rollback: the candidate had no rows and both previous releases retained their complete catalog/FTS counts. The corrected copy uses fixed 150-ID batches and indexed lookups rather than repeated sorting with OFFSET. SQLite query-plan and full fixture-import checks passed again before the changed import was attempted. Preserve both attempt logs and require remote verification.

## Pre-push verification

At `2026-11-02T04:20:16Z`, `npm run ci:build` exited 0: complete build/output validation, 32 tests, 20 real local Worker/Static Assets/R2 fixture checks and remote readiness passed. All 48 new R2 objects match size/MD5; D1 has 18,444 catalog and FTS rows, with all 18,142 prior indexed texts exactly equal. Both new and previous public readiness endpoints return 200/ready. The corrected import committed successfully; a later SSL error affected only a read-only verification call, so verification resumed without repeating the import. Native Cloudflare and post-release full export checks are still required before calling the release delivered.
