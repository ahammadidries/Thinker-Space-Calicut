import { sceneConfig } from '../config/scene-config.js';
export function terrainHeight(x, z) {
  // Upper path reaches workshop grade; lower parking sits below the veranda.
  return Math.max(0, Math.min(sceneConfig.building.room.floorY, (-z + 7) / 17 * sceneConfig.building.room.floorY));
}
export function baseGroundHeight(x, z) {
  const b = sceneConfig.building;
  return x > -b.room.width / 2 - .4 && x < b.veranda.outerX + .2 && z > b.veranda.nearZ && z < b.veranda.farZ + .2 ? 0 : terrainHeight(x, z);
}
export class CollisionWorld {
  constructor() { this.boxes = []; this.surfaces = []; }
  addBox(id, minX, maxX, minY, maxY, minZ, maxZ) {
    const collider = { id, minX, maxX, minY, maxY, minZ, maxZ, enabled: true }; this.boxes.push(collider); return collider;
  }
  box(id, size, pos) { return this.addBox(id, pos[0] - size[0] / 2, pos[0] + size[0] / 2, pos[1] - size[1] / 2, pos[1] + size[1] / 2, pos[2] - size[2] / 2, pos[2] + size[2] / 2); }
  addSurface(id, minX, maxX, minZ, maxZ, height) { this.surfaces.push({ id, minX, maxX, minZ, maxZ, height }); }
  ground(x, z, feet = 100) {
    // Under the raised building and parking deck, retain the lower ground.
    let height = baseGroundHeight(x, z);
    for (const s of this.surfaces) if (x >= s.minX && x <= s.maxX && z >= s.minZ && z <= s.maxZ) {
      const y = typeof s.height === 'function' ? s.height(x, z) : s.height;
      if (y <= feet + sceneConfig.player.stepHeight && y > height) height = y;
    }
    return height;
  }
  overlaps(x, z, y, radius = sceneConfig.player.radius, height = sceneConfig.player.height, ignore = '') {
    return this.boxes.some(b => b.enabled && b.id !== ignore && y + height > b.minY + .04 && y < b.maxY - .04 &&
      (Math.max(b.minX, Math.min(x, b.maxX)) - x) ** 2 + (Math.max(b.minZ, Math.min(z, b.maxZ)) - z) ** 2 < radius ** 2);
  }
  move(position, dx, dz) {
    const count = Math.max(1, Math.ceil(Math.hypot(dx, dz) / .09));
    for (let i = 0; i < count; i++) {
      if (!this.overlaps(position.x + dx / count, position.z, position.y)) position.x += dx / count;
      if (!this.overlaps(position.x, position.z + dz / count, position.y)) position.z += dz / count;
    }
    position.x = Math.max(-27, Math.min(27, position.x)); position.z = Math.max(-28, Math.min(28, position.z));
  }
}
