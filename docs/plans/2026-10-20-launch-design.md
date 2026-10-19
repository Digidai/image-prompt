# Image Prompt launch design

Build a public, attributed prompt library from the supplied Prompt Atlas HTML snapshot. Keep its editorial visual design, search, filters, favorites, copy and rewrite workbench. Publish to `https://prompt.genedai.me` from `Digidai/image-prompt`.

Use a dependency-light Node static generator and Cloudflare Workers Static Assets. A static single file would preserve the 33 MB transfer and weak crawling. A database-backed application adds operational cost without an editing requirement. Static pages plus a small read-only Worker API provide permanent URLs and portable data without accounts or a database.

Generate full HTML for 474 prompts, 22 categories, paginated directory, guide, sources, about and agent documentation. Keep source attribution, prompt text, reference-image requirements and snapshot boundaries. Code uses MIT; source content retains its upstream licenses and exceptions. Do not claim contemporary model versions, fresh popularity, commercial clearance or reproduction success.

SEO: canonical HTTPS lowercase host, real links, distinct titles/descriptions, social previews, JSON-LD WebSite/CollectionPage/CreativeWork/BreadcrumbList, image sitemap, XML sitemap, robots, static 404 and redirect coverage. GEO: complete prompt text, provenance, dates, limitations and citation-ready pages. Agent discovery: llms.txt/full, OpenAPI 3.1, agent manifest, JSON dataset, per-case Markdown, CORS-enabled paginated API with strict validation and no write endpoints.

Operations: pinned tooling, lockfile, meaningful API and output checks, CI, deploy script, live smoke, submission ledger and repeatable IndexNow submission. Deploy verified source, then submit sitemap to authenticated Google and Bing properties, and IndexNow. Submission receipts and actual indexing are separate outcomes. Never commit credentials.
