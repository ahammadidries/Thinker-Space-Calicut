// One shared profile for the rendered treads, walkable surfaces and plan drawing.
// Reference numbers ascend from the lower end: 1–11, landing 12, then 13–25.
export function createStairLayout(stairs, floorY) {
  const lowerCount = stairs.landingNumber - 1;
  const upperCount = stairs.steps - stairs.landingNumber;
  const risers = lowerCount + upperCount;
  const run = stairs.bottomZ - stairs.topZ;
  if (lowerCount < 1 || upperCount < 1 || stairs.landingDepth <= 0 || stairs.landingDepth >= run) throw new Error('Invalid stair landing configuration');
  const treadDepth = (run - stairs.landingDepth) / risers, riserHeight = floorY / risers;
  const segments = [];
  let edge = stairs.bottomZ, rise = 0;
  for (let number = 1; number <= stairs.steps; number++) {
    const isLanding = number === stairs.landingNumber;
    const depth = isLanding ? stairs.landingDepth : treadDepth;
    if (!isLanding) rise++;
    segments.push({ number, isLanding, minZ: edge - depth, maxZ: edge, height: rise * riserHeight });
    edge -= depth;
  }
  const landing = segments.find(s => s.isLanding);
  return { segments, landing, treadDepth, riserHeight, lowerCount, upperCount,
    railPoints: [[stairs.bottomZ, 0], [landing.maxZ, landing.height], [landing.minZ, landing.height], [stairs.topZ, floorY]] };
}
