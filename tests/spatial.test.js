import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { sceneConfig as c } from '../src/config/scene-config.js';
import { firstFloorPlan as p } from '../src/config/first-floor-plan.js';
import { CollisionWorld } from '../src/game/CollisionWorld.js';
import { buildBuilding } from '../src/world/Building.js';
import { createStairLayout } from '../src/config/stair-layout.js';

function building() {
  const world = new CollisionWorld(), material = new THREE.MeshBasicMaterial();
  buildBuilding(new THREE.Group(), new Proxy({}, { get: () => material }), world);
  return world;
}
test('PDF dimensions measure actual clear walls and floor rectangles', () => {
  const w=building(), close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
  assert.equal(c.building.room.floorY,3.75);
  const front=w.boxes.find(q=>q.id==='display-wall'),back=w.boxes.find(q=>q.id==='printer-wall');
  close(back.minZ-front.maxZ,14.435);
  const sides=w.boxes.filter(q=>q.id.startsWith('wall-')&&q.minZ<=0&&q.maxZ>=0).sort((a,b)=>a.minX-b.minX);
  close(sides[1].minX-sides[0].maxX,5.406);
  for(const [id,width,depth] of [['covered-balcony',5.65,2.33],['covered-lobby',5.17,5.43]]){
    const surface=w.surfaces.find(q=>q.id===id);close(surface.maxX-surface.minX,width);close(surface.maxZ-surface.minZ,depth);assert.equal(surface.height,3.75);
  }
  assert.equal(c.building.stairs.steps,25);
});
test('restored annex has the old landing wall and north-facing bathroom entrance', () => {
  const w = building(), f = c.building.room.floorY;
  assert.ok(w.overlaps(-.56, -11.5, f), 'Original divider between Other 2 and Other 3');
  assert.ok(w.overlaps(-.56, -8.3, f), 'Bathroom is enclosed from the landing');
  assert.ok(w.overlaps(1.57, -10, f), 'Outer annex wall restored beside the lobby');
  const toilet=p.rooms.find(q=>q.id==='bathroom');
  assert.ok(Math.abs(toilet.maxX-toilet.minX-2.21)<1e-8);
  assert.ok(Math.abs(toilet.maxZ-toilet.minZ-1.86)<1e-8);
  assert.equal(toilet.maxZ,p.main.minZ-c.building.room.wallThickness);
  const door=p.annexOpenings.find(q=>q.id==='bathroom-opening');
  assert.equal(door.a[1],door.b[1]);
  assert.ok(p.fixtures.some(q=>q.id==='other-1-basin'&&q.kind==='basin'));
  assert.ok(!p.fixtures.some(q=>q.kind==='counter'&&q.position[2]>-9));
  assert.ok(w.overlaps(.7, -7.3, f), 'No invented doorway through workshop end wall');
  for (const o of p.annexOpenings) assert.equal(w.overlaps((o.a[0] + o.b[0]) / 2, (o.a[1] + o.b[1]) / 2, f), false, o.id);
  for (const r of p.rooms) assert.equal(w.ground((r.minX+r.maxX)/2,(r.minZ+r.maxZ)/2,f),f,r.id);
});
test('table chair counts follow the plan and seats align to their table edges', () => {
  for (const table of c.objects.tables) for (const side of ['north','south']) {
    const chairs=c.chairs.filter(q=>q.tableId===table.id&&q.side===side);
    assert.equal(chairs.length,table.seats[side]);
    for(const chair of chairs){
      assert.equal(chair.rotationY,side==='north'?Math.PI:0);
      assert.ok(Math.abs(Math.abs(chair.position[2]-table.position[2])-table.depth/2-.43)<1e-9);
      assert.ok(Math.abs(chair.position[0]-table.position[0])<=table.width/2-.4);
    }
    if(chairs.length>2){const gaps=chairs.slice(1).map((q,i)=>q.position[0]-chairs[i].position[0]);assert.ok(Math.max(...gaps)-Math.min(...gaps)<1e-9);}
  }
  assert.equal(c.chairs.filter(q=>q.tableId==='window-desk-01').length,7);
  assert.equal(c.chairs.filter(q=>q.position[2]>-7.3&&q.position[2]<7.3&&q.position[0]<2.9).length,36);
  for(const table of c.objects.tables.filter(t=>t.id.startsWith('table-')))assert.deepEqual(table.seats,{north:4,south:4});
});
test('all initial chairs clear walls, fixtures and other chairs', () => {
  const w=building();
  for(const chair of c.chairs) assert.equal(w.overlaps(chair.position[0],chair.position[2],chair.position[1],.31,.98),false,chair.id);
  const footprint=q=>Math.abs(Math.sin(q.rotationY))>.5?[.62,.56]:[.56,.62];
  for(let i=0;i<c.chairs.length;i++)for(let j=i+1;j<c.chairs.length;j++){
    const a=c.chairs[i],b=c.chairs[j],as=footprint(a),bs=footprint(b);
    assert.ok(Math.abs(a.position[0]-b.position[0])>=(as[0]+bs[0])/2||Math.abs(a.position[2]-b.position[2])>=(as[1]+bs[1])/2,a.id+' intersects '+b.id);
  }
  for(const chair of c.chairs) for(const t of [...c.objects.tables,c.objects.windowDesk]){
    const size=footprint(chair);
    assert.ok(Math.abs(chair.position[0]-t.position[0])>=size[0]/2+t.width/2||Math.abs(chair.position[2]-t.position[2])>=size[1]/2+t.depth/2,chair.id+' intersects '+t.id);
  }
});
test('shelf and furniture leave both door swings clear', () => {
  const door=c.building.doors[1],shelf=c.objects.shelf,bench=c.objects.workbench;
  assert.ok(door.z+door.width/2<shelf.position[2]-.7);
  assert.ok(bench.position[0]+bench.width/2<shelf.position[0]-.23);
  for(const d of c.building.doors) for(const chair of c.chairs){
    const [width,depth]=Math.abs(Math.sin(chair.rotationY))>.5?[.62,.56]:[.56,.62];
    assert.ok(chair.position[0]+width/2<d.x-d.width/2||chair.position[0]-width/2>d.x+.1||chair.position[2]+depth/2<d.z-d.width/2||chair.position[2]-depth/2>d.z+d.width/2,chair.id+' obstructs '+d.id);
  }
});

test('electrical boxes and their conduits are on solid wall, clear of doors and windows', () => {
  const root=new THREE.Group(),world=new CollisionWorld(),material=new THREE.MeshBasicMaterial();
  buildBuilding(root,new Proxy({}, {get:()=>material}),world);root.updateMatrixWorld(true);
  for(const [side,openings] of [['veranda',c.building.doors],['window',c.building.windows]])for(let i=0;i<3;i++)for(const kind of ['conduit','outlet-box','junction-box']){
    const fixture=root.getObjectByName(`wall-${kind}-${side}-${i}`);assert.ok(fixture);
    const bounds=new THREE.Box3().setFromObject(fixture);
    for(const opening of openings)assert.ok(bounds.max.z < opening.z-opening.width/2-.04 || bounds.min.z > opening.z+opening.width/2+.04,fixture.name+' crosses glass opening at '+opening.z);
    assert.ok(world.boxes.some(w=>w.id.startsWith('wall-')&&w.minZ<=bounds.min.z&&w.maxZ>=bounds.max.z&&w.minX<=bounds.max.x&&w.maxX>=bounds.min.x),fixture.name+' has no supporting wall');
  }
  for(const plate of [...c.objects.lightSwitches,c.objects.electricalOutlet])assert.ok(Math.abs(plate.position[0]+.0225-c.building.room.width/2)<1e-9,'Plate must touch wall');
});
test('physical-object IDs stay unique without photo duplication', () => {
  const items=[...Object.values(c.objects).flat(),...c.chairs,...c.building.doors,...c.unplacedObjects];
  assert.equal(new Set(items.map(o=>o.id)).size,items.length);
  assert.equal(c.objects.printers.length,2);assert.ok(c.objects.display.position[2]<0&&c.objects.workbench.position[2]>0);
  assert.ok(c.unplacedObjects.every(o=>!o.enabled&&o.position===null));
  assert.equal(c.objects.entranceSign.id, 'sign-tinkerspace');
  assert.ok(c.objects.entranceSign.position[2] < p.main.minZ, 'sign faces the entry landing');
});

test('entry porch is a continuous raised surface under the roof approach', () => {
  const w=building(), v=p.lobby, f=c.building.room.floorY;
  for(let z=v.minZ-.2;z<=v.maxZ+.2;z+=.1) assert.equal(w.ground(3.8,z,f),f);
});
test('single stairs remain connected, while upper deck cannot teleport a visitor from below', () => {
  const w=building(),s=c.building.stairs,x=(s.minX+s.maxX)/2;
  const f=c.building.room.floorY;
  assert.equal(w.ground(x,5,0),0);assert.equal(w.ground(x,5,f),f);
  let feet=0;for(let z=s.bottomZ+.1;z>=s.topZ-.1;z-=.04){const y=w.ground(x,z,feet);assert.ok(y>=feet-.0001&&y-feet<=c.player.stepHeight);feet=y;}
  assert.ok(Math.abs(feet-f)<.01);
  const position={x:3.75,y:f,z:0};w.move(position,15,0);assert.ok(position.x<s.minX);
});
test('landing 12 is flat, wide and shared by geometry and collision between two runs', () => {
  const s=c.building.stairs,profile=createStairLayout(s,c.building.room.floorY),w=building();
  assert.equal(profile.lowerCount,11);assert.equal(profile.upperCount,13);
  assert.equal(profile.segments.filter(q=>!q.isLanding).length,24);
  assert.ok(profile.landing.maxZ-profile.landing.minZ>profile.treadDepth*3);
  for(let z=profile.landing.minZ+.01;z<profile.landing.maxZ;z+=.05) assert.equal(w.ground((s.minX+s.maxX)/2,z,profile.landing.height),profile.landing.height);
  for(const step of profile.segments) assert.equal(w.ground((s.minX+s.maxX)/2,(step.minZ+step.maxZ)/2,step.height),step.height);
  assert.equal(profile.railPoints[1][1],profile.railPoints[2][1]);
  assert.ok(Math.abs(profile.segments.at(-1).minZ-s.topZ)<1e-8);
});
