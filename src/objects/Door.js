import * as THREE from 'three';
import { box, group, beam } from '../world/primitives.js';

export function addDoor(parent, materials, config, registry, collision, floor) {
  const g = group(parent, [config.x, floor, config.z], 0, config.id), w = config.width, h = config.height;
  for (const z of [-w / 2, w / 2]) box(g, materials.steel, [.12, h, .045], [0, h / 2, z]);
  box(g, materials.steel, [.12, .055, w], [0, h, 0]);
  const leaves = [];
  for (const side of [-1, 1]) {
    const pivot = group(g, [0, 0, side * w / 2]);
    const center = -side * w / 4;
    for (const z of [0, -side * w / 2]) box(pivot, materials.steel, [.065, h - .03, .045], [0, h / 2, z]);
    for (const y of [.06, h - .05]) box(pivot, materials.steel, [.065, .07, w / 2], [0, y, center]);
    box(pivot, materials.glass, [.018, h - .2, w / 2 - .06], [0, h / 2, center]);
    beam(pivot, materials.steel, [.07, .85, -side * (w / 2 - .1)], [.07, 1.2, -side * (w / 2 - .1)], .025);
    const collider = collision.box(`${config.id}-${side}`, [.08, h, w / 2], [config.x, floor + h / 2, config.z + side * w / 4]);
    leaves.push({ pivot, side, collider });
  }
  let angle = 0, goal = 0;
  const bounds = new THREE.Box3();
  const item = registry.add({ id: config.id, group: g, label: config.id.includes('display') ? 'Display-end glass doors' : 'Printer-end glass doors', category: 'Passage', state: 'Closed', action: 'Open doors', detail: 'The two workshop entrances open onto the same upper veranda.',
    interact(player) {
      if (Math.hypot(player.position.x - config.x, player.position.z - config.z) < .95 && player.position.x < config.x + .2) return 'Step back from the door swing.';
      goal = goal ? 0 : Math.PI * .46; return goal ? 'Opening doors' : 'Closing doors';
    },
    update(dt, player) {
      const proposed = THREE.MathUtils.damp(angle, goal, 6, dt);
      const old = angle;
      for (const leaf of leaves) leaf.pivot.rotation.y = leaf.side * proposed;
      g.updateWorldMatrix(true, true);
      let blocked = false;
      for (const leaf of leaves) {
        bounds.setFromObject(leaf.pivot);
        const p = player.position, r = .27;
        if (p.y < bounds.max.y && p.y + 1.65 > bounds.min.y && p.x > bounds.min.x - r && p.x < bounds.max.x + r && p.z > bounds.min.z - r && p.z < bounds.max.z + r) blocked = true;
      }
      angle = blocked ? old : proposed;
      for (const leaf of leaves) {
        leaf.pivot.rotation.y = leaf.side * angle; leaf.pivot.updateWorldMatrix(true, true); bounds.setFromObject(leaf.pivot);
        Object.assign(leaf.collider, { minX: bounds.min.x, maxX: bounds.max.x, minY: bounds.min.y, maxY: bounds.max.y, minZ: bounds.min.z, maxZ: bounds.max.z });
      }
      item.state = angle > 1.3 ? 'Open' : angle < .05 ? 'Closed' : 'Moving'; item.action = goal ? 'Close doors' : 'Open doors';
    },
  });
  return item;
}
