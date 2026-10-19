import fs from 'node:fs/promises';
const origin='https://prompt.genedai.me',key='d46f8c2a59eb4dcab314f45a8efbe85e';
const file=new URL('../docs/evidence/search-submissions.json',import.meta.url);
const execute=process.argv.includes('--execute');
const urls=JSON.parse(await fs.readFile(new URL('../dist/url-list.json',import.meta.url),'utf8'));
const payload={host:'prompt.genedai.me',key,keyLocation:`${origin}/${key}.txt`,urlList:urls};
if(!execute){console.log(`Dry run: ${urls.length} canonical URLs to api.indexnow.org. Add --execute to submit.`);process.exit(0);}
const keyResponse=await fetch(payload.keyLocation);if(!keyResponse.ok||(await keyResponse.text()).trim()!==key)throw Error('Live key validation failed; no submission sent.');
const map=await fetch(origin+'/sitemap.xml');if(!map.ok)throw Error('Live sitemap unavailable; no submission sent.');const xml=await map.text();
if(!urls.every(u=>xml.includes(`<loc>${u}</loc>`)))throw Error('Local URLs do not match the live sitemap.');
const response=await fetch('https://api.indexnow.org/indexnow',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
const receipt={at:new Date().toISOString(),provider:'IndexNow',endpoint:'https://api.indexnow.org/indexnow',httpStatus:response.status,urlCount:urls.length,status:response.status===200?'accepted':response.status===202?'accepted_pending_key_validation':'failed',message:(await response.text()).slice(0,2000),notEvidenceOf:'crawl, indexation, rank, traffic or AI citation'};
let ledger=[];try{ledger=JSON.parse(await fs.readFile(file,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
ledger.push(receipt);await fs.writeFile(file,JSON.stringify(ledger,null,2)+'\n');console.log(JSON.stringify(receipt,null,2));if(![200,202].includes(response.status))process.exitCode=1;
