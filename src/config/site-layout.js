import { CatmullRomCurve3, Vector3 } from 'three';

// Sketch orientation confirmed by the owner: broad road at the balcony end,
// curved road along the veranda, short upper branch to the first-floor lobby.
// The sketch gives connectivity, not surveyed road widths or distances.
export function createSiteLayout(plan, stairs) {
  const roads = [
    { id: 'main-road', label: 'Main road', width: 5.5, points: [[-17,16],[22,16]] },
    { id: 'veranda-road', label: 'Curved veranda-side road', width: 3.2, points: [[11.8,16],[12,9],[12,-1],[11.8,-10],[10,-14],[7.5,-18]] },
    { id: 'upper-road', label: 'Upper approach road', width: 3.2, points: [[-8,-18],[0,-18],[7.5,-18],[12,-19],[18,-23]] },
    { id: 'lobby-branch', label: 'First-floor entrance', width: 2.5, points: [[3.8,plan.lobby.minZ],[3.8,-14.3],[4.6,-16.3],[4.8,-18]] },
    { id: 'lower-walk', label: 'Lower stair access', width: 2.6, level: 'lower', points: [[5.767,16],[5.767,11],[5.767,6],[(stairs.minX+stairs.maxX)/2,stairs.bottomZ+.3]] },
    { id: 'balcony-front-road', label: 'Road beside balcony parking', width: 3.5, points: [[-17,11.5],[-4,11.5],[5,11.5],[11.8,11.5]] },
  ];
  for (const [index, road] of roads.entries()) {
    const curve = new CatmullRomCurve3(road.points.map(([x,z]) => new Vector3(x,0,z)));
    road.samples = curve.getPoints(120).map(p => [p.x,p.z]);
    road.surfaceOffset = .025 + index * .002;
  }
  const parking = {
    id: 'balcony-parking', label: 'Covered bike parking below balcony',
    minX: plan.balcony.minX, maxX: plan.balcony.maxX, minZ: plan.balcony.minZ, maxZ: plan.balcony.maxZ,
    height: .015,
    bikes: [7.91,8.60,9.29].map((z,i)=>({id:`parked-bike-${i+1}`,position:[-1.65,.015,z],rotationY:Math.PI/2})),
  };
  return { roads, parking, note: 'Road connections follow the owner’s sketch; road widths, offsets and curves are indicative. The marked strip is paved road and bike parking is underneath the balcony.' };
}

export function distanceToRoad(x,z,road) {
  let nearest = Infinity;
  for (let i=1;i<road.samples.length;i++) {
    const [ax,az]=road.samples[i-1], [bx,bz]=road.samples[i], dx=bx-ax,dz=bz-az;
    const u=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz||1)));
    nearest=Math.min(nearest,Math.hypot(x-ax-u*dx,z-az-u*dz));
  }
  return nearest;
}

export function onSiteRoad(x,z,roads,margin=0,exclude=null) {
  return roads.some(road => road!==exclude && distanceToRoad(x,z,road)<=road.width/2+margin);
}
