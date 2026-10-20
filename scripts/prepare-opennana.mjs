import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
const root=path.resolve(import.meta.dirname,'..'), cache=path.join(root,'.cache/opennana'), out=path.join(root,'data/opennana');
const original=JSON.parse(await fs.readFile(path.join(root,'data/catalog.json'),'utf8'));
const manifest=JSON.parse(await fs.readFile(path.join(cache,'manifest.json'),'utf8'));
const snapshotDate=manifest.fetchedAt.slice(0,10),recentCutoff=new Date(new Date(snapshotDate+'T00:00:00Z').getTime()-90*86400000).toISOString().slice(0,10);
let acquisitionCompletedAt=null;try{acquisitionCompletedAt=JSON.parse(await fs.readFile(path.join(cache,'sync-summary.json'),'utf8')).at;}catch{}
const hash=s=>createHash('sha256').update(s).digest('hex');
const normalize=s=>String(s||'').normalize('NFKC').replace(/\s+/g,' ').trim().toLowerCase();
const publicUrl=s=>{try{let value=String(s||'').trim();const embedded=value.match(/https?:\/\/[^\s<>)\]]+/);if(embedded)value=embedded[0];else if(/^(?:www\.)?(?:x\.com|twitter\.com|threads\.(?:com|net))\//i.test(value))value='https://'+value;const u=new URL(value);if(u.protocol==='http:'&&['x.com','twitter.com','threads.com','threads.net'].includes(u.hostname))u.protocol='https:';if(u.protocol!=='https:'||u.username||u.password)return null;const h=u.hostname.toLowerCase();if(!h.includes('.')||/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h)||h.endsWith('.local'))return null;if(h==='opennana.com'||h.endsWith('.opennana.com'))return null;return u.href;}catch{return null}};
const safeMedia=s=>{try{const u=new URL(s);return u.protocol==='https:'?u.href:null}catch{return null}};
const seen=new Map(original.cases.filter(c=>normalize(c.prompt).length>=120).map(c=>[hash(normalize(c.prompt)),c]));
const rows=[],duplicates=[],excluded=[],missing=[];
for(const item of manifest.items){
 if(item.access_type!==0)continue;
 let d;try{d=JSON.parse(await fs.readFile(path.join(cache,'details',item.id+'.json'),'utf8'));}catch{missing.push(item.id);continue;}
 if(d.access_type!==0||!d.is_unlocked){excluded.push({id:item.id,reason:'not_free_or_locked'});continue;}
 const sourceUrl=publicUrl(d.source_url);
 if(sourceUrl&&/^https:\/\/(?:www\.)?threads\.(?:com|net)\/@[^/]+\/?$/.test(sourceUrl)){excluded.push({id:item.id,reason:'profile_only_no_original_post'});continue;}
 if(!sourceUrl){excluded.push({id:item.id,reason:'no_public_original_source'});continue;}
 const variants=(Array.isArray(d.prompts)?d.prompts:[]).filter(p=>typeof p.text==='string'&&p.text.trim()).map(p=>({text:p.text,type:String(p.type||''),label:String(p.label||'')}));
 if(!variants.length){excluded.push({id:item.id,reason:'no_public_full_prompt'});continue;}
 const preferred=variants.find(p=>p.type==='en')||variants[0],zh=variants.find(p=>p.type==='zh');
 const fingerprint=normalize(preferred.text),key=hash(fingerprint),duplicate=fingerprint.length>=120&&seen.get(key);
 if(duplicate){const citation={collection:'OpenNana',url:manifest.source+'/'+d.slug,sourceUrl,author:d.source_name};if(duplicate.collectionKey==='opennana')(duplicate.additionalSources??=[]).push(citation);duplicates.push({id:item.id,canonicalId:duplicate.id,...citation});continue;}
 const imageUrls=(d.images||[]).map(s=>safeMedia(typeof s==='string'?s:s?.url)).filter(Boolean),videoUrls=(d.video_urls||[]).map(safeMedia).filter(Boolean);
 let preview=d.thumbnail?new URL(d.thumbnail,'https://img.opennana.com/').href:item.cover_image;
 if(!safeMedia(preview)||preview.includes('/https:'))preview=imageUrls[0]||'/og.png';
 const authorMatch=/^https:\/\/(?:x|twitter)\.com\/([^/]+)\/status\/\d+/.exec(sourceUrl);
 const profileMatch=/^https:\/\/(?:www\.)?threads\.(?:com|net)\/(@[^/?#]+)/.exec(sourceUrl);
 const author=String(d.source_name||'').trim()||(authorMatch?'@'+authorMatch[1]:profileMatch?profileMatch[1]:'来源未披露作者');
 const model=String(d.model||'来源未披露'),modelGroup=/nano|gemini/i.test(model)?'nano':/gpt|chatgpt|dall.?e/i.test(model)?'gpt':'other';
 const c={id:'opennana-'+d.id,sourceId:d.id,order:original.cases.length+rows.length,titleZh:String(d.title),titleOriginal:String(d.title),category:'opennana',model,modelShort:model,modelGroup,prompt:preferred.text,promptZh:zh&&zh!==preferred?zh.text:'',promptVariants:variants,sourceExamples:d.examples||[],promptLanguage:preferred.label||preferred.type,notesZh:String(d.description||'来自 OpenNana 的公开提示词；保留原始作者与公开原帖引用。'),sourcePromptNotes:typeof d.notes==='string'?d.notes:(d.notes?JSON.stringify(d.notes):''),author,authorUrl:authorMatch?'https://x.com/'+authorMatch[1]:'',sourceUrl,sourceUrlRaw:d.source_url,sourceCitationType:authorMatch?'post':profileMatch?'profile':'source_page',authorBasis:d.source_name?'source_label':authorMatch||profileMatch?'source_url_handle':'not_disclosed',sourceCollection:'OpenNana Awesome Prompt Gallery',collectionKey:'opennana',collectionShort:'OpenNana',collectionUrl:manifest.source,collectionCaseUrl:manifest.source+'/'+d.slug,collectionStars:null,evidenceType:'public_source',evidenceLabel:'公开原帖引用；来源图库收录',likes:null,views:null,sourceGalleryLikes:d.like_count??null,sourceGalleryViews:d.view_count??null,publishedAt:String(d.created_at||'').slice(0,10),publishedAtBasis:'OpenNana 条目创建日期，不代表原帖发布日期',sourceUpdatedAt:d.updated_at||null,isRecent:String(d.created_at||'').slice(0,10)>=recentCutoff,requiresReference:null,tags:(d.tags||[]).map(t=>typeof t==='string'?t:String(t.name||t.label||'')).filter(Boolean),license:'项目维护者确认转载授权；原作者权利保留',licenseUrl:'https://prompt.genedai.me/sources/opennana/',imageUrl:imageUrls[0]||preview,imageUrls,videoUrls,mediaType:d.media_type==='video'?'video':'image',preview,previewWidth:null,previewHeight:null,imageAuthor:author,imageProvenance:'OpenNana 展示的来源示例；本站未重新生成。',contentAvailability:'full',sourceAccess:'free',url:'https://prompt.genedai.me/prompts/opennana-'+d.id+'/'};
 rows.push(c);if(fingerprint.length>=120)seen.set(key,c);
}
if(missing.length&&!process.argv.includes('--partial'))throw Error(`Acquisition incomplete: ${missing.length} free entries missing. Use --partial only for local development.`);
await fs.mkdir(out,{recursive:true});for(const f of await fs.readdir(out))if(f.endsWith('.json.gz'))await fs.rm(path.join(out,f));
const digest=hash(JSON.stringify({original:original.cases,rows,duplicates})).slice(0,16),shards=[];
for(let at=0;at<rows.length;at+=400){const name='part-'+String(shards.length).padStart(3,'0')+'.json',body=JSON.stringify(rows.slice(at,at+400));await fs.writeFile(path.join(out,name+'.gz'),gzipSync(body,{level:9}));shards.push({file:name+'.gz',key:`catalog/${digest}/${name}`,count:Math.min(400,rows.length-at),sha256:hash(body)});}
const report={snapshotDate,acquisitionCompletedAt,releaseId:digest,source:manifest.source,fetchedAt:manifest.fetchedAt,reportedTotal:manifest.reportedTotal,manifestCount:manifest.items.length,freeCount:manifest.items.filter(x=>x.access_type===0).length,paidExcluded:manifest.items.filter(x=>x.access_type!==0).length,downloadedFree:manifest.items.filter(x=>x.access_type===0).length-missing.length,imported:rows.length,duplicates:duplicates.length,excluded:excluded.length,missing:missing.length,mediaCounts:{image:rows.filter(c=>c.mediaType==='image').length,video:rows.filter(c=>c.mediaType==='video').length},sourceDomains:[...new Set(rows.map(c=>new URL(c.sourceUrl).hostname))],repairedSourceUrls:rows.filter(c=>c.sourceUrl!==c.sourceUrlRaw).length,exclusionReasons:Object.fromEntries([...new Set(excluded.map(x=>x.reason))].map(reason=>[reason,excluded.filter(x=>x.reason===reason).length])),policy:'Only free, unlocked full prompts with attributed public original URLs. Paid and non-public sources excluded by maintainer instruction. Redistribution authorization confirmed by maintainer 2026-10-20; original creator rights retained. Source URLs are references, not independently verified authorship or current availability.',shards};
await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify(report,null,2)+'\n');
await fs.writeFile(path.join(out,'reconciliation.json'),JSON.stringify({duplicates,excluded,missingIds:missing},null,2)+'\n');
console.log(JSON.stringify({...report,shards:shards.length},null,2));
