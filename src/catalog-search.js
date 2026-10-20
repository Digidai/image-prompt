// Index source text as data only. CJK grams support Chinese searches in unicode61 FTS.
export function searchTokens(text){
 const words=String(text||'').normalize('NFKC').toLowerCase().match(/[a-z0-9_]+|[\p{Script=Han}]+/gu)||[];
 return [...new Set(words.flatMap(w=>/\p{Script=Han}/u.test(w)?w.length===1?[w]:Array.from({length:w.length-1},(_,i)=>w.slice(i,i+2)): [w]))];
}
export function indexText(text){const s=String(text||'').normalize('NFKC').toLowerCase();return s+' '+searchTokens(s).join(' ')+' '+[...new Set(s.match(/\p{Script=Han}/gu)||[])].join(' ');}
export function matchQuery(q){return searchTokens(q).map(w=>'"'+w.replaceAll('"','""')+'"'+(/^[a-z0-9_]+$/.test(w)?'*':'')).join(' AND ');}
export function catalogQuery(params,releaseId,snapshotDate='2026-10-20'){
 const conditions=['c.release_id=?'],args=[releaseId],q=(params.get('q')||'').trim();
 if(q.length>200)throw Error('q must be at most 200 characters.');
 const integer=(key,fallback,max)=>{const v=params.get(key);if(v===null)return fallback;if(!/^\d+$/.test(v)||!Number.isSafeInteger(+v)||+v>max)throw Error(`Invalid ${key}.`);return +v;};
 const limit=integer('limit',20,100),offset=integer('offset',0,100000);if(!limit)throw Error('limit must be 1–100.');
 const eq=(parameter,column,allowed)=>{const v=params.get(parameter);if(v&&v!=='all'){if(allowed&&!allowed.includes(v))throw Error(`Invalid ${parameter}.`);conditions.push('c.'+column+'=?');args.push(v);}};
 eq('category','category');eq('model','model_group',['nano','gpt','other']);eq('collection','collection_key');eq('evidence','evidence_type',['post_archive','collection','public_source']);eq('media','media_type',['image','video']);
 const ref=params.get('requiresReference');if(ref!==null){if(!['true','false'].includes(ref))throw Error('Invalid requiresReference.');conditions.push('c.requires_reference=?');args.push(ref==='true'?1:0);}
 const date=params.get('date');if(date&&date!=='all'){if(date==='recent'){conditions.push('c.published_at>=?');args.push(new Date(new Date(snapshotDate+'T00:00:00Z').getTime()-90*86400000).toISOString().slice(0,10));}else if(['2025','2026'].includes(date)){conditions.push('c.published_at LIKE ?');args.push(date+'%');}else throw Error('Invalid date.');}
 const ids=params.get('ids');if(ids!==null){const list=ids.split(',').filter(Boolean);if(list.length>80||list.some(s=>!/^[-a-zA-Z0-9]+$/.test(s)))throw Error('ids must contain at most 80 valid IDs.');conditions.push(list.length?'c.id IN ('+list.map(()=>'?').join(',')+')':'0');args.push(...list);}
 let join='';if(q){const match=matchQuery(q);if(!match){conditions.push('0');}else{join=' JOIN catalog_fts ON catalog_fts.rowid=c.row_id';conditions.push('catalog_fts MATCH ?');args.push(match);}}
 const quick=params.get('quick'),groups={brand:['brand','product','typography','poster'],portrait:['portrait','fashion','cinematic'],miniature:['miniature','toy','material'],infographic:['infographic','icon','poster','typography']};
 if(groups[quick]){conditions.push('c.category IN ('+groups[quick].map(()=>'?').join(',')+')');args.push(...groups[quick]);}
 const sorts={curated:'c.curated_order ASC,c.id ASC',likes:'c.likes DESC,c.curated_order ASC',latest:'c.published_at DESC,c.id ASC',short:'c.prompt_length ASC,c.id ASC'},sort=params.get('sort')||'curated';if(!sorts[sort])throw Error('Invalid sort.');
 return {from:'catalog_entries c'+join,where:conditions.join(' AND '),args,order:sorts[sort],limit,offset};
}
