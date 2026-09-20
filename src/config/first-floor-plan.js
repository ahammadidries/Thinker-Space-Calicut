// TINKERSPACE.pdf dimensions are in centimetres; runtime units are metres.
// PDF right = world -Z; PDF bottom = world +X. Room dimensions are clear inside faces.
const width = 5.406, length = 14.435, floorY = 3.75, wallThickness = .2;
const x = width / 2, z = length / 2;
const main = { id: 'workshop', label: 'Workshop', minX: -x, maxX: x, minZ: -z, maxZ: z };
const lobby = { id: 'covered-lobby', label: 'Covered lobby', minX: 1.697, maxX: 6.867, minZ: -12.8475, maxZ: -7.4175, dimensionLabel: '5.43 × 5.17 m' };
const balcony = { id: 'covered-balcony', label: 'Covered balcony', minX: -2.903, maxX: 2.747, minZ: 7.4175, maxZ: 9.7475, dimensionLabel: '2.33 × 5.65 m' };
export const firstFloorPlan = {
  source: 'TINKERSPACE.pdf (main dimensions); earlier screenshot (restored annex)', version: 4, floorY, wallThickness, main, lobby, balcony,
  dimensions: { workshop: [length, width], balcony: [2.33, 5.65], lobby: [5.43, 5.17] },
  // User explicitly restored the pre-PDF annex. Its earlier layout is translated
  // 0.1175 m toward -Z to meet the current workshop's outer wall face.
  annex: { minX: -2.77, partitionX: -.56, maxX: 1.57, minZ: -12.7775, upperSplitZ: -10.7975, bathroomTopZ: -9.2775, maxZ: -7.4175, wallThickness: .16, floorPadding: 0, source: 'Earlier first-floor screenshot; restored at user request' },
  rooms: [
    { id: 'other-3', label: 'Other 3', minX: -2.77, maxX: -.56, minZ: -12.7775, maxZ: -10.7975 },
    { id: 'other-2', label: 'Other 2', minX: -.56, maxX: 1.57, minZ: -12.7775, maxZ: -10.7975 },
    { id: 'other-1', label: 'Other 1', minX: -2.77, maxX: 1.57, minZ: -10.7975, maxZ: -9.2775 },
    { id: 'bathroom', label: 'Bathroom', minX: -2.77, maxX: -.56, minZ: -9.2775, maxZ: -7.4175 },
    { id: 'entry-landing', label: 'Connecting landing', minX: -.56, maxX: 2.803, minZ: -9.2775, maxZ: -7.4175 },
  ],
  annexWalls: [
    { id: 'annex-north', a: [-2.77,-12.7775], b: [1.57,-12.7775] },
    { id: 'annex-west', a: [-2.77,-12.7775], b: [-2.77,-7.4175] },
    { id: 'annex-east', a: [1.57,-12.7775], b: [1.57,-9.2775] },
    { id: 'other-2-3-divider', a: [-.56,-12.7775], b: [-.56,-10.7975] },
    { id: 'other-3-front', a: [-1.78,-10.7975], b: [-.56,-10.7975] },
    { id: 'other-2-front', a: [-.56,-10.7975], b: [.35,-10.7975] },
    { id: 'bathroom-front-left', a: [-2.77,-9.2775], b: [-1.93,-9.2775] },
    { id: 'bathroom-front-right', a: [-.72,-9.2775], b: [-.56,-9.2775] },
    { id: 'bathroom-east', a: [-.56,-9.2775], b: [-.56,-7.4175] },
  ],
  annexOpenings: [
    { id: 'other-3-opening', a: [-2.67,-10.7975], b: [-1.78,-10.7975] },
    { id: 'other-2-opening', a: [.35,-10.7975], b: [1.47,-10.7975] },
    { id: 'bathroom-opening', a: [-1.93,-9.2775], b: [-.72,-9.2775] },
  ],
  fixtures: [
    { id: 'bathroom-toilet', kind: 'toilet', position: [-2.31,floorY,-7.9375], rotationY: 0 },
    { id: 'bathroom-basin', kind: 'basin', position: [-1.3,floorY,-7.7575], rotationY: 0 },
    { id: 'other-1-basin', kind: 'basin', position: [-2.43,floorY,-9.5475], rotationY: 0 },
    { id: 'other-3-counter', kind: 'counter', position: [-2.49,floorY,-11.5675], width: .36, depth: 1.1 },
  ],
  notes: [
    'TINKERSPACE.pdf supersedes the earlier screenshot: workshop clear length 1443.5 cm and width 540.6 cm.',
    'Covered balcony 233 × 565 cm; covered lobby 543 × 517 cm; upper finished floor +375 cm.',
    'The user restored the earlier bathroom, Other 1/2/3 and landing layout. PDF green-room/toilet dimensions are no longer applied to this area.',
    'Wall thickness 20 cm, unlabelled passages, door widths and stair run are drawing-based estimates. The PDF shows 25 stair positions: 11 lower treads, broad landing 12, and 13 upper treads.',
    'Photo-confirmed furniture is retained, adjusted to fit the new shell; the red-marked three-door table remains beneath the TV-end windows.',
    'Roof pitch, height above the floor and grounds remain photographic estimates.',
  ],
};
export function containsPlanPoint(rect, x, z) { return x >= rect.minX && x <= rect.maxX && z >= rect.minZ && z <= rect.maxZ; }
