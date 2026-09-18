import { sceneConfig } from '../config/scene-config.js';
import { box, cylinder, beam, group } from './primitives.js';
import { buildAnnex } from './Annex.js';

export function buildBuilding(parent, m, collision) {
  const b = sceneConfig.building, f = b.room.floorY, h = b.room.wallHeight, t = b.room.wallThickness;
  const w = b.room.width / 2, l = b.room.length / 2, v = b.veranda, s = b.stairs;
  const solid = (id, size, position, material = m.wall) => { box(parent, material, size, position, id); collision.box(id, size, position); };
  const floor = (id, x1, x2, z1, z2, material = m.veranda) => {
    box(parent, material, [x2 - x1, .2, z2 - z1], [(x1 + x2) / 2, f - .1, (z1 + z2) / 2]);
    collision.addSurface(id, x1, x2, z1, z2, f);
  };
  floor('workshop-floor', -w, w, -l, l, m.floor);
  // The entrance image confirms that the raised tiled porch projects forward beneath the roof.
  floor('entry-porch', v.innerX, v.outerX, v.entryPorchNearZ, v.nearZ);
  floor('veranda-passage', v.innerX, s.minX, v.nearZ, v.farZ);
  floor('stair-top-landing', s.minX, v.outerX, v.nearZ, s.topZ);
  floor('stair-bottom-overlook', s.minX, v.outerX, s.bottomZ, v.farZ);
  floor('rear-veranda', -w - .3, w, l, v.farZ);
  // Exterior mass only; references do not establish the lower room interiors.
  solid('lower-building-mass', [b.room.width, f - .2, l - v.nearZ], [0, (f - .2) / 2, (v.nearZ + l) / 2], m.darkWall);
  for (const z of [-5.2, .1, 5.4]) {
    box(parent, m.steel, [.04, 1.2, 1.5], [w + .015, 1.4, z]);
    box(parent, m.glass, [.05, 1.06, 1.36], [w + .04, 1.4, z]);
  }
  solid('display-wall', [b.room.width, h, t], [0, f + h / 2, -l]);
  solid('printer-wall', [b.room.width, h, t], [0, f + h / 2, l]);
  const longWall = (x, openings, windows) => {
    let edge = -l;
    for (const o of openings) {
      const low = o.z - o.width / 2, high = o.z + o.width / 2;
      if (low > edge) solid(`wall-${x}-${edge}`, [t, h, low - edge], [x, f + h / 2, (low + edge) / 2]);
      const sill = windows ? .18 : 0, top = windows ? 2.63 : 2.45;
      if (sill) solid(`sill-${o.z}`, [t, sill, o.width], [x, f + sill / 2, o.z]);
      solid(`lintel-${x}-${o.z}`, [t, h - top, o.width], [x, f + top + (h - top) / 2, o.z]);
      if (windows) {
        const frame = group(parent, [x, f, o.z]);
        for (const zz of [-o.width / 2, 0, o.width / 2]) box(frame, m.steel, [.13, 2.47, .045], [0, 1.405, zz]);
        for (const y of [.18, 1.05, 2.63]) box(frame, m.steel, [.13, .055, o.width], [0, y, 0]);
        box(frame, m.glass, [.025, 2.4, o.width - .05], [0, 1.4, 0]);
        collision.box(`glass-${o.z}`, [.12, 2.47, o.width], [x, f + 1.4, o.z]);
      }
      edge = high;
    }
    if (edge < l) solid(`wall-${x}-last`, [t, h, l - edge], [x, f + h / 2, (l + edge) / 2]);
  };
  longWall(-w, b.windows, true); longWall(w, b.doors, false);
  for (const x of [-w + t / 2, w - t / 2]) {
    // Baseboard follows the openings so it cannot seal a doorway.
    if (x < 0) box(parent, m.concrete, [.035, .13, b.room.length - .1], [x, f + .065, 0]);
    for (const z of [-3.4, .5, 4.1]) {
      beam(parent, m.white, [x, f + .2, z], [x, f + 3.08, z], .018);
      box(parent, m.white, [.045, .11, .18], [x, f + .55, z]);
      box(parent, m.white, [.05, .11, .13], [x, f + 2.65, z]);
    }
    beam(parent, m.white, [x, f + 3.07, -l + .1], [x, f + 3.07, l - .1], .02);
  }
  for (const x of [-1.7, 1.9]) { beam(parent, m.white, [x, f + .5, l - .13], [x, f + 3.1, l - .13], .02); box(parent, m.white, [.24, .12, .045], [x, f + 1.25, l - .15]); }
  // One continuous straight staircase, rising toward the uphill / display end.
  const run = s.bottomZ - s.topZ;
  for (let i = 0; i < s.steps; i++) {
    const rise = f * (s.steps - i) / s.steps;
    box(parent, m.veranda, [s.maxX - s.minX, rise, run / s.steps + .005], [(s.minX + s.maxX) / 2, rise / 2, s.topZ + (i + .5) * run / s.steps]);
    box(parent, m.silver, [s.maxX - s.minX - .1, .012, .025], [(s.minX + s.maxX) / 2, rise + .006, s.topZ + (i + 1) * run / s.steps - .015]);
  }
  collision.addSurface('stairs', s.minX, s.maxX, s.topZ, s.bottomZ + .2, (x, z) => Math.max(0, Math.min(f, (s.bottomZ - z) / run * f)));
  solid('stair-outer-retaining-wall', [.16, f, run], [v.outerX - .1, f / 2, (s.topZ + s.bottomZ) / 2], m.darkWall);
  const railing = (id, a, c, base = f, fullWall = false) => {
    const length = Math.hypot(c[0] - a[0], c[1] - a[1]);
    beam(parent, m.steel, [a[0], base + 1.02, a[1]], [c[0], base + 1.02, c[1]], .052);
    beam(parent, m.steel, [a[0], base + .08, a[1]], [c[0], base + .08, c[1]], .035);
    for (let i = 0; i <= length / .16; i++) { const k = i / Math.ceil(length / .16); const x = a[0] + (c[0] - a[0]) * k, z = a[1] + (c[1] - a[1]) * k; beam(parent, m.steel, [x, base + .08, z], [x, base + 1.02, z], .018); }
    const size = [Math.abs(c[0] - a[0]) + .08, 1.05, Math.abs(c[1] - a[1]) + .08];
    const pos = [(a[0] + c[0]) / 2, base + .525, (a[1] + c[1]) / 2];
    collision.box(id, size, pos);
    if (fullWall) box(parent, m.darkWall, [size[0], .8, size[2]], [pos[0], base + .4, pos[2]]);
  };
  railing('outer-veranda-railing', [v.outerX - .1, v.nearZ], [v.outerX - .1, v.farZ - .1], f, true);
  railing('rear-railing', [-w - .25, v.farZ - .1], [v.outerX - .1, v.farZ - .1]);
  railing('rear-west-railing', [-w - .25, l + .1], [-w - .25, v.farZ - .1]);
  railing('stair-opening-inner-rail', [s.minX - .05, s.topZ + .3], [s.minX - .05, s.bottomZ]);
  railing('stair-opening-far-rail', [s.minX - .05, s.bottomZ], [s.maxX + .05, s.bottomZ]);
  beam(parent, m.steel, [s.maxX - .05, f + .85, s.topZ], [s.maxX - .05, .85, s.bottomZ], .05);
  beam(parent, m.steel, [s.minX + .05, f + .85, s.topZ], [s.minX + .05, .85, s.bottomZ], .045);
  // Columns align along the outer veranda rather than filling the workshop.
  for (const z of [v.nearZ + .1, -5.5, -.7, 4.1, v.farZ - .1]) {
    cylinder(parent, m.concrete, .145, 6.28, [v.outerX - .1, 3.14, z], 18);
    cylinder(parent, m.steel, .16, .12, [v.outerX - .1, f + .06, z], 18);
    collision.box(`column-${z}`, [.3, 6.3, .3], [v.outerX - .1, 3.15, z]);
  }
  for (const x of [-w - .2, .4]) cylinder(parent, m.concrete, .15, 6.3, [x, 3.15, v.farZ - .1], 16);
  if (b.utility.enabled) buildAnnex(parent, m, collision, floor, solid);
}
