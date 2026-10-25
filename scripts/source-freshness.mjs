const maxAge=7*24*60*60*1000;
export function detailCacheFresh(detail,item,mtimeMs,now=Date.now()){
 if(detail.id!==item.id||detail.slug!==item.slug||detail.access_type!==0||!detail.is_unlocked||item.access_type!==0)return false;
 for(const field of ['updated_at','reviewed_at'])if(item[field]&&item[field]!==detail[field])return false;
 return Number.isFinite(mtimeMs)&&now-mtimeMs>=0&&now-mtimeMs<maxAge;
}
