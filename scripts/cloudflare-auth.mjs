import {execFileSync} from 'node:child_process';

// Let Wrangler select and refresh the existing local auth profile. Capture its
// secret output in memory only; never log it or copy it into hosted builds.
export function cloudflareToken(){
 if(process.env.CLOUDFLARE_API_TOKEN)return process.env.CLOUDFLARE_API_TOKEN;
 let value;
 try{value=JSON.parse(execFileSync('npx',['wrangler','auth','token','--json'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}));}
 catch{throw Error('Existing Wrangler CLI session unavailable. Check npx wrangler whoami.');}
 if(typeof value.token!=='string'||!value.token)throw Error('An existing authorized Wrangler token is required.');
 return value.token;
}
