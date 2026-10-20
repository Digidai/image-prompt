import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import meta from '../src/catalog-meta.json' with {type:'json'};
const origin=process.env.SITE_ORIGIN||'https://prompt.genedai.me';
const response=await fetch(origin+'/build-info.json');assert(response.ok,'Current production build unavailable');
const live=await response.json();
if(!live.contentRelease){
 const receipt=JSON.parse(await fs.readFile(new URL('../docs/evidence/opennana-storage.json',import.meta.url),'utf8'));
 assert.equal(receipt.releaseId,meta.releaseId);assert.equal(receipt.remoteCount,meta.total);assert.equal(receipt.indexedCount,meta.total);
 console.log('First catalog deployment: verified maintainer storage receipt matches the complete snapshot.');
}else{
 const ready=await fetch(origin+'/api/v1/releases/'+meta.releaseId);assert.equal(ready.status,200,'Seed and verify the new catalog before deployment');const body=await ready.json();assert.equal(body.status,'ready');assert.equal(body.releaseId,meta.releaseId);assert.equal(body.caseCount,meta.total);assert.equal(body.indexedCount,meta.total);console.log('Remote D1/R2 release readiness verified: '+meta.releaseId);
}
