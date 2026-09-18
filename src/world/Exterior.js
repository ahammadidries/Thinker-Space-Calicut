import * as THREE from 'three';
import { terrainHeight, baseGroundHeight } from '../game/CollisionWorld.js';
import { seededRandom } from './materials.js';
import { box, cylinder, beam, group, sphere } from './primitives.js';

export function buildExterior(parent, m, collision) {
  const rng = seededRandom(100);
  const ground = new THREE.PlaneGeometry(64, 64, 70, 70); ground.rotateX(-Math.PI / 2);
  const positions = ground.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), z = positions.getZ(i);
    positions.setY(i, baseGroundHeight(x, z) - .06);
  }
  ground.computeVertexNormals(); const terrain = new THREE.Mesh(ground, m.soil); terrain.receiveShadow = true; parent.add(terrain);
  // Upper approach and sloping side path converge with the lower parking walk.
  const path = (points, width, lower = false) => {
    const curve = new THREE.CatmullRomCurve3(points.map(([x, z]) => new THREE.Vector3(x, lower ? .015 : terrainHeight(x, z) + .025, z)));
    const p = curve.getPoints(90), vertices = [], uv = [];
    for (let i = 0; i < p.length; i++) {
      const tangent = curve.getTangent(i / (p.length - 1)); const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize().multiplyScalar(width / 2);
      for (const sign of [-1, 1]) { const v = p[i].clone().addScaledVector(side, sign); vertices.push(...v.toArray()); uv.push(sign === 1 ? 1 : 0, i * .3); }
      if (i > 0) for (const sign of [-1, 1]) {
        const end = p[i].clone().addScaledVector(side, sign); const prevT = curve.getTangent((i - 1) / (p.length - 1)); const prevSide = new THREE.Vector3(-prevT.z, 0, prevT.x).normalize().multiplyScalar(width / 2); const start = p[i - 1].clone().addScaledVector(prevSide, sign);
        start.y += .04; end.y += .04; beam(parent, m.curb, start.toArray(), end.toArray(), .11, .16);
      }
    }
    const indices = []; for (let i = 0; i < p.length - 1; i++) { const a = i * 2; indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geometry.setIndex(indices); geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, m.path); mesh.receiveShadow = true; parent.add(mesh);
  };
  path([[3.7, -25], [3.6, -18], [3.8, -13], [3.8, -11.47]], 2.5);
  path([[5.7, -24], [12, -18], [13, -9], [11.4, 0], [11.2, 7], [8, 12], [4.4, 19]], 3.1);
  path([[4.4, 21], [5.6, 13], [5.5, 8], [5.65, 4]], 3.9, true);
  box(parent, m.path, [11, .08, 4], [1.6, -.01, 10.7]);
  box(parent, m.veranda, [2.3, .06, 1.1], [5.65, -.02, 4.1]);
  // Repeated foliage uses shared geometry and instancing.
  const trunkMatrices = [], leafMatrices = [], leafColors = [], grassMatrices = [];
  const temp = new THREE.Object3D();
  for (let i = 0; i < 125; i++) {
    const x = (rng() - .5) * 58, z = (rng() - .5) * 58;
    if (x > -5.7 && x < 8.5 && z > -14 && z < 12) continue;
    if (Math.abs(x - 3.7) < 2.3 && z < -10) continue;
    if (x > 8 && x < 15 && z < 14 && z > -22) continue;
    if (x > 2 && x < 9 && z > 10) continue;
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
    const x = -5.8 + rng() * 2, z = 9.5 + rng() * 3, height = 5 + rng() * 4;
    beam(parent, m.moss, [x, 0, z], [x - rng() * 1.8, height, z + rng()], .045);
  }
  for (const [x, z] of [[12.7, -13], [13.3, -2], [10.8, 10]]) {
    const y = terrainHeight(x, z); cylinder(parent, m.steel, .055, 3.3, [x, y + 1.65, z]);
    cylinder(parent, m.concrete, .35, .055, [x, y + 3.3, z], 24); cylinder(parent, m.led, .23, .025, [x, y + 3.25, z], 20);
  }
  // Three motorcycles visible together below the far veranda. Stylized proxies.
  for (let i = 0; i < 3; i++) {
    const g = group(parent, [-2.8 + i * 1.25, 0, 9.4], .15);
    for (const z of [-.53, .53]) { const wheel = cylinder(g, m.rubber, .26, .13, [0, .28, z], 16); wheel.rotation.z = Math.PI / 2; const hub = cylinder(g, m.silver, .14, .14, [0, .28, z], 12); hub.rotation.z = Math.PI / 2; }
    beam(g, m.steel, [0, .3, -.55], [0, .85, -.28], .08); beam(g, m.steel, [0, .32, .5], [0, .61, -.3], .1);
    box(g, i === 0 ? m.red : m.black, [.34, .28, .45], [0, .67, -.05]); box(g, m.black, [.35, .13, .55], [0, .8, .34]); beam(g, m.steel, [-.3, .99, -.35], [.3, .99, -.35], .03);
  }
}
