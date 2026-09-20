import {box,cylinder,beam,group} from './primitives.js';

export function buildParking(parent,m,collision,parking) {
  const {minX,maxX,minZ,maxZ,height}=parking;
  box(parent,m.path,[maxX-minX,.08,maxZ-minZ],[(minX+maxX)/2,height-.04,(minZ+maxZ)/2],parking.id);
  collision.addSurface(parking.id,minX,maxX,minZ,maxZ,height);
  // The balcony above provides the shade. Bikes face the bamboo-side edge,
  // leaving the opposite side clear for access from the road and stairs.
  for(const [i,bike] of parking.bikes.entries()) {
    const g=group(parent,bike.position,bike.rotationY,bike.id);
    for(const z of [-.53,.53]) {
      const wheel=cylinder(g,m.rubber,.26,.13,[0,.28,z],16);wheel.rotation.z=Math.PI/2;
      const hub=cylinder(g,m.silver,.14,.14,[0,.28,z],12);hub.rotation.z=Math.PI/2;
    }
    beam(g,m.steel,[0,.3,-.55],[0,.85,-.28],.08);beam(g,m.steel,[0,.32,.5],[0,.61,-.3],.1);
    box(g,i===0?m.red:m.black,[.34,.28,.45],[0,.67,-.05]);box(g,m.black,[.35,.13,.55],[0,.8,.34]);
    beam(g,m.steel,[-.3,.99,-.35],[.3,.99,-.35],.03);
    collision.box(bike.id,[1.65,1.03,.64],[bike.position[0],height+.515,bike.position[2]]);
  }
}
