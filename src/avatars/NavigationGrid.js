// Small deterministic A* grid over the existing first-floor collision geometry.
export class NavigationGrid {
  constructor(collision,config,options) {
    this.world=collision;this.config=config;this.options=options;this.floor=config.building.room.floorY;
    this.minX=config.plan.main.minX+.3;this.maxX=config.building.veranda.outerX-.3;
    this.minZ=config.plan.lobby.minZ+.3;this.maxZ=config.plan.balcony.maxZ-.3;
    this.step=options.navCellSize;this.cols=Math.floor((this.maxX-this.minX)/this.step)+1;this.rows=Math.floor((this.maxZ-this.minZ)/this.step)+1;
  }
  clear(x,z,ignore='') {
    const r=this.options.radius,y=this.floor;
    if(x<this.minX||x>this.maxX||z<this.minZ||z>this.maxZ)return false;
    if(Math.abs(this.world.ground(x,z,y)-y)>.04)return false;
    return !this.world.boxes.some(b=>b.enabled&&b.id!==ignore&&!b.id.startsWith('avatar:')&&y+1.78>b.minY+.04&&y<b.maxY-.04&&
      (Math.max(b.minX,Math.min(x,b.maxX))-x)**2+(Math.max(b.minZ,Math.min(z,b.maxZ))-z)**2<r*r);
  }
  segment(a,b,ignore='') {
    const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.075);
    for(let i=0;i<=n;i++){const k=n?i/n:0;if(!this.clear(a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,ignore))return false}return true;
  }
  point(index){return [this.minX+(index%this.cols)*this.step,this.minZ+Math.floor(index/this.cols)*this.step]}
  closest(point){let best=-1,d=Infinity;const cx=Math.round((point[0]-this.minX)/this.step),cz=Math.round((point[1]-this.minZ)/this.step);for(let z=Math.max(0,cz-2);z<=Math.min(this.rows-1,cz+2);z++)for(let x=Math.max(0,cx-2);x<=Math.min(this.cols-1,cx+2);x++){const n=z*this.cols+x,p=this.point(n),q=Math.hypot(p[0]-point[0],p[1]-point[1]);if(q<d&&this.clear(...p)&&this.segment(point,p)){d=q;best=n}}return best}
  freePoints(){const result=[];for(let z=0;z<this.rows;z+=3)for(let x=0;x<this.cols;x+=3){const p=this.point(z*this.cols+x);if(this.clear(...p))result.push(p)}return result}
  path(from,to) {
    if(!this.clear(...from)||!this.clear(...to))return null;
    if(this.segment(from,to))return [to];
    const start=this.closest(from),end=this.closest(to);if(start<0||end<0)return null;
    const open=new Set([start]),came=new Map(),g=new Map([[start,0]]),score=new Map([[start,0]]),closed=new Set(),valid=new Map();
    const usable=n=>{if(!valid.has(n))valid.set(n,this.clear(...this.point(n)));return valid.get(n)};
    while(open.size) {
      let current=-1,best=Infinity;for(const n of open)if(score.get(n)<best){best=score.get(n);current=n}
      if(current===end) {
        const path=[to];for(let n=end;n!==start;n=came.get(n))path.unshift(this.point(n));
        const smooth=[];let anchor=from;for(let i=0;i<path.length;){let far=path.length-1;while(far>i&&!this.segment(anchor,path[far]))far--;smooth.push(path[far]);anchor=path[far];i=far+1}return smooth;
      }
      open.delete(current);closed.add(current);
      const x=current%this.cols,z=Math.floor(current/this.cols);
      for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]) {
        const nx=x+dx,nz=z+dz;if(nx<0||nx>=this.cols||nz<0||nz>=this.rows)continue;
        const n=nz*this.cols+nx;if(closed.has(n)||!usable(n))continue;
        if(!this.segment(this.point(current),this.point(n)))continue;
        const candidate=g.get(current)+Math.hypot(dx,dz);
        if(candidate<(g.get(n)??Infinity)){came.set(n,current);g.set(n,candidate);score.set(n,candidate+Math.hypot(nx-end%this.cols,nz-Math.floor(end/this.cols)));open.add(n)}
      }
    }
    return null;
  }
}
