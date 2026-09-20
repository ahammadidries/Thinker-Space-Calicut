const {chromium}=require('C:/Users/ahamm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
(async()=>{
 fs.mkdirSync('artifacts',{recursive:true});
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1440,height:1000}}); const errors=[];
 page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE ERROR',e.message)}); page.on('console',msg=>{if(msg.type()==='error'){errors.push(msg.text());console.log('CONSOLE',msg.text())}});
 await page.goto('http://127.0.0.1:5186');
 try { await page.waitForFunction(()=>window.__twin?.ready,null,{timeout:15000}); }
 catch(e){console.log(await page.locator('#fatal').textContent()); console.log(errors);await page.screenshot({path:'artifacts/failure.png',timeout:10000}).catch(()=>{});await browser.close();throw e;}
 await page.waitForTimeout(2000); await page.screenshot({path:'artifacts/landing.png'});
 console.log(await page.evaluate(()=>({objects:__twin.interaction.items.size,drawCalls:__twin.renderer.info.render.calls,triangles:__twin.renderer.info.render.triangles})));
 for(const [name,pos,yaw,pitch] of [
  ['workshop',[-.95,3.2,5.7],0,0],
  ['printers',[-.95,3.2,-5.5],Math.PI,0],
  ['veranda',[3.75,3.2,-5.7],Math.PI,.05],
  ['stairs',[5.767,3.75,-6.75],Math.PI,-.55],
  ['entry',[3.8,3.75,-14.3],Math.PI,0],
  ['annex',[.6,3.75,-9.7],0,0],
 ]){
  await page.evaluate(({pos,yaw,pitch})=>{const t=__twin;t.ui.started=true;t.ui.setExploring(true);document.getElementById('pause-modal').hidden=true;t.player.active=false;t.player.position.set(pos[0],t.config.building.room.floorY,pos[2]);t.player.yaw=yaw;t.player.pitch=pitch;t.player.syncCamera()}, {pos,yaw,pitch});
  await page.waitForTimeout(250); await page.screenshot({path:`artifacts/${name}.png`});
 }
 await page.click('#map-button');await page.screenshot({path:'artifacts/map.png'});
 console.log(JSON.stringify({errors}));await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
