import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {sceneConfig as c} from '../src/config/scene-config.js';
import {distanceToRoad} from '../src/config/site-layout.js';
import {buildSiteRoads,roadHeight} from '../src/world/SiteRoads.js';
import {CollisionWorld} from '../src/game/CollisionWorld.js';
import {buildBuilding} from '../src/world/Building.js';
import {buildParking} from '../src/world/Parking.js';

test('sketch roads connect the broad road, veranda route and first-floor lobby',()=>{
  const byId=id=>c.site.roads.find(r=>r.id===id),main=byId('main-road'),side=byId('veranda-road'),upper=byId('upper-road'),branch=byId('lobby-branch');
  assert.ok(main.width>side.width);
  assert.ok(distanceToRoad(...side.points[0],main)<.01);
  assert.ok(distanceToRoad(...side.points.at(-1),upper)<.01);
  assert.ok(distanceToRoad(...branch.points.at(-1),upper)<upper.width/2);
  assert.equal(branch.points[0][1],c.plan.lobby.minZ);
  assert.ok(branch.points[0][0]>c.plan.lobby.minX&&branch.points[0][0]<c.plan.lobby.maxX);
});

test('marked strip is road and the shaded bike parking is directly below the balcony',()=>{
  const root=new THREE.Group(),world=new CollisionWorld(),mat=new THREE.MeshBasicMaterial(),m=new Proxy({},{get:()=>mat}),p=c.site.parking;
  buildBuilding(root,m,world);buildSiteRoads(root,m,world,c.site.roads,[p]);buildParking(root,m,world,p);root.updateMatrixWorld(true);
  for(const key of ['minX','maxX','minZ','maxZ'])assert.equal(p[key],c.plan.balcony[key]);
  const strip=c.site.roads.find(r=>r.id==='balcony-front-road');
  assert.ok(Math.abs(strip.points[0][1]-strip.width/2-p.maxZ)<.01);
  for(const bike of p.bikes){
    const bounds=new THREE.Box3().setFromObject(root.getObjectByName(bike.id));
    assert.ok(bounds.min.x>=p.minX&&bounds.max.x<=p.maxX&&bounds.min.z>=p.minZ&&bounds.max.z<=p.maxZ,'Bike is outside balcony shade');
    assert.ok(bounds.max.y<c.building.room.floorY-.2);assert.equal(bike.rotationY,Math.PI/2);
  }
  const position={x:1.2,y:.035,z:12};
  for(let i=0;i<100;i++){world.move(position,0,-.035);position.y=world.ground(position.x,position.z,position.y);}
  assert.ok(position.z<8.6,'Parking approach is blocked');assert.ok(position.y<.05,'Parking must remain below the balcony');
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
  assert.ok(world.ground(end[0],end[1],0)<.05,'Lower approach must not jump to the first floor');
  const branch=c.site.roads.find(r=>r.id==='lobby-branch');
  let feet=c.building.room.floorY;
  for(const [x,z] of [...branch.samples].reverse()){
    const y=world.ground(x,z,feet);assert.ok(Math.abs(y-feet)<=c.player.stepHeight);assert.equal(world.overlaps(x,z,y),false);feet=y;
  }
  assert.ok(Math.abs(feet-c.building.room.floorY)<.05);
});
