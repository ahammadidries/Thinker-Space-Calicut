import {mkdir,writeFile} from 'node:fs/promises';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {createSpaceHost} from '../src/host/createSpaceHost.js';

globalThis.FileReader=class {
  readAsArrayBuffer(blob){blob.arrayBuffer().then(value=>{this.result=value;this.onloadend?.()})}
  readAsDataURL(blob){blob.arrayBuffer().then(value=>{this.result=`data:${blob.type};base64,${Buffer.from(value).toString('base64')}`;this.onloadend?.()})}
};
const {root,clips,skeleton}=createSpaceHost();
const binary=await new GLTFExporter().parseAsync(root,{binary:true,animations:clips,onlyVisible:true});
await mkdir('public/models',{recursive:true});
await writeFile('public/models/space-host.glb',Buffer.from(binary));
const meshes=[];
root.traverse(o=>{if(o.isMesh)meshes.push({name:o.name,material:o.material.name,triangles:o.geometry.index.count/3,vertices:o.geometry.attributes.position.count,skinned:o.isSkinnedMesh,uv:!!o.geometry.attributes.uv})});
const metadata={asset:'space-host.glb',bytes:binary.byteLength,triangles:meshes.reduce((s,m)=>s+m.triangles,0),bones:skeleton.bones.map(b=>b.name),clips:clips.map(c=>({name:c.name,duration:c.duration})),meshes,units:'metres',up:'+Y',forward:'+Z',editableMaterial:'HostShirt',textures:0,identity:'Reference-informed original stylized likeness. Nameplate is separate UI.',generator:'tools/export-host.mjs'};
await writeFile('public/models/space-host.manifest.json',JSON.stringify(metadata,null,2)+'\n');
console.log(JSON.stringify({bytes:metadata.bytes,triangles:metadata.triangles,bones:metadata.bones.length,clips:metadata.clips.map(c=>c.name)},null,2));
