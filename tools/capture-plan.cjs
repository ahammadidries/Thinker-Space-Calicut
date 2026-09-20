const {chromium}=require('C:/Users/ahamm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
(async()=>{
  fs.mkdirSync('artifacts',{recursive:true});
  const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  try {
    const page=await browser.newPage({viewport:{width:760,height:1500}});
    await page.goto('http://127.0.0.1:5186/?view=plan');
    await page.waitForFunction(()=>window.__twin?.ready);
    if (!await page.locator('#map-modal').isVisible()) throw new Error('Plan preview did not open');
    await page.evaluate(async()=>{
      const THREE=await import('/node_modules/three/build/three.module.js');
      const t=window.__twin;
      t.scene.getObjectByName('roof').visible=false;
      const grounds=t.scene.getObjectByName('grounds');
      if (grounds) grounds.visible=false;
      const interior=t.scene.getObjectByName('interior');
      if (interior) for(const child of interior.children) if(child.type==='Group'&&!child.name) child.visible=false;
      t.scene.background=new THREE.Color('#ecefe7');
      t.scene.fog=null;
      const cutY=t.config.building.room.floorY+1.25;
      t.renderer.clippingPlanes=[new THREE.Plane(new THREE.Vector3(0,-1,0),cutY)];
      t.renderer.shadowMap.enabled=false;
      // Cap cut walls so their cross-sections stay visible from above.
      const capMaterial=new THREE.MeshBasicMaterial({color:'#7e8474'});
      const cap=(a,b,thickness=t.config.building.room.wallThickness)=>{
        const length=Math.hypot(b[0]-a[0],b[1]-a[1]);
        const mesh=new THREE.Mesh(new THREE.BoxGeometry(length,.02,thickness),capMaterial);
        mesh.position.set((a[0]+b[0])/2,cutY-.015,(a[1]+b[1])/2);
        mesh.rotation.y=-Math.atan2(b[1]-a[1],b[0]-a[0]);
        t.scene.add(mesh);
      };
      const {plan,building}=t.config, m=plan.main, half=building.room.wallThickness/2;
      const r={minX:m.minX-half,maxX:m.maxX+half,minZ:m.minZ-half,maxZ:m.maxZ+half};
      for(const wall of plan.annexWalls) cap(wall.a,wall.b,plan.annex.wallThickness);
      cap([r.minX,r.minZ],[r.maxX,r.minZ]);
      cap([r.minX,r.maxZ],[r.maxX,r.maxZ]);
      for(const [x,openings] of [[r.minX,building.windows],[r.maxX,building.doors]]){
        let start=r.minZ;
        for(const opening of openings){
          cap([x,start],[x,opening.z-opening.width/2]);
          start=opening.z+opening.width/2;
        }
        cap([x,start],[x,r.maxZ]);
      }
      document.querySelectorAll('body > :not(canvas)').forEach(el=>el.style.display='none');
      const height=23.6, width=height*760/1500;
      const camera=new THREE.OrthographicCamera(-width/2,width/2,height/2,-height/2,.1,80);
      camera.position.set(1.6,35,-1.65);
      camera.up.set(0,0,-1);
      camera.lookAt(1.6,0,-1.65);
      camera.updateMatrixWorld();
      t.renderer.setAnimationLoop(()=>t.renderer.render(t.scene,camera));
    });
    await page.waitForTimeout(500);
    await page.screenshot({path:'artifacts/first-floor-overhead.png'});
    console.log('Saved artifacts/first-floor-overhead.png; plan preview opens successfully.');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1});
