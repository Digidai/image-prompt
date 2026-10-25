import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cachedListing} from './listing-cache.js';
const origin='https://prompt.genedai.me';
function fixture(){
 const entries=new Map(),pending=[];let loads=0;
 return {env:{CF_VERSION_METADATA:{id:'version-a'}},ctx:{waitUntil:p=>pending.push(p)},cache:{async match(key){return entries.get(key.url)?.clone();},async put(key,response){entries.set(key.url,response);}},load:async()=>{loads++;return new Response('render '+loads,{headers:{'content-type':'text/html'}});},settle:()=>Promise.all(pending),entries,get loads(){return loads;}};
}
test('a warm public directory avoids rendering; locale, content release and deployment remain isolated',async()=>{
 const f=fixture(),run=(pathname,release='release-a',env=f.env)=>cachedListing(new Request(origin+pathname),env,f.ctx,f.load,release,f.cache);
 const first=await run('/prompts/');assert.equal(first.headers.get('x-catalog-cache'),'MISS');assert.equal(await first.text(),'render 1');await f.settle();
 const hit=await run('/prompts/');assert.equal(hit.headers.get('x-catalog-cache'),'HIT');assert.equal(await hit.text(),'render 1');assert.equal(f.loads,1);
 for(const [path,release,env] of [['/en/prompts/','release-a',f.env],['/prompts/','release-b',f.env],['/prompts/','release-a',{CF_VERSION_METADATA:{id:'version-b'}}]])assert.equal((await run(path,release,env)).headers.get('x-catalog-cache'),'MISS');
 await f.settle();assert.equal(f.entries.size,4);
});
test('HEAD, credentials, filters, Markdown and unrelated routes never share directory HTML',async()=>{
 const f=fixture();
 for(const request of [new Request(origin+'/prompts/',{method:'HEAD'}),new Request(origin+'/prompts/',{headers:{authorization:'Bearer test'}}),new Request(origin+'/prompts/?q=cat'),new Request(origin+'/prompts/',{headers:{accept:'text/markdown'}}),new Request(origin+'/api/v1/prompts'),new Request(origin+'/prompts/opennana-1/')])await cachedListing(request,f.env,f.ctx,f.load,'release',f.cache);
 await f.settle();assert.equal(f.loads,6);assert.equal(f.entries.size,0);
});
test('failed renders and cookie-bearing responses are not cached',async()=>{
 const f=fixture();for(const response of [new Response('outage',{status:503}),new Response('missing',{status:404}),new Response('private',{headers:{'content-type':'text/html','set-cookie':'test=1'}})])await cachedListing(new Request(origin+'/prompts/'),f.env,f.ctx,async()=>response,'release',f.cache);
 await f.settle();assert.equal(f.entries.size,0);
});
test('cache outages fall back to rendering and do not fail the public request',async()=>{
 const f=fixture(),cache={async match(){throw Error('unavailable');},async put(){throw Error('unavailable');}};
 const response=await cachedListing(new Request(origin+'/prompts/'),f.env,f.ctx,f.load,'release',cache);assert.equal(await response.text(),'render 1');await f.settle();
});
