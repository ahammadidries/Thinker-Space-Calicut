import { firstFloorPlan } from './first-floor-plan.js';

const floorY = 3.2;
const tables = [
  { id: 'table-01', position: [1.04, floorY, -3.82], width: 2.8, depth: 1.05, seats: { north: 3, south: 2 } },
  { id: 'table-02', position: [.68, floorY, -1.36], width: 2.67, depth: 1.1, seats: { north: 1, south: 0 } },
  { id: 'table-03', position: [.88, floorY, 1.26], width: 3, depth: 1.1, seats: { north: 3, south: 2 } },
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
    room: { width: 5.8, length: 14.6, floorY, wallHeight: 3.15, wallThickness: .16 },
    veranda: { outerX: 6.9, innerX: 2.9, nearZ: -9.16, farZ: 9.5, entryPorchNearZ: -11.45 },
    roof: { minX: -3.65, maxX: 7.55, minZ: -13.4, maxZ: 10.2, ridgeX: .35, eaveY: 6.4, ridgeY: 9.1, hipLength: 3.6, confidence: 'photo-based; extended over plan footprint' },
    stairs: { minX: 4.65, maxX: 6.65, topZ: -3.5, bottomZ: 3.7, steps: 20, confidence: 'photo/video connection; not dimensioned on plan' },
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
    entranceSign: { id: 'sign-tinkerspace', position: [1.42, 4.68, -7.39], width: 1.28, height: 1.55, rotationY: 0, confidence: 'User-supplied sign image; mounted on the approach-facing landing wall.' },
    workshopEquipment: { id: 'bench-equipment', position: [-1.4, 4.15, 6.82], rotationY: Math.PI, confidence: 'photo-established bench; approximate component positions' },
    display: { id: 'display-01', position: [0, 5.23, -7.18], rotationY: 0, confidence: 'photo-established wall; adjusted to plan shell', refs: ['P1-P3', 'P6'] },
    workbench: { id: 'printer-workbench', position: [-.3, floorY, 6.84], width: 4.96, depth: .68, confidence: 'plan footprint; photo function' },
    printers: [
      { id: 'printer-01', position: [1.42, 4.15, 6.82], rotationY: Math.PI, confidence: 'same larger printer beside shelf', refs: ['P18', 'P19'] },
      { id: 'printer-02', position: [.34, 4.15, 6.82], rotationY: Math.PI, scale: .78, refs: ['P19'] },
    ],
    shelf: { id: 'tall-shelf-01', position: [2.53, floorY, 6.05], rotationY: -Math.PI / 2, confidence: 'plan rectangle beside lower door; photo identity' },
    network: { id: 'network-cabinet-01', position: [2.21, 5.92, 7.01], rotationY: Math.PI, confidence: 'photo-established printer corner' },
    windowCabinet: { id: 'window-cabinet-01', position: [-2.46, floorY, -6.33], rotationY: Math.PI / 2, confidence: 'photo-established display-end window' },
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
    ...[1.35, 2.15].map((x, i) => ({ id: 'chair-east-spare-' + (i + 1), position: [x, floorY, 3.15], rotationY: 0 })),
    { id: 'chair-other-3-01', position: [-1.63, floorY, -12.06], rotationY: Math.PI },
    { id: 'chair-other-2-01', position: [.15, floorY, -12.06], rotationY: Math.PI },
    { id: 'chair-other-2-02', position: [.93, floorY, -12.06], rotationY: Math.PI },
    ...[6.1, 7.2, 8.3].map((z, i) => ({ id: 'chair-veranda-0' + (i + 1), position: [6.15, floorY, z], rotationY: Math.PI / 2, source: 'photos; veranda omitted from plan' })),
  ],
  uncertainty: {
    dimensions: firstFloorPlan.notes[0],
    furniture: 'Table footprints follow the plan. Chair counts by group are retained; rows face their table. Loose seats stay in their wall zones.',
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
