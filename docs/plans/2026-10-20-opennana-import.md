# OpenNana expansion

The source reports 23,657 entries: 18,142 free and 5,515 paid. The maintainer confirmed full redistribution authorization on 2026-10-20. Source access remains separate: the public paid endpoint returns zero prompt texts and `is_unlocked: false`. The maintainer narrowed scope to free full text with a public original-source citation. Exclude paid entries entirely, and exclude entries without public original sources. Never unlock or bypass restrictions.

Keep existing case URLs. Deduplicate exact substantial prompts and preserve additional source citations. Do not identify source collection counts as independent works. Preserve model labels, full language variants, author/original post, source item dates, media type, original image URLs, and reference requirements; distinguish unknown requirements and unavailable text.

Use bounded, resumable public API acquisition with retry/rate-limit handling. Checkpoint raw permitted fields privately under .cache/. Publish normalized source snapshots in compressed, reviewable-count shards with content digests and a reconciliation report.

The original 474-case static site remains a fallback. Add versioned D1 catalog/search and private R2 content shards; original source-hosted preview URLs, served through explicit read-only Worker routes. This avoids a huge Worker bundle, browser full-catalog download and per-version static asset limit. Complete dynamic HTML and Markdown remain crawlable; Paid and non-public entries are omitted entirely. Search uses SQL bindings and FTS with Chinese bigram indexing. The frontend fetches bounded result pages and fetches complete details when opening/copying a case.

Release order: complete acquisition and reconciliation, prepare versioned R2/D1 data, seed and verify remote storage, validate UI and APIs, then switch the Worker to that exact dataset version. Preserve initial search receipts, submit newly indexable canonical URLs after live verification, and leave same-day Google homepage quota retry to the authorized October 21 monitor.
