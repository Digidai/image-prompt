import {language,localePath,translateText} from './i18n.js';
const lang=language(location.pathname),key='promptAtlasLanguage_v1';
try{const saved=localStorage.getItem(key);if(saved==='en'&&lang==='zh'&&!sessionStorage.getItem('promptAtlasExplicitZh'))location.replace(localePath(location.pathname+location.search+location.hash,'en'));}catch{}
const preserve='pre,textarea,script,style,[data-source-content],#modalTitle,#modalDesc,.card h3,.card-note,.hero-caption,#similarCases,.variables label';
function apply(root=document.body){
 if(lang!=='en')return;
 const elements=root.nodeType===1?[root,...root.querySelectorAll('*')]:[];
 for(const el of elements){if(el.closest(preserve))continue;for(const attr of ['aria-label','placeholder','title','alt'])if(el.hasAttribute(attr)){const value=el.getAttribute(attr),translated=translateText(value);if(value!==translated)el.setAttribute(attr,translated);}if(el.tagName==='A'&&el.hasAttribute('href')&&!el.hasAttribute('data-language-switch')){const value=el.getAttribute('href'),next=localePath(value,'en');if(value!==next)el.setAttribute('href',next);}}
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode()){if(node.parentElement.closest(preserve))continue;const translated=translateText(node.textContent);if(translated!==node.textContent)node.textContent=translated;}
}
apply();
new MutationObserver(records=>{if(lang!=='en')return;for(const record of records){if(record.type==='attributes'){apply(record.target);}else if(record.type==='childList')for(const node of record.addedNodes){if(node.nodeType===1)apply(node);else if(node.nodeType===3&&!node.parentElement.closest(preserve)){const text=translateText(node.textContent);if(text!==node.textContent)node.textContent=text;}}else if(record.type==='characterData'&&!record.target.parentElement.closest(preserve)){const text=translateText(record.target.textContent);if(text!==record.target.textContent)record.target.textContent=text;}}}).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['aria-label','placeholder','title','alt']});
document.addEventListener('click',event=>{const link=event.target.closest('[data-language-switch]');if(!link)return;const target=new URL(localePath(location.pathname+location.search+location.hash,lang==='en'?'zh':'en'),location.origin);link.href=target.href;try{localStorage.setItem(key,lang==='en'?'zh':'en');if(lang==='en')sessionStorage.setItem('promptAtlasExplicitZh','1');else sessionStorage.removeItem('promptAtlasExplicitZh');}catch{}});
