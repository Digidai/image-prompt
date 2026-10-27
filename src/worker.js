import catalog from '../data/catalog.json' with { type: 'json' };
import {catalogApi,meta} from './catalog-api.js';
import {dynamicResponse} from './render-catalog.js';
import {language,stripLocale} from './i18n.js';
import { ORIGIN, apiResponse, cors, json } from './api.js';
import {cachedListing} from './listing-cache.js';
const prebuiltListings=new Set(['/prompts/','/en/prompts/','/categories/opennana/','/en/categories/opennana/']);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url),locale=language(url.pathname),normalized=new URL(url);normalized.pathname=stripLocale(url.pathname);
    // Keep preview and workers.dev hosts out of the canonical search index.
    if (!['localhost','127.0.0.1','prompt.genedai.me'].includes(url.hostname)) {
      url.protocol='https:';url.hostname='prompt.genedai.me';url.port='';
      return Response.redirect(url.href,308);
    }
    let response;
    if (url.pathname.startsWith('/api/')) {
      if (request.method === 'OPTIONS') return new Response(null,{status:204,headers:cors});
      if (!['GET','HEAD'].includes(request.method)) return json({error:'Read-only API. Use GET or HEAD.'},405,{allow:'GET, HEAD, OPTIONS'});
      try{response=env.CATALOG?await catalogApi(url,env):apiResponse(url);}catch{response=json({error:'Catalog temporarily unavailable. Please retry.'},503,{'retry-after':'30'});}
    } else {
      if (!['GET','HEAD'].includes(request.method)) return new Response('Method not allowed',{status:405,headers:{allow:'GET, HEAD'}});
      if(prebuiltListings.has(url.pathname)){
        try{const built=await env.ASSETS.fetch(request);
          if((built.status===200&&built.headers.get('content-type')?.includes('text/html'))||built.status===304){const h=new Headers(built.headers);h.set('x-catalog-cache','STATIC');h.set('cache-control','public, max-age=300');response=new Response(built.body,{status:built.status,headers:h});}
          else await built.body?.cancel();
        }catch{} // Keep the existing dynamic path available if an asset is missing.
      }
      if(!response&&env.CATALOG&&env.CONTENT){try{response=await cachedListing(request,env,ctx,()=>dynamicResponse(new Request(normalized,request),env,locale),meta.releaseId);}catch{response=new Response('Catalog temporarily unavailable',{status:503,headers:{'retry-after':'30'}});}}
      // Optional content negotiation complements permanent .md and JSON links.
      if(!response&&locale==='en'&&normalized.pathname.endsWith('/index.md'))response=await env.ASSETS.fetch(new Request(normalized,request));
      if (!response && request.headers.get('accept')?.includes('text/markdown') && /^\/prompts\/[a-zA-Z0-9-]+\/$/.test(normalized.pathname)) {
        normalized.pathname+='index.md';
        response=await env.ASSETS.fetch(new Request(normalized,request));
      } else if(!response) response=await env.ASSETS.fetch(request);
      if(locale==='en'&&response.status===404&&response.headers.get('content-type')?.includes('text/html')){const error=await env.ASSETS.fetch(new Request(new URL('/en/404/',url),request));response=new Response(error.body,{status:404,headers:error.headers});}
    }
    const headers=new Headers(response.headers);
    if (/^\/(?:en\/)?prompts\/[a-zA-Z0-9-]+\/(index\.md)?$/.test(url.pathname)) headers.set('vary','Accept');
    headers.set('x-content-type-options','nosniff');
    headers.set('referrer-policy','strict-origin-when-cross-origin');
    headers.set('x-frame-options','DENY');
    headers.set('permissions-policy','camera=(), microphone=(), geolocation=(), payment=()');
    headers.set('strict-transport-security','max-age=31536000');
    headers.set('x-content-snapshot',env.CATALOG?meta.snapshotDate:catalog.snapshotDate);
    if(env.CATALOG)headers.set('x-content-release',meta.releaseId);
    if (headers.get('content-type')?.includes('text/html')) {
      headers.set('content-security-policy',"default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://cloudflareinsights.com; media-src 'self' https:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'");
      headers.append('link',`<${ORIGIN}/llms.txt>; rel="describedby"; type="text/plain"`);
      // Filter/sort URLs are useful to humans but do not create new index targets.
      if (url.search) headers.set('x-robots-tag','noindex, follow');
    } else if (headers.get('content-type')?.includes('text/markdown') || /\.(json|md)$/.test(url.pathname) || url.pathname.startsWith('/api/') || url.pathname.startsWith('/llms')) {
      headers.set('x-robots-tag','noindex, follow');
    }
    if (/\.[a-f0-9]{12}\./.test(url.pathname) || /-[a-f0-9]{12}\.webp$/.test(url.pathname)) headers.set('cache-control','public, max-age=31536000, immutable');
    if (request.method==='HEAD') return new Response(null,{status:response.status,headers});
    return new Response(response.body,{status:response.status,headers});
  },
};
