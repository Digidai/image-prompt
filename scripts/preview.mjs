import http from 'node:http';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import fs from 'node:fs/promises';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {data,meta,root} from './catalog-data.mjs';
import worker from '../src/worker.js';
import {caseMarkdown} from '../src/catalog-markdown.js';
const db=new DatabaseSync(':memory:');db.exec(await fs.readFile(path.join(root,'migrations/0001_catalog.sql'),'utf8'));
const dir=path.join(root,'.cache/catalog-release');for(const f of (await fs.readdir(dir)).filter(f=>/^seed-.*\.sql$/.test(f)).sort())db.exec(await fs.readFile(path.join(dir,f),'utf8'));
const objects=new Map();let at=0;for(const shard of meta.shards){objects.set(shard.key,data.cases.slice(at,at+shard.count));at+=shard.count;}
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.md':'text/markdown; charset=utf-8','.txt':'text/plain; charset=utf-8','.xml':'application/xml'};
const env={CATALOG:{prepare(sql){return {bind(...args){return {async first(){return db.prepare(sql).get(...args)||null},async all(){return {results:db.prepare(sql).all(...args)}}}}}}},CONTENT:{async get(key){if(key===`catalog/${meta.releaseId}/ready.json`)return {async json(){return {releaseId:meta.releaseId,caseCount:meta.total,indexedCount:meta.total,remoteCount:meta.total,preview:true}}};if(key.endsWith('/catalog.json'))return {body:JSON.stringify({...data,releaseId:meta.releaseId})};if(key.endsWith('/llms-full.txt'))return {body:data.cases.map(c=>caseMarkdown(c,meta.snapshotDate)).join('\n---\n')};const rows=objects.get(key);return rows?{async json(){return rows}}:null}},ASSETS:{async fetch(req){const u=new URL(req.url);const pathname=decodeURIComponent(u.pathname);let file=path.resolve(root,'dist','.'+pathname);if(!file.startsWith(path.join(root,'dist')+path.sep)&&file!==path.join(root,'dist'))return new Response('Forbidden',{status:403});if(pathname.endsWith('/'))file=path.join(file,'index.html');try{return new Response(await fs.readFile(file),{headers:{'content-type':mime[path.extname(file)]||'application/octet-stream'}})}catch{return new Response(await fs.readFile(path.join(root,'dist/404.html')),{status:404,headers:{'content-type':'text/html'}})}}}};
http.createServer(async(req,res)=>{try{const response=await worker.fetch(new Request('http://localhost:8787'+req.url,{method:req.method,headers:req.headers}),env);res.writeHead(response.status,Object.fromEntries(response.headers));if(response.body)await pipeline(Readable.fromWeb(response.body),res);else res.end();}catch(e){if(res.headersSent||res.destroyed){res.destroy();return;}console.error(e);res.writeHead(500);res.end('Preview error');}}).listen(8787,'127.0.0.1',()=>console.log('Preview http://localhost:8787, release '+meta.releaseId));
