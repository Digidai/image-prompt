import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..'),dist=path.join(root,'dist');
const data=JSON.parse(await fs.readFile(path.join(root,'data/catalog.json'),'utf8'));
const urls=JSON.parse(await fs.readFile(path.join(dist,'static-url-list.json'),'utf8'));
const allUrls=JSON.parse(await fs.readFile(path.join(dist,'url-list.json'),'utf8'));
const {extra,meta,expansion}=await import('./catalog-data.mjs');
if(process.env.ALLOW_PARTIAL_CATALOG!=='1')assert.equal(expansion.missing,0,'Incomplete acquisition must not be released');
const {renderCase,caseMarkdown}=await import('../src/render-catalog.js');
const sitemap=await fs.readFile(path.join(dist,'sitemap.xml'),'utf8');
assert.equal(new Set(data.cases.map(c=>c.id)).size,data.cases.length,'Duplicate case IDs');
assert.equal(data.cases.length,474);assert.equal(data.categories.length,22);
const categories=new Set(data.categories.map(c=>c.id));let linkCount=0,schemaCount=0;
for(const c of data.cases){
 assert(categories.has(c.category),`Unknown category ${c.id}`);
 for(const field of ['titleZh','prompt','author','licenseUrl','imageProvenance','preview']) assert(c[field],`${c.id} missing ${field}`);
 assert(c.sourceUrl||c.collectionCaseUrl,`${c.id} source absent`);
 assert(!c.preview.startsWith('data:'),'Inline binary image');
 await fs.access(path.join(dist,c.preview));
 const md=await fs.readFile(path.join(dist,'prompts',c.id,'index.md'),'utf8');
 assert(md.includes(c.author)&&md.includes(c.licenseUrl),'Markdown attribution missing');
 assert(md.includes(c.promptReady||c.prompt),'Prompt text changed');
}
for(const address of urls){
 const pathname=new URL(address).pathname;
 assert(sitemap.includes(`<loc>${address}</loc>`),'Sitemap missing page');
 const html=await fs.readFile(path.join(dist,pathname,'index.html'),'utf8');
 assert(html.includes(`<link rel="canonical" href="${address}">`),`Canonical ${address}`);
 assert.equal((html.match(/<h1\b/g)||[]).length,1,`H1 count: ${pathname}`);
 assert(html.includes('name="description"'),'Description absent');
 assert(html.includes('property="og:image"'),'Social preview absent');
 assert(!html.includes('data:image/'),'Embedded preview');
 for(const match of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)){JSON.parse(match[1]);schemaCount++;}
 for(const match of html.matchAll(/(?:href|src)="(\/[^"#?]*)(?:[?#][^"]*)?"/g)){
  const href=match[1];if(href.startsWith('//')||href.startsWith('/api/'))continue;
  const file=path.join(dist,href.endsWith('/')?href+'index.html':href);
  await fs.access(file).catch(()=>{if(!allUrls.includes('https://prompt.genedai.me'+href))throw new Error(`Broken link ${pathname} -> ${href}`)});linkCount++;
 }
}
const api=JSON.parse(await fs.readFile(path.join(dist,'openapi.json'),'utf8'));assert.equal(api.openapi,'3.1.0');
assert.equal(api.paths['/api/v1/prompts'].get.parameters.find(p=>p.name==='limit').schema.maximum,100);
const home=await fs.readFile(path.join(dist,'index.html'),'utf8');assert(Buffer.byteLength(home)<180000,'Homepage HTML too large');
assert.equal((sitemap.match(/<image:image>/g)||[]).length,meta.total,'Image sitemap incomplete');
assert.equal(new Set(allUrls).size,allUrls.length,'Duplicate canonical URLs');
assert.equal(expansion.freeCount,expansion.imported+expansion.duplicates+expansion.excluded+expansion.missing,'Source reconciliation mismatch');
const assets=JSON.parse(await fs.readFile(path.join(dist,'asset-manifest.json'),'utf8'));
for(const c of extra){assert.equal(c.sourceAccess,'free');assert(c.sourceUrl.startsWith('https://'));assert(c.author&&c.prompt&&c.promptVariants.length);assert(!new URL(c.sourceUrl).hostname.endsWith('opennana.com'));assert(allUrls.includes(c.url));const html=renderCase(c,assets);assert(html.includes('rel="canonical" href="'+c.url+'"'));assert.equal((html.match(/<h1\b/g)||[]).length,1);assert(caseMarkdown(c).includes(c.prompt));for(const m of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs))JSON.parse(m[1]);}
console.log(`Expansion: ${extra.length} complete public-source cases; ${allUrls.length} indexable URLs. Release ${meta.releaseId}; ${expansion.missing} pending downloads.`);
console.log(`Passed: ${urls.length} canonical pages, ${schemaCount} JSON-LD blocks, ${linkCount} internal links, 474 full prompts and image attributions. Homepage ${Math.round(Buffer.byteLength(home)/1024)} KiB.`);
