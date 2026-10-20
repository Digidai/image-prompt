import fs from 'node:fs/promises';
import path from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';

const cache=path.resolve(import.meta.dirname,'../.cache/opennana');
const api='https://api.opennana.com/api/prompts';
const detailDir=path.join(cache,'details');
await fs.mkdir(detailDir,{recursive:true});
const args=new Set(process.argv.slice(2));
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
let turn=0;
async function get(url){
 for(let attempt=0;attempt<4;attempt++){
  const slot=Math.max(Date.now(),turn);turn=slot+85;await delay(Math.max(0,slot-Date.now()));
  try{
   const r=await fetch(url,{signal:AbortSignal.timeout(25000),headers:{'user-agent':'ImagePromptCatalogImporter/1.0 (+https://prompt.genedai.me/)','accept':'application/json'}});
   if(r.status===429){await delay(Math.max(10000,Number(r.headers.get('retry-after')||10)*1000));continue;}
   if(r.status===401||r.status===403)throw Object.assign(Error(`Access denied: ${r.status}`),{permanent:true});
   if(!r.ok)throw Error(`HTTP ${r.status}`);const v=await r.json();if(v.status!==200||!v.data)throw Error(v.msg||'Invalid source response');return v.data;
  }catch(e){if(e.permanent||attempt===3)throw e;await delay(1500*2**attempt);}
 }
 throw Error('Rate limit persisted');
}
async function pool(items,concurrency,task){let i=0;await Promise.all(Array.from({length:concurrency},async()=>{while(i<items.length){const at=i++;await task(items[at],at);}}));}
let manifest;
const manifestPath=path.join(cache,'manifest.json');
try{if(args.has('--refresh'))throw Error('refresh');manifest=await read(manifestPath);}catch{
 const first=await get(`${api}?page=1&limit=100&sort=reviewed_at&order=DESC`);
 const records=new Map(first.items.map(x=>[x.id,x]));
 const pages=Array.from({length:first.pagination.total_pages-1},(_,i)=>i+2);
 let done=1;
 await pool(pages,2,async page=>{const data=await get(`${api}?page=${page}&limit=100&sort=reviewed_at&order=DESC`);for(const x of data.items)records.set(x.id,x);if(++done%25===0)console.log(`Manifest ${done}/${pages.length+1}: ${records.size} unique entries`);});
 // Re-read the first page to reconcile new arrivals while taking the snapshot.
 const end=await get(`${api}?page=1&limit=100&sort=reviewed_at&order=DESC`);for(const x of end.items)records.set(x.id,x);
 manifest={source:'https://opennana.com/awesome-prompt-gallery',fetchedAt:new Date().toISOString(),reportedTotal:end.pagination.total,items:[...records.values()]};
 await fs.writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
}
console.log(`Manifest ready: ${manifest.items.length}/${manifest.reportedTotal}; free ${manifest.items.filter(x=>x.access_type===0).length}; paid/excluded ${manifest.items.filter(x=>x.access_type!==0).length}`);
if(args.has('--manifest-only'))process.exit(0);
const free=manifest.items.filter(x=>x.access_type===0);let completed=0,cached=0,failed=[];
const started=Date.now();
const fields=['id','slug','title','description','source_name','source_url','model','prompts','images','examples','notes','tags','is_featured','view_count','like_count','copy_count','created_at','updated_at','reviewed_at','thumbnail','media_type','video_urls','access_type','paid_points','is_unlocked'];
await pool(free,6,async item=>{
 const dest=path.join(detailDir,`${item.id}.json`);
 try{
  try{const v=await read(dest);if(v.id===item.id&&v.slug===item.slug){cached++;completed++;return;}}catch{}
  const d=await get(`${api}/${encodeURIComponent(item.slug)}`);
  // Never attempt to unlock, buy, log in or read a hidden paid prompt.
  const clean=Object.fromEntries(fields.filter(k=>k in d).map(k=>[k,d[k]]));
  if(d.access_type!==0&&!d.is_unlocked){clean.prompts=[];clean.accessBoundary='source_paid_locked';}
  await fs.writeFile(dest,JSON.stringify(clean)+'\n');completed++;
 }catch(e){failed.push({id:item.id,slug:item.slug,error:String(e.message)});}
 if((completed+failed.length)%200===0)console.log(`Details ${completed}/${free.length}; cached ${cached}; failed ${failed.length}; elapsed ${Math.round((Date.now()-started)/1000)}s`);
});
const summary={at:new Date().toISOString(),reportedTotal:manifest.reportedTotal,manifestCount:manifest.items.length,publicDetailCount:completed,paidExcludedCount:manifest.items.length-free.length,cached,failed,authorization:'Project maintainer confirmed full redistribution authorization on 2026-10-20. This does not bypass source access controls.'};
await fs.writeFile(path.join(cache,'sync-summary.json'),JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify(summary,null,2));if(failed.length)process.exitCode=1;
