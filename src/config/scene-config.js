import { firstFloorPlan } from './first-floor-plan.js';
import { createSiteLayout } from './site-layout.js';

const floorY = firstFloorPlan.floorY;
const tables = [
  ...[-4.05, -.8, 2.45].map((z, i) => ({ id: `table-0${i + 1}`, position: [.8, floorY, z], width: 2.9, depth: 1.1, seats: { north: 4, south: 4 } })),
  { id: 'window-table-01', position: [-2.02, floorY, 4.4], width: 1.38, depth: .84, seats: { north: 0, south: 1 } },
];
// Seat centres derive from tables; local +Z is the chair back.
export function alignedTableChairs(table) {
  return ['north', 'south'].flatMap(side => {
    const count = table.seats[side];
    return Array.from({ length: count }, (_, i) => {
      const usable = table.width - .82;
      const offset = count === 1 ? 0 : (i / (count - 1) - .5) * usable;
      return { id: 'chair-' + table.id + '-' + side + '-' + (i + 1), tableId: table.id, side,
        position: [table.position[0] + offset, floorY, table.position[2] + (side === 'north' ? -1 : 1) * (table.depth / 2 + .43)],
        rotationY: side === 'north' ? Math.PI : 0, source: 'Supplied plan; chairs straightened' };
    });
  });
}
// One location: +X veranda; -Z display/annex; +Z printer end.
export const sceneConfig = {
  plan: firstFloorPlan,
  building: {
    room: { width: 5.406, length: 14.435, floorY, wallHeight: 3.15, wallThickness: firstFloorPlan.wallThickness },
    veranda: { outerX: firstFloorPlan.lobby.maxX, innerX: 2.803, nearZ: firstFloorPlan.lobby.minZ, farZ: firstFloorPlan.balcony.maxZ, entryPorchNearZ: firstFloorPlan.lobby.minZ },
    roof: { minX: -3.55, maxX: 7.52, minZ: -13.5, maxZ: 10.4, ridgeX: .35, eaveY: 6.95, ridgeY: 9.65, hipLength: 3.6, confidence: 'photo-based height above the PDF +3.75 m floor' },
    stairs: { minX: 4.867, maxX: 6.667, topZ: -6.25, bottomZ: 1.85, steps: 25, landingNumber: 12, landingDepth: 1.08, confidence: 'Reference positions 1–11 and 13–25 are treads; 12 is the broad intermediate landing. Width, run and landing depth are traced estimates.' },
    doors: [
      { id: 'door-display-end', x: 2.9, z: -6.3, width: 1.36, height: 2.45, refs: ['First-floor plan', 'P6-P7'] },
      { id: 'door-printer-end', x: 2.9, z: 4.6, width: 1.36, height: 2.45, refs: ['First-floor plan', 'P4', 'P18'], note: 'Opening ends before the tall shelf.' },
    ],
    windows: [{ z: -6.32, width: 1.3 }, { z: 2.63, width: 1.62 }, { z: 4.3, width: 1.42 }],
    utility: { enabled: true, ...firstFloorPlan.annex, confidence: 'supplied floor plan', note: 'Bathroom, Other 1, Other 2 and Other 3 are separate connected spaces.' },
  },
  player: { height: 1.68, radius: .23, speed: 2.8, sprint: 4.5, jumpSpeed: 4.8, gravity: 15, stepHeight: .27, interactionRange: 3.6 },
  objects: {
    lightSwitches: [
      { id: 'light-switch-1', position: [2.8, 4.4, -5.38], rotationY: -Math.PI / 2 },
      { id: 'light-switch-2', position: [2.8, 4.4, 3.66], rotationY: -Math.PI / 2 },
    ],
    electricalOutlet: { id: 'electrical-switch-01', position: [2.8, 3.72, -5.38], rotationY: -Math.PI / 2 },
    entranceSign: {
      id: 'sign-tinkerspace',
      position: [firstFloorPlan.annex.maxX + firstFloorPlan.annex.wallThickness / 2 + .025, floorY + 1.48, (firstFloorPlan.annex.minZ + firstFloorPlan.annex.bathroomTopZ) / 2],
      width: 1.28, height: 1.55, rotationY: -Math.PI / 2,
      confidence: 'User-marked location on the large annex wall facing the covered lobby.',
    },
    display: { id: 'display-01', position: [0, 5.23, -7.18], rotationY: 0, url: 'https://jasimcm.github.io/tinkerspace_digital_calicut/', refreshIntervalMs: 60_000, confidence: 'photo-established wall; adjusted to plan shell', refs: ['P1-P3', 'P6'] },
    workbench: { id: 'printer-workbench', position: [-.3, floorY, 6.84], width: 4.96, depth: .68, confidence: 'plan footprint; photo function' },
    printers: [
      { id: 'printer-01', position: [1.42, 4.15, 6.82], rotationY: Math.PI, confidence: 'same larger printer beside shelf', refs: ['P18', 'P19'] },
      { id: 'printer-02', position: [.34, 4.15, 6.82], rotationY: Math.PI, scale: .78, refs: ['P19'] },
    ],
    shelf: { id: 'tall-shelf-01', position: [2.53, floorY, 6.05], rotationY: -Math.PI / 2, confidence: 'plan rectangle beside lower door; photo identity' },
    network: { id: 'network-cabinet-01', position: [2.21, 5.92, 7.01], rotationY: Math.PI, confidence: 'photo-established printer corner' },
    windowCabinet: { id: 'window-cabinet-01', position: [-2.46, floorY, -6.0], rotationY: Math.PI / 2, width: 2.2, depth: .6, height: .9, doorCount: 3, confidence: 'User red annotation on TINKERSPACE.pdf confirms a three-door cabinet table beneath the windows at the TV end; exact dimensions estimated.', refs: ['P5', 'TINKERSPACE.pdf', 'User red-marked plan'] },
    tables,
    windowDesk: { id: 'window-desk-01', position: [-2.46, floorY, -1.05], width: .68, depth: 5.5, confidence: 'supplied floor plan' },
    fans: [-5.2, -.35, 5.18].flatMap((z, i) => [
      { id: 'fan-window-0' + (i + 1), position: [-2.72, 5.77, z], rotationY: Math.PI / 2 },
      { id: 'fan-veranda-0' + (i + 1), position: [2.72, 5.77, z], rotationY: -Math.PI / 2 },
    ]),
    speakers: [-4.55, 5.8].flatMap((z, i) => [
      { id: 'speaker-window-0' + (i + 1), position: [-2.77, 5.65, z], rotationY: Math.PI / 2 },
      { id: 'speaker-veranda-0' + (i + 1), position: [2.77, 5.65, z], rotationY: -Math.PI / 2 },
    ]),
  },
  chairs: [
    ...tables.flatMap(alignedTableChairs),
    ...Array.from({ length: 7 }, (_, i) => ({ id: 'chair-window-' + (i + 1), tableId: 'window-desk-01', side: 'east', position: [-1.69, floorY, -3.3 + i * .75], rotationY: Math.PI / 2 })),
    ...[2.15, 2.85, 3.55].map((z, i) => ({ id: 'chair-window-spare-' + (i + 1), position: [-2.38, floorY, z], rotationY: -Math.PI / 2 })),
    { id: 'chair-window-upper-spare', position: [-2.38, floorY, -4.48], rotationY: -Math.PI / 2 },
    { id: 'chair-other-3-01', position: [-1.63, floorY, -12.06], rotationY: Math.PI },
    { id: 'chair-other-2-01', position: [.15, floorY, -12.06], rotationY: Math.PI },
    { id: 'chair-other-2-02', position: [.93, floorY, -12.06], rotationY: Math.PI },
    ...[6.1, 7.2, 8.3].map((z, i) => ({ id: 'chair-veranda-0' + (i + 1), position: [6.15, floorY, z], rotationY: Math.PI / 2, source: 'photos; veranda omitted from plan' })),
  ],
  uncertainty: {
    dimensions: firstFloorPlan.notes[0],
    furniture: 'Three aligned 2.9 × 1.1 m shared tables, each with four chairs on both long sides, per the latest user correction. Other seats remain in their wall zones.',
    windows: 'Three left-wall window groups traced from plan. Opening widths are scaled estimates.',
    annex: 'Other 1/2/3 names and source area labels are retained; room functions are not invented.',
    vegetation: 'Planting and terrain are photo-based context, not surveyed.',
    lowerLevel: 'Only the visible lower exterior and parking are modeled.',
  },
  unplacedObjects: [
    { id: 'extra-stacked-chairs', enabled: false, position: null, reason: 'Uncounted video stacks; no extra copies added.' },
    { id: 'additional-camera', enabled: false, position: null, reason: 'Repeated observations cannot establish extra copies.' },
  ],
  viewpoints: {
    arrival: { position: [3.8, floorY, -11], yaw: Math.PI, pitch: -.04, label: 'Uphill approach' },
    workshop: { position: [-.9, floorY, 5.4], yaw: 0, pitch: -.04, label: 'Workshop' },
    veranda: { position: [3.78, floorY, -5.2], yaw: Math.PI, pitch: -.04, label: 'Upper veranda' },
    annex: { position: [.6, floorY, -8.2], yaw: 0, pitch: -.03, label: 'First-floor annex' },
    garden: { position: [9.5, 0, 12.5], yaw: .55, pitch: .03, label: 'Lower approach' },
  },
};

// Preserve physical furniture sizes while re-anchoring their centres to the PDF shell.
const sx = sceneConfig.building.room.width / 5.8, sz = sceneConfig.building.room.length / 14.6;
const anchor = item => {
  if (!item.position) return;
  item.position[0] *= sx; item.position[2] *= sz;
  if (item.position[1] !== floorY) item.position[1] += floorY - 3.2;
};
// The entrance board is already positioned from the current annex wall dimensions.
for (const item of Object.values(sceneConfig.objects).flat()) if (item !== sceneConfig.objects.entranceSign) anchor(item);
// Electrical plates sit against the inside wall face, not at a scaled offset from it.
for (const plate of [...sceneConfig.objects.lightSwitches, sceneConfig.objects.electricalOutlet]) plate.position[0] = sceneConfig.building.room.width / 2 - .0225;
sceneConfig.objects.workbench.width = 4.56;
// Seats along tables derive again from their unchanged tabletop sizes.
sceneConfig.chairs = [
  ...sceneConfig.objects.tables.flatMap(alignedTableChairs),
  ...sceneConfig.chairs.filter(c => !sceneConfig.objects.tables.some(t => t.id === c.tableId)).map(c => { anchor(c); return c; }),
];
for (const [id, position] of [
  ['chair-other-3-01',[-1.63,floorY,-12.1775]],
  ['chair-other-2-01',[.15,floorY,-12.1775]],
  ['chair-other-2-02',[.93,floorY,-12.1775]],
]) sceneConfig.chairs.find(c => c.id === id).position = position;
for (const door of sceneConfig.building.doors) { door.x = sceneConfig.building.veranda.innerX; door.z *= sz; }
for (const window of sceneConfig.building.windows) window.z *= sz;
sceneConfig.viewpoints.arrival.position = [3.8,floorY,-14.3];
sceneConfig.viewpoints.workshop.position = [-.8,floorY,5.3];
sceneConfig.viewpoints.veranda.position = [3.7,floorY,-5.2];
sceneConfig.viewpoints.annex.position = [.6,floorY,-8.3175];
sceneConfig.uncertainty.dimensions = firstFloorPlan.notes[0];
sceneConfig.uncertainty.annex = 'Earlier bathroom and Other 1/2/3 layout restored at the user’s request; translated to meet the current workshop wall.';
sceneConfig.site = createSiteLayout(firstFloorPlan, sceneConfig.building.stairs);
