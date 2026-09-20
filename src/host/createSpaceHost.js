import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';

// Original, reference-informed geometry. Metres; +Y up, +Z face forward.
// Facial features are modeled, not photographs mapped onto the character.
export function createSpaceHost() {
  const root = new THREE.Group(); root.name = 'SpaceHost';
  const bones = [], joints = {}, parts = new Map();
  const joint = (name, parent, position) => {
    const bone = new THREE.Bone(); bone.name = name; bone.position.set(...position);
    (parent ? joints[parent] : root).add(bone); bones.push(bone); joints[name] = bone;
  };
  joint('Hips', null, [0,.965,0]); joint('Spine','Hips',[0,.13,0]);
  joint('Chest','Spine',[0,.225,0]); joint('Neck','Chest',[0,.16,0]); joint('Head','Neck',[0,.125,0]);
  for (const [side,s] of [['Left',1],['Right',-1]]) {
    joint(side+'UpperArm','Chest',[s*.195,.015,0]);
    joint(side+'ForeArm',side+'UpperArm',[s*.012,-.265,0]);
    joint(side+'Hand',side+'ForeArm',[s*.016,-.235,0]);
    joint(side+'Thigh','Hips',[s*.096,-.012,0]);
    joint(side+'Shin',side+'Thigh',[0,-.422,0]);
    joint(side+'Foot',side+'Shin',[0,-.431,0]);
    joint(side+'Toe',side+'Foot',[0,-.045,.12]);
  }
  root.updateMatrixWorld(true);
  const specs = {
    HostSkin: ['#b07b59',.82], HostHair: ['#171b19',.95], HostShirt: ['#203e34',.88],
    HostPants: ['#292d2e',.94], HostShoes: ['#515e56',.85], HostTrim: ['#d6d8ce',.78],
    HostEyes: ['#372821',.38], HostEyeWhite: ['#cbbba6',.58], HostLips: ['#96543e',.86],
    HostDetail: ['#242924',.82], HostBeard: ['#76543b',.98], HostCurl: ['#202320',.96],
  };
  const materials = Object.fromEntries(Object.entries(specs).map(([name,[color,roughness]]) => {
    const m = new THREE.MeshStandardMaterial({color,roughness,metalness:0}); m.name = name; parts.set(name,[]); return [name,m];
  }));
  materials.HostSkin.vertexColors = true;
  function add(geo, material, bone, position=[0,0,0], scale=[1,1,1], rotation=[0,0,0], weighting) {
    if (!geo.index) geo.setIndex(Array.from({length:geo.attributes.position.count},(_,i)=>i));
    // Convex accessories get a small planar UV layout; ring surfaces have continuous UVs.
    if (!geo.attributes.uv) {
      const uv=[]; const p=geo.attributes.position;
      for(let i=0;i<p.count;i++)uv.push(p.getX(i)*3+.5,p.getY(i)*3+.5);
      geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    }
    if(material==='HostSkin'&&!geo.attributes.color)geo.setAttribute('color',new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count*3).fill(1),3));
    geo.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...position),new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),new THREE.Vector3(...scale)));
    if(bone==='Head')geo.scale(.88,.88,.88);
    geo.applyMatrix4(joints[bone].matrixWorld);
    const count=geo.attributes.position.count, indices=new Uint16Array(count*4), weights=new Float32Array(count*4);
    for(let i=0;i<count;i++) {
      const w=weighting?.(geo.attributes.position,i) || [[bone,1]];
      w.forEach(([name,weight],n)=>{indices[i*4+n]=bones.indexOf(joints[name]);weights[i*4+n]=weight;});
    }
    geo.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(indices,4));
    geo.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weights,4));
    parts.get(material).push(geo);
  }
  const ellipse=(mat,bone,pos,scale,w=12,h=8)=>add(new THREE.SphereGeometry(1,w,h),mat,bone,pos,scale);
  const box=(mat,bone,pos,size,rot)=>add(new THREE.BoxGeometry(1,1,1),mat,bone,pos,size,rot);
  const tube=(mat,bone,points,r=.002,segments=12)=>add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),segments,r,5,false),mat,bone);
  const blend=(a,b,low,high)=>(p,i)=>{const w=THREE.MathUtils.smoothstep(p.getY(i),low,high);return [[a,1-w],[b,w]];};

  // Ring topology preserves shoulder/waist shape and provides elbow/knee support loops.
  const torso = rings([
    [-.14,.167,.100,0],[-.12,.172,.106,0],[-.05,.17,.109,0],[.04,.173,.116,0],
    [.14,.19,.122,0],[.23,.205,.112,-.003],[.27,.189,.101,-.004],[.305,.125,.074,-.003],[.325,.055,.050,0],
  ],24);
  add(torso,'HostShirt','Spine',[0,0,0],[1,1,1],[0,0,0],blend('Spine','Chest',1.13,1.37));
  add(rings([[-.127,.135,.078,0],[-.095,.158,.091,0],[-.03,.172,.102,0],[.028,.166,.101,0]],24),'HostPants','Hips');
  ellipse('HostSkin','Neck',[0,.008,0],[.054,.086,.052],16,10);

  const faceProfile = [
    [-.151,.026,.037,.012],[-.14,.057,.064,.01],[-.116,.079,.076,.008],
    [-.083,.095,.084,.006],[-.039,.108,.092,.001],[.004,.114,.097,0],
    [.044,.116,.096,0],[.082,.115,.095,-.003],[.12,.104,.089,-.008],
    [.149,.075,.067,-.014],[.16,.026,.028,-.015],
  ];
  // Vertex-tinted stubble shares the face surface: no floating beard or coplanar flicker.
  const denseProfile=faceProfile.flatMap((p,i)=>i===faceProfile.length-1?[p]:[p,p.map((v,k)=>(v+faceProfile[i+1][k])/2)]);
  const face=rings(denseProfile,40,.78),colors=[];
  for(let i=0;i<face.attributes.position.count;i++) {
    const a=-Math.PI+2*Math.PI*(i%41)/40,y=face.attributes.position.getY(i);
    const top=-.082+Math.abs(Math.sin(a))*.055;
    const coverage=(1-THREE.MathUtils.smoothstep(y,top-.008,top+.01))*(1-THREE.MathUtils.smoothstep(Math.abs(a),1.32,1.62));
    colors.push(1-coverage*.43,1-coverage*.47,1-coverage*.47);
  }
  face.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));add(face,'HostSkin','Head');
  for(const s of [-1,1]) {
    ellipse('HostSkin','Head',[s*.114,-.022,-.005],[.021,.037,.023],12,8);
    ellipse('HostLips','Head',[s*.127,-.022,.009],[.007,.019,.005],10,6);
    // Almond eyes sit inside lids; restrained sclera keeps a natural expression.
    ellipse('HostEyeWhite','Head',[s*.043,.025,.094],[.022,.0068,.007],16,8);
    ellipse('HostEyes','Head',[s*.042,.026,.100],[.0075,.007,.004],12,8);
    ellipse('HostHair','Head',[s*.042,.026,.103],[.0047,.0058,.0018],10,6);
    ellipse('HostTrim','Head',[s*.042-.002,.029,.1055],[.0016,.0018,.0008],6,4);
    tube('HostSkin','Head',[[s*.019,.025,.098],[s*.03,.033,.1],[s*.05,.034,.098],[s*.066,.028,.091]],.0032);
    tube('HostLips','Head',[[s*.019,.022,.097],[s*.043,.014,.101],[s*.066,.024,.093]],.0014);
    tube('HostHair','Head',[[s*.018,.058,.095],[s*.035,.063,.097],[s*.053,.062,.094],[s*.069,.056,.088]],.0055,10);
  }
  ellipse('HostSkin','Head',[0,.005,.105],[.012,.043,.020],16,12);
  ellipse('HostSkin','Head',[0,-.02,.123],[.017,.012,.016],16,10);
  for(const s of [-1,1]){
    ellipse('HostSkin','Head',[s*.015,-.028,.113],[.010,.008,.013],12,8);
    ellipse('HostBeard','Head',[s*.013,-.033,.125],[.004,.002,.002],8,4);
  }
  tube('HostHair','Head',[[-.033,-.054,.090],[-.017,-.051,.095],[-.008,-.050,.097],[0,-.053,.098],[.012,-.050,.097],[.027,-.052,.092],[.034,-.054,.089]],.0028);
  tube('HostLips','Head',[[-.029,-.065,.089],[-.015,-.071,.095],[0,-.072,.098],[.017,-.07,.094],[.03,-.064,.089]],.003);
  tube('HostBeard','Head',[[-.029,-.064,.092],[0,-.067,.100],[.03,-.063,.092]],.0013);

  // Cropped sides/back and a short, dense curl crown, matching the supplied front/profile photos.
  const cap=rings([[.065,.116,.096,-.006],[.11,.119,.101,-.009],[.15,.101,.088,-.01],[.174,.055,.052,-.015],[.178,.004,.004,-.015]],28);
  for(let i=0;i<=28;i++){const a=-Math.PI+2*Math.PI*i/28;cap.attributes.position.setY(i,.065+.027*Math.max(0,Math.cos(a))**2);}cap.computeVertexNormals();
  add(cap,'HostHair','Head');
  for(const s of [-1,1])ellipse('HostHair','Head',[s*.108,.038,-.027],[.015,.053,.071],12,8);
  let seed=512;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
  for(let row=0;row<5;row++)for(let col=0;col<9;col++) {
    const x=(col-4)*.025+(random()-.5)*.008,z=(row-2)*.035+(random()-.5)*.009;
    if((x/.118)**2+(z/.105)**2>1)continue;
    const y=.105+.070*Math.sqrt(Math.max(0,1-(x/.132)**2-(z/.135)**2));
    const r=.018+random()*.006;
    add(new THREE.IcosahedronGeometry(1,1),random()>.7?'HostCurl':'HostHair','Head',[x,y,z],[r,r*.76,r*1.05],[random(),random(),random()]);
    // A small off-centre lobe reads as a curl rather than large spiky locks.
    ellipse('HostHair','Head',[x+r*.45,y+r*.45,z+r*.18],[r*.65,r*.45,r*.7],8,6);
  }
  for(let i=0;i<12;i++){
    const x=(i-5.5)*.0175+(random()-.5)*.006,y=.10+.014*(1-(x/.11)**2)+random()*.004,z=.087-.022*(x/.11)**2;
    add(new THREE.IcosahedronGeometry(1,1),'HostHair','Head',[x,y,z],[.014,.015,.015],[random(),random(),random()]);
  }
  for(const [side,s] of [['Left',1],['Right',-1]]) {
    const arm=side+'UpperArm',fore=side+'ForeArm',hand=side+'Hand',thigh=side+'Thigh',shin=side+'Shin',foot=side+'Foot';
    const sleeve=rings([[-.303,.047,.045,0],[-.28,.053,.050,0],[-.263,.057,.053,0],[-.245,.058,.054,0],[-.21,.06,.057,0],[-.14,.064,.062,0],[-.04,.071,.068,0],[.012,.065,.060,0],[.038,.038,.035,0],[.044,.002,.002,0]],16);
    const sp=sleeve.attributes.position;for(let i=0;i<sp.count;i++)sp.setX(i,sp.getX(i)+s*.012*(1-THREE.MathUtils.smoothstep(sp.getY(i),-.27,-.11)));sleeve.computeVertexNormals();
    add(sleeve,'HostShirt',arm,[0,0,0],[1,1,1],[0,0,0],blend(fore,arm,1.035,1.105));
    const forearm=rings([[-.245,.027,.026,0],[-.22,.031,.03,0],[-.13,.04,.036,0],[-.055,.047,.042,0],[.005,.046,.043,0]],14);
    const fp=forearm.attributes.position;for(let i=0;i<fp.count;i++)fp.setX(i,fp.getX(i)+s*.016*(1-THREE.MathUtils.smoothstep(fp.getY(i),-.235,0)));forearm.computeVertexNormals();
    add(forearm,'HostSkin',fore,[0,0,0],[1,1,1],[0,0,0],blend(hand,fore,.82,.855));
    add(new THREE.CylinderGeometry(.061,.056,.048,16,2),'HostShirt',fore,[0,-.026,0],[1,1,.94]);
    ellipse('HostSkin',hand,[0,-.044,.002],[.034,.053,.023],12,8);
    ellipse('HostSkin',hand,[-s*.031,-.037,.012],[.012,.033,.013],10,6);
    for(let n=0;n<4;n++)ellipse('HostSkin',hand,[(n-1.5)*.015,-.085+(n===3?.009:0),.005],[.0076,.029-(n===3?.005:0),.010],8,6);
    const leg=rings([[-.821,.053,.054,.002],[-.79,.057,.056,0],[-.59,.062,.063,0],[-.45,.067,.067,0],[-.421,.07,.068,0],[-.391,.073,.07,0],[-.27,.080,.076,0],[-.12,.087,.087,0],[.00,.089,.096,0]],18);
    add(leg,'HostPants',thigh,[0,0,0],[1,1,1],[0,0,0],blend(shin,thigh,.50,.58));
    box('HostPants',shin,[0,-.378,0],[.112,.036,.114]);
    ellipse('HostShoes',foot,[0,-.032,.040],[.070,.066,.132],16,10);
    ellipse('HostTrim',foot,[0,-.071,.04],[.073,.026,.138],16,8);
    box('HostTrim',foot,[0,-.004,.074],[.064,.014,.097],[.14,0,0]);
    for(let i=0;i<3;i++)box('HostTrim',foot,[0,.006-i*.003,.044+i*.025],[.085,.007,.006]);
  }
  // Open, folded collar and a quiet button placket. No title or name on clothing.
  for(const s of [-1,1]) {
    const geo=new ConvexGeometry([[s*.024,.12,.05],[s*.06,.126,.051],[s*.087,.073,.099],[s*.05,.032,.111],[s*.027,.09,.088]].map(p=>new THREE.Vector3(...p)));
    add(geo,'HostShirt','Chest');
  }
  box('HostShirt','Spine',[0,.067,.118],[.017,.365,.007]);
  for(let n=0;n<5;n++)ellipse('HostTrim','Spine',[.001,-.10+n*.073,.123],[.0035,.0035,.0018],8,4);
  // A simple dark watch echoes the standing reference without becoming a focal point.
  add(new THREE.CylinderGeometry(.033,.033,.029,12),'HostDetail','LeftForeArm',[0,-.204,0],[1,1,1.04]);
  box('HostDetail','LeftForeArm',[.005,-.205,.035],[.036,.040,.009]);
  box('HostShoes','LeftForeArm',[.005,-.205,.041],[.028,.032,.002]);

  const skeleton=new THREE.Skeleton(bones);
  for(const [name,geometries] of parts) {
    if(!geometries.length)continue;
    const geometry=mergeGeometries(geometries,false); geometries.forEach(g=>g.dispose());
    const mesh=new THREE.SkinnedMesh(geometry,materials[name]);mesh.name=name+'Mesh';mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;
    root.add(mesh);mesh.bind(skeleton);mesh.normalizeSkinWeights();
  }
  root.userData={role:'Permanent Space Host',height:1.78,forward:'+Z',units:'metres',humanoid:Object.fromEntries(bones.map(b=>[b.name,b.name])),editableShirt:'HostShirt',nameplate:'External UI; not included in this asset',source:'Original procedural geometry based on supplied likeness references'};
  return {root,clips:createHostClips(joints),skeleton,materials};
}

// Elliptical rings, seam duplicated for UVs. Optional arc used by close-fitting facial hair.
function rings(profile,segments=20,frontPower=1,start=-Math.PI,end=Math.PI) {
  const pos=[],uv=[],idx=[];
  profile.forEach(([y,rx,rz,cz=0],j)=>{
    for(let i=0;i<=segments;i++) {
      const a=start+(end-start)*i/segments,c=Math.cos(a);
      pos.push(Math.sin(a)*rx,y,Math.sign(c)*Math.abs(c)**frontPower*rz+cz);
      uv.push(i/segments,j/(profile.length-1));
      if(j&&i) {const d=j*(segments+1)+i;idx.push(d,d-1,d-segments-2,d,d-segments-2,d-segments-1);}
    }
  });
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;
}

function createHostClips(joints) {
  const names=Object.keys(joints), clips=[];
  for(const [name,duration] of [['Idle',4],['Breathing',5],['Greeting',2.8],['Talking',4],['HeadTurn',4],['LookAtVisitor',3],['HandGesture',3],['TurnLeft',3],['TurnRight',3]]) {
    const times=[],values=Object.fromEntries(names.map(n=>[n,[]]));
    for(let i=0;i<=48;i++) {
      const t=duration*i/48,phase=t/duration*Math.PI*2,envelope=Math.sin(Math.PI*i/48)**2;
      const r=Object.fromEntries(names.map(n=>[n,[0,0,0]]));
      r.LeftUpperArm=[-.04,0,.075];r.RightUpperArm=[-.055,0,-.065];
      r.LeftForeArm[0]=-.11;r.RightForeArm[0]=-.14;
      r.Chest=[.008+Math.sin(phase)*.009,0,.006];r.Head=[-.01,Math.sin(phase)*.025,-.01];
      if(name==='Breathing'){r.Chest[0]+=.013*Math.sin(phase);r.Neck[0]=-.008*Math.sin(phase);}
      if(name==='Greeting') {
        r.RightUpperArm=[-.30*envelope,0,-.88*envelope-.065];
        r.RightForeArm=[-1.83*envelope-.14,-.22*envelope,-.17*envelope];
        r.RightHand[2]=Math.sin(phase*3)*.20*envelope;r.Head[2]=-.045*envelope;
      }
      if(name==='Talking'||name==='HandGesture') {
        r.RightUpperArm[0]-=.32*envelope;r.RightForeArm[0]-=.85*envelope;
        r.RightHand[1]=.32*envelope;r.LeftForeArm[0]-=.30*envelope;
        r.Head[0]+=.04*Math.sin(phase*2)*envelope;
      }
      if(name==='HeadTurn')r.Head[1]=.42*Math.sin(phase);
      if(name==='LookAtVisitor'){r.Head[1]=-.18*envelope;r.Head[0]=-.06*envelope;r.Chest[1]=-.05*envelope;}
      // In-place upper-body turns retain planted feet and a permanent location.
      if(name==='TurnLeft'||name==='TurnRight') {
        const sign=name==='TurnLeft'?1:-1;
        r.Spine[1]=sign*.13*envelope;r.Chest[1]=sign*.20*envelope;r.Head[1]=sign*.22*envelope;
      }
      times.push(t);
      for(const n of names)values[n].push(...new THREE.Quaternion().setFromEuler(new THREE.Euler(...r[n])).toArray());
    }
    clips.push(new THREE.AnimationClip(name,duration,names.map(n=>new THREE.QuaternionKeyframeTrack(n+'.quaternion',times,values[n]))));
  }
  return clips;
}
