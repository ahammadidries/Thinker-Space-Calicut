import * as THREE from 'three';
import { sceneConfig } from '../config/scene-config.js';
import { containsPlanPoint } from '../config/first-floor-plan.js';

export class PlayerController {
  constructor(camera, canvas, collision, onLockChange) {
    this.camera = camera; this.canvas = canvas; this.collision = collision; this.onLockChange = onLockChange;
    this.position = new THREE.Vector3(); this.keys = new Set(); this.yaw = 0; this.pitch = 0; this.velocityY = 0; this.grounded = true; this.active = false; this.dragging = false;
    this.reset('arrival');
    document.addEventListener('pointerlockchange', () => { this.active = document.pointerLockElement === canvas; this.keys.clear(); onLockChange(this.active); });
    document.addEventListener('mousemove', e => { if (this.active || this.dragging) { this.yaw -= e.movementX * .002; this.pitch = THREE.MathUtils.clamp(this.pitch - e.movementY * .002, -1.47, 1.47); } });
    document.addEventListener('keydown', e => { if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return; this.keys.add(e.code); if (this.active && ['Space', 'KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(e.code)) e.preventDefault(); });
    document.addEventListener('keyup', e => this.keys.delete(e.code));
    window.addEventListener('blur', () => { this.keys.clear(); this.dragging = false; });
    canvas.addEventListener('mousedown', () => { if (this.fallback) { this.dragging = true; this.active = true; } });
    document.addEventListener('mouseup', () => { this.dragging = false; });
  }
  reset(view = 'arrival') { const v = sceneConfig.viewpoints[view]; this.position.set(...v.position); this.yaw = v.yaw; this.pitch = v.pitch; this.velocityY = 0; this.keys.clear(); this.syncCamera(); }
  async lock() {
    try { if (!this.canvas.requestPointerLock) throw new Error('Pointer lock unavailable'); await this.canvas.requestPointerLock(); }
    catch { this.fallback = true; this.active = true; this.onLockChange(true); }
  }
  pause() { this.active = false; this.keys.clear(); document.exitPointerLock?.(); this.onLockChange(false); }
  syncCamera() { this.camera.position.copy(this.position); this.camera.position.y += sceneConfig.player.height; this.camera.rotation.order = 'YXZ'; this.camera.rotation.set(this.pitch, this.yaw, 0); }
  update(dt) {
    if (!this.active) return;
    const c = sceneConfig.player;
    const forward = Number(this.keys.has('KeyW') || this.keys.has('ArrowUp')) - Number(this.keys.has('KeyS') || this.keys.has('ArrowDown'));
    const right = Number(this.keys.has('KeyD') || this.keys.has('ArrowRight')) - Number(this.keys.has('KeyA') || this.keys.has('ArrowLeft'));
    const length = Math.hypot(forward, right) || 1, speed = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') ? c.sprint : c.speed;
    const dx = (right * Math.cos(this.yaw) - forward * Math.sin(this.yaw)) / length * speed * dt;
    const dz = (-forward * Math.cos(this.yaw) - right * Math.sin(this.yaw)) / length * speed * dt;
    this.collision.move(this.position, dx, dz);
    const ground = this.collision.ground(this.position.x, this.position.z, this.position.y);
    if (this.keys.has('Space') && this.grounded) { this.velocityY = c.jumpSpeed; this.grounded = false; this.keys.delete('Space'); }
    this.velocityY -= c.gravity * dt; this.position.y += this.velocityY * dt;
    if (this.position.y <= ground + .01 && this.velocityY <= 0) { this.position.y = ground; this.velocityY = 0; this.grounded = true; } else this.grounded = false;
    if (this.position.y < -5 || !Number.isFinite(this.position.y)) this.reset('arrival');
    this.syncCamera();
  }
  location() {
    const p = this.position, b = sceneConfig.building, s = b.stairs, v = b.veranda;
    if (p.y > b.room.floorY - .2) for (const r of [sceneConfig.plan.main, ...sceneConfig.plan.rooms]) if (containsPlanPoint(r, p.x, p.z)) return r.label;
    if (p.x > s.minX && p.x < s.maxX && p.z > s.topZ && p.z < s.bottomZ && p.y < b.room.floorY - .1) return 'Staircase';
    if (p.x > v.innerX && p.x < v.outerX && p.z > v.nearZ && p.z < v.farZ && p.y > b.room.floorY - .2) return 'Upper veranda';
    return p.z < -8 ? 'Uphill approach' : 'Garden & lower approach';
  }
}
