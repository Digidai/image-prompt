// Only public directory HTML is shared. Every deployment and content release
// gets a separate namespace, including independent Chinese and English paths.
export async function cachedListing(request,env,ctx,load,releaseId,cache=globalThis.caches?.default){
 const url=new URL(request.url),version=env.CF_VERSION_METADATA?.id;
 if(!cache||!version||!ctx?.waitUntil||request.method!=='GET'||url.search||request.headers.has('authorization')||request.headers.has('range')||request.headers.get('accept')?.includes('text/markdown')||!/^\/(?:en\/)?(?:prompts\/(?:page\/[1-9]\d*\/)?|categories\/opennana\/(?:page\/[1-9]\d*\/)?)$/.test(url.pathname))return load();
 const key=new URL(url);key.pathname=`/_worker-cache/listing/${encodeURIComponent(version)}/${encodeURIComponent(releaseId)}${url.pathname}`;
 const cacheKey=new Request(key,{method:'GET'});
 try{const hit=await cache.match(cacheKey);if(hit){const headers=new Headers(hit.headers);headers.set('x-catalog-cache','HIT');return new Response(hit.body,{status:hit.status,headers});}}catch{}
 const response=await load();
 if(!response||response.status!==200||!response.headers.get('content-type')?.includes('text/html')||response.headers.has('set-cookie'))return response;
 const headers=new Headers(response.headers);headers.set('cache-control','public, max-age=300');headers.set('x-catalog-cache','MISS');
 const result=new Response(response.body,{status:200,headers});
 ctx.waitUntil(cache.put(cacheKey,result.clone()).catch(()=>{}));
 return result;
}
