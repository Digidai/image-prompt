import {test} from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.js';
import {apiResponse} from './api.js';
const origin='https://prompt.genedai.me';
const api=p=>apiResponse(new URL(origin+p));
test('pagination preserves ordering, total and source attribution',async()=>{
 const a=await api('/api/v1/prompts?limit=2').json(),b=await api('/api/v1/prompts?limit=2&offset=2').json();
 assert.equal(a.total,474);assert.equal(a.data.length,2);assert(!a.data.some(x=>b.data.some(y=>y.id===x.id)));
 assert.equal(new URL(a.next).searchParams.get('offset'),'2');
 for(const c of a.data){assert(c.author&&c.licenseUrl&&c.sourceUrl);assert(c.preview.startsWith(origin));assert(c.markdownUrl.endsWith('/index.md'));}
});
test('filters intersect and match real Chinese prompt content',async()=>{
 const body=await api('/api/v1/prompts?category=product&requiresReference=true&limit=100').json();
 assert(body.total>0);assert(body.data.every(c=>c.category==='product'&&c.requiresReference));
 const zh=await api('/api/v1/prompts?q='+encodeURIComponent('产品')).json();assert(zh.total>0);
 const none=await api('/api/v1/prompts?q=not-a-real-prompt-37498234').json();assert.equal(none.total,0);assert.equal(none.next,null);
});
test('invalid filter and pagination are rejected rather than broadened',()=>{
 for(const q of ['limit=0','limit=101','offset=-1','offset=1.5','limit=abc','category=unknown','model=unknown','requiresReference=maybe','q='+('x'.repeat(201))])assert.equal(api('/api/v1/prompts?'+q).status,400,q);
});
test('detail and category endpoints return stable complete records',async()=>{
 const list=await api('/api/v1/prompts?limit=1').json();const c=await api('/api/v1/prompts/'+list.data[0].id).json();assert.deepEqual(c.data,list.data[0]);
 const categories=await api('/api/v1/categories').json();assert.equal(categories.data.length,22);assert.equal(categories.data.reduce((sum,c)=>sum+c.count,0),474);
 assert.equal(api('/api/v1/prompts/missing').status,404);assert.equal(api('/api/v1/missing').status,404);
});
test('Worker enforces canonical host, read-only methods, HEAD and CORS',async()=>{
 const redirect=await worker.fetch(new Request('https://image-prompt.example.workers.dev/prompts/?a=1'),{});assert.equal(redirect.status,308);assert.equal(redirect.headers.get('location'),origin+'/prompts/?a=1');
 const denied=await worker.fetch(new Request(origin+'/api/v1/prompts',{method:'POST'}),{});assert.equal(denied.status,405);
 const options=await worker.fetch(new Request(origin+'/api/v1/prompts',{method:'OPTIONS'}),{});assert.equal(options.status,204);assert.equal(options.headers.get('access-control-allow-origin'),'*');
 const head=await worker.fetch(new Request(origin+'/api/v1/prompts',{method:'HEAD'}),{});assert.equal(await head.text(),'');assert.equal(head.status,200);
});
test('Markdown negotiation and filter URLs preserve cache/index boundaries',async()=>{
 let seen='';const env={ASSETS:{fetch:async req=>{seen=req.url;return new Response('body',{headers:{'content-type':seen.endsWith('.md')?'text/markdown':'text/html'}});}}};
 const md=await worker.fetch(new Request(origin+'/prompts/gpt4o-097/',{headers:{accept:'text/markdown'}}),env);assert(seen.endsWith('/index.md'));assert.equal(md.headers.get('x-robots-tag'),'noindex, follow');
 const html=await worker.fetch(new Request(origin+'/?category=product'),env);assert.equal(html.headers.get('x-robots-tag'),'noindex, follow');assert(html.headers.get('content-security-policy').includes("script-src 'self'"));
});
