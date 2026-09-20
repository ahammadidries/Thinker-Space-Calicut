const {chromium}=require('C:/Users/ahamm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}}), errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const url='https://jasimcm.github.io/tinkerspace_digital_calicut/';
  let version=null,checks=0,liveHTML=null,navigations=0;
  page.on('response',async response=>{if(liveHTML===null&&response.url().startsWith(url+'?_tv_check=')&&response.ok())liveHTML=await response.text()});
  page.on('framenavigated',frame=>{if(frame.parentFrame())navigations++});
  await page.route('https://app-api.tinkerhub.org/checkin/active?*',route=>route.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'[]'}));
  await page.route(url+'?_tv_check=*',route=>{checks++;return version===null?route.continue():route.fulfill({contentType:'text/html',headers:{'access-control-allow-origin':'*'},body:version})});
  await page.goto('http://127.0.0.1:5186/');await page.waitForFunction(()=>window.__twin?.ready);
  if(await page.locator('#workshop-live-tv').getAttribute('data-source-url')!==url)throw Error('TV must use the supplied URL');
  if(await page.locator('#workshop-live-tv').getAttribute('sandbox')!=='allow-scripts')throw Error('Remote content must be isolated from the office origin');
  await page.evaluate(()=>{const t=__twin;t.ui.started=true;t.ui.setExploring(true);document.getElementById('pause-modal').hidden=true;t.player.active=false;t.player.position.set(0,t.config.building.room.floorY,-4.6);t.player.yaw=0;t.player.pitch=.1;t.player.syncCamera()});
  const embedded=await page.locator('#workshop-live-tv').elementHandle().then(handle=>handle.contentFrame());
  if(!embedded)throw Error('Live site did not load inside TV');
  try { await embedded.waitForSelector('#root > *',{timeout:30000}); }
  catch(error) { console.error('TV contents:',await embedded.locator('body').innerText());console.error('Page errors:',errors);throw error; }
  if(!await embedded.evaluate(()=>document.querySelector('script[src]').src.startsWith(document.baseURI)))throw Error('Live assets must resolve against the source URL');
  const isolated=await embedded.evaluate(()=>{try{return !parent.document}catch{return true}});
  if(!isolated)throw Error('Live website can access the office DOM');
  // Wait beyond the source's 1.5 s fullscreen timer without clicking the TV.
  await page.waitForTimeout(2500);
  if(await embedded.getByText('Press any button to enter fullscreen',{exact:true}).isVisible())throw Error('Fullscreen prompt is visible before E');
  await page.evaluate(()=>__twin.interaction.items.get('display-01').interact());
  await embedded.waitForFunction(()=>{const cover=[...document.querySelectorAll('div')].find(el=>el.classList.contains('z-40'));return cover&&getComputedStyle(cover).opacity==='0'},{},{timeout:45000});
  if(await embedded.getByText('Press any button to enter fullscreen',{exact:true}).isVisible())throw Error('Fullscreen prompt is visible after E');
  if(!await page.locator('#tv-controls').isVisible())throw Error('E did not open TV controls');
  await page.waitForTimeout(1500);
  await page.screenshot({path:'artifacts/live-tv.png'});
  console.log('Live iframe title:',await embedded.title());
  await page.getByRole('button',{name:'Back to exploration',exact:true}).click();
  await page.evaluate(()=>{__twin.player.pause();document.getElementById('pause-modal').hidden=true});
  await page.waitForTimeout(1000);
  await page.evaluate(()=>document.getElementById('pause-modal').hidden=true);
  await page.screenshot({path:'artifacts/live-tv-wall.png'});
  if(await embedded.getByText('Press any button to enter fullscreen',{exact:true}).isVisible())throw Error('Returning to room restarted the fullscreen prompt');
  if(!liveHTML?.includes('<html'))throw Error('Could not read the current source page');
  version=liveHTML;
  const beforeRefresh=navigations,checksBefore=checks;
  await page.evaluate(()=>{__twin.config.objects.display.refreshIntervalMs=100});
  for(let n=0;n<30&&checks<checksBefore+2;n++)await page.waitForTimeout(250);
  if(checks<checksBefore+2||navigations!==beforeRefresh)throw Error('Unchanged source should not reload the TV');
  // A new deployment also stays prompt-free, including a delayed prompt.
  version='<html><head></head><body style="background:#aaff88">UPDATED LIVE TV<script>setTimeout(()=>{const prompt=document.createElement("div");prompt.textContent="Press any button to enter fullscreen";document.body.append(prompt)},500)</script></body></html>';
  await page.evaluate(()=>{__twin.config.objects.display.refreshIntervalMs=1});
  await page.frameLocator('#workshop-live-tv').getByText('UPDATED LIVE TV',{exact:true}).waitFor();
  await page.evaluate(()=>{__twin.config.objects.display.refreshIntervalMs=60000});
  await page.waitForTimeout(1000);
  if(await page.frameLocator('#workshop-live-tv').getByText('Press any button to enter fullscreen',{exact:true}).isVisible())throw Error('Updated website shows fullscreen prompt');
  const beforeOutage=navigations;
  await page.route(url+'?_tv_check=*',route=>route.abort());
  await page.evaluate(()=>{__twin.config.objects.display.refreshIntervalMs=100});
  await page.waitForTimeout(1000);
  await page.evaluate(()=>{__twin.config.objects.display.refreshIntervalMs=60000});
  if(navigations!==beforeOutage)throw Error('Network outage reset the live display');
  await page.evaluate(()=>__twin.interaction.items.get('display-01').rotate());
  await page.waitForFunction(()=>document.querySelector('#workshop-live-tv').style.display==='none');
  const off=await page.evaluate(()=>__twin.scene.getObjectByName('live-tv-screen').material.opacity===1);
  if(!off)throw Error('TV did not turn black when off');
  await page.evaluate(()=>__twin.interaction.items.get('display-01').rotate());
  await page.waitForFunction(()=>document.querySelector('#workshop-live-tv').style.display!=='none');
  if(errors.length)throw Error(errors.join('\n'));
  const result={url,livePageLoaded:true,noFullscreenPrompt:true,eInteraction:true,isolated:true,refreshReplacesContent:navigations>beforeRefresh,outagePreservesPage:true,powerToggle:true,errors};
  fs.writeFileSync('artifacts/live-tv-check.json',JSON.stringify(result,null,2));
  console.log(JSON.stringify(result));
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
