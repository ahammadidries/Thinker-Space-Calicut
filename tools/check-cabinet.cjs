const {chromium}=require('C:/Users/ahamm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  try {
    const page=await browser.newPage({viewport:{width:1440,height:1000}}), errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:5186'); await page.waitForFunction(()=>window.__twin?.ready);
    const report=await page.evaluate(()=>{
      const t=__twin, cfg=t.config.objects.windowCabinet, item=t.interaction.items.get(cfg.id);
      t.ui.started=true; t.ui.setExploring(true); t.player.active=false;
      document.getElementById('pause-modal').hidden=true;
      t.player.position.set(.2,t.config.building.room.floorY,-4.1);
      t.player.yaw=.91; t.player.pitch=-.27; t.player.syncCamera();
      const doors=item.group.children.filter(o=>o.name.startsWith('cabinet-door-'));
      if(doors.length!==3) throw Error('Expected three cabinet doors');
      const overlaps=t.config.chairs.filter(q=>t.collision.overlaps(q.position[0],q.position[2],q.position[1],.31,.98,q.id));
      if(overlaps.length) throw Error('Chair clearance: '+overlaps.map(q=>q.id));
      item.interact(t.player); for(let i=0;i<100;i++) item.update(1/60,t.player);
      if(!doors.every(o=>Math.abs(o.rotation.y)>.9)) throw Error('A cupboard door failed to open');
      item.interact(t.player); for(let i=0;i<110;i++) item.update(1/60,t.player);
      if(!doors.every(o=>Math.abs(o.rotation.y)<.01)) throw Error('A cupboard door failed to close');
      const ids=t.collision.boxes.map(o=>o.id);
      if(ids.length!==new Set(ids).size) throw Error('Duplicate collision IDs');
      return {doors:doors.length,printers:t.config.objects.printers.length,printerTable:t.interaction.items.has('printer-workbench'),objects:t.interaction.items.size};
    });
    await page.waitForTimeout(300); await page.screenshot({path:'artifacts/three-door-cabinet.png'});
    await page.evaluate(()=>{const p=__twin.player; p.position.set(-.8,__twin.config.building.room.floorY,4.8);p.yaw=Math.PI;p.pitch=-.22;p.syncCamera()});
    await page.waitForTimeout(200); await page.screenshot({path:'artifacts/printer-workbench.png'});
    console.log(JSON.stringify({...report,errors})); if(errors.length) throw Error(errors.join('\n'));
  } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
