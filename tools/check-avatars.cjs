const {chromium}=require('C:/Users/ahamm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
 const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5186/tools/avatar-preview.html');await page.waitForFunction(()=>window.ready);await page.screenshot({path:'artifacts/avatar-review.png'});
 const users=Array.from({length:14},(_,i)=>({membershipId:100+i,id:200+i,name:'Maker '+(i+1),spaceId:2}));
 await page.route('https://app-api.tinkerhub.org/checkin/active?*',route=>route.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(users)}));
 await page.route('https://jasimcm.github.io/**',route=>route.fulfill({contentType:'text/html',body:'<body>TV test</body>'}));
 await page.goto('http://127.0.0.1:5186/');await page.waitForFunction(()=>window.__twin?.avatars?.avatars.size===14,null,{timeout:30000});
 const report=await page.evaluate(async()=>{
  const t=__twin,m=t.avatars;m.options.pollIntervalMs=600000;clearTimeout(m.timer);t.renderer.setAnimationLoop(null);
  const results=[],check=(name,value)=>{results.push({name,pass:!!value});if(!value)throw Error(name)};
  check('One avatar per unique user',m.avatars.size===14);
  const first=m.avatars.get('100'),second=m.avatars.get('101');check('Independent shirt materials',first.shirt!==second.shirt);
  check('Shared base geometry',first.model.getObjectByName('Body').geometry===second.model.getObjectByName('Body').geometry);
  check('Independent skeletons',first.model.getObjectByName('Body').skeleton!==second.model.getObjectByName('Body').skeleton);
  const snapshot=()=>[...m.avatars.values()].map(a=>({id:a.id,state:a.state,seat:a.seat?.id,position:a.body.position.toArray(),path:a.path.length}));
  let samples=0,seatedSamples=0,walkingSamples=0;const states=new Set();
  for(let frame=0;frame<2400;frame++){
   m.update(.1,t.camera,null);for(const a of m.avatars.values()){states.add(a.state);samples++;if(a.state==='seated')seatedSamples++;if(['walking','docking','leaving'].includes(a.state))walkingSamples++;}
  }
  const seats=[...m.avatars.values()].filter(a=>a.seat).map(a=>a.seat.id);check('Exclusive chair reservations',seats.length===new Set(seats).size);
  check('Characters reach seated state',states.has('seated'));
  check('Most time is seated',seatedSamples/samples>.70);
  const distribution={seated:seatedSamples/samples,walking:walkingSamples/samples,states:[...states],snapshot:snapshot()};
  const color=first.shirt.color.getHexString();m.sync([{id:'100',name:'Renamed maker'},{id:'999',name:'New maker'}]);
  check('Departures removed',m.avatars.size===2&&!m.avatars.has('101'));
  check('ID retains model and color',m.avatars.get('100')===first&&first.shirt.color.getHexString()===color);
  check('Name changes without replacing model',first.name==='Renamed maker');
  check('Departures release chairs',[...m.seats.values()].every(id=>m.avatars.has(id)));
  m.sync(Array.from({length:14},(_,i)=>({id:String(100+i),name:'Maker '+(i+1)})));
  for(let frame=0;frame<100;frame++)m.update(.1,t.camera,null);
  t.ui.started=true;t.ui.setExploring(true);t.player.active=false;t.player.position.set(-.9,t.config.building.room.floorY,5.9);t.player.yaw=0;t.player.pitch=-.04;t.player.syncCamera();m.update(.001,t.camera,null);t.ui.update(t.player);t.scene.updateMatrixWorld(true);t.renderer.render(t.scene,t.camera);
  return {results,distribution,errors:[]};
 });
 await page.screenshot({path:'artifacts/avatars-workshop.png'});fs.writeFileSync('artifacts/avatar-checks.json',JSON.stringify({...report,errors},null,2));console.log(JSON.stringify({results:report.results,distribution:report.distribution,errors}));
 if(errors.length)throw Error(errors.join('\n'));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
