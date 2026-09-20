import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {sceneConfig as c} from '../src/config/scene-config.js';
import {distanceToRoad} from '../src/config/site-layout.js';
import {buildSiteRoads,roadHeight} from '../src/world/SiteRoads.js';
import {CollisionWorld} from '../src/game/CollisionWorld.js';
import {buildBuilding} from '../src/world/Building.js';

test('sketch roads connect the broad road, veranda route and first-floor lobby',()=>{
  const byId=id=>c.site.roads.find(r=>r.id===id),main=byId('main-road'),side=byId('veranda-road'),upper=byId('upper-road'),branch=byId('lobby-branch');
  assert.ok(main.width>side.width);
  assert.ok(distanceToRoad(...side.points[0],main)<.01);
  assert.ok(distanceToRoad(...side.points.at(-1),upper)<.01);
  assert.ok(distanceToRoad(...branch.points.at(-1),upper)<upper.width/2);
  assert.equal(branch.points[0][1],c.plan.lobby.minZ);
  assert.ok(branch.points[0][0]>c.plan.lobby.minX&&branch.points[0][0]<c.plan.lobby.maxX);
});

test('road render heights match walkable surfaces and both floor approaches remain connected',()=>{
  const root=new THREE.Group(),world=new CollisionWorld(),mat=new THREE.MeshBasicMaterial(),m=new Proxy({},{get:()=>mat});
  buildBuilding(root,m,world);buildSiteRoads(root,m,world,c.site.roads);
  for(const road of c.site.roads){
    assert.ok(root.getObjectByName(road.id));
    for(const [x,z] of road.samples){
      const y=roadHeight(road,x,z),ground=world.ground(x,z,y);
      assert.ok(Math.abs(ground-y)<.012,`${road.id} floats or has a ground mismatch`);
    }
  }
  const lower=c.site.roads.find(r=>r.id==='lower-walk'),end=lower.points.at(-1);
  assert.ok(world.ground(...[end[0],end[1],0])<.05,'Lower approach must not jump to the first floor');
  const branch=c.site.roads.find(r=>r.id==='lobby-branch');
  let feet=c.building.room.floorY;
  for(const [x,z] of [...branch.samples].reverse()){
    const y=world.ground(x,z,feet);assert.ok(Math.abs(y-feet)<=c.player.stepHeight);assert.equal(world.overlaps(x,z,y),false);feet=y;
  }
  assert.ok(Math.abs(feet-c.building.room.floorY)<.05);
});
