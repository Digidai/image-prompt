import assert from 'node:assert/strict';
const origin=process.env.SITE_ORIGIN||'https://prompt.genedai.me';
const paths=['/','/prompts/','/categories/','/categories/product/','/guide/','/sources/','/about/','/agents/','/sitemap.xml','/robots.txt','/llms.txt','/llms-full.txt','/openapi.json','/.well-known/agent.json','/data/catalog.json','/build-info.json','/og.png'];
let count=0;
for(const path of paths){const r=await fetch(origin+path);assert.equal(r.status,200,path);assert(r.headers.get('x-content-type-options')==='nosniff',path);if(path.endsWith('/')){const html=await r.text();assert(html.includes(`rel="canonical" href="https://prompt.genedai.me${path}"`),path);}count++;}
const body=await (await fetch(origin+'/api/v1/prompts?category=product&limit=2')).json();assert(body.total>0);assert.equal(body.data.length,2);assert(body.next);
const c=body.data[0];assert.equal((await fetch(c.url)).status,200);assert.equal((await fetch(c.markdownUrl)).status,200);
const negotiated=await fetch(c.url,{headers:{accept:'text/markdown'}});assert(negotiated.headers.get('content-type').includes('text/markdown'));
assert.equal((await fetch(origin+'/not-a-real-page-123456')).status,404);
assert.equal((await fetch(origin+'/api/v1/prompts?limit=101')).status,400);
assert.equal((await fetch(origin+'/api/v1/prompts',{method:'POST'})).status,405);
console.log(`Passed ${count+7} live page, API, Markdown, error and security checks on ${origin}.`);
