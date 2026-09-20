const {chromium}=require('C:/Users/ahamm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
(async()=>{
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5186/');await page.waitForFunction(()=>window.__twin?.avatars?.lastSynced,null,{timeout:45000});
 const report=await page.evaluate(()=>{const t=__twin,m=t.avatars;clearTimeout(m.timer);t.ui.started=true;t.ui.setExploring(true);t.player.active=false;t.player.position.set(-.9,t.config.building.room.floorY,5.9);t.player.yaw=0;t.player.pitch=-.04;t.player.syncCamera();m.update(.001,t.camera,null);return {apiUsers:m.activeUsers.length,avatars:m.avatars.size,seated:[...m.avatars.values()].filter(a=>a.state==='seated').length,source:m.options.apiUrl,stale:m.stale}});
 await page.waitForTimeout(1000);await page.screenshot({path:'artifacts/live-makers.png'});
 if(report.apiUsers!==report.avatars||report.stale)throw Error('Live roster mismatch');
 await page.route('https://app-api.tinkerhub.org/checkin/active?*',route=>route.fulfill({status:503,headers:{'access-control-allow-origin':'*'},body:'Unavailable'}));
 const retained=await page.evaluate(async()=>{const m=__twin.avatars,before=m.avatars.size;await m.poll();clearTimeout(m.timer);return m.stale&&m.avatars.size===before});
 if(!retained)throw Error('Network failure should retain last-known users');
 await page.unroute('https://app-api.tinkerhub.org/checkin/active?*');
 await page.route('https://app-api.tinkerhub.org/checkin/active?*',route=>route.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'[]'}));
 const empty=await page.evaluate(async()=>{const m=__twin.avatars;await m.poll();clearTimeout(m.timer);return !m.stale&&m.avatars.size===0&&m.seats.size===0&&!__twin.collision.boxes.some(b=>b.id.startsWith('avatar:'))});
 if(!empty||errors.length)throw Error('Presence recovery/cleanup failed: '+errors.join('\n'));
 fs.writeFileSync('artifacts/live-presence-check.json',JSON.stringify({...report,failureRetainsRoster:retained,emptyResponseCleansUp:empty,errors},null,2));console.log(JSON.stringify({...report,failureRetainsRoster:retained,emptyResponseCleansUp:empty,errors}));
}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
