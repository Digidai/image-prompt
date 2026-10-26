// Keep existing canonical records ahead of new duplicates, independent of the
// upstream review order. Never change the source list in place.
export function prioritizePublishedItems(items,publishedIds){
 const rank=new Map(publishedIds.map((id,index)=>[String(id),index]));
 return items.map((item,index)=>({item,index,rank:rank.get(String(item.id))??Number.MAX_SAFE_INTEGER}))
  .sort((a,b)=>a.rank-b.rank||a.index-b.index).map(({item})=>item);
}
