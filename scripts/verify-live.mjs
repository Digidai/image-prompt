import assert from 'node:assert/strict';
import meta from '../src/catalog-meta.json' with {type:'json'};
import {SEARCH_POLICY,assertSearchSubmissionUrls} from '../src/search-policy.js';
const origin=process.env.SITE_ORIGIN||'https://prompt.genedai.me';
const paths=['/','/prompts/','/prompts/page/14/','/categories/','/categories/product/','/categories/opennana/','/categories/opennana/page/2/','/guide/','/sources/','/sources/opennana/','/about/','/agents/','/sitemap.xml','/robots.txt','/llms.txt','/openapi.json','/.well-known/agent.json','/data/site.json','/data/catalog-manifest.json','/build-info.json','/og.png','/en/','/en/guide/','/en/sources/','/en/about/','/en/agents/','/en/categories/','/en/categories/product/','/en/categories/opennana/','/en/prompts/','/en/prompts/page/14/'];
let count=0;
for(const path of paths){const r=await fetch(origin+path);assert.equal(r.status,200,path);assert.equal(r.headers.get('x-content-type-options'),'nosniff',path);if(path.endsWith('/')){const html=await r.text();assert(html.includes(`rel="canonical" href="https://prompt.genedai.me${path}"`),path);assert.equal((html.match(/<h1\b/g)||[]).length,1,path);}else await r.body?.cancel();count++;}
const sitemap=await(await fetch(origin+'/sitemap.xml')).text();
const sitemapUrls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match=>match[1]);
assertSearchSubmissionUrls(sitemapUrls,meta.categories);
const submittedUrls=await(await fetch(origin+'/url-list.json')).json();assertSearchSubmissionUrls(submittedUrls,meta.categories);
assert.deepEqual(sitemapUrls,submittedUrls);
const build=await(await fetch(origin+'/build-info.json')).json();assert.equal(build.searchSubmissions.policy,SEARCH_POLICY);assert.equal(build.searchSubmissions.urlCount,sitemapUrls.length);
count+=3;
const ready=await(await fetch(origin+'/api/v1/releases/'+meta.releaseId)).json();assert.equal(ready.status,'ready');assert.equal(ready.caseCount,meta.total);
const all=await(await fetch(origin+'/api/v1/prompts?limit=1')).json();assert.equal(all.total,meta.total);assert.equal(all.releaseId,meta.releaseId);
const body=await(await fetch(origin+'/api/v1/prompts?category=opennana&limit=2')).json();assert.equal(body.total,meta.opennana.imported);assert.equal(body.data.length,2);assert(body.next);
for(const c of body.data){assert(c.sourceAccess==='free'&&c.sourceUrl.startsWith('https://')&&c.author);assert.equal(c.requiresReference,null);const html=await(await fetch(origin+'/prompts/'+c.id+'/')).text();assert(html.includes(c.author)&&html.includes(c.sourceUrl)&&html.includes('id="full-prompt"'));const md=await fetch(origin+'/prompts/'+c.id+'/index.md');assert.equal(md.status,200);assert((await md.text()).includes(c.prompt));}
const c=body.data[0],negotiated=await fetch(origin+'/prompts/'+c.id+'/',{headers:{accept:'text/markdown'}});assert(negotiated.headers.get('content-type').includes('text/markdown'));await negotiated.body.cancel();
const english=await(await fetch(origin+'/en/prompts/'+c.id+'/')).text();assert(english.includes('<html lang="en">'));assert(english.includes('Copy prompt'));assert(english.includes('hreflang="zh-CN"'));const englishMd=await fetch(origin+'/en/prompts/'+c.id+'/',{headers:{accept:'text/markdown'}});assert.equal(englishMd.status,200);assert((await englishMd.text()).includes(c.prompt));
const english404=await fetch(origin+'/en/does-not-exist-12345');assert.equal(english404.status,404);assert((await english404.text()).includes('<html lang="en">'));
const zh=await(await fetch(origin+'/api/v1/prompts?collection=opennana&q='+encodeURIComponent('拼贴')+'&limit=2')).json();assert(zh.total>0);assert(zh.data.every(c=>c.collectionKey==='opennana'));
for(const path of ['/not-a-real-page-123456','/prompts/opennana-18345/','/api/v1/prompts/opennana-18345','/categories/opennana/page/9999/'])assert.equal((await fetch(origin+path)).status,404,path);
assert.equal((await fetch(origin+'/api/v1/prompts?limit=101')).status,400);assert.equal((await fetch(origin+'/api/v1/prompts',{method:'POST'})).status,405);
const redirect=await fetch(origin+'/prompts/'+c.id,{redirect:'manual'});assert.equal(redirect.status,308);
for(const path of ['/data/catalog.json','/llms-full.txt']){const r=await fetch(origin+path);assert.equal(r.status,200);const reader=r.body.getReader(),first=await reader.read();assert(first.value.length>0);await reader.cancel();}
console.log(`Passed ${count+18} live page, full prompt, source scope, Chinese search, pagination, streaming export and security checks on ${origin}. Dataset ${meta.releaseId}, ${meta.total} cases. Search submissions limited to ${sitemapUrls.length} collection entrances.`);
