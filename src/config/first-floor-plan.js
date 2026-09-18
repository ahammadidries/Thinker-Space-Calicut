// Written dimensions on the user's first-floor plan supersede photo-based scale.
// Metres. Plan top = -Z; right = +X. These are not geographic directions.
export const firstFloorPlan = {
  source: 'WhatsApp Image 2026-09-16 at 3.41.14 PM.jpeg', version: 2,
  main: { id: 'workshop', label: 'Workshop', sourceLabel: 'Dining Room', minX: -2.9, maxX: 2.9, minZ: -7.3, maxZ: 7.3, statedArea: 81 },
  annex: { minX: -2.77, partitionX: -.56, maxX: 1.57, minZ: -12.66, upperSplitZ: -10.68, bathroomTopZ: -9.16, maxZ: -7.3 },
  rooms: [
    { id: 'other-3', label: 'Other 3', minX: -2.77, maxX: -.56, minZ: -12.66, maxZ: -10.68, statedArea: 3.7 },
    { id: 'other-2', label: 'Other 2', minX: -.56, maxX: 1.57, minZ: -12.66, maxZ: -10.68, statedArea: 3.7 },
    { id: 'other-1', label: 'Other 1', minX: -2.77, maxX: 1.57, minZ: -10.68, maxZ: -9.16, statedArea: 6.4 },
    { id: 'bathroom', label: 'Bathroom', minX: -2.77, maxX: -.56, minZ: -9.16, maxZ: -7.3, statedArea: 3.4 },
    { id: 'entry-landing', label: 'Connecting landing', minX: -.56, maxX: 2.9, minZ: -9.16, maxZ: -7.3 },
  ],
  annexWalls: [
    { id: 'annex-north', a: [-2.77, -12.66], b: [1.57, -12.66] },
    { id: 'annex-west', a: [-2.77, -12.66], b: [-2.77, -7.3] },
    { id: 'annex-east', a: [1.57, -12.66], b: [1.57, -9.16] },
    { id: 'other-2-3-divider', a: [-.56, -12.66], b: [-.56, -10.68] },
    { id: 'other-3-front', a: [-1.78, -10.68], b: [-.56, -10.68] },
    { id: 'other-2-front', a: [-.56, -10.68], b: [.35, -10.68] },
    { id: 'bathroom-front-left', a: [-2.77, -9.16], b: [-1.93, -9.16] },
    { id: 'bathroom-front-right', a: [-.72, -9.16], b: [-.56, -9.16] },
    { id: 'bathroom-east', a: [-.56, -9.16], b: [-.56, -7.3] },
  ],
  annexOpenings: [
    { id: 'other-3-opening', a: [-2.67, -10.68], b: [-1.78, -10.68] },
    { id: 'other-2-opening', a: [.35, -10.68], b: [1.47, -10.68] },
    { id: 'bathroom-opening', a: [-1.93, -9.16], b: [-.72, -9.16] },
  ],
  fixtures: [
    { id: 'bathroom-toilet', kind: 'toilet', position: [-2.31, 3.2, -7.82], rotationY: 0 },
    { id: 'bathroom-basin', kind: 'basin', position: [-1.3, 3.2, -7.64], rotationY: 0 },
    { id: 'other-1-basin', kind: 'basin', position: [-2.43, 3.2, -9.43], rotationY: 0 },
    { id: 'other-3-counter', kind: 'counter', position: [-2.49, 3.2, -11.45], width: .36, depth: 1.1 },
  ],
  notes: [
    'Main width 5.80 m and right length 14.60 m are used. Left annotation 14.46 m is recorded; no unsupported skew is introduced.',
    'The 3.46 m return fixes the bathroom divider at X=-0.56. Upper widths 2.21 m and 2.13 m determine the annex sides.',
    'Annex extension is 5.36 m. Unlabelled internal depths/opening widths are scaled from the plan. The 3.53 m right annotation differs slightly from the traced 3.50 m.',
    'Printed room areas are source labels, not recalculated survey areas. Other 1/2/3 names are retained without inventing room functions.',
    'Furniture footprints follow the plan. Chair counts are retained by group, with skewed/overlapping icons straightened along table edges at the user’s request.',
    'Veranda, staircase, roof and grounds are outside the plan and remain photo/video estimates.',
  ],
};
export function containsPlanPoint(rect, x, z) { return x >= rect.minX && x <= rect.maxX && z >= rect.minZ && z <= rect.maxZ; }
