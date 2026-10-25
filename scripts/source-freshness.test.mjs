import {test} from 'node:test';
import assert from 'node:assert/strict';
import {detailCacheFresh} from './source-freshness.mjs';
test('public detail caches expire even when listing metadata has no timestamps',()=>{
 const now=Date.parse('2026-10-25T00:00:00Z'),item={id:1,slug:'example',access_type:0},detail={...item,is_unlocked:true};
 assert(detailCacheFresh(detail,item,now-60000,now));assert(!detailCacheFresh(detail,item,now-8*86400000,now));assert(!detailCacheFresh(detail,item,now+1000,now));
});
test('updated source markers and access restrictions force detail revalidation',()=>{
 const item={id:1,slug:'example',access_type:0,reviewed_at:'new'},detail={...item,is_unlocked:true,reviewed_at:'old'};
 assert(!detailCacheFresh(detail,item,Date.now()));assert(!detailCacheFresh({...detail,reviewed_at:'new',access_type:1},item,Date.now()));assert(!detailCacheFresh({...detail,reviewed_at:'new',is_unlocked:false},item,Date.now()));
});
