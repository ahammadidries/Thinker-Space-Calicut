import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {hostConfig} from '../config/host-config.js';

export class SpaceHost {
  constructor(scene,collision,registry,{onTalk,onError}={},config=hostConfig) {
    this.config=config;this.scene=scene;this.collision=collision;this.registry=registry;this.onTalk=onTalk;this.onError=onError;
    this.group=new THREE.Group();this.group.name='space-host';this.group.position.set(...config.position);this.group.rotation.y=config.rotation;scene.add(this.group);
    const [x,y,z]=config.position;
    this.collider=collision.box('space-host',[.52,1.82,.40],[x,y+.91,z]);
    this.item=registry.add({id:'space-host',group:this.group,label:`${config.name} · Space Host`,category:'Help',action:'Talk to me',state:'Available',detail:'Your permanent guide to the virtual TinkerSpace.',inspect:false,highlight:false,interact:()=>{this.onTalk?.();}});
    // Billboards are generated at runtime and deliberately live outside the GLB.
    this.nameplate=this.label(config.name,false);this.nameplate.position.set(0,2.04,0);this.group.add(this.nameplate);
    this.indicator=this.label(config.prompt,true);this.indicator.position.set(0,1.87,.02);this.group.add(this.indicator);
    this.group.visible=false;this.time=0;this.nextGreeting=0;this.nextIdle=8;this.wasNear=false;this.actions=new Map();this.reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.look=new THREE.Euler(0,0,0,'YXZ');this.lookRotation=new THREE.Quaternion();this.headPoint=new THREE.Vector3();this.toVisitor=new THREE.Vector3();
    this.ready=this.load();
  }
  label(text,chat) {
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;const ctx=canvas.getContext('2d');
    ctx.fillStyle=chat?'#ebefdd':'#213c32';ctx.beginPath();ctx.roundRect(2,2,508,92,20);ctx.fill();
    ctx.strokeStyle=chat?'#45614d':'#abc891';ctx.lineWidth=2;ctx.stroke();
    if(chat) {ctx.strokeStyle='#35543e';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(49,29,40,29,7);ctx.stroke();ctx.beginPath();ctx.moveTo(59,58);ctx.lineTo(56,66);ctx.lineTo(69,58);ctx.stroke();for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(60+i*9,44,2,0,Math.PI*2);ctx.fillStyle='#35543e';ctx.fill();}}
    else {ctx.fillStyle='#c9dfa0';ctx.beginPath();ctx.arc(47,48,8,0,Math.PI*2);ctx.fill();}
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=chat?'#253f30':'#f3f2e7';
    if(chat){ctx.font='500 32px Segoe UI, sans-serif';ctx.fillText(text,294,49,360);}
    else {ctx.font='600 34px Segoe UI, sans-serif';ctx.fillText(text,275,36,390);ctx.font='600 17px Segoe UI, sans-serif';ctx.fillStyle='#c7d7b3';ctx.fillText(this.config.role,275,72,390);}
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=THREE.LinearFilter;
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:true,depthWrite:false,toneMapped:false}));sprite.scale.set(chat?.86:1.02,chat?.161:.191,1);sprite.userData.ignoreRay=true;sprite.userData.label=text;sprite.name=chat?'host-talk-indicator':'host-nameplate';return sprite;
  }
  async load() {
    try {
      const asset=await new GLTFLoader().loadAsync(this.config.modelUrl);
      if(this.disposed){this.releaseAsset(asset.scene);return;}
      this.model=asset.scene;this.group.add(this.model);this.mixer=new THREE.AnimationMixer(this.model);
      this.model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;if(o.material.name==='HostShirt'){this.shirt=o.material;this.shirt.color.set(this.config.shirtColor);}}});
      this.head=this.model.getObjectByName('Head');
      for(const clip of asset.animations)this.actions.set(clip.name,this.mixer.clipAction(clip));
      this.play('Idle');this.group.visible=true;this.loaded=true;
    } catch(error) {if(this.disposed)return;this.collider.enabled=false;this.registry.items.delete('space-host');this.onError?.();console.error('Space Host asset:',error);}
  }
  setShirtColor(color){if(this.shirt)this.shirt.color.set(color);}
  play(name,once=false) {
    const action=this.actions.get(name);if(!action)return;
    const previous=this.currentAction;if(previous===action&&action.isRunning())return;
    action.reset();action.setLoop(once?THREE.LoopOnce:THREE.LoopRepeat,once?1:Infinity);action.clampWhenFinished=once;action.setEffectiveWeight(1);action.setEffectiveTimeScale(this.reducedMotion?.45:1);action.fadeIn(.28).play();previous?.fadeOut(.28);this.currentAction=action;this.animation=name;
    this.returnToIdle=once?this.time+action.getClip().duration/(this.reducedMotion?.45:1):0;
  }
  converse(active){this.conversation=active;this.item.state=active?'Talking':'Available';this.indicator.visible=!active;if(active&&!this.reducedMotion)this.play('Greeting',true);else this.play('Idle');}
  respond(){if(!this.reducedMotion)this.play('Talking',true);}
  update(dt,camera,player) {
    if(!this.loaded||this.disposed)return;
    this.time+=dt;this.mixer.update(dt);
    if(this.returnToIdle&&this.time>=this.returnToIdle)this.play('Idle');
    const near=!!player?.active&&player.position.distanceTo(this.group.position)<this.config.greetingRadius&&Math.abs(player.position.y-this.group.position.y)<.5;
    if(near&&!this.wasNear&&this.time>=this.nextGreeting&&!this.conversation&&!this.reducedMotion){this.play('Greeting',true);this.nextGreeting=this.time+this.config.greetingCooldown;}
    this.wasNear=near;
    if(!near&&!this.conversation&&this.time>this.nextIdle&&!this.returnToIdle&&!this.reducedMotion){this.play(Math.floor(this.time/8)%2?'Breathing':'HeadTurn',true);this.nextIdle=this.time+12;}
    // Track nearby visitors gently; clamp the neck rather than spinning the whole NPC.
    let yaw=0,pitch=0;
    if((near||this.conversation)&&camera){this.head.getWorldPosition(this.headPoint);this.toVisitor.copy(camera.position).sub(this.headPoint);const angle=Math.atan2(this.toVisitor.x,this.toVisitor.z)-this.group.rotation.y;if(Math.abs(angle)<1.45){yaw=THREE.MathUtils.clamp(angle,-.48,.48);pitch=-THREE.MathUtils.clamp(Math.atan2(this.toVisitor.y,Math.hypot(this.toVisitor.x,this.toVisitor.z)),-.18,.18);}}
    this.look.y=THREE.MathUtils.damp(this.look.y,yaw,4,dt);this.look.x=THREE.MathUtils.damp(this.look.x,pitch,4,dt);this.lookRotation.setFromEuler(this.look);this.head.quaternion.multiply(this.lookRotation);
    const distance=camera.position.distanceTo(this.group.position),visible=distance<13&&distance>1.05;
    this.nameplate.visible=visible;this.indicator.visible=visible&&!this.conversation;
  }
  releaseAsset(model){const geometries=new Set(),materials=new Set(),skeletons=new Set();model.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);if(o.skeleton)skeletons.add(o.skeleton);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());skeletons.forEach(s=>s.dispose());}
  dispose(){if(this.disposed)return;this.disposed=true;this.mixer?.stopAllAction();if(this.model){this.mixer.uncacheRoot(this.model);this.releaseAsset(this.model);}for(const s of [this.nameplate,this.indicator]){s.material.map.dispose();s.material.dispose();}this.group.removeFromParent();this.registry.items.delete('space-host');const index=this.collision.boxes.indexOf(this.collider);if(index>=0)this.collision.boxes.splice(index,1);}
}
