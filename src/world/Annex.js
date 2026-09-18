import { sceneConfig } from '../config/scene-config.js';
import { box, cylinder, group } from './primitives.js';

export function buildAnnex(parent, m, collision, floor, solid) {
  const c = sceneConfig, plan = c.plan, f = c.building.room.floorY, h = c.building.room.wallHeight, t = c.building.room.wallThickness;
  for (const r of plan.rooms) floor(r.id, r.minX, r.maxX, r.minZ, r.maxZ, r.id === 'bathroom' ? m.bathroomFloor : r.id === 'entry-landing' ? m.veranda : m.annexFloor);
  const wall = (segment, height, y) => {
    const { a, b, id } = segment;
    solid(id, [Math.abs(a[0] - b[0]) || t, height, Math.abs(a[1] - b[1]) || t], [(a[0] + b[0]) / 2, y, (a[1] + b[1]) / 2]);
  };
  for (const segment of plan.annexWalls) wall(segment, h, f + h / 2);
  // The plan shows open passages. Headers complete the wall over each gap.
  for (const segment of plan.annexOpenings) wall({ ...segment, id: segment.id + '-header' }, h - 2.4, f + 2.4 + (h - 2.4) / 2);
  for (const cfg of plan.fixtures) {
    const g = group(parent, cfg.position, cfg.rotationY || 0, cfg.id);
    if (cfg.kind === 'toilet') {
      cylinder(g, m.white, .19, .36, [0, .18, 0], 18);
      box(g, m.white, [.43, .07, .55], [0, .4, 0]);
      box(g, m.white, [.4, .35, .14], [0, .58, .2]);
      collision.box(cfg.id, [.43, .77, .55], [cfg.position[0], f + .38, cfg.position[2]]);
    } else if (cfg.kind === 'basin') {
      box(g, m.white, [.58, .12, .42], [0, .85, 0]);
      box(g, m.silver, [.36, .01, .25], [0, .917, 0]);
      cylinder(g, m.silver, .012, .16, [0, .98, .16], 8);
      box(g, m.white, [.4, .7, .29], [0, .4, .05]);
      collision.box(cfg.id, [.58, 1.06, .42], [cfg.position[0], f + .53, cfg.position[2]]);
    } else {
      box(g, m.wood, [cfg.width, .055, cfg.depth], [0, .78, 0]);
      box(g, m.white, [cfg.width - .03, .73, cfg.depth - .04], [0, .39, 0]);
      collision.box(cfg.id, [cfg.width, .81, cfg.depth], [cfg.position[0], f + .405, cfg.position[2]]);
    }
  }
}
