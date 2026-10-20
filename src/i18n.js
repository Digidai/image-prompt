import {messages} from './locale-dictionary.js';
export const language=path=>/^\/en(?:\/|$)/.test(path)?'en':'zh';
export const stripLocale=path=>path==='/en'?'/':path.replace(/^\/en\//,'/');
export function localePath(value,lang='en'){
 if(String(value).startsWith('#'))return value;
 try{const u=new URL(value,'https://prompt.genedai.me');if(u.origin!=='https://prompt.genedai.me'&&!['localhost','127.0.0.1'].includes(u.hostname))return value;const p=stripLocale(u.pathname);if(/^\/(?:api|data|assets|\.well-known)\//.test(p)||/\.(?:json|xml|txt|png|svg|webp|jpg|js|css|md)$/.test(p))return value;u.pathname=lang==='en'?'/en'+p:p;return /^https?:/.test(value)?u.href:u.pathname+u.search+u.hash;}catch{return value;}
}
const keys=Object.keys(messages).filter(Boolean).sort((a,b)=>b.length-a.length);
const pattern=new RegExp(keys.map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');
export function translateText(value){
 return String(value).replace(pattern,s=>messages[s])
 .replace(/新增 ([\d,]+) 条 OpenNana 免费公开来源 Prompt/g,'Added $1 free OpenNana prompts with public sources')
 .replace(/找到 /g,'Found ').replace(/ 条灵感 · 已展示 ([\d,]+) 条/g,' prompts · showing $1').replace(/ 条匹配案例/g,' matches')
 .replace(/([\d,]+) 条灵感 · 已展示 ([\d,]+) 条/g,'$1 prompts · showing $2').replace(/([\d,]+) 个来源案例/g,'$1 source examples')
 .replace(/([\d,]+) 个案例/g,'$1 examples').replace(/([\d,]+) 字符/g,'$1 characters').replace(/第 ([\d,]+) 页/g,'Page $1')
 .replace(/第 ([\d,]+) \/ ([\d,]+) 页/g,'Page $1 / $2').replace(/历史点赞/g,'archived likes').replace(/历史浏览/g,'archived views')
 .replace(/([\d,]+) 历史赞/g,'$1 archived likes').replace(/合集 Stars/g,'Collection stars').replace(/合集收录/g,'Collection entry').replace(/([\d,]+) 个/g,'$1 ').replace(/([\d,]+) 类/g,'$1 ').replace(/([\d,]+) 条/g,'$1 prompts').replace(/([\d,]+) 张/g,'$1 images').replace(/打开(.+?)(?:Category|分类)页面/g,'Open $1 category page').replace(/^(?:复制|Copy) (.+?) 的 Prompt$/,'Copy prompt: $1').replace(/^查看 (.+?) 的 Prompt$/,'View prompt: $1').replace(/^查看 (.+)$/,'View $1').replace(/适合/g,'Use cases: ').replace(/。/g,'.');
}
export function localizeHtml(input,lang,pathname,assets={}){
 const base=stripLocale(pathname),target='https://prompt.genedai.me'+(lang==='en'?'/en':'')+base;
 let html=input.replace(/<link[^>]+hreflang="[^"]+"[^>]*>/g,'').replace(/<a\b[^>]*data-language-switch[^>]*>[\s\S]*?<\/a>/g,'');
 if(lang==='en'){
  html=html.replace(/<p class="card-note">[\s\S]*?<\/p>/g,'<p class="card-note">Complete source prompt, creator credits and original-source links.</p>');
  if(/^\/prompts\/(?!page\/)[^/]+\/$/.test(base))html=html.replace(/<p class="lead">[\s\S]*?<\/p>/,'<p class="lead">Read the complete source prompt and attribution. Titles and source text retain their original language.</p>');
  html=html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,(_,body)=>{const walk=v=>Array.isArray(v)?v.map(walk):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,k==='inLanguage'&&x==='zh-CN'?'en':walk(x)])):typeof v==='string'?v.startsWith('https://prompt.genedai.me/')?localePath(v,'en'):translateText(v):v;return '<script type="application/ld+json">'+JSON.stringify(walk(JSON.parse(body))).replaceAll('<','\\u003c')+'</script>';});
  html=html.replace(/<(pre|textarea|script)\b[^>]*>[\s\S]*?<\/\1>|<([a-z0-9]+)\b[^>]*data-source-content[^>]*>[\s\S]*?<\/\2>|<[^>]+>|[^<]+/gi,token=>{
   if(/^<(?:pre|textarea|script)\b/i.test(token)||/data-source-content/.test(token))return token;
   if(token.startsWith('<'))return token.replace(/\b(aria-label|placeholder|title|alt|content)="([^"]*)"/g,(_,name,value)=>`${name}="${translateText(value)}"`);
   return translateText(token);
  });
  html=html.replace(/\bhref="((?:https:\/\/prompt\.genedai\.me)?\/[^"]*)"/g,(_,value)=>`href="${localePath(value,'en')}"`).replace('<html lang="zh-CN">','<html lang="en">').replace('content="zh_CN"','content="en_US"');
 }
 if(lang==='en'){
  const titles={'/':'Image Prompt · Source-attributed visual prompts','/about/':'About Image Prompt','/guide/':'Prompt adaptation guide · Image Prompt','/sources/':'Sources, evidence and rights · Image Prompt','/sources/opennana/':'OpenNana import scope and rights · Image Prompt','/agents/':'Agent API, Markdown and downloads · Image Prompt','/categories/':'Prompt categories and OpenNana gallery · Image Prompt'};
  if(titles[base])html=html.replace(/<title>[\s\S]*?<\/title>/,`<title>${titles[base]}</title>`);
  const title=html.match(/<title>([\s\S]*?)<\/title>/)?.[1]||'Image Prompt';
  html=html.replace(/(<meta (?:name|property)="(?:og:title|twitter:title)" content=")[^"]*/,(_,start)=>start+title);
  html=html.replace(/(<meta (?:name|property)="(?:description|og:description|twitter:description)" content=")[^"]*/g,(_,start)=>start+'Complete source prompts, creator credits and original-source links. Explore, filter and adapt visual examples.');
  const total=input.match(/([\d,]+) 个来源案例/)?.[1]||'';
  html=html.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/,`<footer class="site-footer"><div><strong>IMAGE PROMPT / PROMPT ATLAS</strong><p>${total?Number(total.replaceAll(',','')).toLocaleString('en-US')+' source examples. ':''}Images are source examples, not independent reproduction tests.</p><nav class="permanent-nav"><a href="/en/categories/">All categories</a><a href="/en/about/">About</a><a href="/en/sources/">Rights & attribution</a><a href="/en/agents/">Agent documentation</a><a href="/sitemap.xml">Sitemap</a><a href="https://github.com/Digidai/image-prompt">Open-source code · MIT</a></nav></div></footer>`);
 }
 html=html.replace(/(<link rel="canonical" href=")[^"]+/,(_,start)=>start+target).replace(/(<meta property="og:url" content=")[^"]+/,(_,start)=>start+target);
 const other=lang==='en'?base:'/en'+base;
 const switcher=`<a class="language-switch" data-language-switch href="${other}" lang="${lang==='en'?'zh-CN':'en'}" hreflang="${lang==='en'?'zh-CN':'en'}" aria-label="${lang==='en'?'Switch to Chinese':'切换为英文'}">${lang==='en'?'中文':'English'}</a>`;
 html=html.replace('</header>',switcher+'</header>');
 const alternates=`<link rel="alternate" hreflang="zh-CN" href="https://prompt.genedai.me${base}"><link rel="alternate" hreflang="en" href="https://prompt.genedai.me/en${base}"><link rel="alternate" hreflang="x-default" href="https://prompt.genedai.me${base}">`;
 html=html.replace('</head>',alternates+(assets.localeJS&&!html.includes(`src="${assets.localeJS}"`)?`<script type="module" src="${assets.localeJS}"></script>`:'')+'</head>');
 return html;
}
