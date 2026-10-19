# Delivery status

Launch date: **2026-10-20, Asia/Shanghai**. Public site: **https://prompt.genedai.me/**. Public repository: **https://github.com/Digidai/image-prompt**.

## Published product

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

The homepage was not yet indexed at the initial URL Inspection. No rankings, traffic or AI citations are claimed. Provider receipts are preserved in `docs/evidence/search-submissions.json`; verification is recorded in `docs/evidence/verification.json`. No recurring submission automation or redundant same-day GSC request was created.

## Release receipts

Production source commit: `b6adcfc5250c402105d069116a8725b36f723ba3`, confirmed by live build-info. [Validate](https://github.com/Digidai/image-prompt/actions/runs/39288070566) and [Deploy Cloudflare](https://github.com/Digidai/image-prompt/actions/runs/39288070563) both succeeded, including 24 production smoke checks. Detailed receipts are in `docs/evidence/verification.json`. The initial CI deployment credential did not have access to the new Worker; it was replaced with an existing verified deployment credential, and the complete CI deployment succeeded. Tokens are not committed. Documentation-only closeout commits may be ahead of the deployed source commit; they do not change site content or require repeated search submissions.
