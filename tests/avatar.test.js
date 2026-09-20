import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import {normalizeActiveUsers,shirtColor} from '../src/avatars/identity.js';
import {avatarConfig} from '../src/config/avatar-config.js';

const buffer=readFileSync(new URL('../public/models/office-avatar.glb',import.meta.url));
const asset=await new GLTFLoader().parseAsync(buffer.buffer.slice(buffer.byteOffset,buffer.byteOffset+buffer.byteLength),'');
test('Presence deduplicates people across check-ins and validates before replacing a roster',()=>{
  assert.deepEqual(normalizeActiveUsers([{membershipId:7,id:1,name:' First ',spaceId:2},{membershipId:7,id:2,name:'Updated',spaceId:2},{mid:8,name:'Second',spaceId:2},{membershipId:9,name:'Other space',spaceId:1}]),[{id:'7',name:'Updated'},{id:'8',name:'Second'}]);
  assert.throws(()=>normalizeActiveUsers({error:'offline'}));assert.throws(()=>normalizeActiveUsers([{name:'No ID'}]));assert.deepEqual(normalizeActiveUsers([]),[]);
  assert.equal(shirtColor(7,avatarConfig.shirtColors),shirtColor('7',avatarConfig.shirtColors));
});
test('Exported GLB has named PBR materials, independent skinned body parts and a complete rig',()=>{
  const names=new Set();let triangles=0;
  asset.scene.traverse(mesh=>{if(!mesh.isMesh)return;assert.ok(mesh.isSkinnedMesh);assert.ok(mesh.material.isMeshStandardMaterial);names.add(mesh.material.name);triangles+=(mesh.geometry.index?.count??mesh.geometry.attributes.position.count)/3;
    const weights=mesh.geometry.attributes.skinWeight,indices=mesh.geometry.attributes.skinIndex;
    for(let i=0;i<weights.count;i++){let sum=0;for(let j=0;j<4;j++){sum+=weights.array[i*4+j];assert.ok(indices.array[i*4+j]<mesh.skeleton.bones.length)}assert.ok(Math.abs(sum-1)<1e-5)}
  });
  for(const name of ['SkinMaterial','HairMaterial','AvatarShirt','PantsMaterial','ShoesMaterial'])assert.ok(names.has(name));
  assert.ok(triangles<6000);assert.ok(buffer.length<600000);
  for(const name of ['Hips','Spine','Chest','Neck','Head','LeftThigh','RightThigh','LeftShin','RightShin','LeftFoot','RightFoot','LeftUpperArm','RightUpperArm','LeftForeArm','RightForeArm'])assert.ok(asset.scene.getObjectByName(name)?.isBone);
});
test('All five exported clips bind and sitting/getting up reach the chair height',()=>{
  assert.deepEqual(asset.animations.map(c=>c.name),['Idle','Walk','Sit','SittingIdle','GetUp']);
  for(const clip of asset.animations){const model=clone(asset.scene),mixer=new THREE.AnimationMixer(model),action=mixer.clipAction(clip);action.setLoop(THREE.LoopOnce,1);action.clampWhenFinished=true;action.play();mixer.update(clip.duration);model.updateMatrixWorld(true);const hips=model.getObjectByName('Hips');assert.ok(Math.abs(hips.position.y-(['Sit','SittingIdle'].includes(clip.name)?.56:.97))<.01,clip.name);model.traverse(o=>{assert.ok(o.position.toArray().every(Number.isFinite))});mixer.stopAllAction();mixer.uncacheRoot(model)}
});
test('Separate instances share geometry while bones and shirt colors stay independent',()=>{
  const a=clone(asset.scene),b=clone(asset.scene);const as=a.getObjectByName('Shirt'),bs=b.getObjectByName('Shirt');as.material=as.material.clone();as.material.color.set('#4285F4');assert.notEqual(as.material.color.getHex(),bs.material.color.getHex());assert.equal(as.geometry,bs.geometry);assert.notEqual(as.skeleton.bones[0],bs.skeleton.bones[0]);as.material.dispose();
});
test('Default behavior favors two to four minutes seated and short walking breaks',()=>{
  assert.deepEqual(avatarConfig.seatedSeconds,[120,240]);assert.ok(avatarConfig.maxWalkSeconds<=12);assert.ok(avatarConfig.maxWanderDistance<=3);
});
