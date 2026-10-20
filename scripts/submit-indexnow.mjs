import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const origin='https://prompt.genedai.me',key='d46f8c2a59eb4dcab314f45a8efbe85e';
const evidence=new URL('../docs/evidence/',import.meta.url),file=new URL('search-submissions.json',evidence),historyFile=new URL('indexnow-url-history.json',evidence);
const execute=process.argv.includes('--execute');
const urls=JSON.parse(await fs.readFile(new URL('../dist/url-list.json',import.meta.url),'utf8'));
let ledger=JSON.parse(await fs.readFile(file,'utf8')),history;
try{history=JSON.parse(await fs.readFile(historyFile,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;const previous=JSON.parse(await fs.readFile(new URL('../dist/static-url-list.json',import.meta.url),'utf8')).filter(u=>!u.endsWith('/sources/opennana/'));if(!ledger.some(r=>r.provider==='IndexNow'&&r.httpStatus===200&&r.urlCount===previous.length))throw Error('Prior IndexNow coverage cannot be reconciled.');history={note:'Initial 516-URL coverage reconstructed from stable original routes and the recorded HTTP 200 launch receipt.',acceptedUrls:previous};}
const accepted=new Set(history.acceptedUrls),pending=urls.filter(u=>!accepted.has(u));
console.log(`${execute?'Execute':'Dry run'}: ${pending.length} new canonical URLs, ${Math.ceil(pending.length/10000)} batches; ${accepted.size} previously accepted URLs omitted.`);
if(!execute||!pending.length)process.exit(0);
const keyResponse=await fetch(`${origin}/${key}.txt`);if(!keyResponse.ok||(await keyResponse.text()).trim()!==key)throw Error('Live key validation failed; no submission sent.');
const map=await fetch(origin+'/sitemap.xml');if(!map.ok)throw Error('Live sitemap unavailable; no submission sent.');const xml=await map.text();if(!pending.every(u=>xml.includes(`<loc>${u}</loc>`)))throw Error('Local URLs do not match live sitemap.');
for(let at=0;at<pending.length;at+=10000){const batch=pending.slice(at,at+10000),payload={host:'prompt.genedai.me',key,keyLocation:`${origin}/${key}.txt`,urlList:batch};
 const response=await fetch('https://api.indexnow.org/indexnow',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
 const now=new Date().toISOString(),digest=createHash('sha256').update(JSON.stringify(batch)).digest('hex'),name=`indexnow-${digest.slice(0,12)}.json`;
 const receipt={at:now,provider:'IndexNow',endpoint:'https://api.indexnow.org/indexnow',httpStatus:response.status,urlCount:batch.length,status:response.status===200?'accepted':response.status===202?'accepted_pending_key_validation':'failed',urlListFile:'docs/evidence/'+name,urlListSha256:digest,message:(await response.text()).slice(0,2000),notEvidenceOf:'crawl, indexation, rank, traffic or AI citation'};
 await fs.writeFile(new URL(name,evidence),JSON.stringify({at:now,urls:batch},null,2)+'\n');ledger.push(receipt);await fs.writeFile(file,JSON.stringify(ledger,null,2)+'\n');console.log(JSON.stringify(receipt,null,2));
 if([200,202].includes(response.status)){batch.forEach(u=>accepted.add(u));await fs.writeFile(historyFile,JSON.stringify({...history,updatedAt:now,acceptedUrls:[...accepted]},null,2)+'\n');}else{process.exitCode=1;break;}
}
