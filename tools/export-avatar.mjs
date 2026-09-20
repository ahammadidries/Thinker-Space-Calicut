import {mkdir,writeFile} from 'node:fs/promises';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {createOfficeAvatar} from '../src/avatars/createOfficeAvatar.js';
// Node's Blob is native; GLTFExporter also expects this browser adapter.
globalThis.FileReader=class {
  readAsArrayBuffer(blob){blob.arrayBuffer().then(value=>{this.result=value;this.onloadend?.()})}
  readAsDataURL(blob){blob.arrayBuffer().then(value=>{this.result=`data:${blob.type};base64,${Buffer.from(value).toString('base64')}`;this.onloadend?.()})}
};
const {root,clips,skeleton}=createOfficeAvatar();
const binary=await new GLTFExporter().parseAsync(root,{binary:true,animations:clips,onlyVisible:true});
await mkdir('public/models',{recursive:true});
await writeFile('public/models/office-avatar.glb',Buffer.from(binary));
const meshes=[];root.traverse(o=>{if(o.isMesh)meshes.push({name:o.name,material:o.material.name,triangles:o.geometry.index.count/3,vertices:o.geometry.attributes.position.count,skinned:o.isSkinnedMesh})});
const metadata={asset:'office-avatar.glb',bytes:binary.byteLength,triangles:meshes.reduce((s,m)=>s+m.triangles,0),bones:skeleton.bones.map(b=>b.name),clips:clips.map(c=>({name:c.name,duration:c.duration})),meshes,units:'metres',up:'+Y',forward:'+Z',seatHeight:.46,identity:'No name or personal data baked into asset',generator:'tools/export-avatar.mjs'};
await writeFile('public/models/office-avatar.manifest.json',JSON.stringify(metadata,null,2)+'\n');
console.log(JSON.stringify(metadata,null,2));
