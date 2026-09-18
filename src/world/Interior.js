import * as THREE from 'three';
import { sceneConfig } from '../config/scene-config.js';
import { makeDisplayTexture, makeTinkerspaceBoardTexture } from './materials.js';
import { box, beam, group, cylinder } from './primitives.js';
import { makeTable, makeChair, makeCabinet, makeShelf, makeLaptop, makePrinter, makeFan } from '../objects/Furniture.js';
import { addDoor } from '../objects/Door.js';

export function buildInterior(parent, m, registry, collision) {
  const c = sceneConfig, f = c.building.room.floorY;
  const registerSolid = (cfg, g, size, label, detail) => {
    const collider = collision.box(cfg.id, size, [cfg.position[0], cfg.position[1] + size[1] / 2, cfg.position[2]]);
    const item = registry.add({ id: cfg.id, group: g, label, category: 'Furniture', state: 'Fixed', action: 'Inspect', detail, interact: () => detail });
    return { item, collider };
  };
  for (const cfg of [...c.objects.tables, c.objects.windowDesk]) {
    const g = makeTable(parent, m, cfg);
    registerSolid(cfg, g, [cfg.width, .81, cfg.depth], cfg.id === 'window-desk-01' ? 'Wall workbench' : cfg.id === 'window-table-01' ? 'Window-side table' : 'Shared worktable', 'Footprint follows the supplied first-floor plan. Chairs are aligned with the table edges.');
    if (!cfg.id.includes('window') && !cfg.id.includes('electronics')) {
      makeLaptop(g, m, -.5, -.03, 0);
      box(g, m.paper, [.32, .006, .23], [.24, .814, .07]);
      box(g, m.black, [.22, .025, .12], [.53, .827, -.15]);
      cylinder(g, m.blue, .038, .22, [-1.1, .926, .1]);
      const cable = new THREE.CatmullRomCurve3([new THREE.Vector3(-.25, .82, -.1), new THREE.Vector3(.15, .82, -.3), new THREE.Vector3(.42, .82, -.38), new THREE.Vector3(.58, .8, -.5), new THREE.Vector3(.58, .25, -.55)]);
      g.add(new THREE.Mesh(new THREE.TubeGeometry(cable, 16, .004, 4, false), m.black));
    } else if (cfg.id === 'window-desk-01') for (const z of [-1.75, 0, 1.75]) makeLaptop(g, m, 0, z, Math.PI / 2);
    else if (cfg.id === 'window-table-01') makeLaptop(g, m, 0, 0);
  }
  for (const cfg of c.chairs) {
    const g = makeChair(parent, m, cfg), start = g.position.clone();
    const collider = collision.box(cfg.id, [.58, .98, .62], [g.position.x, f + .49, g.position.z]);
    const updateCollider = () => { collider.minX = g.position.x - .32; collider.maxX = g.position.x + .32; collider.minZ = g.position.z - .32; collider.maxZ = g.position.z + .32; };
    const item = registry.add({ id: cfg.id, group: g, category: 'Furniture', label: 'Mesh chair', state: 'Aligned to plan', action: 'Move chair · R rotate', detail: 'Starts aligned with its table or wall group. Move in small steps or rotate, within 0.9 m of the starting position.',
      interact(player) {
        const dir = new THREE.Vector3().subVectors(g.position, player.position); dir.y = 0; dir.normalize();
        const pos = g.position.clone().addScaledVector(dir, .2);
        if (pos.distanceTo(start) > .9 || collision.overlaps(pos.x, pos.z, pos.y, .36, .98, cfg.id) || Math.abs(collision.ground(pos.x, pos.z, pos.y) - pos.y) > .08) return 'This chair cannot move farther in that direction.';
        g.position.copy(pos); updateCollider(); item.state = 'Moved'; return 'Chair moved 20 cm';
      },
      rotate() { if (collision.overlaps(g.position.x, g.position.z, g.position.y, .38, .98, cfg.id)) return 'There is not enough room to rotate this chair.'; g.rotation.y += Math.PI / 8; item.state = 'Rotated'; return 'Chair rotated'; },
    });
  }
  const benchCfg = c.objects.workbench, bench = group(parent, benchCfg.position, 0, benchCfg.id);
  box(bench, m.wood, [benchCfg.width, .07, benchCfg.depth], [0, .915, 0]);
  box(bench, m.wood, [2.35, .84, .67], [.1, .42, 0]);
  for (const x of [-benchCfg.width / 2 + .1, benchCfg.width / 2 - .1]) beam(bench, m.wood, [x, .02, .27], [x, .88, .27], .08);
  box(bench, m.wood, [1.4, .045, benchCfg.depth - .05], [1.7, .34, 0]);
  for (const x of [-.58, .2, .98]) box(bench, m.wood, [.74, .73, .035], [x, .46, -.35]);
  registerSolid(benchCfg, bench, [benchCfg.width, .96, benchCfg.depth], 'Printer workbench', 'One continuous bench on the wall opposite the display. Two distinct printers are visible together in the reference.');
  for (const cfg of c.objects.printers) {
    const printer = makePrinter(parent, m, cfg); let time = 0;
    const item = registry.add({ id: cfg.id, group: printer.group, category: 'Fabrication', label: cfg.id.endsWith('01') ? '3D printer · larger frame' : '3D printer · compact frame', state: 'Idle', action: 'Start / pause motion', detail: 'A simple demonstration of gantry and bed motion. No real print job is sent.',
      interact() { item.state = item.state === 'Idle' ? 'Active' : 'Idle'; return `Printer ${item.state.toLowerCase()}`; },
      update(dt) { if (item.state === 'Active') { time += dt; printer.head.position.x = Math.sin(time * 1.8) * .16; printer.bed.position.z = Math.cos(time) * .065; } },
    });
  }
  const shelfCfg = c.objects.shelf, shelf = makeShelf(parent, m, shelfCfg);
  registerSolid(shelfCfg, shelf, [.48, 2.56, 1.4], 'Open wooden shelf', 'One shelf at the printer-end doorway. The network cabinet is above the same corner.');
  const cabCfg = c.objects.windowCabinet, cabinet = makeCabinet(parent, m, cabCfg, 1.5);
  registerSolid(cabCfg, cabinet.group, [.58, .85, 1.55], 'Window cabinet', 'Low wooden cabinet below the display-end windows.');
  const cabItem = registry.items.get(cabCfg.id); let cabinetOpen = false;
  const cabinetBounds = new THREE.Box3();
  for (const panel of cabinet.panels) panel.collider = collision.box(`${cabCfg.id}-panel-${panel.side}`, [.01, .01, .01], [0, -10, 0]);
  cabItem.action = 'Open cabinet';
  cabItem.interact = player => { if (Math.hypot(player.position.x - cabCfg.position[0], player.position.z - cabCfg.position[2]) < 1.2) return 'Step back to open the cabinet.'; cabinetOpen = !cabinetOpen; cabItem.state = cabinetOpen ? 'Open' : 'Closed'; cabItem.action = cabinetOpen ? 'Close cabinet' : 'Open cabinet'; return `Cabinet ${cabItem.state.toLowerCase()}`; };
  cabItem.update = (dt, player) => {
    for (const { pivot, side, collider } of cabinet.panels) {
      const old = pivot.rotation.y; pivot.rotation.y = THREE.MathUtils.damp(old, cabinetOpen ? side * 1.1 : 0, 5, dt);
      pivot.updateWorldMatrix(true, true); cabinetBounds.setFromObject(pivot);
      const p = player.position, r = c.player.radius;
      if (p.y < cabinetBounds.max.y && p.y + c.player.height > cabinetBounds.min.y && p.x > cabinetBounds.min.x - r && p.x < cabinetBounds.max.x + r && p.z > cabinetBounds.min.z - r && p.z < cabinetBounds.max.z + r) pivot.rotation.y = old;
      pivot.updateWorldMatrix(true, true); cabinetBounds.setFromObject(pivot);
      Object.assign(collider, { minX: cabinetBounds.min.x, maxX: cabinetBounds.max.x, minY: cabinetBounds.min.y, maxY: cabinetBounds.max.y, minZ: cabinetBounds.min.z, maxZ: cabinetBounds.max.z });
    }
  };
  const tvCfg = c.objects.display, tv = group(parent, tvCfg.position, tvCfg.rotationY, tvCfg.id);
  box(tv, m.black, [1.67, .97, .075]);
  const screenMat = new THREE.MeshBasicMaterial({ map: makeDisplayTexture() });
  const screen = box(tv, screenMat, [1.6, .9, .008], [0, 0, .045]);
  beam(tv, m.black, [0, -.49, 0], [.05, -.99, -.02], .007);
  const tvItem = registry.add({ id: tvCfg.id, group: tv, category: 'Display', label: 'Workshop display', state: 'On', action: 'Turn off display', detail: 'The single wall display faces the printer workbench across the workshop.',
    interact() { const on = tvItem.state !== 'On'; tvItem.state = on ? 'On' : 'Off'; screen.visible = on; tvItem.action = on ? 'Turn off display' : 'Turn on display'; return `Display ${on ? 'on' : 'off'}`; },
  });
  const signCfg = c.objects.entranceSign, sign = group(parent, signCfg.position, signCfg.rotationY, signCfg.id);
  box(sign, m.wood, [signCfg.width, signCfg.height, .04]);
  const signFace = new THREE.Mesh(new THREE.PlaneGeometry(signCfg.width - .07, signCfg.height - .07), new THREE.MeshBasicMaterial({ map: makeTinkerspaceBoardTexture(), side: THREE.DoubleSide }));
  signFace.position.z = -.023; signFace.rotation.y = Math.PI; sign.add(signFace);
  for (const x of [-1, 1]) for (const y of [-1, 1]) box(sign, m.silver, [.052, .052, .025], [x * (signCfg.width / 2 - .07), y * (signCfg.height / 2 - .07), -.035]);
  registry.add({ id: signCfg.id, group: sign, category: 'Identity', label: 'Tinkerspace Calicut board', state: 'Mounted', action: 'Inspect board', detail: 'OSB identity board added from the supplied reference and mounted on the approach-facing landing wall.', interact: () => 'TINKERSPACE CALICUT' });
  for (const cfg of c.objects.fans) {
    const fan = makeFan(parent, m, cfg);
    const item = registry.add({ id: cfg.id, group: fan.group, category: 'Ventilation', label: 'Wall fan', state: 'On', action: 'Switch fan off', detail: 'Wall-mounted fan with visible cage and rotating blades.',
      interact() { item.state = item.state === 'On' ? 'Off' : 'On'; item.action = item.state === 'On' ? 'Switch fan off' : 'Switch fan on'; return `Fan ${item.state.toLowerCase()}`; },
      update(dt) { if (item.state === 'On') fan.blades.rotation.z += dt * 15; },
    });
  }
  for (const cfg of c.objects.speakers) {
    const g = group(parent, cfg.position, cfg.rotationY, cfg.id);
    box(g, m.black, [.25, .4, .18]); box(g, m.mesh, [.22, .36, .008], [0, 0, .096]);
    const led = box(g, m.indicator, [.012, .012, .008], [.075, -.15, .105]);
    const item = registry.add({ id: cfg.id, group: g, category: 'Audio', label: 'Wall speaker', state: 'Powered', action: 'Toggle speaker', detail: 'Basic power-state interaction; no audio playback.', interact() { led.visible = !led.visible; item.state = led.visible ? 'Powered' : 'Off'; return `Speaker ${item.state.toLowerCase()}`; } });
  }
  const n = c.objects.network, network = group(parent, n.position, n.rotationY, n.id);
  box(network, m.silver, [.66, .4, .4]); box(network, m.glass, [.57, .3, .02], [0, 0, .215]);
  for (let i = 0; i < 8; i++) box(network, m.black, [.035, .024, .015], [-.2 + i * .055, -.08, .224]);
  const networkLed = box(network, m.indicator, [.03, .025, .01], [.2, .08, .226]);
  box(network, m.black, [.26, .03, .19], [0, .22, 0]);
  for (const x of [-.1, .1]) beam(network, m.black, [x, .23, 0], [x, .49, -.045], .012);
  registry.add({ id: n.id, group: network, label: 'Network cabinet', category: 'Connectivity', state: 'Online · simulated', action: 'Inspect network', detail: 'One wall-mounted network cabinet above the printer-side shelf. Indicator state is simulated; there is no connection to real equipment.', interact: () => 'Network cabinet · simulated online status' });
  // Confirmed bench electronics represented as one cluster, with a neutral pixel motif.
  const eq = c.objects.workshopEquipment, tools = group(parent, eq.position, eq.rotationY, eq.id);
  box(tools, m.blue, [.68, .49, .035], [0, .245, 0]);
  for (let row = 0; row < 8; row++) for (let col = 0; col < 10; col++) if ((row + col) % 3 === 0) box(tools, m.indicator, [.04, .04, .01], [-.24 + col * .052, .055 + row * .052, .025]);
  box(tools, m.steel, [.28, .07, .23], [.73, .04, 0]); cylinder(tools, m.silver, .035, .22, [.73, .15, 0]);
  registry.add({ id: 'bench-equipment', group: tools, label: 'Electronics & bench tools', category: 'Workshop', state: 'Available', action: 'Inspect tools', detail: 'Pixel panel, small vise and electronics on the printer workbench. Fine component placement is approximate.', interact: () => 'Electronics and small bench tools' });
  // Hanging rectangles with crossbars, shared by two switch banks.
  const lampMat = new THREE.MeshBasicMaterial({ color: '#f3ffe6' }), lamps = group(parent);
  const lights = [];
  for (const z of [-3.1, 3.1]) {
    const y = f + 3.55;
    for (const x of [-1.0, 1.0]) { beam(lamps, lampMat, [x, y, z - 1], [x, y, z + 1], .035); beam(lamps, m.steel, [x, y, z], [x, 8.5, z], .006); }
    for (const zz of [z - 1, z, z + 1]) beam(lamps, lampMat, [-1, y, zz], [1, y, zz], .035);
    const light = new THREE.SpotLight('#fff4df', 58, 12, 1.22, .65, 2); light.position.set(0, y - .2, z); light.target.position.set(0, f, z); light.castShadow = true; light.shadow.mapSize.set(1024, 1024); light.shadow.bias = -.0003; light.shadow.normalBias = .025; parent.add(light, light.target); lights.push(light);
  }
  let lightsOn = true;
  for (const cfg of c.objects.lightSwitches) {
    const g = group(parent, cfg.position, cfg.rotationY, cfg.id);
    box(g, m.white, [.21, .12, .04]); const rocker = box(g, m.white, [.065, .075, .024], [-.025, 0, .032]);
    const item = registry.add({ id: cfg.id, group: g, category: 'Lighting', label: 'Workshop light switch', state: 'Lights on', action: 'Toggle overhead lights', detail: 'Both switch plates control the two rectangular overhead light fixtures.',
      interact() { lightsOn = !lightsOn; lights.forEach(l => l.visible = lightsOn); lampMat.color.set(lightsOn ? '#f3ffe6' : '#636961'); for (const a of registry.items.values()) if (a.id.startsWith('light-switch')) a.state = lightsOn ? 'Lights on' : 'Lights off'; rocker.rotation.x = lightsOn ? 0 : .18; return lightsOn ? 'Overhead lights on' : 'Overhead lights off'; },
    });
  }
  const outlet = c.objects.electricalOutlet, socket = group(parent, outlet.position, outlet.rotationY, outlet.id);
  box(socket, m.white, [.22, .12, .045]); for (const x of [-.06, .01]) box(socket, m.black, [.009, .022, .003], [x, 0, .026]);
  const powerItem = registry.add({ id: 'electrical-switch-01', group: socket, label: 'Switched electrical outlet', category: 'Utilities', state: 'On', action: 'Toggle outlet', detail: 'Simulated outlet switch, independent of the real building supply.', interact() { powerItem.state = powerItem.state === 'On' ? 'Off' : 'On'; return `Outlet ${powerItem.state.toLowerCase()}`; } });
  for (const door of c.building.doors) addDoor(parent, m, door, registry, collision, f);
}
