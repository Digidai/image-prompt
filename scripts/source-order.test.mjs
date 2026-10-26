import test from 'node:test';
import assert from 'node:assert/strict';
import {prioritizePublishedItems} from './source-order.mjs';

test('a newly reviewed duplicate cannot replace an existing canonical URL',()=>{
 const items=[{id:99,prompt:'same full prompt'},{id:2,prompt:'other full prompt'},{id:1,prompt:'same full prompt'}];
 const ordered=prioritizePublishedItems(items,[1,2]);
 const seen=new Set(),canonical=ordered.filter(item=>{if(seen.has(item.prompt))return false;seen.add(item.prompt);return true;});
 assert.deepEqual(canonical.map(item=>item.id),[1,2]);
 assert.deepEqual(items.map(item=>item.id),[99,2,1]);
});

test('published order survives source reordering while new items retain their source order',()=>{
 const items=[{id:'new-b'},{id:3},{id:'new-a'},{id:'1'}];
 assert.deepEqual(prioritizePublishedItems(items,[1,2,3]).map(item=>item.id),['1',3,'new-b','new-a']);
 assert.deepEqual(prioritizePublishedItems(items,[]),items);
});
