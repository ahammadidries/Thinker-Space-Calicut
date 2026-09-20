export function hashId(id) {
  let hash=2166136261;for(const c of String(id)){hash^=c.charCodeAt(0);hash=Math.imul(hash,16777619)}return hash>>>0;
}
export function shirtColor(id,palette) {return palette[hashId(id)%palette.length]}
// membershipId identifies a person; id identifies a particular check-in.
export function normalizeActiveUsers(payload) {
  if(!Array.isArray(payload))throw new Error('Active-user response must be an array');
  const users=new Map();
  for(const row of payload) {
    if(!row||typeof row!=='object')throw new Error('Invalid active-user record');
    if(row.spaceId!=null&&Number(row.spaceId)!==2)continue;
    const id=row.membershipId??row.mid??row.id;
    if(id==null||!['string','number'].includes(typeof id)||!String(id).trim())throw new Error('Active user has no stable ID');
    const key=String(id),name=typeof row.name==='string'&&row.name.trim()?row.name.trim().slice(0,100):'Maker';
    // No timestamps are interpreted as live coordinates or motion. The endpoint
    // is authoritative for presence; checkout time can be a future booking end.
    users.set(key,{id:key,name});
  }
  return [...users.values()].sort((a,b)=>a.id.localeCompare(b.id,undefined,{numeric:true}));
}
