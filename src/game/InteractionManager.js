import * as THREE from 'three';
import { sceneConfig } from '../config/scene-config.js';

export class InteractionManager {
  constructor(scene, camera, collision, ui) {
    this.scene = scene; this.camera = camera; this.collision = collision; this.ui = ui; this.items = new Map();
    this.ray = new THREE.Raycaster(); this.ray.far = sceneConfig.player.interactionRange;
    this.outline = new THREE.Box3Helper(new THREE.Box3(), 0xd8eea2); this.outline.material.depthTest = false; this.outline.material.transparent = true; this.outline.material.opacity = .65;
    this.outline.visible = false; this.outline.renderOrder = 20; this.outline.userData.ignoreRay = true; scene.add(this.outline);
  }
  add(item) {
    if (this.items.has(item.id)) throw new Error(`Duplicate physical object ID: ${item.id}`);
    item.group.userData.interactiveId = item.id; item.state ??= 'Ready'; this.items.set(item.id, item); return item;
  }
  update(dt, player) {
    for (const item of this.items.values()) item.update?.(dt, player);
    if (!player.active) { this.target = null; this.outline.visible = false; this.ui.prompt(null); return; }
    this.scene.updateMatrixWorld(); this.camera.updateMatrixWorld(true); this.ray.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    // Ray against the entire world: walls/glass/other objects occlude interactions.
    const hits = this.ray.intersectObjects(this.scene.children, true);
    let target = null;
    for (const hit of hits) {
      if (hit.object.userData.ignoreRay || hit.object.type === 'Box3Helper' || !hit.object.visible) continue;
      let object = hit.object;
      while (object && !object.userData.interactiveId) object = object.parent;
      if (object) target = this.items.get(object.userData.interactiveId);
      break;
    }
    this.target = target;
    this.outline.visible = !!target && target.highlight !== false;
    if (this.outline.visible) this.outline.box.setFromObject(target.group).expandByScalar(.015);
    this.ui.prompt(target);
  }
  act(player, action = 'primary') {
    if (!this.target) return;
    const item = this.target;
    const message = action === 'rotate' ? item.rotate?.(player) : item.interact?.(player);
    if (message) this.ui.toast(message);
    if (item.inspect !== false) this.ui.inspect(item);
  }
}
