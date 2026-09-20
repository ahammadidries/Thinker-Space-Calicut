const {chromium}=require('C:/Users/ahamm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
 const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://app-api.tinkerhub.org/checkin/active?*',r=>r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'[]'}));
 await page.route('https://jasimcm.github.io/**',r=>r.fulfill({contentType:'text/html',body:'<body style="font:50px system-ui;background:#f2f3ed;color:#234538;text-align:center;padding:90px"><h1>TINKERSPACE CALICUT</h1><p>Live display</p></body>'}));
 await page.goto('http://127.0.0.1:5186/');await page.waitForFunction(()=>window.__twin?.host?.loaded);
 const report=await page.evaluate(()=>{
  const t=__twin,h=t.host,results=[];const check=(name,value)=>{results.push({name,pass:!!value});if(!value)throw Error(name)};
  clearTimeout(t.avatars.timer);
  check('Permanent host with no check-ins',t.avatars.avatars.size===0&&h.group.visible&&t.interaction.items.has('space-host'));
  check('Host collider clear of existing furniture',!t.collision.overlaps(h.group.position.x,h.group.position.z,h.group.position.y,.30,1.82,'space-host'));
  const original=h.shirt.color.getHex();h.setShirtColor('#345678');check('HostShirt editable at runtime',h.shirt.color.getHex()===0x345678);h.shirt.color.setHex(original);
  check('Separate dynamic UI',h.nameplate.parent===h.group&&h.nameplate.parent!==h.model&&h.indicator.isSprite);
  check('Jasim name in world label and interaction',h.nameplate.userData.label==='Jasim'&&h.item.label==='Jasim · Space Host');
  const start=h.group.position.clone();for(let i=0;i<2400;i++)h.update(.1,t.camera,null);check('Stays at designated position for four minutes',h.group.position.distanceTo(start)===0);
  t.avatars.sync([{id:'host-test-maker',name:'Test maker'}]);t.avatars.sync([]);check('Roster updates do not remove host',h.group.visible&&h.loaded);
  t.ui.started=true;t.ui.setExploring(true);t.player.active=false;t.player.position.set(.6,t.config.building.room.floorY,-3.25);t.player.yaw=0;t.player.pitch=-.04;t.player.syncCamera();
  h.play('Idle');h.update(.5,t.camera,null);t.scene.updateMatrixWorld(true);t.renderer.render(t.scene,t.camera);
  return {results};
 });
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await page.screenshot({path:'artifacts/host-in-room.png'});
 const interaction=await page.evaluate(()=>{
  const t=__twin;t.player.active=true;t.player.position.set(1.43,t.config.building.room.floorY,-4.42);t.player.yaw=0;t.player.pitch=-.14;t.player.syncCamera();t.host.update(.016,t.camera,t.player);t.interaction.update(.016,t.player);return {target:t.interaction.target?.id,greeting:t.host.animation};
 });
 if(interaction.target!=='space-host')throw Error('Host not selectable: '+JSON.stringify(interaction));
 await page.keyboard.press('KeyE');await page.waitForSelector('#host-dialog:not([hidden])');
 if(await page.locator('#host-title').innerText()!=='Jasim')throw Error('Host name missing');
 if(await page.locator('.host-questions button').count()!==6)throw Error('Six starter questions missing');
 const ask=async question=>{await page.locator('#host-question').fill(question);await page.locator('#host-question').press('Enter');return page.locator('.host-message-host p').last().innerText();};
 const examples=[['What is this place?','community makerspace'],['Do I need to pay?','free'],["I'm a beginner. Can I come?",'Absolutely'],['What can I do here?','open-source'],['Where is TinkerSpace?','7RHV+2QC'],['What events are happening?','Maker Thursday']];
 for(const [q,expected] of examples)if(!(await ask(q)).includes(expected))throw Error('Conversational reply missing: '+q);
 if(!(await ask('Where are the 3D printers?')).includes('opposite end'))throw Error('Printer directions missing');
 if(!(await ask('Is it free?')).includes('filament'))throw Error('Follow-up lost printing context');
 if(!(await ask('What events are happening tomorrow?')).includes('don’t have a live calendar'))throw Error('Live schedule was fabricated');
 await page.locator('.host-reset').click();await ask("I'm a beginner. Can I come?");
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await page.screenshot({path:'artifacts/host-faq.png'});
 await page.locator('[data-topic="ai"]').click();if(!(await page.locator('.host-message-host p').last().innerText()).includes('AI Wednesday'))throw Error('Follow-up chip failed');
 if(await page.locator('.host-message-host a').last().getAttribute('href')!=='https://tinkerhub.org/events')throw Error('Current event link missing');
 await page.locator('#host-question').press('M');if(await page.locator('#map-modal').isVisible())throw Error('Typing opened floor plan');
 await ask('<img src=x onerror="window.chatInjected=true">');if(await page.evaluate(()=>!!window.chatInjected||!!document.querySelector('.host-messages img')))throw Error('Chat input interpreted as HTML');
 if(!(await ask('Tell me the WiFi password')).includes('don’t have a reliable answer'))throw Error('Unsupported question fallback missing');
 await page.locator('#host-question').fill('  ');if(!(await page.locator('.host-send').isDisabled()))throw Error('Blank submit enabled');
 await page.setViewportSize({width:390,height:780});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 if(!(await page.locator('.host-send').isVisible()))throw Error('Mobile composer missing');
 await page.screenshot({path:'artifacts/host-chat-mobile.png'});await page.setViewportSize({width:1600,height:1000});
 await page.locator('.host-back').focus();await page.keyboard.press('Tab');if(!(await page.locator('.host-close').evaluate(el=>el===document.activeElement)))throw Error('Focus trap failed');
 await page.keyboard.press('Escape');await page.waitForSelector('#host-dialog[hidden]',{state:'attached'});
 await page.waitForFunction(()=>__twin.player.active,null,{timeout:3000});
 const state=await page.evaluate(()=>({closed:!__twin.hostDialog.isOpen,active:__twin.player.active,pause:!document.getElementById('pause-modal').hidden}));
 if(!state.closed||!state.active||state.pause)throw Error('Conversation did not return to exploration '+JSON.stringify(state));
 if(errors.length)throw Error(errors.join('\n'));
 fs.writeFileSync('artifacts/host-checks.json',JSON.stringify({...report,interaction,state,errors},null,2));console.log(JSON.stringify({...report,interaction,state,errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
