const {chromium}=require('C:/Users/ahamm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try {
 const page=await browser.newPage({viewport:{width:1280,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5186');await page.waitForFunction(()=>window.__twin?.ready);
 await page.click('#enter');await page.waitForTimeout(250);
 const clicked=await page.evaluate(()=>({active:__twin.player.active,landingHidden:document.getElementById('landing').hidden}));
 if(!clicked.active||!clicked.landingHidden)throw Error('Enter did not activate exploration');
 await page.keyboard.press('Escape');await page.waitForTimeout(200);
 const paused=await page.locator('#pause-modal').isVisible();if(!paused)throw Error('Escape did not open pause');
 const report=await page.evaluate(()=>{
  const t=__twin,p=t.player,w=t.collision,i=t.interaction; t.renderer.setAnimationLoop(null);p.active=true;
  const results=[];const check=(name,value,detail='')=>{results.push({name,pass:!!value,detail});if(!value)throw Error(name+': '+detail)};
  const pose=(x,y,z,yaw=0)=>{p.position.set(x,y,z);p.yaw=yaw;p.pitch=0;p.velocityY=0;p.grounded=true;p.keys.clear();p.syncCamera()};
  const frames=(n)=>{for(let k=0;k<n;k++){p.update(1/60);i.update(1/60,p)}};
  const walk=(x,z,max=500)=>{p.yaw=Math.atan2(-(x-p.position.x),-(z-p.position.z));p.keys.add('KeyW');let n=0;while(Math.hypot(x-p.position.x,z-p.position.z)>.065&&n++<max){p.update(1/60);i.update(1/60,p)}p.keys.clear();return Math.hypot(x-p.position.x,z-p.position.z)<.08};
  const aim=(x,y,z)=>{p.syncCamera();t.camera.lookAt(x,y,z);p.yaw=t.camera.rotation.y;p.pitch=t.camera.rotation.x;i.update(0,p)};
  pose(3.8,3.2,-11);check('Walk from uphill path onto upper deck',walk(3.8,-6.3),p.position.toArray().join(','));
  check('Reach display-end door from veranda',walk(4.0,-6.3));
  walk(1.7,-6.3,80);check('Closed door blocks movement',p.position.x>3.1,p.position.toArray().join(','));
  pose(4.0,3.2,-6.3);aim(2.9,4.5,-6.3);check('Door is reachable by raycast',i.target?.id==='door-display-end',i.target?.id);i.act(p);frames(110);
  check('Door opens smoothly',i.items.get('door-display-end').state==='Open');
  check('Cross opened display-end door',walk(1.8,-6.3));
  check('Reach workshop aisle',walk(-.95,-6.3));check('Traverse workshop length',walk(-.95,5.5),p.position.toArray().join(','));
  pose(4.0,3.2,4.6);aim(2.9,4.5,4.6);check('Second door is same workshop entrance',i.target?.id==='door-printer-end',i.target?.id);i.act(p);frames(110);check('Cross printer-end door',walk(1.7,4.6),p.position.toArray().join(','));
  pose(3.75,3.2,-5.2);check('Veranda bypass beside stair opening',walk(3.75,5.4));
  pose(5.65,0,4.4);check('Climb the full stair flight',walk(5.65,-4.1),p.position.toArray().join(','));check('Stairs reach upper grade',Math.abs(p.position.y-3.2)<.02);
  check('Descend the same flight',walk(5.65,4.5));frames(30);check('Stairs return to lower grade',p.position.y<.05,p.position.y);
  pose(-.95,3.2,-.2);p.keys.add('Space');frames(12);check('Jump rises above floor',p.position.y>3.5);frames(90);check('Gravity returns to tiled floor',Math.abs(p.position.y-3.2)<.01);
  pose(0,3.2,-5.6);aim(0,5.23,-7.18);check('Display is raycast target',i.target?.id==='display-01',i.target?.id);i.act(p);check('Display toggles off',i.items.get('display-01').state==='Off');i.act(p);check('Display toggles back on',i.items.get('display-01').state==='On');
  pose(3.75,3.2,-5.1);aim(0,5.23,-7.18);check('Walls block remote interactions',i.target?.id!=='display-01');
  for(const [id,before,after] of [['fan-window-01','On','Off'],['speaker-window-01','Powered','Off'],['printer-01','Idle','Active'],['electrical-switch-01','On','Off'],['light-switch-1','Lights on','Lights off']]){const item=i.items.get(id);check(id+' initial state',item.state===before);item.interact(p);check(id+' toggles',item.state===after)}
  const printer=i.items.get('printer-01');const transforms=()=>{const a=[];printer.group.traverse(o=>a.push(o.position.toArray().join(',')));return a.join(';')};const printerBefore=transforms();frames(30);check('Printer gantry and bed visibly move',transforms()!==printerBefore);
  const chair=i.items.get('chair-veranda-03');pose(6.15,3.2,9.0);const old=chair.group.position.clone();chair.interact(p);check('Chair moves one constrained step',Math.abs(chair.group.position.distanceTo(old)-.2)<.001);const angle=chair.group.rotation.y;chair.rotate(p);check('Chair rotates',chair.group.rotation.y!==angle);for(let k=0;k<15;k++)chair.interact(p);check('Chair cannot pass outside balcony',chair.group.position.x<6.7&&chair.group.position.distanceTo(old)<=.901);
  pose(3.75,3.2,-8.2);check('Veranda connects to stepped annex landing',walk(.6,-8.2));
  check('Landing enters Other 1',walk(.6,-9.98));check('Other 1 label',p.location()==='Other 1');
  check('Reach Other 2 doorway',walk(.9,-9.98));check('Enter separate Other 2',walk(.9,-11.32),p.position.toArray().join(','));check('Other 2 label',p.location()==='Other 2');
  check('Return to common area',walk(.9,-9.98));check('Reach Other 3 doorway',walk(-2.04,-9.98));
  check('Enter separate Other 3',walk(-2.04,-11.1),p.position.toArray().join(','));check('Other 3 label',p.location()==='Other 3');
  check('Leave Other 3',walk(-2.04,-9.98));check('Reach bathroom doorway',walk(-1.3,-9.98));
  check('Enter bathroom from Other 1',walk(-1.3,-8.3),p.position.toArray().join(','));check('Bathroom label',p.location()==='Bathroom');
  check('Exit bathroom through same opening',walk(-1.3,-9.98));
  check('No duplicate interactive IDs',i.items.size===new Set([...i.items.keys()]).size);
  return {results,objects:i.items.size,drawCalls:t.renderer.info.render.calls};
 });
 fs.writeFileSync('artifacts/playability.json',JSON.stringify({clicked,paused,...report,errors},null,2));console.log(JSON.stringify({clicked,paused,...report,errors},null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
