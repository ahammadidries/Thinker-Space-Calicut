import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import { avatarConfig } from '../config/avatar-config.js';
import { sceneConfig } from '../config/scene-config.js';
import { hashId, normalizeActiveUsers, shirtColor } from './identity.js';
import { NavigationGrid } from './NavigationGrid.js';

export class AvatarManager {
  constructor(scene,collision,registry,options=avatarConfig) {
    this.options=options;this.scene=scene;this.collision=collision;this.registry=registry;this.avatars=new Map();this.seats=new Map();this.failures=0;this.stale=false;this.stopped=false;this.floor=sceneConfig.building.room.floorY;
    this.navigation=new NavigationGrid(collision,sceneConfig,options);
    this.group=new THREE.Group();this.group.name='live-makers';scene.add(this.group);
    this.status=document.createElement('div');this.status.id='presence-status';this.status.setAttribute('role','status');this.status.textContent='Connecting to makers…';document.body.append(this.status);
  }
  async start() {
    try {
      this.asset=await new GLTFLoader().loadAsync(this.options.modelUrl);
      if(this.stopped)return;
      for(const name of ['Idle','Walk','Sit','SittingIdle','GetUp'])if(!this.asset.animations.some(c=>c.name===name))throw new Error('Avatar animation missing: '+name);
      await this.poll();
    } catch(error){this.status.textContent='Characters unavailable · reload to retry';console.error('Avatar model:',error)}
  }
  async poll() {
    if(this.stopped)return;
    if(document.hidden){this.timer=setTimeout(()=>this.poll(),this.options.pollIntervalMs);return}
    this.abort=new AbortController();const timeout=setTimeout(()=>this.abort.abort(),this.options.requestTimeoutMs);
    try {
      const response=await fetch(this.options.apiUrl,{signal:this.abort.signal,cache:'no-store',credentials:'omit'});
      if(!response.ok)throw new Error(`Presence HTTP ${response.status}`);
      const users=normalizeActiveUsers(await response.json());
      if(this.stopped)return;
      this.stale=false;this.failures=0;this.sync(users);this.lastSynced=Date.now();
    } catch(error) {
      if(this.stopped)return;
      this.failures++;this.stale=true;
      for(const a of this.avatars.values())this.drawName(a);
      this.status.textContent=this.avatars.size?`${this.avatars.size} makers · connection interrupted · retrying`:'Presence unavailable · retrying';
    } finally {
      clearTimeout(timeout);
      if(!this.stopped)this.timer=setTimeout(()=>this.poll(),Math.min(60_000,this.options.pollIntervalMs*2**Math.min(this.failures,2)));
    }
  }
  sync(users) {
    const wanted=new Set(users.map(u=>u.id));
    for(const [id,a] of this.avatars)if(!wanted.has(id))this.remove(a);
    const free=this.navigation.freePoints();
    for(const user of users) {
      let a=this.avatars.get(user.id);
      if(!a) {
        const offset=hashId(user.id)%Math.max(1,free.length);
        const point=free.slice(offset).concat(free.slice(0,offset)).find(p=>this.unoccupied(p,.68));
        if(!point)continue;
        a=this.spawn(user,point);
      }
      a.name=user.name;this.drawName(a);
    }
    this.activeUsers=users;
    this.status.textContent=`${this.avatars.size} ${this.avatars.size===1?'maker':'makers'} present · motion simulated${this.avatars.size<users.length?' · waiting for space':''}`;
  }
  spawn(user,point) {
    const model=clone(this.asset.scene),body=new THREE.Group();body.name='maker-'+user.id;body.position.set(point[0],this.floor,point[1]);body.add(model);this.group.add(body);
    let shirt;
    model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;if(o.material.name==='AvatarShirt'){shirt=o.material.clone();shirt.color.set(shirtColor(user.id,this.options.shirtColors));o.material=shirt}}});
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
    const label=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:true,depthWrite:false}));label.name='nameplate';label.userData.ignoreRay=true;label.scale.set(1.03,.193,1);body.add(label);
    const a={...user,body,model,shirt,canvas,texture,label,head:model.getObjectByName('Head'),mixer:new THREE.AnimationMixer(model),actions:new Map(),state:'idle',timer:1+(hashId(user.id)%20)/10,path:[],seat:null,blocked:0,cycles:0,walkElapsed:0};
    for(const clip of this.asset.animations)a.actions.set(clip.name,a.mixer.clipAction(clip));
    a.collider=this.collision.box('avatar:'+user.id,[.40,1.75,.40],[...body.position.toArray()]);
    this.avatars.set(user.id,a);
    // Presence begins at an available desk; users spend most of their visit seated.
    const seat=this.availableSeats(a)[0];
    if(seat){this.reserve(a,seat);body.position.set(seat.center[0],this.floor,seat.center[1]);body.rotation.y=seat.yaw;a.state='seated';a.timer=this.seatDuration(a);this.play(a,'SittingIdle')}
    else this.play(a,'Idle');
    a.action.time=(hashId(user.id)%100)/50;this.drawName(a);this.updateCollider(a);return a;
  }
  drawName(a) {
    const ctx=a.canvas.getContext('2d');ctx.font='600 36px "Segoe UI",sans-serif';
    let name=a.name;while(ctx.measureText(name).width>425&&name.length>1)name=name.slice(0,-2)+'…';
    a.canvas.width=Math.max(170,Math.ceil(ctx.measureText(name).width+84));
    ctx.clearRect(0,0,a.canvas.width,96);ctx.fillStyle='#203d34';ctx.beginPath();ctx.roundRect(2,2,a.canvas.width-4,92,20);ctx.fill();ctx.strokeStyle='#b4c9b077';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle=this.stale?'#e6b966':'#99d69c';ctx.beginPath();ctx.arc(35,48,10,0,Math.PI*2);ctx.fill();
    ctx.font='600 36px "Segoe UI",sans-serif';ctx.fillStyle='#f6f5e9';ctx.textBaseline='middle';
    ctx.fillText(name,60,49);a.texture.needsUpdate=true;
  }
  play(a,name) {
    const next=a.actions.get(name);if(a.action===next)return;
    next.reset();next.setLoop(['Sit','GetUp'].includes(name)?THREE.LoopOnce:THREE.LoopRepeat,Infinity);next.clampWhenFinished=true;next.enabled=true;next.setEffectiveTimeScale(1);next.setEffectiveWeight(1);next.play();
    if(a.action)a.action.crossFadeTo(next,.18,false);a.action=next;
  }
  unoccupied(p,r=.6,ignore=null) {
    return [...this.avatars.values()].every(a=>a===ignore||Math.hypot(a.body.position.x-p[0],a.body.position.z-p[1])>=r);
  }
  releaseSeat(a) {
    if(a.seat){this.seats.delete(a.seat.id);const g=this.registry.items.get(a.seat.id)?.group;if(g)delete g.userData.occupiedBy;a.seat=null}
  }
  seatDuration(a){const [min,max]=this.options.seatedSeconds;return min+(hashId(a.id)+a.cycles*37)%(max-min+1)}
  availableSeats(a) {
    const seats=[];
    for(const c of sceneConfig.chairs.filter(c=>c.tableId&&!this.seats.has(c.id))) {
      const g=this.registry.items.get(c.id)?.group;if(!g)continue;
      const center=[g.position.x,g.position.z],rot=g.rotation.y;
      if(!this.unoccupied(center,.60,a)||!this.navigation.clear(...center,c.id))continue;
      for(const [x,z] of [[-.64,0],[.64,0],[-.45,.50],[.45,.50]]) {
        const approach=[center[0]+Math.cos(rot)*x+Math.sin(rot)*z,center[1]-Math.sin(rot)*x+Math.cos(rot)*z];
        if(this.navigation.segment(approach,center,c.id)){seats.push({id:c.id,center,approach,yaw:rot+Math.PI});break}
      }
    }
    return seats;
  }
  reserve(a,seat){a.seat=seat;this.seats.set(seat.id,a.id);this.registry.items.get(seat.id).group.userData.occupiedBy=a.id}
  choose(a) {
    const from=[a.body.position.x,a.body.position.z];a.cycles++;
    if(!a.takingBreak) {
      const seats=this.availableSeats(a).sort((a,b)=>Math.hypot(a.center[0]-from[0],a.center[1]-from[1])-Math.hypot(b.center[0]-from[0],b.center[1]-from[1]));
      for(const seat of seats.slice(0,3)) {
        const path=this.navigation.path(from,seat.approach);if(!path)continue;
        let length=0,previous=from;for(const p of path){length+=Math.hypot(p[0]-previous[0],p[1]-previous[1]);previous=p}if(length>this.options.walkSpeed*this.options.maxWalkSeconds)continue;
        this.reserve(a,seat);a.path=path;a.state='walking';a.walkElapsed=0;this.play(a,'Walk');return;
      }
    }
    const points=this.navigation.freePoints(),offset=(hashId(a.id)+a.cycles*31)%Math.max(1,points.length);
    for(let k=0;k<Math.min(15,points.length);k++) {
      const p=points[(offset+k)%points.length],distance=Math.hypot(p[0]-from[0],p[1]-from[1]);if(!this.unoccupied(p,.7,a)||distance<1.1||distance>this.options.maxWanderDistance)continue;
      const path=this.navigation.path(from,p);if(path){a.takingBreak=false;a.path=path;a.state='walking';a.walkElapsed=0;this.play(a,'Walk');return}
    }
    a.takingBreak=false;a.timer=4;
  }
  updateCollider(a) {
    const p=a.body.position,b=a.collider,h=['sitting','seated'].includes(a.state)?1.35:1.78;
    Object.assign(b,{minX:p.x-.20,maxX:p.x+.20,minZ:p.z-.20,maxZ:p.z+.20,minY:p.y,maxY:p.y+h});
  }
  update(dt,camera,player) {
    if(!this.asset||this.stopped)return;
    for(const a of this.avatars.values()) {
      a.timer-=dt;
      if(a.state==='idle'&&a.timer<=0)this.choose(a);
      if(['walking','docking','leaving'].includes(a.state)) {
        a.walkElapsed+=dt;
        if(a.state==='walking'&&!a.seat&&a.walkElapsed>this.options.maxWalkSeconds){a.path=[];a.state='idle';a.timer=2;this.play(a,'Idle')}
        const target=a.path[0];
        if(target) {
          const p=a.body.position,dx=target[0]-p.x,dz=target[1]-p.z,d=Math.hypot(dx,dz),step=Math.min(d,this.options.walkSpeed*dt),next=[p.x+dx/d*step,p.z+dz/d*step];
          const ignore=['docking','leaving'].includes(a.state)?a.seat?.id:'';
          const blocked=d>1e-6&&(!this.navigation.segment([p.x,p.z],next,ignore)||!this.unoccupied(next,.47,a)||(player&&Math.abs(player.position.y-this.floor)<1&&Math.hypot(player.position.x-next[0],player.position.z-next[1])<.52));
          if(blocked){a.blocked+=dt;this.play(a,'Idle');if(a.blocked>4&&a.state==='walking'){a.path=[];this.releaseSeat(a);a.state='idle';a.timer=1+(hashId(a.id)%5);a.blocked=0}}
          else {
            a.blocked=0;this.play(a,'Walk');if(d>.001){p.x=next[0];p.z=next[1];const angle=Math.atan2(dx,dz),delta=Math.atan2(Math.sin(angle-a.body.rotation.y),Math.cos(angle-a.body.rotation.y));a.body.rotation.y+=delta*Math.min(1,dt*9)}
            if(d<=step+.02)a.path.shift();
          }
        }
        if(!a.path.length&&a.state!=='idle') {
          if(a.state==='walking'&&a.seat){a.state='docking';a.path=[a.seat.center]}
          else if(a.state==='docking'){a.body.rotation.y=a.seat.yaw;a.state='sitting';a.timer=1;this.play(a,'Sit')}
          else {if(a.state==='leaving'){this.releaseSeat(a);a.takingBreak=true}a.state='idle';a.timer=2+(hashId(a.id)+a.cycles)%3;this.play(a,'Idle')}
        }
      }
      if(a.state==='sitting'&&a.timer<=0){a.state='seated';a.timer=this.seatDuration(a);this.play(a,'SittingIdle')}
      if(a.state==='seated'&&a.timer<=0){a.state='gettingUp';a.timer=1;this.play(a,'GetUp')}
      if(a.state==='gettingUp'&&a.timer<=0){a.state='leaving';a.path=[a.seat.approach];this.play(a,'Walk')}
      a.mixer.update(dt);a.body.updateMatrixWorld(true);
      const head=a.head.getWorldPosition(new THREE.Vector3());a.label.position.y=head.y-this.floor+.31;
      const distance=camera.position.distanceTo(head),height=2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*distance*32/innerHeight;
      a.label.scale.set(height*a.canvas.width/96,height,1);
      const projected=head.clone().add(new THREE.Vector3(0,.31,0)).project(camera);
      a.label.visible=distance>.65&&distance<19&&projected.z<1&&Math.abs(projected.x)<.92&&Math.abs(projected.y)<.94;
      a.labelScreen={x:projected.x,y:projected.y,w:(a.canvas.width/96*32+8)/innerWidth,h:36/innerHeight,distance};
      this.updateCollider(a);
    }
    // Prefer nearby readable names over stacks of overlapping distant labels.
    const visible=[];
    for(const a of [...this.avatars.values()].filter(a=>a.label.visible).sort((a,b)=>a.labelScreen.distance-b.labelScreen.distance)) {
      const r=a.labelScreen;
      if(visible.some(q=>Math.abs(q.x-r.x)<q.w+r.w&&Math.abs(q.y-r.y)<q.h+r.h))a.label.visible=false;
      else visible.push(r);
    }
  }
  remove(a) {
    this.releaseSeat(a);a.mixer.stopAllAction();a.mixer.uncacheRoot(a.model);a.body.removeFromParent();a.shirt.dispose();a.texture.dispose();a.label.material.dispose();
    const skeletons=new Set();a.model.traverse(o=>{if(o.isSkinnedMesh)skeletons.add(o.skeleton)});skeletons.forEach(s=>s.dispose());
    const index=this.collision.boxes.indexOf(a.collider);if(index>=0)this.collision.boxes.splice(index,1);this.avatars.delete(a.id);
  }
  dispose(){this.stopped=true;clearTimeout(this.timer);this.abort?.abort();for(const a of this.avatars.values())this.remove(a);this.group.removeFromParent();this.status.remove()}
}
