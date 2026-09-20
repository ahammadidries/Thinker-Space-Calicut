import * as THREE from 'three';
import { CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
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
import { AvatarManager } from './avatars/AvatarManager.js';
import { avatarConfig } from './config/avatar-config.js';
import { SpaceHost } from './host/SpaceHost.js';
import { HostDialog } from './host/HostDialog.js';
import './styles.css';

const $ = id => document.getElementById(id);
try {
  const renderer = new THREE.WebGLRenderer({ canvas: $('world'), alpha: true, antialias: true, powerPreference: 'high-performance' });
  const liveRenderer = new CSS3DRenderer();
  liveRenderer.domElement.id = 'live-display-layer';
  Object.assign(liveRenderer.domElement.style, { position: 'fixed', inset: '0', zIndex: '0', pointerEvents: 'none' });
  document.body.prepend(liveRenderer.domElement);
  liveRenderer.setSize(innerWidth, innerHeight);
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
  const host = new SpaceHost(scene, collision, interaction, {onTalk: () => hostDialog.open(), onError: () => ui.toast('The Space Host could not load. Reload the room to retry.')});
  const avatars=avatarConfig.enabled?new AvatarManager(scene,collision,interaction):null;
  avatars?.start();
  window.addEventListener('pagehide',()=>{avatars?.dispose();host.dispose();hostDialog.dispose();},{once:true});
  const start = async () => { ui.started = true; $('landing').hidden = true; ['guide-modal', 'map-modal', 'pause-modal'].forEach(id => $(id).hidden = true); player.syncCamera(); await player.lock(); if (player.fallback) ui.toast('Hold the left mouse button and drag to look around.'); };
  const hostDialog = new HostDialog({
    onOpen: () => { host.converse(true); player.pause(); $('pause-modal').hidden = true; $('inspector').hidden = true; ui.inspected = null; },
    onClose: () => { host.converse(false); start(); },
    onAnswer: () => host.respond(),
  });
  renderer.domElement.addEventListener('click', () => { if (player.active && interaction.target?.id === 'space-host') interaction.act(player); });
  const tvControls = document.createElement('div');
  tvControls.id = 'tv-controls'; tvControls.hidden = true;
  const tvHint = document.createElement('span'); tvHint.textContent = 'Live display · updates automatically';
  const tvLink = document.createElement('a'); tvLink.textContent = 'Open source website ↗'; tvLink.href = sceneConfig.objects.display.url; tvLink.target = '_blank'; tvLink.rel = 'noopener noreferrer';
  const tvBack = document.createElement('button'); tvBack.textContent = 'Back to exploration';
  tvControls.append(tvHint, tvLink, tvBack); document.body.append(tvControls);
  const stopViewingTV = () => { tvControls.hidden = true; liveRenderer.domElement.classList.remove('tv-viewing'); renderer.domElement.style.pointerEvents = ''; $('workshop-live-tv').style.pointerEvents = 'none'; player.syncCamera(); };
  tvBack.onclick = () => { stopViewingTV(); start(); };
  window.addEventListener('view-live-tv', () => {
    player.pause();
    $('pause-modal').hidden = true;
    $('inspector').hidden = true;
    tvControls.hidden = false;
    liveRenderer.domElement.classList.add('tv-viewing');
    renderer.domElement.style.pointerEvents = 'none';
    $('workshop-live-tv').style.pointerEvents = 'auto';
    const tv = scene.getObjectByName('display-01');
    const center = tv.getWorldPosition(new THREE.Vector3());
    camera.position.copy(center).add(new THREE.Vector3(0, 0, 1.85).applyQuaternion(tv.getWorldQuaternion(new THREE.Quaternion())));
    camera.lookAt(center);
    // Pointer-lock change arrives asynchronously and normally opens Pause.
    setTimeout(() => { if (!tvControls.hidden) { $('pause-modal').hidden = true; $('workshop-live-tv').focus(); } }, 150);
  });
  $('enter').onclick = start; $('guide-enter').onclick = start; $('resume').onclick = start;
  $('menu-button').onclick = () => { if (!tvControls.hidden) stopViewingTV(); player.pause(); };
  $('home').onclick = e => { e.preventDefault(); if (!tvControls.hidden) stopViewingTV(); if (ui.started) player.pause(); };
  $('reset').onclick = () => location.reload();
  $('close-inspector').onclick = () => { $('inspector').hidden = true; ui.inspected = null; };
  $('guide-button').onclick = () => ui.openModal('guide-modal'); $('close-guide').onclick = () => ui.closeModal('guide-modal');
  const openMap = () => { if (!tvControls.hidden) stopViewingTV(); ui.openModal('map-modal'); $('pause-modal').hidden = true; if (player.active) player.pause(); };
  const closeMap = () => { ui.closeModal('map-modal'); if (ui.started) ui.setExploring(false); };
  $('map-button').onclick = openMap; $('close-map').onclick = closeMap;
  if (new URLSearchParams(location.search).get('view') === 'plan') openMap();
  document.querySelectorAll('[data-view]').forEach(el => el.onclick = () => { player.reset(el.dataset.view); start(); });
  $('quality').onchange = e => { const q = e.target.value; renderer.setPixelRatio(q === 'high' ? Math.min(devicePixelRatio, 2) : q === 'balanced' ? Math.min(devicePixelRatio, 1.5) : 1); renderer.shadowMap.enabled = q !== 'low'; renderer.shadowMap.needsUpdate = true; ui.toast(`Visual quality: ${q}`); };
  document.addEventListener('keydown', e => {
    if (hostDialog.isOpen || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (e.repeat) return;
    if (e.code === 'KeyE' && player.active) interaction.act(player);
    if (e.code === 'KeyR' && player.active) interaction.act(player, 'rotate');
    if (e.code === 'KeyM') { if ($('map-modal').hidden) openMap(); else closeMap(); }
    if (e.code === 'Escape') {
      if (!tvControls.hidden) { stopViewingTV(); ui.setExploring(false); return; }
      if (!$('map-modal').hidden) closeMap(); else if (!$('guide-modal').hidden) ui.closeModal('guide-modal'); else if (player.active) player.pause();
    }
  });
  window.addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); liveRenderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && player.active) player.pause(); });
  let previous = performance.now(), elapsed = 0, frame = 0;
  renderer.setAnimationLoop(time => {
    const dt = Math.min((time - previous) / 1000, .04); previous = time; elapsed += dt;
    if (!ui.started) { const orbit = Math.sin(elapsed * .025) * .25; camera.position.set(13.7 + orbit, 9.8, 18.3 - orbit); camera.lookAt(-1.8, 4.1, -.5); }
    else if (tvControls.hidden) player.update(dt);
    interaction.update(dt, player);
    avatars?.update(dt,camera,ui.started?player:null);
    host.update(dt,camera,ui.started?player:null);
    if (frame++ % 8 === 0) ui.update(player);
    renderer.render(scene, camera);
    liveRenderer.render(scene, camera);
  });
  // Read-only state and explicit navigation hooks for local smoke tests.
  if (import.meta.env.DEV) window.__twin = { scene, camera, renderer, player, collision, interaction, avatars, host, hostDialog, config: sceneConfig, ui, start, ready: true };
} catch (error) {
  console.error(error); $('fatal').hidden = false; $('fatal').textContent = `The 3D scene could not start. Enable WebGL in a modern desktop browser and reload. ${error.message}`;
}
