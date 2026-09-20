import fs from 'node:fs';
import {sceneConfig as c} from '../src/config/scene-config.js';
import {createFloorPlan} from '../src/ui/FloorPlan.js';
import {createStairLayout} from '../src/config/stair-layout.js';

const dir='public/reference';fs.mkdirSync(dir,{recursive:true});
const sx=z=>740-z*23,sy=x=>560+x*23;
const text=(x,y,t,size=22,fill='#294238',extra='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${extra}>${t}</text>`;
const area=(r,fill,stroke='#758373')=>`<rect x="${sx(r.maxZ)}" y="${sy(r.minX)}" width="${(r.maxZ-r.minZ)*23}" height="${(r.maxX-r.minX)*23}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
const path=road=>road.samples.map(([x,z],i)=>`${i?'L':'M'}${sx(z).toFixed(2)},${sy(x).toFixed(2)}`).join('');
let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="1240" viewBox="0 0 2000 1240" font-family="Arial, sans-serif" role="img" aria-label="TinkerSpace Calicut first-floor seating and roads following the confirmed sketch">
<defs><clipPath id="site-clip"><rect x="70" y="282" width="1336" height="810" rx="16"/></clipPath></defs>
<rect width="2000" height="1240" fill="#eff0e7"/>
${text(56,83,'TinkerSpace Calicut',54,'#203a2e','font-weight="700"')}
${text(57,132,'First-floor seating &amp; road reference',27,'#667266')}
${text(1940,80,'OWNER’S SKETCH · 20 SEPTEMBER 2026',17,'#667266','text-anchor="end" letter-spacing="1.4"')}
<rect x="48" y="188" width="1380" height="956" rx="22" fill="#fafaf4"/>
<rect x="1452" y="188" width="500" height="956" rx="22" fill="#fafaf4"/>
${text(80,239,'01 / SITE &amp; ROAD CONNECTIONS',21,'#294238','font-weight="700" letter-spacing="1.1"')}
${text(1480,239,'02 / FIRST-FLOOR SEATING',21,'#294238','font-weight="700" letter-spacing="1.1"')}
${text(1480,272,'Four chairs on each side of each shared table.',17,'#667266')}
<g clip-path="url(#site-clip)"><rect x="70" y="282" width="1336" height="810" fill="#e5ebdc"/>`;
for(const road of c.site.roads)svg+=`<path d="${path(road)}" fill="none" stroke="#b4775a" stroke-width="${road.width*23+5}" stroke-linecap="butt" stroke-linejoin="round"/>`;
for(const road of c.site.roads)svg+=`<path d="${path(road)}" fill="none" stroke="${road.level==='lower'?'#d7ccba':'#c7b9a2'}" stroke-width="${road.width*23}" stroke-linecap="butt" stroke-linejoin="round"/>`;
svg+=area({minX:c.building.veranda.innerX,maxX:c.building.veranda.outerX,minZ:c.building.veranda.nearZ,maxZ:c.building.veranda.farZ},'#c9d5bb');
for(const r of [c.plan.balcony,c.plan.lobby])svg+=area(r,'#d6dfca');
for(const r of c.plan.rooms)svg+=area(r,r.id==='bathroom'?'#dce8e6':'#eae5d6');
svg+=area(c.plan.main,'#eae5d6','#394d42');
const s=c.building.stairs;svg+=area({minX:s.minX,maxX:s.maxX,minZ:s.topZ,maxZ:s.bottomZ},'#adbaa1');
for(const step of createStairLayout(s,c.building.room.floorY).segments)svg+=`<path d="M${sx(step.minZ)},${sy(s.minX)}V${sy(s.maxX)}" stroke="#788b70" stroke-width="1"/>`;
svg+=text(740,555,'FIRST FLOOR',25,'#294238','text-anchor="middle" font-weight="700"')+text(740,584,'Workshop · +3.75 m',18,'#667266','text-anchor="middle"');
svg+=text(542,562,'BALCONY',12,'#566b4c','text-anchor="middle" transform="rotate(-90 542 562)"');
svg+=text(974,655,'LOBBY',16,'#566b4c','text-anchor="middle"')+text(738,653,'VERANDA',14,'#566b4c','text-anchor="middle" letter-spacing="3"');
svg+=text(371,450,'MAIN ROAD',25,'#615747','text-anchor="middle" font-weight="700" transform="rotate(-90 371 450)"');
svg+=text(757,845,'CURVED VERANDA-SIDE ROAD',20,'#615747','text-anchor="middle" font-weight="700"');
svg+=text(1230,330,'UPPER ROAD',17,'#615747','text-anchor="middle" font-weight="700"');
svg+='<path d="M1167 339L1154 388" stroke="#8d957d" fill="none" stroke-width="2"/>';
svg+='<path d="M1095 497V583L1088 657" stroke="#62785a" fill="none" stroke-width="2"/><circle cx="1088" cy="657" r="5" fill="#62785a"/>';
svg+='<rect x="1020" y="434" width="310" height="64" rx="12" fill="#fafaf4"/>'+text(1175,461,'FIRST-FLOOR ENTRANCE',17,'#294238','text-anchor="middle" font-weight="700"')+text(1175,485,'Short branch from the upper road',16,'#667266','text-anchor="middle"');
svg+='<path d="M490 749L467 694" stroke="#8d957d" fill="none" stroke-width="2"/>'+text(490,774,'Lower stair access',17,'#667266','text-anchor="middle"');
svg+=text(760,991,'Road direction matches your hand-drawn sketch.',20,'#667266','text-anchor="middle"')+text(760,1022,'“Second Floor” in the sketch is labelled First Floor here.',18,'#667266','text-anchor="middle"');
svg+='</g>';
const plan=createFloorPlan(c).svg.replace(/<circle id="map-marker"[^>]*\/>/,'');
svg+=plan.replace('<svg ','<svg x="1490" y="290" width="425" height="808" ');
svg+='<rect x="1480" y="1095" width="444" height="30" rx="7" fill="#e2e9d8"/>'+text(1702,1116,'3 TABLES × 8 CHAIRS = 24 SHARED SEATS',15,'#294238','text-anchor="middle" font-weight="700"');
svg+=text(56,1184,'Building dimensions follow the supplied floor plan. Road connections follow your sketch; widths and curves are indicative.',19,'#667266');
svg+=text(56,1213,'The three shared tables are 2.90 × 1.10 m, with matching, evenly spaced chair rows. Other wall and balcony seating is retained.',17,'#7d8779')+'</svg>';
fs.writeFileSync(`${dir}/first-floor-site-reference.svg`,svg);
fs.writeFileSync(`${dir}/first-floor-seating.svg`,plan);
console.log(`Saved ${dir}/first-floor-site-reference.svg and first-floor-seating.svg`);
