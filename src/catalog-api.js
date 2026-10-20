import meta from './catalog-meta.json' with {type:'json'};
import {ORIGIN,json as baseJson} from './api.js';
const json=(value,status=200,extra={})=>baseJson(value,status,{'x-content-snapshot':meta.snapshotDate,'x-content-release':meta.releaseId,...extra});
import {catalogQuery} from './catalog-search.js';
export {meta};
const shardCache=new Map(),inflight=new Map();
export async function readShard(env,key){
 if(!meta.shards.some(s=>s.key===key))throw Error('Unknown content shard');
 if(shardCache.has(key))return shardCache.get(key);
 if(inflight.has(key))return inflight.get(key);
 const pending=(async()=>{const object=await env.CONTENT.get(key);if(!object)throw Error('Catalog content unavailable');const rows=await object.json();shardCache.set(key,rows);if(shardCache.size>5)shardCache.delete(shardCache.keys().next().value);return rows;})();
 inflight.set(key,pending);try{return await pending;}finally{inflight.delete(key);}
}
export async function hydrate(env,rows){
 const keys=[...new Set(rows.map(r=>r.record_key))],lookup=new Map(),wanted=new Set(rows.map(r=>r.id));
 for(let i=0;i<keys.length;i+=2)await Promise.all(keys.slice(i,i+2).map(async key=>{for(const c of await readShard(env,key))if(wanted.has(c.id))lookup.set(c.id,c);}));
 return rows.map(r=>{const c=lookup.get(r.id);if(!c)throw Error('Catalog record missing');return {...c,preview:new URL(c.preview,ORIGIN).href,markdownUrl:c.url+'index.md'};});
}
export async function searchCatalog(env,params){
 const q=catalogQuery(params,meta.releaseId,meta.snapshotDate);
 if(params.get('category')&&!meta.categories.some(c=>c.id===params.get('category')))throw Error('Unknown category.');
 const count=await env.CATALOG.prepare(`SELECT COUNT(*) AS total FROM ${q.from} WHERE ${q.where}`).bind(...q.args).first();
 const result=await env.CATALOG.prepare(`SELECT c.id,c.record_key FROM ${q.from} WHERE ${q.where} ORDER BY ${q.order} LIMIT ? OFFSET ?`).bind(...q.args,q.limit,q.offset).all();
 return {total:count.total,limit:q.limit,offset:q.offset,data:await hydrate(env,result.results)};
}
export async function getCase(env,id){const row=await env.CATALOG.prepare('SELECT id,record_key FROM catalog_entries WHERE release_id=? AND id=?').bind(meta.releaseId,id).first();return row?(await hydrate(env,[row]))[0]:null;}
export async function catalogApi(url,env){
 const readiness=/^\/api\/v1\/releases\/([a-f0-9]{16})$/.exec(url.pathname);
 if(readiness){const releaseId=readiness[1],object=await env.CONTENT.get(`catalog/${releaseId}/ready.json`);if(!object)return json({error:'Release not ready.'},404);const ready=await object.json();const row=await env.CATALOG.prepare('SELECT COUNT(*) AS total,COUNT(f.rowid) AS indexed FROM catalog_entries c LEFT JOIN catalog_fts f ON f.rowid=c.row_id WHERE c.release_id=?').bind(releaseId).first();if(ready.releaseId!==releaseId||ready.caseCount!==row.total||row.indexed!==row.total)return json({error:'Release storage verification failed.'},503);return json({status:'ready',...ready});}

 if(url.pathname==='/api/v1/categories')return json({snapshotDate:meta.snapshotDate,releaseId:meta.releaseId,data:meta.categories.map(c=>({...c,url:ORIGIN+'/categories/'+c.id+'/'}))});
 if(url.pathname==='/api/v1/prompts'){
  let result;try{result=await searchCatalog(env,url.searchParams);}catch(e){if(/Invalid|must|Unknown category/.test(e.message))return json({error:e.message},400);throw e;}
  const nextUrl=new URL(url);nextUrl.searchParams.set('offset',String(result.offset+result.limit));const next=result.offset+result.limit<result.total?ORIGIN+nextUrl.pathname+nextUrl.search:null;
  return json({snapshotDate:meta.snapshotDate,releaseId:meta.releaseId,...result,next,attribution:'Retain original creator, public source, collection citation and case-specific rights. OpenNana free sources only.'},200,next?{link:`<${next}>; rel="next"`}:{});
 }
 const match=/^\/api\/v1\/prompts\/([-a-zA-Z0-9]+)$/.exec(url.pathname);
 if(match){const c=await getCase(env,match[1]);return c?json({snapshotDate:meta.snapshotDate,releaseId:meta.releaseId,data:c}):json({error:'Prompt not found.'},404);}
 return json({error:'Endpoint not found.'},404);
}
