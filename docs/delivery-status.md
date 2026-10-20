# Delivery status

Launch date: **2026-10-20, Asia/Shanghai**. Public site: **https://prompt.genedai.me/**. Public repository: **https://github.com/Digidai/image-prompt**.

## OpenNana expansion — dataset validated, release in progress

- Authorization: maintainer confirmed redistribution permission, then limited scope to free full prompts with public original-source citations. Paid content and non-public/missing-source entries are excluded.
- Complete acquisition: **18,142 / 18,142 free details**, zero failed downloads. Source manifest: 23,657 total; 5,515 paid excluded.
- Added **17,418 unique cases**: 16,826 image prompts and 592 video prompts. Reconciled 687 duplicates and 37 exclusions (36 missing valid public original sources; one profile without an original-post reference). Total catalog: **17,892 cases**. One malformed source URL wrapper was repaired without inventing a new source.
- Preserved original text/language variants, authors, original source citations, collection links, source model labels, image/video URLs and notes. Unknown reference requirements remain null. Entry dates are OpenNana creation dates, not original-post dates. Original creator rights remain; no MIT/CC relabeling.
- Added versioned D1 search and private R2 content/complete exports, bounded frontend pagination, Chinese bigram/character and English prefix search, image/video filters, full server-rendered HTML and Markdown. Existing case URLs remain stable.
- Dataset release: `465e0259274b1b15`. Committed shards pass SHA-256 verification. Full reconciliation, 18,902 canonical URLs, 517 static pages and all 17,418 dynamic case renders passed output validation; eleven SQLite/API/Worker tests passed. Browser checks covered Chinese results, 36→72 pagination, full prompts, public attribution, persisted favorites and 390 px overflow.
- A non-published Worker version upload verified the existing deployment credential can bind the D1 and R2 resources. Remote storage seeding completed: 47 content/export objects plus a ready marker, 17,892 D1 rows and 17,892 FTS rows verified. A pre-deploy readiness check prevents switching code before its dataset is ready. Production verification receipts will be appended after deployment.
- Source previews remain on the source media host; outages can affect images. Source citations do not independently establish authorship, present link accessibility or reproduction results.

## Original launch (historical)

- Imported 474 cases across 22 categories from the supplied Prompt Atlas snapshot (2026-10-19). Original file SHA-256 and transformations are in `data/import.json`.
- Published 516 canonical HTML pages and 474 Markdown alternates. Cases include full prompts, source translations where available, original authors, original posts, reference-image requirements and source-specific licenses.
- Preserved search, filters, local favorites, copy, rewrite workbench, grid/list views and progressive loading. Added static details, category navigation, paginated directory, guide, sources, about/privacy and agent documentation.
- Code is MIT. Imported prompts/images/source translations retain upstream licenses and exceptions. Original source license texts are archived in `licenses/`; see THIRD_PARTY_NOTICES.md.

## Infrastructure and verification

- Cloudflare Worker `image-prompt`, custom domain `prompt.genedai.me`, HTTPS and lowercase canonical host. HTTP redirects to HTTPS; workers.dev redirects to the canonical; unknown pages return real 404s.
- Content-hashed WebP previews, cached assets, security headers, strict script CSP, bounded read-only CORS API, security alerts and updates, secret-scanning push protection and private vulnerability reporting.
- Tooling is locked; official GitHub actions are pinned to verified release commits; the runner is pinned to Ubuntu 24.04. GitHub Actions validates and deploys production using the verified repository secret.
- Output validation: 516 pages, 1,540 JSON-LD blocks, 20,078 internal links, 474 complete prompts and image attributions. Homepage HTML is about 59 KiB.
- Six API/Worker tests passed. Desktop/mobile tests covered search, empty state, reset, favorites, modal, Escape, workbench, list/grid, progressive loading, and no-JavaScript HTML. Production overflow checks passed at 320, 390, 768 and 1440 px.
- 24 live checks passed. Googlebot, bingbot, GPTBot, OAI-SearchBot, ChatGPT-User, Claude-SearchBot and PerplexityBot user-agent smoke requests returned 200 without a challenge. These are access tests, not independent crawler visits.
- The strict CSP blocks optional Cloudflare-injected analytics and inline challenge JavaScript; these produce platform policy messages in the browser console. The application module, gallery and static pages work. No permissive inline-script exception was added.

## SEO, GEO and agent access

- Canonical metadata, individual descriptions, Open Graph/Twitter cards, breadcrumbs, WebSite/CollectionPage/CreativeWork JSON-LD, XML/image sitemap, robots and full source-linked text.
- `/llms.txt`, `/llms-full.txt`, `/openapi.json`, `/.well-known/agent.json`, complete `/data/catalog.json`, per-case Markdown and `Accept: text/markdown` negotiation with `Vary: Accept`.
- Public API: `/api/v1/prompts`, `/api/v1/prompts/{id}` and `/api/v1/categories`. Validated query/category/model/reference filters, limits, pagination, CORS, GET/HEAD/OPTIONS and 405 for mutations.

## Actual search submission results

| Provider | Observed result | Boundary |
| --- | --- | --- |
| Google Search Console | Domain property `sc-domain:genedai.me`; sitemap processed successfully; **516 pages discovered** | Discovery is not individual page indexation |
| Bing Webmaster Tools | Exact subdomain verified with HTML meta tag; sitemap **Success**, **516 URLs discovered**, 0 errors and 0 warnings | Sitemap success is not individual page indexation |
| IndexNow | Initial key verification was pending; subsequent request returned **HTTP 200 accepted for 516 canonical URLs** | Acceptance is not crawl/index/rank/traffic proof |
| Google homepage URL indexing request | **Quota Exceeded**; the daily account quota prevented processing this separate request | No successful `requested` receipt. Do not retry the same day; the sitemap remains successfully processed |

The homepage was not yet indexed at the initial URL Inspection. No rankings, traffic or AI citations are claimed. Provider receipts are preserved in `docs/evidence/search-submissions.json`; verification is recorded in `docs/evidence/verification.json`. No redundant same-day GSC request was made. A separately authorized local thread heartbeat now starts on **2026-10-21 10:00 Asia/Shanghai** to retry the homepage request once quota allows and monitor actual Google/Bing indexation. It stays quiet when the state is unchanged or waiting, and reports meaningful results or required action.

## Original launch receipts

Production source commit: `b6adcfc5250c402105d069116a8725b36f723ba3`, confirmed by live build-info. [Validate](https://github.com/Digidai/image-prompt/actions/runs/39288070566) and [Deploy Cloudflare](https://github.com/Digidai/image-prompt/actions/runs/39288070563) both succeeded, including 24 production smoke checks. Detailed receipts are in `docs/evidence/verification.json`. The initial CI deployment credential did not have access to the new Worker; it was replaced with an existing verified deployment credential, and the complete CI deployment succeeded. Tokens are not committed. Documentation-only closeout commits may be ahead of the deployed source commit; they do not change site content or require repeated search submissions.
