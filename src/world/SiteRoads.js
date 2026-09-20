import * as THREE from 'three';
import { terrainHeight } from '../game/CollisionWorld.js';
import { distanceToRoad, onSiteRoad } from '../config/site-layout.js';
import { beam } from './primitives.js';

export function roadHeight(road,x,z) {
  return (road.level==='lower'?0:terrainHeight(x,z))+road.surfaceOffset;
}

export function buildSiteRoads(parent,m,collision,roads) {
  for(const road of roads) {
    const vertices=[],uv=[],indices=[],edges=[[],[]],p=road.samples;
    for(let i=0;i<p.length;i++) {
      const prev=p[Math.max(0,i-1)],next=p[Math.min(p.length-1,i+1)];
      const dx=next[0]-prev[0],dz=next[1]-prev[1],length=Math.hypot(dx,dz);
      for(const [side,sign] of [[0,-1],[1,1]]) {
        const x=p[i][0]-sign*dz/length*road.width/2,z=p[i][1]+sign*dx/length*road.width/2;
        const point=[x,roadHeight(road,x,z),z];edges[side].push(point);vertices.push(...point);uv.push(side,i*.25);
      }
      if(i>0) {const a=(i-1)*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();
    const mesh=new THREE.Mesh(geometry,m.path);mesh.name=road.id;mesh.receiveShadow=true;parent.add(mesh);
    for(const edge of edges)for(let i=1;i<edge.length;i++) {
      const a=edge[i-1],b=edge[i];
      // Leave every junction open; curb strips must not cut across connecting roads.
      if(onSiteRoad(a[0],a[2],roads,.15,road)||onSiteRoad(b[0],b[2],roads,.15,road))continue;
      beam(parent,m.curb,[a[0],a[1]+.035,a[2]],[b[0],b[1]+.035,b[2]],.1,.13);
    }
    const xs=p.map(v=>v[0]),zs=p.map(v=>v[1]),half=road.width/2;
    collision.addSurface(road.id,Math.min(...xs)-half,Math.max(...xs)+half,Math.min(...zs)-half,Math.max(...zs)+half,
      (x,z)=>distanceToRoad(x,z,road)<=half?roadHeight(road,x,z):-Infinity);
  }
}
