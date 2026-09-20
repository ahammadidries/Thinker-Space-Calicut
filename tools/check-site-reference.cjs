const {chromium}=require('C:/Users/ahamm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:2000,height:1240},deviceScaleFactor:1.5}),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error(e.message)});page.on('console',msg=>{if(msg.type()==='error')console.error(msg.text())});
  await page.goto('http://127.0.0.1:5186/reference/first-floor-site-reference.svg');
  await page.screenshot({path:'public/reference/first-floor-site-reference.png'});
  await page.setViewportSize({width:840,height:1700});await page.goto('http://127.0.0.1:5186/reference/first-floor-seating.svg');
  await page.screenshot({path:'public/reference/first-floor-seating.png'});
  await page.setViewportSize({width:1200,height:900});
  await page.route('https://app-api.tinkerhub.org/checkin/active?*',r=>r.fulfill({contentType:'application/json',body:'[]'}));
  await page.route('https://jasimcm.github.io/**',r=>r.fulfill({contentType:'text/html',body:'<body>Live display</body>'}));
  await page.goto('http://127.0.0.1:5186/?view=plan');
  try{await page.waitForFunction(()=>window.__twin?.ready,null,{timeout:45000});}catch(e){console.error((await page.locator('body').innerText()).slice(-2500));throw e;}
  const report=await page.evaluate(async()=>{
   const t=__twin;clearTimeout(t.avatars.timer);t.player.active=false;
   const counts=t.config.objects.tables.filter(q=>q.id.startsWith('table-')).map(table=>({id:table.id,chairs:t.config.chairs.filter(q=>q.tableId===table.id).length}));
   if(counts.some(q=>q.chairs!==8))throw Error('Incorrect seating: '+JSON.stringify(counts));
   const {onSiteRoad}=await import('/src/config/site-layout.js');
   const trees=t.collision.boxes.filter(q=>q.id.startsWith('tree-')&&onSiteRoad((q.minX+q.maxX)/2,(q.minZ+q.maxZ)/2,t.config.site.roads,.4));
   if(trees.length)throw Error('Trees block roads');
   const floors=t.config.site.roads.map(r=>({id:r.id,walkable:t.collision.surfaces.some(s=>s.id===r.id)}));
   if(floors.some(s=>!s.walkable))throw Error('Missing road surface');
   const walk=(a,b)=>{const p={x:a[0],y:t.config.building.room.floorY,z:a[1]},steps=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.035);for(let k=0;k<steps;k++)t.collision.move(p,(b[0]-a[0])/steps,(b[1]-a[1])/steps);if(Math.hypot(p.x-b[0],p.z-b[1])>.06)throw Error('Blocked furniture aisle '+JSON.stringify({a,b,p}));};
   walk([-.99,-5.35],[-.99,3.8]);walk([2.44,-5.35],[2.44,3.8]);
   walk([-.99,-2.4],[2.44,-2.4]);walk([-.99,.815],[2.44,.815]);
   t.ui.started=true;t.ui.setExploring(true);document.getElementById('map-modal').hidden=true;document.getElementById('pause-modal').hidden=true;
   t.player.position.set(1.5,3.75,5.4);t.camera.position.set(1.5,5.75,5.4);t.camera.lookAt(.4,4.6,-2.3);
   return {counts,floors,totalChairs:t.config.chairs.length,aislesClear:true};
  });
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:'artifacts/aligned-shared-tables.png'});
  const overhead=await page.evaluate(async()=>{
   const THREE=await import('/node_modules/three/build/three.module.js'),t=__twin;
   t.renderer.setAnimationLoop(null);
   t.scene.fog=null;t.renderer.shadowMap.enabled=false;
   const camera=new THREE.OrthographicCamera(-29,29,21.75,-21.75,.1,100);camera.position.set(2,55,0);camera.up.set(-1,0,0);camera.lookAt(2,0,0);camera.updateMatrixWorld();
   // Hide tree crowns for this inspection capture so the complete road graph is visible.
   t.scene.getObjectByName('grounds').traverse(o=>{if(o.isInstancedMesh)o.visible=false;});
   t.scene.background=new THREE.Color('#dce3d0');t.renderer.render(t.scene,camera);
   return t.renderer.domElement.toDataURL('image/png');
  });
  fs.writeFileSync('artifacts/site-roads-overhead.png',Buffer.from(overhead.split(',')[1],'base64'));
  if(errors.length)throw Error(errors.join('\n'));fs.writeFileSync('artifacts/site-reference-checks.json',JSON.stringify({report,errors},null,2));console.log(JSON.stringify({report,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
