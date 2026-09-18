import * as THREE from 'three';
import { createMaterials } from './world/materials.js';
import { buildBuilding } from './world/Building.js';
import { buildRoof } from './world/Roof.js';
import { buildExterior } from './world/Exterior.js';
import { buildInterior } from './world/Interior.js';
import { group, mergeStatic } from './world/primitives.js';
import { CollisionWorld } from './game/CollisionWorld.js';
import { PlayerController } from './game/PlayerController.js';
import { InteractionManager } from './game/InteractionManager.js';
import { UI } from './ui/UI.js';
import { sceneConfig } from './config/scene-config.js';
import './styles.css';

const $ = id => document.getElementById(id);
try {
  const renderer = new THREE.WebGLRenderer({ canvas: $('world'), antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#c4d3c1'); scene.fog = new THREE.Fog('#c4d3c1', 25, 66);
  const camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, .045, 110);
  const hemisphere = new THREE.HemisphereLight('#e4edd6', '#6d6f4f', 1.65); scene.add(hemisphere);
  const sun = new THREE.DirectionalLight('#fff0d6', 3.0); sun.position.set(-13, 24, -11); sun.castShadow = true;
  Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: .1, far: 65 }); sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.00025; sun.shadow.normalBias = .035; scene.add(sun);
  const materials = createMaterials(), collision = new CollisionWorld(), ui = new UI();
  const interaction = new InteractionManager(scene, camera, collision, ui);
  const player = new PlayerController(camera, renderer.domElement, collision, active => ui.setExploring(active));
  const architecture = group(scene, [0, 0, 0], 0, 'architecture'), roof = group(scene, [0, 0, 0], 0, 'roof'), exterior = group(scene, [0, 0, 0], 0, 'grounds'), interior = group(scene, [0, 0, 0], 0, 'interior');
  buildBuilding(architecture, materials, collision); buildRoof(roof, materials); buildExterior(exterior, materials, collision); buildInterior(interior, materials, interaction, collision);
  mergeStatic(architecture); mergeStatic(roof); mergeStatic(exterior);
  for (const item of interaction.items.values()) if (/^(chair-|table-|electronics-table|window-desk|tall-shelf|printer-workbench)/.test(item.id)) mergeStatic(item.group);
  const start = async () => { ui.started = true; $('landing').hidden = true; ['guide-modal', 'map-modal', 'pause-modal'].forEach(id => $(id).hidden = true); player.syncCamera(); await player.lock(); if (player.fallback) ui.toast('Hold the left mouse button and drag to look around.'); };
  $('enter').onclick = start; $('guide-enter').onclick = start; $('resume').onclick = start;
  $('menu-button').onclick = () => player.pause();
  $('home').onclick = e => { e.preventDefault(); if (ui.started) player.pause(); };
  $('reset').onclick = () => location.reload();
  $('close-inspector').onclick = () => { $('inspector').hidden = true; ui.inspected = null; };
  $('guide-button').onclick = () => ui.openModal('guide-modal'); $('close-guide').onclick = () => ui.closeModal('guide-modal');
  const openMap = () => { ui.openModal('map-modal'); $('pause-modal').hidden = true; if (player.active) player.pause(); };
  const closeMap = () => { ui.closeModal('map-modal'); if (ui.started) ui.setExploring(false); };
  $('map-button').onclick = openMap; $('close-map').onclick = closeMap;
  if (new URLSearchParams(location.search).get('view') === 'plan') openMap();
  document.querySelectorAll('[data-view]').forEach(el => el.onclick = () => { player.reset(el.dataset.view); start(); });
  $('quality').onchange = e => { const q = e.target.value; renderer.setPixelRatio(q === 'high' ? Math.min(devicePixelRatio, 2) : q === 'balanced' ? Math.min(devicePixelRatio, 1.5) : 1); renderer.shadowMap.enabled = q !== 'low'; renderer.shadowMap.needsUpdate = true; ui.toast(`Visual quality: ${q}`); };
  document.addEventListener('keydown', e => {
    if (e.repeat) return;
    if (e.code === 'KeyE' && player.active) interaction.act(player);
    if (e.code === 'KeyR' && player.active) interaction.act(player, 'rotate');
    if (e.code === 'KeyM') { if ($('map-modal').hidden) openMap(); else closeMap(); }
    if (e.code === 'Escape') {
      if (!$('map-modal').hidden) closeMap(); else if (!$('guide-modal').hidden) ui.closeModal('guide-modal'); else if (player.active) player.pause();
    }
  });
  window.addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && player.active) player.pause(); });
  let previous = performance.now(), elapsed = 0, frame = 0;
  renderer.setAnimationLoop(time => {
    const dt = Math.min((time - previous) / 1000, .04); previous = time; elapsed += dt;
    if (!ui.started) { const orbit = Math.sin(elapsed * .025) * .25; camera.position.set(13.7 + orbit, 9.8, 18.3 - orbit); camera.lookAt(-1.8, 4.1, -.5); }
    else player.update(dt);
    interaction.update(dt, player);
    if (frame++ % 8 === 0) ui.update(player);
    renderer.render(scene, camera);
  });
  // Read-only state and explicit navigation hooks for local smoke tests.
  if (import.meta.env.DEV) window.__twin = { scene, camera, renderer, player, collision, interaction, config: sceneConfig, ui, start, ready: true };
} catch (error) {
  console.error(error); $('fatal').hidden = false; $('fatal').textContent = `The 3D scene could not start. Enable WebGL in a modern desktop browser and reload. ${error.message}`;
}
