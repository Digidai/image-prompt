import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import meta from '../src/catalog-meta.json' with {type:'json'};

// Exercise the real Static Assets HTML routing, which unit-test ASSETS stubs
// cannot reproduce. Local mode disables remote D1/R2 and needs no credentials.
const root=fileURLToPath(new URL('../',import.meta.url));
const state=await fs.mkdtemp(path.join(os.tmpdir(),'image-prompt-hosting-'));
const socket=createServer();
await new Promise((resolve,reject)=>{socket.once('error',reject);socket.listen(0,'127.0.0.1',resolve);});
const port=socket.address().port;
await new Promise((resolve,reject)=>socket.close(error=>error?reject(error):resolve()));
const origin=`http://127.0.0.1:${port}`,env={...process.env,CI:'true',WRANGLER_SEND_METRICS:'false'};
for(const name of ['CLOUDFLARE_API_TOKEN','CLOUDFLARE_API_KEY','CLOUDFLARE_EMAIL'])delete env[name];
const child=spawn(process.execPath,[path.join(root,'node_modules/wrangler/bin/wrangler.js'),'dev','--local','--ip','127.0.0.1','--port',String(port),'--inspector-port','0','--persist-to',state,'--show-interactive-dev-session=false'],{cwd:root,env,detached:process.platform!=='win32',stdio:['ignore','pipe','pipe']});
let output='',ended=false,spawnError;
const exited=new Promise(resolve=>child.once('exit',()=>{ended=true;resolve();}));
child.once('error',error=>{spawnError=error;ended=true;});
for(const stream of [child.stdout,child.stderr])stream.on('data',chunk=>{output=(output+chunk.toString()).slice(-12000);});
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const request=(pathname,options={})=>fetch(origin+pathname,{redirect:'manual',signal:AbortSignal.timeout(8000),...options});
function signalChild(signal){if(!child.pid)return;try{if(process.platform==='win32')child.kill(signal);else process.kill(-child.pid,signal);}catch(error){if(error.code!=='ESRCH')throw error;}}
let checks=0;
try{
  const deadline=Date.now()+45000;
  while(true){
    if(ended)throw spawnError||new Error('Local Workers runtime exited before readiness');
    try{const response=await request('/build-info.json',{signal:AbortSignal.timeout(500)});await response.body?.cancel();if(response.status===200)break;}catch{}
    if(Date.now()>deadline)throw new Error('Local Workers runtime did not become ready');
    await pause(150);
  }
  for(const pathname of ['/','/categories/','/categories/product/','/guide/','/en/','/en/categories/','/en/categories/product/','/en/guide/','/prompts/','/en/prompts/','/categories/opennana/','/en/categories/opennana/']){
    const response=await request(pathname),html=await response.text(),locale=pathname.startsWith('/en/')?'en':'zh-CN';
    assert.equal(response.status,200,pathname);assert(html.includes(`<html lang="${locale}">`),`Locale missing: ${pathname}`);assert(html.includes(`rel="canonical" href="https://prompt.genedai.me${pathname}"`),`Canonical missing: ${pathname}`);
    if(/\/(?:prompts|categories\/opennana)\/$/.test(pathname)){assert.equal(response.headers.get('x-catalog-cache'),'STATIC',`First page must work without seeded D1/R2: ${pathname}`);assert(html.includes((pathname.includes('opennana')?meta.opennana.imported:meta.total).toLocaleString('en-US')),`Snapshot count missing: ${pathname}`);assert(html.includes(pathname+'page/2/'),`Next-page route missing: ${pathname}`);}
    checks++;
  }
  for(const pathname of ['/not-a-real-page-hosting-check','/en/not-a-real-page-hosting-check']){
    const response=await request(pathname),html=await response.text(),locale=pathname.startsWith('/en/')?'en':'zh-CN';
    assert.equal(response.status,404,pathname);assert.equal(response.headers.get('location'),null,`404 must not be an asset redirect: ${pathname}`);assert(html.includes(`<html lang="${locale}">`),`404 body missing or wrong language: ${pathname}`);assert(/<h1\b/.test(html),`Empty 404 body: ${pathname}`);assert(html.includes('noindex,follow'),`404 indexing boundary: ${pathname}`);checks++;
  }
  const head=await request('/en/not-a-real-page-hosting-check',{method:'HEAD'});assert.equal(head.status,404);assert.equal(await head.text(),'');checks++;
  const catalog=JSON.parse(await fs.readFile(path.join(root,'data/catalog.json'),'utf8')),example=catalog.cases[0];
  for(const prefix of ['','/en']){
    const response=await request(`${prefix}/prompts/${example.id}/`,{headers:{accept:'text/markdown'}}),markdown=await response.text();
    assert.equal(response.status,200);assert(response.headers.get('content-type')?.includes('text/markdown'));assert(markdown.includes(example.promptReady||example.prompt));assert.equal(response.headers.get('vary'),'Accept');checks++;
  }
  console.log(`Passed ${checks} local Workers/Static Assets checks: localized HTML, real 404 bodies, HEAD and Markdown negotiation. No production resources used.`);
}catch(error){console.error(output);throw error;}
finally{
  signalChild('SIGTERM');
  await Promise.race([exited,pause(3000)]);
  signalChild('SIGKILL');
  await fs.rm(state,{recursive:true,force:true});
}
