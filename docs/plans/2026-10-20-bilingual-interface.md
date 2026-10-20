# Chinese and English interface

Use Chinese as the default and an English /en/ counterpart for every HTML landing page. The language switch preserves the current path, query filters and anchor, and stores the user's preference locally. Browser favorites keep the same storage key and stable case IDs across languages.

Localize navigation, categories, filters, counts, empty/error/toast states, modal/workbench controls, accessibility labels, guide, source policy and agent documentation. Source titles, author names and full prompt text retain their original language; existing English source prompt variants remain preferred. Do not machine-translate or mutate the source dataset.

English pages have self-canonicals and reciprocal zh-CN/en/x-default alternate links. Full English interface HTML is served before JavaScript. Dynamic D1 pages use the same locale layer; API and complete source downloads remain language-neutral. Add both HTML language variants to sitemap discovery. Data release 465e0259274b1b15 stays unchanged because this is an interface release.

Validate locale routes, canonical/alternate pairs, literal prompt preservation, language-neutral API/Markdown, search/filter restoration, remembered language and favorites, desktop/mobile layout, local/CI and exact production commit. Submit only new English URLs after live verification. Preserve prior indexing receipts and the October 21 homepage monitor.
