import fs from 'node:fs/promises';
import path from 'node:path';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
export const root=path.resolve(import.meta.dirname,'..');
export const original=JSON.parse(await fs.readFile(path.join(root,'data/catalog.json'),'utf8'));
export const expansion=JSON.parse(await fs.readFile(path.join(root,'data/opennana/manifest.json'),'utf8'));
const reconciliation=JSON.parse(await fs.readFile(path.join(root,'data/opennana/reconciliation.json'),'utf8'));
const originalById=new Map(original.cases.map(c=>[c.id,c]));
for(const duplicate of reconciliation.duplicates){const c=originalById.get(duplicate.canonicalId);if(c)(c.additionalSources??=[]).push({collection:'OpenNana',url:duplicate.url,sourceUrl:duplicate.sourceUrl,author:duplicate.author});}
export const extra=[];
for(const shard of expansion.shards){const body=gunzipSync(await fs.readFile(path.join(root,'data/opennana',shard.file))).toString();if(createHash('sha256').update(body).digest('hex')!==shard.sha256)throw Error('Catalog digest mismatch: '+shard.file);const rows=JSON.parse(body);if(rows.length!==shard.count)throw Error('Catalog count mismatch');extra.push(...rows);}
export const extraCategory={id:'opennana',label:'OpenNana 图库',en:'OpenNana Gallery',description:'免费且附有公开原始来源的 OpenNana 提示词。',uses:'浏览更多图像与视频创作灵感。',formula:'保留来源原文，按自己的主题与素材改写。',tip:'参考图要求未逐条核实；请查看原帖说明和所用工具。'};
export const data={...original,snapshotDate:expansion.snapshotDate,originalSnapshotDate:original.snapshotDate,cases:[...original.cases,...extra],categories:[...original.categories,extraCategory],collections:[...original.collections,{key:'opennana',name:'OpenNana Awesome Prompt Gallery',included:extra.length,stars:null,description:'仅收录免费全文和公开原始来源；付费、无公开来源及重复内容排除。',dateNote:'条目日期来自 OpenNana 创建时间，不等于原帖发布日期。',url:expansion.source,licenseUrl:'https://prompt.genedai.me/sources/opennana/'}]};
export const meta={releaseId:expansion.releaseId,snapshotDate:expansion.snapshotDate,total:data.cases.length,categories:data.categories.map(c=>({...c,count:data.cases.filter(x=>x.category===c.id).length})),collections:data.collections,shards:[{key:`catalog/${expansion.releaseId}/original.json`,count:original.cases.length},...expansion.shards.map(({key,count})=>({key,count}))],opennana:expansion};
