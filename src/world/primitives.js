import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const cube = new THREE.BoxGeometry(1, 1, 1);
export function box(parent, material, size, position = [0, 0, 0], name = '') {
  const mesh = new THREE.Mesh(cube, material); mesh.scale.set(...size); mesh.position.set(...position); mesh.name = name;
  mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
export function cylinder(parent, material, radius, height, position, segments = 12) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, segments), material);
  mesh.position.set(...position); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
export function beam(parent, material, a, b, width = .07, depth = width) {
  const av = new THREE.Vector3(...a), bv = new THREE.Vector3(...b);
  const m = box(parent, material, [width, av.distanceTo(bv), depth], av.clone().add(bv).multiplyScalar(.5).toArray());
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), bv.sub(av).normalize()); return m;
}
export function group(parent, position = [0, 0, 0], rotationY = 0, name = '') {
  const g = new THREE.Group(); g.position.set(...position); g.rotation.y = rotationY; g.name = name; parent.add(g); return g;
}
export function sphere(parent, material, radius, position, scale = [1, 1, 1]) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(radius, 10, 6), material); m.position.set(...position); m.scale.set(...scale); m.castShadow = true; parent.add(m); return m;
}
export function mergeStatic(root) {
  root.updateMatrixWorld(true);
  const inverse = root.matrixWorld.clone().invert();
  const materials = new Map(); const originals = [];
  root.traverse(o => { if (!o.isMesh || o.isInstancedMesh || o.material.transparent) return; const transform = inverse.clone().multiply(o.matrixWorld); const g = o.geometry.clone().applyMatrix4(transform); const key = o.material.uuid; if (!materials.has(key)) materials.set(key, { material: o.material, geometries: [] }); materials.get(key).geometries.push(g); originals.push(o); });
  originals.forEach(o => o.removeFromParent());
  for (const { material, geometries } of materials.values()) {
    const merged = mergeGeometries(geometries, false);
    if (merged) { const m = new THREE.Mesh(merged, material); m.castShadow = true; m.receiveShadow = true; root.add(m); }
    geometries.forEach(g => g.dispose());
  }
}
