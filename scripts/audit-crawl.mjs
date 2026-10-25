import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import meta from '../src/catalog-meta.json' with {type:'json'};
import {assertSearchSubmissionUrls} from '../src/search-policy.js';

// Read-only synthetic probes complement authenticated provider inspections.
// A bingbot User-Agent here is not a verified request from Bing's network.
const origin='https://prompt.genedai.me',at=new Date().toISOString();
const output=process.argv.find(x=>x.startsWith('--output='))?.slice(9)||`output/health/${at.replaceAll(':','-')}.json`;
const probes=[],failures=[],warnings=[];
async function get(pathname,options={}){
 const start=Date.now(),response=await fetch(origin+pathname,{redirect:'manual',signal:AbortSignal.timeout(20000),...options}),body=await response.text();
 const row={path:pathname,method:options.method||'GET',userAgent:options.headers?.['user-agent']||'default',status:response.status,ms:Date.now()-start,bytes:Buffer.byteLength(body),contentType:response.headers.get('content-type'),xRobots:response.headers.get('x-robots-tag'),mitigated:response.headers.get('cf-mitigated'),catalogCache:response.headers.get('x-catalog-cache')};probes.push(row);
 return {response,body,row};
}
async function check(name,fn){try{await fn();}catch(error){failures.push({check:name,message:error.message});}}
for(const pathname of ['/','/en/','/prompts/','/en/prompts/','/categories/product/'])await check(pathname,async()=>{
 const {response,body,row}=await get(pathname);assert.equal(response.status,200);assert(!response.headers.get('cf-mitigated'));assert(!/noindex/i.test(response.headers.get('x-robots-tag')||''));assert(body.includes(`rel="canonical" href="${origin+pathname}"`));assert(body.includes(`<html lang="${pathname.startsWith('/en/')?'en':'zh-CN'}">`));assert.equal((body.match(/<h1\b/g)||[]).length,1);assert(!/<meta name="robots"[^>]*noindex/i.test(body));
 const csp=response.headers.get('content-security-policy')||'';assert(csp.includes('https://static.cloudflareinsights.com')&&csp.includes('https://cloudflareinsights.com'),'Cloudflare analytics blocked by CSP');
 if(row.ms>2500)warnings.push({path:pathname,message:'Synthetic response exceeded 2500 ms; compare repeated samples, not field Core Web Vitals.',ms:row.ms});
});
await check('synthetic bingbot access',async()=>{const {response,body}=await get('/',{headers:{'user-agent':'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'}});assert.equal(response.status,200);assert(!response.headers.get('cf-mitigated'));assert(body.includes('<html lang="zh-CN">'));});
await check('robots policy',async()=>{const {response,body}=await get('/robots.txt');assert.equal(response.status,200);assert(body.includes('Sitemap: '+origin+'/sitemap.xml'));assert(!/^Disallow:\s*\/(?:\*|\$)?\s*$/mi.test(body),'Root-blocking robots rule requires review; inspect the applicable agent group.');});
await check('restrained sitemap',async()=>{const {response,body}=await get('/sitemap.xml');assert.equal(response.status,200);const urls=[...body.matchAll(/<loc>(.*?)<\/loc>/g)].map(x=>x[1]);assertSearchSubmissionUrls(urls,meta.categories);});
await check('catalog release',async()=>{const {response,body}=await get('/api/v1/releases/'+meta.releaseId);assert.equal(response.status,200);const value=JSON.parse(body);assert.equal(value.status,'ready');assert.equal(value.caseCount,meta.total);});
for(const pathname of ['/health-check-missing-page','/en/health-check-missing-page'])await check(pathname,async()=>{const {response,body}=await get(pathname);assert.equal(response.status,404);assert(body.includes(`<html lang="${pathname.startsWith('/en/')?'en':'zh-CN'}">`));assert(body.includes('noindex,follow'));});
let buildInfo;await check('live build identity',async()=>{const {response,body}=await get('/build-info.json');assert.equal(response.status,200);buildInfo=JSON.parse(body);assert.equal(buildInfo.contentRelease,meta.releaseId);assert.equal(buildInfo.searchSubmissions.urlCount,52);const expected=process.env.EXPECTED_COMMIT||process.env.WORKERS_CI_COMMIT_SHA;if(expected)assert.equal(buildInfo.commit,expected);});
const report={at,status:failures.length?'failed':'healthy',origin,buildInfo,probes,failures,warnings,submissionsPerformed:0,limitations:['Synthetic User-Agent tests do not establish genuine Bingbot access or actual indexation.','Response timings are local synthetic observations, not field Core Web Vitals or traffic metrics.','Applicable robots agent groups require review if root-blocking rules are detected.']};
await fs.mkdir(path.dirname(output),{recursive:true});await fs.writeFile(output,JSON.stringify(report,null,2)+'\n');
console.log(`${report.status}: ${probes.length} read-only HTTP probes; ${failures.length} failures, ${warnings.length} timing warnings. ${output}`);if(failures.length){console.error(JSON.stringify(failures));process.exitCode=1;}
