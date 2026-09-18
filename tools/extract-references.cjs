const { chromium } = require('C:/Users/ahamm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const {pathToFileURL} = require('url');
(async()=>{
 fs.mkdirSync('reference-analysis/frames',{recursive:true});
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--allow-file-access-from-files']});
 const page=await browser.newPage({viewport:{width:1000,height:900}});
 const files=fs.readdirSync('C:/Users/ahamm/Downloads').filter(f=>f.startsWith('WhatsApp Video 2026-09-16')&&f.endsWith('.mp4'));
 const results=[];
 for(let i=0;i<files.length;i++){
  const file=files[i];
  await page.goto(pathToFileURL(path.join('C:/Users/ahamm/Downloads',file)).href);
  await page.waitForFunction(()=>document.querySelector('video')?.readyState>=2);
  const meta=await page.evaluate(()=>{let v=document.querySelector('video');v.pause();v.muted=true;return {duration:v.duration,width:v.videoWidth,height:v.videoHeight}});
  for(let n=0;n<9;n++){
   const time=Math.min(meta.duration-.15,.2+n*meta.duration/9);
   const b64=await page.evaluate(async(t)=>{const v=document.querySelector('video');await new Promise(r=>{v.addEventListener('seeked',r,{once:true});v.currentTime=t});const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);return c.toDataURL('image/jpeg',.88).split(',')[1]},time);
   fs.writeFileSync(`reference-analysis/frames/video-${i+1}-${n}.jpg`,Buffer.from(b64,'base64'));
  }
  results.push({id:`V${i+1}`,file,...meta});
  console.log(results.at(-1));
 }
 fs.writeFileSync('reference-analysis/videos.json',JSON.stringify(results,null,2));
 await browser.close();
})();
