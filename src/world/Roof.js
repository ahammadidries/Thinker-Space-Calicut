import * as THREE from 'three';
import { sceneConfig } from '../config/scene-config.js';
import { beam } from './primitives.js';

export function buildRoof(parent, m) {
  const r = sceneConfig.building.roof;
  const w = sceneConfig.building.room.width / 2;
  const { minX: a, maxX: b, minZ: n, maxZ: f, ridgeX: x, eaveY: e, ridgeY: h, hipLength: hip } = r;
  const corners = [[a, e, n], [b, e, n], [b, e, f], [a, e, f], [x, h, n + hip], [x, h, f - hip]];
  const indices = [0, 4, 1, 1, 4, 5, 1, 5, 2, 2, 5, 3, 3, 5, 4, 3, 4, 0];
  const vertices = [], uvs = [];
  for (const i of indices) { const p = corners[i]; vertices.push(...p); uvs.push(p[0] * .75, p[2] * .6 + p[1] * .6); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); geo.computeVertexNormals();
  const roof = new THREE.Mesh(geo, m.roof); roof.castShadow = true; roof.receiveShadow = true; parent.add(roof);
  for (let z = n + hip; z <= f - hip + .1; z += 2.6) {
    beam(parent, m.steel, [a, e - .12, z], [x, h - .12, z], .14, .18);
    beam(parent, m.steel, [x, h - .12, z], [b, e - .12, z], .14, .18);
    beam(parent, m.steel, [-w, e - .2, z], [w, e - .2, z], .12, .16);
    beam(parent, m.steel, [x, e - .2, z], [x, h - .12, z], .12);
    beam(parent, m.steel, [-w, e - .2, z], [x, h - .2, z], .08);
    beam(parent, m.steel, [w, e - .2, z], [x, h - .2, z], .08);
  }
  for (let k = 0; k < 13; k++) {
    const t = k / 12;
    for (const edge of [a, b]) {
      const xx = THREE.MathUtils.lerp(edge, x, t), yy = THREE.MathUtils.lerp(e, h, t) - .09;
      beam(parent, m.steel, [xx, yy, n + hip * t], [xx, yy, f - hip * t], .055);
    }
  }
  for (let z = n; z <= f; z += .62) {
    const inset = Math.min(1, Math.max(0, Math.min(z - n, f - z) / hip));
    const y = e + (h - e) * inset - .05;
    const xx = x;
    beam(parent, m.steel, [a, e - .05, z], [xx, y, z], .04);
    beam(parent, m.steel, [xx, y, z], [b, e - .05, z], .04);
  }
  for (const [i, j] of [[0, 4], [1, 4], [2, 5], [3, 5], [4, 5], [0, 1], [1, 2], [2, 3], [3, 0]]) beam(parent, m.steel, corners[i], corners[j], .15);
}
