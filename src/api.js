import catalog from '../data/catalog.json' with { type: 'json' };

export const ORIGIN = 'https://prompt.genedai.me';
const byId = new Map(catalog.cases.map(c => [c.id, c]));
export const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, HEAD, OPTIONS',
  'access-control-allow-headers': 'Accept, If-None-Match',
  'access-control-expose-headers': 'ETag, Link, X-Content-Snapshot, X-Content-Release',
};
const publicCase = c => ({ ...c, preview: ORIGIN + c.preview, markdownUrl: `${c.url}index.md` });
export function json(value, status = 200, extra = {}) {
  return new Response(JSON.stringify(value), {
    status, headers: { ...cors, 'content-type': 'application/json; charset=utf-8',
      'cache-control': status === 200 ? 'public, max-age=300' : 'no-store',
      'x-content-type-options': 'nosniff', 'x-content-snapshot': catalog.snapshotDate, ...extra },
  });
}
function integer(value, fallback, max) {
  if (value === null) return fallback;
  return /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) <= max ? Number(value) : null;
}
export function apiResponse(url) {
  const path = url.pathname;
  if (path === '/api/v1/categories') return json({ snapshotDate: catalog.snapshotDate,
    data: catalog.categories.map(c => ({ ...c, count: catalog.cases.filter(x => x.category === c.id).length, url: `${ORIGIN}/categories/${c.id}/` })) });
  if (path === '/api/v1/prompts') {
    const p = url.searchParams, limit = integer(p.get('limit'), 20, 100), offset = integer(p.get('offset'), 0, 100000);
    if (limit === null || limit < 1 || offset === null) return json({error:'limit must be 1–100; offset must be a non-negative integer.'}, 400);
    const q = (p.get('q') || '').trim().toLowerCase(), category = p.get('category'), model = p.get('model'), ref = p.get('requiresReference');
    if (q.length > 200) return json({error:'q must be at most 200 characters.'}, 400);
    if (category && !catalog.categories.some(c => c.id === category)) return json({error:'Unknown category. See /api/v1/categories.'}, 400);
    if (model && !['nano','gpt','other'].includes(model)) return json({error:'model must be nano, gpt or other.'}, 400);
    if (ref !== null && !['true','false'].includes(ref)) return json({error:'requiresReference must be true or false.'}, 400);
    const rows = catalog.cases.filter(c => (!category || c.category === category) && (!model || c.modelGroup === model)
      && (ref === null || c.requiresReference === (ref === 'true'))
      && (!q || [c.titleZh,c.titleOriginal,c.prompt,c.promptZh,c.notesZh,c.author,...c.tags].filter(Boolean).join(' ').toLowerCase().includes(q)));
    const nextUrl = offset + limit < rows.length ? new URL(url) : null;
    if (nextUrl) nextUrl.searchParams.set('offset', String(offset + limit));
    const next = nextUrl ? ORIGIN + nextUrl.pathname + nextUrl.search : null;
    return json({ snapshotDate:catalog.snapshotDate, total:rows.length, limit, offset, next,
      attribution:'Retain each case author, original source URL and source license. Third-party rights and exceptions apply.', data:rows.slice(offset,offset+limit).map(publicCase) },200,next?{link:`<${next}>; rel="next"`}:{});
  }
  const match = /^\/api\/v1\/prompts\/([a-zA-Z0-9-]+)$/.exec(path);
  if (match) return byId.has(match[1]) ? json({snapshotDate:catalog.snapshotDate,data:publicCase(byId.get(match[1]))}) : json({error:'Prompt not found.'},404);
  return json({error:'Endpoint not found.',documentation:ORIGIN+'/agents/',openapi:ORIGIN+'/openapi.json'},404);
}
