import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import {hostConfig} from '../src/config/host-config.js';
import {sceneConfig} from '../src/config/scene-config.js';

const buffer=readFileSync(new URL('../public/models/space-host.glb',import.meta.url));
const asset=await new GLTFLoader().parseAsync(buffer.buffer.slice(buffer.byteOffset,buffer.byteOffset+buffer.byteLength),'');

test('Host GLB has editable PBR materials, UVs and normalized humanoid skinning',()=>{
  const materials=new Set();let triangles=0,blendedVertices=0;
  asset.scene.traverse(mesh=>{
    if(!mesh.isMesh)return;
    assert.ok(mesh.isSkinnedMesh);assert.ok(mesh.material.isMeshStandardMaterial);materials.add(mesh.material.name);
    assert.equal(mesh.geometry.attributes.uv.count,mesh.geometry.attributes.position.count);
    assert.ok([...mesh.geometry.attributes.position.array,...mesh.geometry.attributes.uv.array].every(Number.isFinite));
    triangles+=mesh.geometry.index.count/3;
    const weights=mesh.geometry.attributes.skinWeight,indices=mesh.geometry.attributes.skinIndex;
    for(let i=0;i<weights.count;i++){
      let total=0;for(let j=0;j<4;j++){const w=weights.array[i*4+j];assert.ok(w>=0&&w<=1);total+=w;assert.ok(indices.array[i*4+j]<mesh.skeleton.bones.length);}
      assert.ok(Math.abs(total-1)<1e-5);if(weights.getY(i)>0&&weights.getY(i)<1)blendedVertices++;
    }
  });
  for(const name of ['HostShirt','HostSkin','HostHair','HostPants','HostShoes'])assert.ok(materials.has(name));
  assert.ok(blendedVertices>100,'Continuous body/joint skin weights');assert.ok(triangles<20000);assert.ok(buffer.length<1800000);
  for(const joint of ['Hips','Spine','Chest','Neck','Head','LeftUpperArm','RightUpperArm','LeftForeArm','RightForeArm','LeftThigh','RightThigh','LeftShin','RightShin'])assert.ok(asset.scene.getObjectByName(joint)?.isBone);
  assert.equal(asset.scene.getObjectByName('host-nameplate'),undefined);
});

test('All nine standing clips bind, keep the root fixed and retain planted feet',()=>{
  assert.deepEqual(asset.animations.map(c=>c.name),['Idle','Breathing','Greeting','Talking','HeadTurn','LookAtVisitor','HandGesture','TurnLeft','TurnRight']);
  for(const clip of asset.animations){
    const model=clone(asset.scene),mixer=new THREE.AnimationMixer(model);mixer.clipAction(clip).play();model.updateMatrixWorld(true);
    const hips=model.getObjectByName('Hips').position.clone(),feet=['LeftFoot','RightFoot'].map(n=>model.getObjectByName(n).getWorldPosition(new THREE.Vector3()));
    for(let i=0;i<40;i++){
      mixer.update(clip.duration/40);model.updateMatrixWorld(true);
      assert.ok(model.getObjectByName('Hips').position.distanceTo(hips)<1e-6,clip.name);
      ['LeftFoot','RightFoot'].forEach((n,j)=>assert.ok(model.getObjectByName(n).getWorldPosition(new THREE.Vector3()).distanceTo(feet[j])<1e-6,clip.name));
      model.traverse(m=>{if(m.isSkinnedMesh){m.computeBoundingBox();assert.ok(m.boundingBox.min.toArray().concat(m.boundingBox.max.toArray()).every(Number.isFinite));}});
    }
    mixer.stopAllAction();mixer.uncacheRoot(model);
  }
});

test('Permanent host position leaves the screen projection and glass-door swing clear',()=>{
  const [x,y,z]=hostConfig.position,tv=sceneConfig.objects.display;
  assert.equal(y,sceneConfig.building.room.floorY);assert.ok(x-.52>tv.position[0]+1.67/2,'Even the nameplate clears the TV from directly in front');
  assert.ok(z>tv.position[2]+.4&&z<tv.position[2]+1.1,'Slightly in front of the display');
  const door=sceneConfig.building.doors.find(d=>d.id==='door-display-end');
  assert.ok(x+.34<door.x-.68-.15,'Shoulders clear the entire door swing');
});
