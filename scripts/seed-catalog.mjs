import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {data,meta,original,expansion,root} from './catalog-data.mjs';
import {indexText} from '../src/catalog-search.js';
import {caseMarkdown} from '../src/catalog-markdown.js';
import {cloudflareToken} from './cloudflare-auth.mjs';
const account='48d9ccaf5ee7914c803b5d0656462848',bucket='image-prompt-content';
const args=new Set(process.argv.slice(2));
const quote=s=>s===null||s===undefined?'NULL':typeof s==='number'?String(s):"'"+String(s).replaceAll("'","''")+"'";
const dir=path.join(root,'.cache/catalog-release');await fs.mkdir(dir,{recursive:true});for(const f of await fs.readdir(dir))if(f.endsWith('.sql'))await fs.rm(path.join(dir,f));
await fs.writeFile(path.join(root,'src/catalog-meta.json'),JSON.stringify(meta,null,2)+'\n');
let at=0;const keyed=new Map();for(const s of meta.shards){const rows=data.cases.slice(at,at+s.count);at+=s.count;keyed.set(s.key,rows);}
const sql=[];let row=0;
// Stable content version; avoid overwriting another deployed snapshot.
for(const [key,rows] of keyed)for(const c of rows){
 row++;
 const summary={id:c.id,titleZh:c.titleZh,category:c.category,preview:c.preview,author:c.author};
 const values=[meta.releaseId,c.id,c.titleZh,c.category,c.modelGroup,c.collectionKey||c.collection,c.requiresReference===null?null:c.requiresReference?1:0,c.evidenceType,c.publishedAt||null,c.order,c.likes??null,(c.promptReady||c.prompt).length,c.mediaType||'image','full',key,JSON.stringify(summary)];
 sql.push(`INSERT OR IGNORE INTO catalog_entries (release_id,id,title,category,model_group,collection_key,requires_reference,evidence_type,published_at,curated_order,likes,prompt_length,media_type,content_availability,record_key,summary_json) VALUES (${values.map(quote).join(',')});`);
 const search=[c.titleZh,c.titleOriginal,c.prompt,c.promptZh,c.notesZh,c.author,c.model,...c.tags].filter(Boolean).join(' ');
 const indexed=indexText(search);
 sql.push(`INSERT OR REPLACE INTO catalog_fts (rowid,search_text) SELECT row_id,${quote(indexed)} FROM catalog_entries WHERE release_id=${quote(meta.releaseId)} AND id=${quote(c.id)};`);
}
const oversized=sql.filter(s=>Buffer.byteLength(s)>100000);if(oversized.length)throw Error(`${oversized.length} SQL statements exceed D1 limit; use bound REST queries for these rows.`);
// Each file stays comfortably below D1's import statement/file limits.
const batches=[];for(let i=0;i<sql.length;i+=300){const file=path.join(dir,'seed-'+String(batches.length).padStart(3,'0')+'.sql');await fs.writeFile(file,sql.slice(i,i+300).join('\n')+'\n');batches.push(file);}
console.log(`Prepared ${data.cases.length} rows in ${keyed.size} R2 shards and ${batches.length} SQL batches, release ${meta.releaseId}.`);
if(args.has('--prepare-only'))process.exit(0);
const token=cloudflareToken();
const uploads=new Map([...keyed].map(([key,rows])=>[key,JSON.stringify(rows)]));
uploads.set(`catalog/${meta.releaseId}/catalog.json`,JSON.stringify({...data,releaseId:meta.releaseId}));
uploads.set(`catalog/${meta.releaseId}/llms-full.txt`,'# Image Prompt / Full source-attributed catalog\n\n'+data.cases.map(c=>caseMarkdown(c,meta.snapshotDate)).join('\n---\n'));
if(!args.has('--db-only'))for(const [key,body] of uploads){let done=false;for(let tries=0;tries<4&&!done;tries++){try{const r=await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/r2/buckets/${bucket}/objects/${key}`,{method:'PUT',headers:{authorization:'Bearer '+token,'content-type':key.endsWith('.txt')?'text/plain; charset=utf-8':'application/json'},body,signal:AbortSignal.timeout(180000)});if(!r.ok)throw Error('R2 upload HTTP '+r.status);done=true;}catch(e){if(tries===3)throw e;await new Promise(r=>setTimeout(r,2000));}}
 console.log('Uploaded '+key);
}
const mode=args.has('--local')?'--local':'--remote';
execFileSync('npx',['wrangler','d1','migrations','apply','image-prompt-catalog',mode],{cwd:root,stdio:'inherit'});
const importFile=path.join(dir,'catalog-import.sql');await fs.writeFile(importFile,sql.join('\n')+'\n');
execFileSync('npx',['wrangler','d1','execute','image-prompt-catalog',mode,'--file',importFile,'--yes'],{cwd:root,stdio:'inherit'});
if(args.has('--local'))process.exit(0);
const check=await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/d1/database/9b0a5ffa-353e-426f-bdcc-47b9065c222f/query`,{method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify({sql:'SELECT COUNT(*) AS total,COUNT(f.rowid) AS indexed FROM catalog_entries c LEFT JOIN catalog_fts f ON f.rowid=c.row_id WHERE c.release_id=?',params:[meta.releaseId]})});
const checked=await check.json();if(!check.ok||!checked.success||checked.result?.[0]?.results?.[0]?.total!==meta.total||checked.result?.[0]?.results?.[0]?.indexed!==meta.total)throw Error('Remote catalog count verification failed');
await fs.writeFile(path.join(dir,'receipt.json'),JSON.stringify({at:new Date().toISOString(),releaseId:meta.releaseId,caseCount:meta.total,objectCount:uploads.size,remoteCount:checked.result[0].results[0].total,indexedCount:checked.result[0].results[0].indexed},null,2)+'\n');
const ready={at:new Date().toISOString(),releaseId:meta.releaseId,caseCount:meta.total,objectCount:uploads.size,remoteCount:checked.result[0].results[0].total,indexedCount:checked.result[0].results[0].indexed};
const readyResponse=await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/r2/buckets/${bucket}/objects/catalog/${meta.releaseId}/ready.json`,{method:'PUT',headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify(ready)});if(!readyResponse.ok)throw Error('Ready marker upload failed');
console.log('Catalog release seeded, remote count verified and ready marker uploaded.');
