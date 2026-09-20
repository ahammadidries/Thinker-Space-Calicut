import { sceneConfig } from '../config/scene-config.js';
import { createFloorPlan } from './FloorPlan.js';

const $ = id => document.getElementById(id);
export class UI {
  constructor() { this.started = false; this.inspected = null; this.previousFocus = null; this.buildMap(); this.bindDialogKeys(); }
  setExploring(active) {
    $('landing').hidden = this.started; $('hud').hidden = !active; $('menu-button').hidden = !this.started;
    document.body.classList.toggle('exploring', this.started);
    if (!active && this.started && $('map-modal').hidden && $('guide-modal').hidden && ($('host-dialog')?.hidden ?? true)) { $('pause-modal').hidden = false; $('resume').focus(); }
    if (active) $('pause-modal').hidden = true;
  }
  prompt(item) { $('interaction-prompt').hidden = !item; if (item) { $('object-label').textContent = item.label; $('object-action').textContent = item.action; } }
  inspect(item) { this.inspected = item; $('inspector').hidden = false; this.updateInspector(); }
  updateInspector() { if (!this.inspected) return; const i = this.inspected; $('inspect-title').textContent = i.label; $('inspect-category').textContent = i.category.toUpperCase(); $('inspect-state').textContent = i.state; $('inspect-detail').textContent = i.detail; }
  toast(text) { $('toast').textContent = text; $('toast').hidden = false; clearTimeout(this.toastTimer); this.toastTimer = setTimeout(() => $('toast').hidden = true, 3400); }
  openModal(id) { this.previousFocus = document.activeElement; $(id).hidden = false; $(id).querySelector('button')?.focus(); }
  closeModal(id) { $(id).hidden = true; this.previousFocus?.focus(); }
  bindDialogKeys() {
    document.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const modal = [...document.querySelectorAll('.modal-shell')].find(el => !el.hidden);
      if (!modal) return;
      const focusable = [...modal.querySelectorAll('button,input,select,textarea,summary,a[href]')].filter(el => el.offsetParent !== null && !el.disabled);
      if (!focusable.length) return;
      const first = focusable[0], last = focusable.at(-1);
      if (e.shiftKey && (document.activeElement === first || !modal.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
      if (!e.shiftKey && (document.activeElement === last || !modal.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
    });
  }
  buildMap() {
    const { svg, X, Z } = createFloorPlan(sceneConfig);
    $('map-drawing').innerHTML = svg; this.mapX = X; this.mapZ = Z;
    const reference=document.createElement('a');reference.className='map-reference';reference.textContent='Road & seating reference ↗';
    reference.href=`${import.meta.env.BASE_URL}reference/first-floor-site-reference.png`;reference.target='_blank';reference.rel='noopener noreferrer';
    document.querySelector('.map-card').append(reference);
  }
  update(player) { $('location-label').textContent = player.location(); this.updateInspector(); if (!$('map-modal').hidden) { const p = player.position; $('map-marker').setAttribute('cx', Math.max(10, Math.min(410, this.mapX(p.x)))); $('map-marker').setAttribute('cy', Math.max(35, Math.min(790, this.mapZ(p.z)))); } }
}
