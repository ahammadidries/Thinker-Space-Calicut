const {chromium}=require('C:/Users/ahamm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5186');await page.waitForFunction(()=>window.__twin?.ready);
  await page.click('#enter');await page.waitForTimeout(150);
  if(!await page.evaluate(()=>__twin.player.active)) throw Error('Enter did not start exploration');
  await page.keyboard.press('Escape');await page.waitForTimeout(150);
  if(!await page.locator('#pause-modal').isVisible()) throw Error('Escape did not pause');
  const report=await page.evaluate(()=>{
   const t=__twin,p=t.player,i=t.interaction,c=t.config,f=c.building.room.floorY,s=c.building.stairs;
   t.renderer.setAnimationLoop(null);p.active=true;
   const results=[],check=(name,value)=>{results.push({name,pass:!!value});if(!value)throw Error(name+' at '+p.position.toArray())};
   const pose=(x,z,y=f)=>{p.position.set(x,y,z);p.yaw=0;p.pitch=0;p.velocityY=0;p.grounded=true;p.keys.clear();p.syncCamera()};
   const frames=n=>{for(let k=0;k<n;k++){p.update(1/60);i.update(1/60,p)}};
   const walk=(x,z,max=650)=>{p.yaw=Math.atan2(-(x-p.position.x),-(z-p.position.z));p.keys.add('KeyW');let n=0;while(Math.hypot(x-p.position.x,z-p.position.z)>.065&&n++<max)frames(1);p.keys.clear();return Math.hypot(x-p.position.x,z-p.position.z)<.08};
   const aim=(x,y,z)=>{p.syncCamera();t.camera.lookAt(x,y,z);p.yaw=t.camera.rotation.y;p.pitch=t.camera.rotation.x;i.update(0,p)};
   const d=c.building.doors[0],d2=c.building.doors[1];
   pose(3.8,c.plan.lobby.minZ-1);check('Path joins PDF lobby without a floor drop',walk(3.8,d.z)&&Math.abs(p.position.y-f)<.01);
   pose(d.x+1.1,d.z);aim(d.x,f+1.3,d.z);check('Display doorway raycast',i.target?.id===d.id);i.act(p);frames(110);
   check('Enter resized workshop',walk(d.x-.9,d.z));check('Reach main aisle',walk(-.99,d.z));check('Walk central workshop aisle',walk(-.99,3.25));check('Pass window table',walk(-.8,3.6)&&walk(-.8,5.4));
   pose(d2.x+1.1,d2.z);aim(d2.x,f+1.3,d2.z);check('Printer doorway raycast',i.target?.id===d2.id);i.act(p);frames(110);check('Enter printer end',walk(d2.x-.9,d2.z));
   pose(3.7,-6.6);check('Walk veranda beside staircase',walk(3.7,8.1));check('Access measured covered balcony',walk(0,8.6));check('Balcony location label',p.location()==='Covered balcony');
   const stairX=(s.minX+s.maxX)/2,lowerCount=s.landingNumber-1,risers=s.steps-1,treadDepth=(s.bottomZ-s.topZ-s.landingDepth)/risers,landingBottom=s.bottomZ-lowerCount*treadDepth,landingHeight=f*lowerCount/risers;
   pose(stairX,s.bottomZ+.6,0);check('Climb lower stair run',walk(stairX,landingBottom-.2));frames(30);check('Reach middle landing height',Math.abs(p.position.y-landingHeight)<.01);check('Walk flat across broad landing',walk(stairX,landingBottom-s.landingDepth+.2)&&Math.abs(p.position.y-landingHeight)<.01);check('Climb upper stair run',walk(stairX,s.topZ-.5));check('Reach +3.75 m',Math.abs(p.position.y-f)<.01);check('Descend both stair runs',walk(stairX,s.bottomZ+.6));frames(30);check('Return to lower grade',p.position.y<.02);
   pose(3.7,-8.3175);check('Lobby reaches restored landing',walk(.6,-8.3175));check('Landing reaches Other 1',walk(.6,-10.08));
   for(const roomId of ['other-2','other-3']){
    const r=c.plan.rooms.find(q=>q.id===roomId),o=c.plan.annexOpenings.find(q=>q.id===roomId+'-opening'),x=roomId==='other-3'?o.b[0]-.27:(o.a[0]+o.b[0])/2;
    check('Reach '+r.label+' doorway',walk(x,-10.08));check('Enter '+r.label,walk(x,-11.12));check(r.label+' location',p.location()===r.label);check('Leave '+r.label,walk(x,-10.08));
   }
   check('Reach original bathroom doorway from Other 1',walk(-1.325,-10.08));check('Enter restored bathroom',walk(-1.325,-8.42));check('Bathroom location',p.location()==='Bathroom');check('Leave through original bathroom opening',walk(-1.325,-10.08));
   pose(0,-5.5);const cabinet=i.items.get(c.objects.windowCabinet.id);cabinet.interact(p);frames(100);check('All three cabinet doors open',cabinet.group.children.filter(o=>o.name.startsWith('cabinet-door-')).every(o=>Math.abs(o.rotation.y)>.9));cabinet.interact(p);frames(100);
   for(const id of ['printer-01','printer-02']){const printer=i.items.get(id);printer.interact(p);check(id+' remains functional',printer.state==='Active')}
   for(const chair of c.chairs)check(chair.id+' clear of furniture',!t.collision.overlaps(...[chair.position[0],chair.position[2],f,.31,.98,chair.id]));
   check('Exactly two physical printers',c.objects.printers.length===2);
   return {results,objects:i.items.size};
  });
  fs.writeFileSync('artifacts/playability.json',JSON.stringify({...report,errors},null,2));
  console.log(JSON.stringify({checks:report.results.length,passed:report.results.every(r=>r.pass),objects:report.objects,errors}));
  await page.reload();await page.waitForFunction(()=>window.__twin?.ready);await page.click('#map-button');await page.screenshot({path:'artifacts/map.png'});
  await page.evaluate(()=>{const t=__twin;t.ui.started=true;t.ui.setExploring(true);document.getElementById('map-modal').hidden=true;document.getElementById('pause-modal').hidden=true;t.player.active=false;t.player.position.set(2.7,t.config.building.room.floorY,-8.4);t.player.yaw=Math.PI/2;t.player.pitch=-.08;t.player.syncCamera()});
  await page.waitForTimeout(300);await page.screenshot({path:'artifacts/restored-annex.png'});
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
