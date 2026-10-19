import catalog from '../data/catalog.json' with { type: 'json' };
import { ORIGIN, apiResponse, cors, json } from './api.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // Keep preview and workers.dev hosts out of the canonical search index.
    if (!['localhost','127.0.0.1','prompt.genedai.me'].includes(url.hostname)) {
      url.protocol='https:';url.hostname='prompt.genedai.me';url.port='';
      return Response.redirect(url.href,308);
    }
    let response;
    if (url.pathname.startsWith('/api/')) {
      if (request.method === 'OPTIONS') return new Response(null,{status:204,headers:cors});
      if (!['GET','HEAD'].includes(request.method)) return json({error:'Read-only API. Use GET or HEAD.'},405,{allow:'GET, HEAD, OPTIONS'});
      response=apiResponse(url);
    } else {
      if (!['GET','HEAD'].includes(request.method)) return new Response('Method not allowed',{status:405,headers:{allow:'GET, HEAD'}});
      // Optional content negotiation complements permanent .md and JSON links.
      if (request.headers.get('accept')?.includes('text/markdown') && /^\/prompts\/[a-zA-Z0-9-]+\/$/.test(url.pathname)) {
        url.pathname+='index.md';
        response=await env.ASSETS.fetch(new Request(url,request));
      } else response=await env.ASSETS.fetch(request);
    }
    const headers=new Headers(response.headers);
    if (/^\/prompts\/[a-zA-Z0-9-]+\/(index\.md)?$/.test(url.pathname)) headers.set('vary','Accept');
    headers.set('x-content-type-options','nosniff');
    headers.set('referrer-policy','strict-origin-when-cross-origin');
    headers.set('x-frame-options','DENY');
    headers.set('permissions-policy','camera=(), microphone=(), geolocation=(), payment=()');
    headers.set('strict-transport-security','max-age=31536000');
    headers.set('x-content-snapshot',catalog.snapshotDate);
    if (headers.get('content-type')?.includes('text/html')) {
      headers.set('content-security-policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'");
      headers.append('link',`<${ORIGIN}/llms.txt>; rel="describedby"; type="text/plain"`);
      // Filter/sort URLs are useful to humans but do not create new index targets.
      if (url.search) headers.set('x-robots-tag','noindex, follow');
    } else if (/\.(json|md)$/.test(url.pathname) || url.pathname.startsWith('/api/')) {
      headers.set('x-robots-tag','noindex, follow');
    }
    if (/\.[a-f0-9]{12}\./.test(url.pathname) || /-[a-f0-9]{12}\.webp$/.test(url.pathname)) headers.set('cache-control','public, max-age=31536000, immutable');
    if (request.method==='HEAD') return new Response(null,{status:response.status,headers});
    return new Response(response.body,{status:response.status,headers});
  },
};
