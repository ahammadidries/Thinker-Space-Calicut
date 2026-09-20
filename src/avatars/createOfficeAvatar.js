import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Metres, Y up, +Z forward. One reusable neutral character; no personal identity.
export function createOfficeAvatar() {
  const root = new THREE.Group(); root.name = 'OfficeAvatar';
  const bones = [], joints = {}, parts = new Map();
  function joint(name, parent, position) {
    const b = new THREE.Bone(); b.name = name; b.position.set(...position);
    (parent ? joints[parent] : root).add(b); joints[name] = b; bones.push(b); return b;
  }
  joint('Hips', null, [0,.97,0]);
  joint('Spine','Hips',[0,.13,0]); joint('Chest','Spine',[0,.22,0]);
  joint('Neck','Chest',[0,.15,0]); joint('Head','Neck',[0,.13,0]);
  for (const [side,sign] of [['Left',1],['Right',-1]]) {
    joint(side+'UpperArm','Chest',[sign*.22,.08,0]);
    joint(side+'ForeArm',side+'UpperArm',[sign*.025,-.255,0]);
    joint(side+'Hand',side+'ForeArm',[sign*.018,-.245,0]);
    joint(side+'Thigh','Hips',[sign*.098,-.015,0]);
    joint(side+'Shin',side+'Thigh',[0,-.425,0]);
    joint(side+'Foot',side+'Shin',[0,-.425,0]);
    joint(side+'Toe',side+'Foot',[0,-.05,.13]);
  }
  root.updateMatrixWorld(true);
  const materials = {
    SkinMaterial: new THREE.MeshStandardMaterial({color:'#dca16f',roughness:.78}),
    HairMaterial: new THREE.MeshStandardMaterial({color:'#282822',roughness:.95,flatShading:true}),
    AvatarShirt: new THREE.MeshStandardMaterial({color:'#3a7d6a',roughness:.86}),
    PantsMaterial: new THREE.MeshStandardMaterial({color:'#303638',roughness:.92}),
    ShoesMaterial: new THREE.MeshStandardMaterial({color:'#718478',roughness:.85}),
    TrimMaterial: new THREE.MeshStandardMaterial({color:'#eeede4',roughness:.76}),
    DetailMaterial: new THREE.MeshStandardMaterial({color:'#202925',roughness:.8}),
  };
  Object.entries(materials).forEach(([name,m])=>{m.name=name;parts.set(name,[])});
  function add(geometry, material, bone, position=[0,0,0], scale=[1,1,1], rotation=[0,0,0]) {
    if(!geometry.index)geometry.setIndex(Array.from({length:geometry.attributes.position.count},(_,i)=>i));
    const matrix = new THREE.Matrix4().compose(new THREE.Vector3(...position),new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),new THREE.Vector3(...scale));
    geometry.applyMatrix4(matrix);
    geometry.applyMatrix4(joints[bone].matrixWorld);
    const count=geometry.attributes.position.count,index=bones.indexOf(joints[bone]);
    const indices=new Uint16Array(count*4),weights=new Float32Array(count*4);
    for(let i=0;i<count;i++){indices[i*4]=index;weights[i*4]=1;}
    geometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(indices,4));
    geometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weights,4));
    parts.get(material).push(geometry);
  }
  const ellipsoid=(mat,bone,pos,scale,segments=12,rings=8)=>add(new THREE.SphereGeometry(1,segments,rings),mat,bone,pos,scale);
  const block=(mat,bone,pos,scale,rot)=>add(new THREE.BoxGeometry(1,1,1),mat,bone,pos,scale,rot);
  const limb=(mat,bone,length,top,bottom,depth=1)=>add(new THREE.CylinderGeometry(top,bottom,length,10,2),mat,bone,[0,-length/2,0],[1,1,depth]);
  // Tapered shirt, with weighted waist/chest rings rather than a solid box.
  const torso=new THREE.CylinderGeometry(.20,.174,.43,16,6);torso.scale(1,1,.64);
  const torsoPosition=torso.attributes.position;
  for(let i=0;i<torsoPosition.count;i++){const y=torsoPosition.getY(i),top=THREE.MathUtils.clamp((y-.12)/.095,0,1);torsoPosition.setX(i,torsoPosition.getX(i)*(1-top*.59));torsoPosition.setY(i,y+top*.025)}torso.computeVertexNormals();
  add(torso,'AvatarShirt','Spine',[0,.145,0]);
  const torsoGeo=parts.get('AvatarShirt').at(-1), tp=torsoGeo.attributes.position;
  for(let i=0;i<tp.count;i++) {
    const chest=THREE.MathUtils.clamp((tp.getY(i)-1.14)/.22,0,1);
    torsoGeo.attributes.skinIndex.setXYZW(i,bones.indexOf(joints.Spine),bones.indexOf(joints.Chest),0,0);
    torsoGeo.attributes.skinWeight.setXYZW(i,1-chest,chest,0,0);
  }
  ellipsoid('PantsMaterial','Hips',[0,-.035,0],[.185,.125,.105]);
  ellipsoid('SkinMaterial','Neck',[0,.035,0],[.062,.096,.057]);
  const headGeometry=new THREE.SphereGeometry(1,20,16);
  const hp=headGeometry.attributes.position;for(let i=0;i<hp.count;i++){const y=hp.getY(i);if(y<-.15)hp.setX(i,hp.getX(i)*(1+(y+.15)*.15));}headGeometry.computeVertexNormals();
  add(headGeometry,'SkinMaterial','Head',[0,.028,0],[.137,.179,.126]);
  for(const s of [-1,1]) {
    ellipsoid('SkinMaterial','Head',[s*.137,-.009,0],[.029,.048,.025],8,6);
    ellipsoid('DetailMaterial','Head',[s*.047,.038,.117],[.011,.020,.009],8,6);
    ellipsoid('TrimMaterial','Head',[s*.045,.044,.125],[.003,.004,.003],6,4);
    block('HairMaterial','Head',[s*.047,.082,.114],[.050,.013,.018],[0,0,-s*.08]);
  }
  ellipsoid('SkinMaterial','Head',[0,.005,.13],[.020,.024,.026],8,6);
  // Small smile made from a thin curved tube.
  const smile=new THREE.CatmullRomCurve3([new THREE.Vector3(-.033,-.043,.12),new THREE.Vector3(0,-.05,.127),new THREE.Vector3(.033,-.043,.12)]);
  add(new THREE.TubeGeometry(smile,8,.0028,4,false),'DetailMaterial','Head');
  // Cropped back cap and swept, faceted locks leave the face open.
  ellipsoid('HairMaterial','Head',[0,.09,-.023],[.145,.126,.125],10,6);
  for(const [x,y,z,sx,sy,sz,rz] of [[-.085,.14,.053,.074,.058,.095,-.3],[-.022,.166,.058,.079,.060,.10,-.2],[.049,.153,.065,.083,.055,.091,.25],[.108,.109,.02,.035,.068,.071,.3]])
    add(new THREE.IcosahedronGeometry(1,1),'HairMaterial','Head',[x,y,z],[sx,sy,sz],[0,0,rz]);
  for (const [side,s] of [['Left',1],['Right',-1]]) {
    const arm=side+'UpperArm',fore=side+'ForeArm',hand=side+'Hand',thigh=side+'Thigh',shin=side+'Shin',foot=side+'Foot';
    const sleeveProfile=[[0,-.26],[.059,-.26],[.066,-.14],[.075,-.03],[.072,.01],[.045,.045],[0,.052]].map(([r,y])=>new THREE.Vector2(r,y));
    add(new THREE.LatheGeometry(sleeveProfile,12),'AvatarShirt',arm);
    limb('SkinMaterial',fore,.244,.047,.031,.9);
    add(new THREE.CylinderGeometry(.065,.062,.054,10),'AvatarShirt',fore,[0,-.015,0]);
    ellipsoid('SkinMaterial',hand,[0,-.048,.003],[.037,.065,.024],8,6);
    ellipsoid('SkinMaterial',hand,[-s*.032,-.035,.014],[.015,.035,.016],8,6);
    for(let n=0;n<3;n++)ellipsoid('SkinMaterial',hand,[(n-1)*.019,-.097,.007],[.009,.025,.01],6,4);
    limb('PantsMaterial',thigh,.427,.092,.073,.94);
    ellipsoid('PantsMaterial',shin,[0,0,0],[.073,.075,.070],10,6);
    limb('PantsMaterial',shin,.395,.072,.057,.98);
    block('PantsMaterial',shin,[0,-.376,0],[.12,.045,.117]);
    ellipsoid('ShoesMaterial',foot,[0,-.035,.049],[.075,.071,.143],12,6);
    const soleShape=new THREE.Shape(),w=.070,l=.123,r=.021;
    soleShape.moveTo(-w+r,-l);soleShape.lineTo(w-r,-l);soleShape.quadraticCurveTo(w,-l,w,-l+r);soleShape.lineTo(w,l-r);soleShape.quadraticCurveTo(w,l,w-r,l);soleShape.lineTo(-w+r,l);soleShape.quadraticCurveTo(-w,l,-w,l-r);soleShape.lineTo(-w,-l+r);soleShape.quadraticCurveTo(-w,-l,-w+r,-l);
    add(new THREE.ExtrudeGeometry(soleShape,{depth:.025,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.006,bevelThickness:.006,curveSegments:3}),'TrimMaterial',foot,[0,-.062,.055],[1,1,1],[Math.PI/2,0,0]);
    block('TrimMaterial',foot,[0,-.007,.098],[.07,.014,.108],[.15,0,0]);
    for(let n=0;n<3;n++)block('TrimMaterial',foot,[0,.008-n*.005,.075+n*.028],[.098,.009,.009]);
  }
  // Collar leaves and undershirt inset. Badge stays generic and uses no name.
  block('TrimMaterial','Chest',[0,.12,.106],[.068,.070,.020]);
  for(const s of [-1,1])block('AvatarShirt','Chest',[s*.045,.125,.127],[.054,.085,.019],[0,0,s*.38]);
  block('AvatarShirt','Spine',[0,.13,.131],[.020,.33,.014]);
  for(let n=0;n<3;n++)ellipsoid('DetailMaterial','Spine',[.008,.03+n*.085,.140],[.004,.004,.004],6,4);
  for(const s of [-1,1])block('DetailMaterial','Chest',[s*.039,-.044,.143],[.012,.224,.012],[0,0,-s*.32]);
  block('DetailMaterial','Chest',[0,-.17,.146],[.092,.111,.014]);
  block('TrimMaterial','Chest',[0,-.168,.158],[.080,.096,.012]);
  block('DetailMaterial','Chest',[0,-.118,.166],[.019,.019,.012]);
  block('ShoesMaterial','Chest',[-.02,-.16,.166],[.018,.024,.002]);
  for(let n=0;n<2;n++)block('DetailMaterial','Chest',[.009,-.154-n*.014,.166],[.026,.003,.002]);
  const skeleton=new THREE.Skeleton(bones);
  const meshNames={SkinMaterial:'Body',HairMaterial:'Hair',AvatarShirt:'Shirt',PantsMaterial:'Pants',ShoesMaterial:'Shoes',TrimMaterial:'SolesAndBadge',DetailMaterial:'FaceAndLanyard'};
  for(const [name,geometries] of parts) {
    const geometry=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());
    const mesh=new THREE.SkinnedMesh(geometry,materials[name]);mesh.name=meshNames[name];mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;
    root.add(mesh);mesh.bind(skeleton);mesh.normalizeSkinWeights();
  }
  root.userData={height:1.82,forward:'+Z',seatHeight:.46,license:'Original procedural asset for this project',humanoid:Object.fromEntries(bones.map(b=>[b.name,b.name]))};
  const clips=createClips(joints);
  return {root,clips,materials,skeleton};
}

function createClips(joints) {
  const names=Object.keys(joints), identity=()=>Object.fromEntries(names.map(n=>[n,[0,0,0]]));
  function pose(kind,t) {
    const rotations=identity();let y=.97;
    rotations.LeftUpperArm[2]=.07;rotations.RightUpperArm[2]=-.07;
    if(kind==='Idle'){y+=Math.sin(t*Math.PI)*.003;rotations.Chest[0]=Math.sin(t*Math.PI)*.014;rotations.Head[1]=Math.sin(t*Math.PI)*.04;}
    if(kind==='Walk') {
      const phase=t*2*Math.PI/.9;y+=Math.abs(Math.sin(phase))*.022;
      for(const [side,s] of [['Left',1],['Right',-1]]){rotations[side+'Thigh'][0]=Math.sin(phase)*.48*s;rotations[side+'Shin'][0]=Math.max(0,-Math.sin(phase)*s)*.68;rotations[side+'UpperArm'][0]=-Math.sin(phase)*.34*s;rotations[side+'ForeArm'][0]=-.12;}
    }
    if(kind==='Seated') {
      y=.56; rotations.Chest[0]=.04+Math.sin(t*Math.PI)*.009;
      for(const side of ['Left','Right']) {rotations[side+'Thigh'][0]=-Math.PI/2;rotations[side+'Shin'][0]=Math.PI/2;rotations[side+'UpperArm'][0]=-.36;rotations[side+'ForeArm'][0]=-.93;}
    }
    return {rotations,y};
  }
  const clips=[];
  for(const [name,duration,kind] of [['Idle',2,'Idle'],['Walk',.9,'Walk'],['Sit',1,'transition'],['SittingIdle',2,'Seated'],['GetUp',1,'transition']]) {
    const samples=kind==='transition'?13:25,times=[],values=Object.fromEntries(names.map(n=>[n,[]])),positions=[];
    for(let i=0;i<samples;i++) {
      const t=i/(samples-1)*duration;times.push(t);
      let p=pose(kind,t);
      if(kind==='transition') {
        const v=name==='Sit'?t:1-t,k=v*v*(3-2*v),a=pose('Idle',0),b=pose('Seated',0);p={y:THREE.MathUtils.lerp(a.y,b.y,k),rotations:identity()};
        for(const n of names)p.rotations[n]=a.rotations[n].map((x,j)=>THREE.MathUtils.lerp(x,b.rotations[n][j],k));
        p.rotations.Chest[0]+=.20*Math.sin(v*Math.PI);
      }
      positions.push(0,p.y,0);
      for(const n of names)values[n].push(...new THREE.Quaternion().setFromEuler(new THREE.Euler(...p.rotations[n])).toArray());
    }
    const tracks=[new THREE.VectorKeyframeTrack('Hips.position',times,positions),...names.map(n=>new THREE.QuaternionKeyframeTrack(n+'.quaternion',times,values[n]))];
    clips.push(new THREE.AnimationClip(name,duration,tracks));
  }
  return clips;
}
