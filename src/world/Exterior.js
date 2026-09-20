import * as THREE from 'three';
import { sceneConfig } from '../config/scene-config.js';
import { terrainHeight, baseGroundHeight } from '../game/CollisionWorld.js';
import { seededRandom } from './materials.js';
import { box, cylinder, beam } from './primitives.js';
import { buildSiteRoads } from './SiteRoads.js';
import { onSiteRoad } from '../config/site-layout.js';
import { buildParking } from './Parking.js';

export function buildExterior(parent, m, collision) {
  const rng = seededRandom(100);
  const ground = new THREE.PlaneGeometry(64, 64, 70, 70); ground.rotateX(-Math.PI / 2);
  const positions = ground.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), z = positions.getZ(i);
    positions.setY(i, baseGroundHeight(x, z) - .06);
  }
  ground.computeVertexNormals(); const terrain = new THREE.Mesh(ground, m.soil); terrain.receiveShadow = true; parent.add(terrain);
  buildSiteRoads(parent, m, collision, sceneConfig.site.roads, [sceneConfig.site.parking]);
  buildParking(parent, m, collision, sceneConfig.site.parking);
  box(parent, m.veranda, [2.3, .06, 1.1], [5.767, -.02, sceneConfig.building.stairs.bottomZ + .5]);
  // Repeated foliage uses shared geometry and instancing.
  const trunkMatrices = [], leafMatrices = [], leafColors = [], grassMatrices = [];
  const temp = new THREE.Object3D();
  for (let i = 0; i < 125; i++) {
    const x = (rng() - .5) * 58, z = (rng() - .5) * 58;
    if (x > -5.7 && x < 8.5 && z > -14 && z < 12) continue;
    if (onSiteRoad(x,z,sceneConfig.site.roads,1.8)) continue;
    const y = terrainHeight(x, z), height = 6.5 + rng() * 6.5, radius = .1 + rng() * .22;
    temp.position.set(x, y + height / 2, z); temp.scale.set(radius, height, radius); temp.rotation.set(0, 0, (rng() - .5) * .08); temp.updateMatrix(); trunkMatrices.push(temp.matrix.clone());
    if (Math.abs(x) < 22 && Math.abs(z) < 24) collision.box(`tree-${i}`, [radius * 2, height, radius * 2], [x, y + height / 2, z]);
    for (let j = 0; j < 7; j++) {
      temp.position.set(x + (rng() - .5) * 3.3, y + height - .9 + rng() * 2.6, z + (rng() - .5) * 3.3);
      temp.scale.set(1.2 + rng() * 1.8, 1.2 + rng() * 1.4, 1.3 + rng() * 1.7); temp.rotation.set(rng(), rng() * 6, rng()); temp.updateMatrix(); leafMatrices.push(temp.matrix.clone()); leafColors.push(new THREE.Color().setHSL(.21 + rng() * .09, .12 + rng() * .15, .62 + rng() * .25));
      if (j < 3) beam(parent, m.trunk, [x, y + height * .6, z], [temp.position.x, temp.position.y - .4, temp.position.z], .07);
    }
    for (let j = 0; j < 8; j++) { temp.position.set(x + (rng() - .5) * 2.5, y + .3, z + (rng() - .5) * 2.5); temp.scale.set(.3, .6 + rng() * .45, .3); temp.rotation.set(0, rng() * 6, (rng() - .5)); temp.updateMatrix(); grassMatrices.push(temp.matrix.clone()); }
  }
  const instance = (geometry, material, matrices, colors) => { const mesh = new THREE.InstancedMesh(geometry, material, matrices.length); matrices.forEach((matrix, i) => { mesh.setMatrixAt(i, matrix); if (colors) mesh.setColorAt(i, colors[i]); }); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); };
  instance(new THREE.CylinderGeometry(1, 1.2, 1, 7), m.trunk, trunkMatrices);
  instance(new THREE.PlaneGeometry(2, 2), m.leaf, leafMatrices, leafColors);
  instance(new THREE.ConeGeometry(.5, 1, 5), m.moss, grassMatrices);
  // Slender bamboo cluster at the downhill end, observed in the exterior views.
  for (let i = 0; i < 23; i++) {
    const x = -4.5 + rng() * 1.2, z = 7.1 + rng() * 2.1, height = 5 + rng() * 4;
    beam(parent, m.moss, [x, 0, z], [x - rng() * 1.8, height, z - rng()], .045);
  }
  for (const [x, z] of [[14.1, -10], [14.1, -2], [14.1, 8]]) {
    const y = terrainHeight(x, z); cylinder(parent, m.steel, .055, 3.3, [x, y + 1.65, z]);
    cylinder(parent, m.concrete, .35, .055, [x, y + 3.3, z], 24); cylinder(parent, m.led, .23, .025, [x, y + 3.25, z], 20);
  }
}
