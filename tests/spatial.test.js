import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { sceneConfig as c } from '../src/config/scene-config.js';
import { firstFloorPlan as p } from '../src/config/first-floor-plan.js';
import { CollisionWorld } from '../src/game/CollisionWorld.js';
import { buildBuilding } from '../src/world/Building.js';

function building() {
  const world = new CollisionWorld(), material = new THREE.MeshBasicMaterial();
  buildBuilding(new THREE.Group(), new Proxy({}, { get: () => material }), world);
  return world;
}
test('supplied dimensions replace old photographic proportions', () => {
  assert.equal(c.building.room.width, 5.8); assert.equal(c.building.room.length, 14.6);
  assert.ok(Math.abs(p.annex.partitionX - p.annex.minX - 2.21) < 1e-9);
  assert.ok(Math.abs(p.annex.maxX - p.annex.partitionX - 2.13) < 1e-9);
  assert.ok(Math.abs(p.main.maxX - p.annex.partitionX - 3.46) < 1e-9);
  assert.ok(Math.abs(p.main.minZ - p.annex.minZ - 5.36) < 1e-9);
  assert.equal(c.building.windows.length, 3);
  assert.deepEqual(c.building.doors.map(d => d.z), [-6.3, 4.6]);
  assert.ok(c.building.veranda.entryPorchNearZ < c.building.veranda.nearZ);
});
test('annex has separate rooms with open connections matching the drawing', () => {
  const w = building(), f = c.building.room.floorY;
  assert.deepEqual(p.rooms.filter(r => r.statedArea).map(r => r.statedArea), [3.7, 3.7, 6.4, 3.4]);
  assert.ok(w.overlaps(-.56, -11.5, f), 'Divider between Other 2 and Other 3');
  assert.ok(w.overlaps(-.56, -8.2, f), 'Bathroom divider');
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
  assert.equal(c.chairs.filter(q=>q.position[2]>-7.3&&q.position[2]<7.3&&q.position[0]<2.9).length,25);
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
test('physical-object IDs stay unique without photo duplication', () => {
  const items=[...Object.values(c.objects).flat(),...c.chairs,...c.building.doors,...c.unplacedObjects];
  assert.equal(new Set(items.map(o=>o.id)).size,items.length);
  assert.equal(c.objects.printers.length,2);assert.ok(c.objects.display.position[2]<0&&c.objects.workbench.position[2]>0);
  assert.ok(c.unplacedObjects.every(o=>!o.enabled&&o.position===null));
  assert.equal(c.objects.entranceSign.id, 'sign-tinkerspace');
  assert.ok(c.objects.entranceSign.position[2] < p.main.minZ, 'sign faces the entry landing');
});

test('entry porch is a continuous raised surface under the roof approach', () => {
  const w=building(), v=c.building.veranda, f=c.building.room.floorY;
  assert.equal(w.ground((v.innerX+v.outerX)/2,(v.entryPorchNearZ+v.nearZ)/2,f),f);
});
test('single stairs remain connected, while upper deck cannot teleport a visitor from below', () => {
  const w=building(),s=c.building.stairs,x=(s.minX+s.maxX)/2;
  assert.equal(w.ground(x,5,0),0);assert.equal(w.ground(x,5,3.2),3.2);
  let feet=0;for(let z=s.bottomZ+.1;z>=s.topZ-.1;z-=.04){const y=w.ground(x,z,feet);assert.ok(y>=feet-.0001&&y-feet<.1);feet=y;}
  assert.ok(Math.abs(feet-3.2)<.01);
  const position={x:3.75,y:3.2,z:0};w.move(position,15,0);assert.ok(position.x<4.4);
});
