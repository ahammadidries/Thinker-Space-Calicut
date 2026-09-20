import * as THREE from 'three';
import { box, beam, cylinder, group, sphere } from '../world/primitives.js';

export function makeTable(parent, m, cfg) {
  const g = group(parent, cfg.position, cfg.rotationY || 0, cfg.id), w = cfg.width, d = cfg.depth;
  box(g, m.wood, [w, .065, d], [0, .775, 0]);
  for (const x of [-w / 2 + .1, w / 2 - .1]) {
    for (const z of [-d / 2 + .1, d / 2 - .1]) beam(g, m.steel, [x, .04, z], [x, .75, z], .045);
    beam(g, m.steel, [x, .13, -d / 2 + .06], [x, .13, d / 2 - .06], .045);
  }
  beam(g, m.steel, [-w / 2 + .1, .21, 0], [w / 2 - .1, .21, 0], .04);
  return g;
}
export function makeChair(parent, m, cfg) {
  const g = group(parent, cfg.position, cfg.rotationY || 0, cfg.id);
  box(g, m.black, [.49, .045, .46], [0, .46, 0]);
  const back = box(g, m.mesh, [.47, .48, .035], [0, .735, .22]); back.rotation.x = .1;
  for (const x of [-.21, .21]) {
    beam(g, m.black, [x * 1.17, .01, -.25], [x, .48, -.17], .03);
    beam(g, m.black, [x * 1.13, .01, .31], [x, .93, .24], .029);
    beam(g, m.black, [x * 1.25, .66, -.18], [x * 1.25, .66, .22], .035);
    beam(g, m.black, [x * 1.25, .66, -.12], [x, .44, -.12], .025);
  }
  return g;
}
export function makeCabinet(parent, m, cfg, width = 1.45) {
  width = cfg.width ?? width;
  const depth = cfg.depth ?? .55, height = cfg.height ?? .84, doorCount = cfg.doorCount ?? 2;
  const g = group(parent, cfg.position, cfg.rotationY || 0, cfg.id);
  for (const x of [-width / 2 + .025, width / 2 - .025]) box(g, m.wood, [.05, height - .06, depth - .06], [x, (height - .06) / 2, 0]);
  box(g, m.wood, [width, .06, depth], [0, height - .03, 0], 'cabinet-table-worktop');
  box(g, m.wood, [width - .06, .045, depth - .06], [0, .045, 0]);
  box(g, m.wood, [width - .06, height - .12, .035], [0, height / 2, -depth / 2 + .025]);
  box(g, m.wood, [width - .1, .03, depth - .08], [0, height / 2, 0]);
  const panels = [];
  const leafWidth = (width - .08) / doorCount;
  for (let index = 0; index < doorCount; index++) {
    const pivot = group(g, [-width / 2 + .04 + index * leafWidth, 0, depth / 2 - .03], 0, 'cabinet-door-' + (index + 1));
    box(pivot, m.wood, [leafWidth - .018, height - .16, .035], [leafWidth / 2, height / 2 - .015, 0]);
    box(pivot, m.silver, [.018, .12, .025], [leafWidth - .08, height * .57, .035]);
    if (index > 0) box(g, m.wood, [.03, height - .12, depth - .08], [-width / 2 + .04 + index * leafWidth, height / 2, -.015]);
    panels.push({ pivot, side: -1, index });
  }
  return { group: g, panels };
}
export function makeShelf(parent, m, cfg) {
  const g = group(parent, cfg.position, cfg.rotationY, cfg.id);
  for (const x of [-.68, 0, .68]) box(g, m.wood, [.055, 2.55, .46], [x, 1.275, 0]);
  for (const y of [.035, .65, 1.3, 1.93, 2.55]) box(g, m.wood, [1.4, .055, .47], [0, y, 0]);
  box(g, m.wood, [1.4, 2.55, .035], [0, 1.275, -.24]);
  for (const [x, y] of [[-.33, .8], [.31, 1.47], [-.35, 1.49]]) { box(g, m.black, [.38, .25, .31], [x, y, 0]); beam(g, m.black, [x - .1, y + .13, -.08], [x + .1, y + .13, -.08], .025); }
  return g;
}
export function makeLaptop(parent, m, x, z, rotate = 0, y = .815) {
  const g = group(parent, [x, y, z], rotate);
  box(g, m.silver, [.38, .02, .27]);
  const screen = box(g, m.black, [.38, .245, .018], [0, .135, -.12]); screen.rotation.x = -.16;
  const panel = box(g, m.blue, [.345, .205, .003], [0, .135, -.107]); panel.rotation.x = -.16;
  for (let row = 0; row < 4; row++) box(g, m.black, [.29, .002, .014], [0, .012, -.04 + row * .028]);
}
export function makePrinter(parent, m, cfg) {
  const g = group(parent, cfg.position, cfg.rotationY || 0, cfg.id);
  if (cfg.scale) g.scale.setScalar(cfg.scale);
  box(g, m.silver, [.54, .085, .51], [0, .045, 0]);
  for (const x of [-.22, .22]) box(g, m.silver, [.035, .55, .035], [x, .32, -.05]);
  box(g, m.silver, [.47, .035, .04], [0, .59, -.05]);
  const bed = box(g, m.black, [.39, .025, .37], [0, .115, .025]);
  const gantry = group(g, [0, .37, -.05]);
  box(gantry, m.steel, [.44, .025, .03]);
  const head = box(gantry, m.white, [.065, .095, .07], [0, -.015, .035]);
  box(g, m.black, [.12, .065, .08], [.16, .095, .235]);
  const spool = cylinder(g, m.black, .1, .06, [.06, .72, -.08], 20); spool.rotation.x = Math.PI / 2;
  cylinder(g, m.white, .027, .065, [.06, .72, -.08], 12).rotation.x = Math.PI / 2;
  beam(g, m.white, [.06, .65, -.055], [0, .4, .0], .005);
  const print = cylinder(g, m.indicator, .035, .07, [0, .16, .03], 6);
  return { group: g, head, bed, print };
}
export function makeFan(parent, m, cfg) {
  const g = group(parent, cfg.position, cfg.rotationY, cfg.id);
  box(g, m.white, [.13, .31, .06], [0, -.07, 0]);
  beam(g, m.silver, [0, -.18, .03], [0, 0, .23], .045);
  const face = group(g, [0, .04, .25]); face.rotation.x = -.18;
  const blades = group(face, [0, 0, 0]);
  for (let i = 0; i < 3; i++) { const blade = sphere(blades, m.concrete, .12, [Math.sin(i * Math.PI * 2 / 3) * .12, Math.cos(i * Math.PI * 2 / 3) * .12, 0], [.7, 1.5, .07]); blade.rotation.z = -i * Math.PI * 2 / 3; }
  for (const radius of [.12, .2, .28]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, .005, 4, 36), m.silver); ring.position.z = .045; face.add(ring); }
  for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; beam(face, m.silver, [0, 0, .065], [Math.cos(a) * .28, Math.sin(a) * .28, .035], .005); }
  sphere(face, m.white, .04, [0, 0, .08], [1, 1, .45]);
  return { group: g, blades };
}
