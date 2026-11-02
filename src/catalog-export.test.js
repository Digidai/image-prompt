import {test} from 'node:test';
import assert from 'node:assert/strict';
import {gzipSync} from 'node:zlib';
import worker from './worker.js';
import {meta} from './catalog-api.js';

const origin='https://prompt.genedai.me';
function environment(key,bytes){
 const calls=[];let cancelled=false;
 return {calls,get cancelled(){return cancelled},env:{CATALOG:{},CONTENT:{async get(k){
  calls.push(k);if(k!==key)return null;
  let offset=0;return {httpEtag:'"export-fixture"',body:new ReadableStream({pull(controller){if(offset===bytes.length){controller.close();return}const next=Math.min(offset+7,bytes.length);controller.enqueue(bytes.slice(offset,next));offset=next},cancel(){cancelled=true}})};
 }}}};
}
for(const path of ['/data/catalog.json','/llms-full.txt'])test(`complete ${path} decompresses a chunked R2 gzip stream without changing public content`,async()=>{
 const text=path.endsWith('.txt'),value=text?'# 完整目录\n\n原始 Prompt <subject>\nEND':'{"prompt":"原始 Prompt <subject>","end":true}';
 const key=`catalog/${meta.releaseId}/${text?'llms-full.txt':'catalog.json'}.gz`,e=environment(key,gzipSync(value));
 const response=await worker.fetch(new Request(origin+path),e.env,{});
 assert.equal(response.status,200);assert.equal(await response.text(),value);assert.equal(response.headers.get('content-encoding'),null);
 assert(response.headers.get('content-type').startsWith(text?'text/plain':'application/json'));assert.equal(response.headers.get('x-content-release'),meta.releaseId);assert.equal(response.headers.get('x-robots-tag'),'noindex, follow');assert.equal(response.headers.get('access-control-allow-origin'),'*');assert.deepEqual(e.calls,[key]);
});
test('legacy plain complete exports remain readable and HEAD closes the storage body',async()=>{
 const key=`catalog/${meta.releaseId}/catalog.json`,value='{"legacy":"原文"}',bytes=new TextEncoder().encode(value);
 const e=environment(key,bytes),response=await worker.fetch(new Request(origin+'/data/catalog.json'),e.env,{});assert.equal(await response.text(),value);assert.deepEqual(e.calls,[key+'.gz',key]);
 const head=environment(key+'.gz',gzipSync(value)),r=await worker.fetch(new Request(origin+'/data/catalog.json',{method:'HEAD'}),head.env,{});assert.equal(r.status,200);assert.equal(await r.text(),'');assert(head.cancelled);
});
