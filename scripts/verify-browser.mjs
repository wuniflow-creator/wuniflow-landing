import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const address = 'http://127.0.0.1:4173';
const server = spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4173','--strictPort'],{stdio:'pipe'});
let stderr = '';
server.stderr.on('data',chunk=>stderr += chunk.toString());
const delay = n=>new Promise(resolve=>setTimeout(resolve,n));
async function ready(){
 for(let attempt=0;attempt<45;attempt++){
  if(server.exitCode!==null)throw new Error('Vite preview exited: '+stderr);
  try{const res=await fetch(address+'/');if(res.ok)return;}catch{}
  await delay(350);
 }
 throw new Error('Preview did not start: '+stderr);
}
async function testPage(browser,viewport,label){
 const page=await browser.newPage({viewport,deviceScaleFactor:1});
 const errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 // Vite preview ignores vercel.json rewrites. Mirror Vercel's /sites -> /sites/index.html
 // while keeping the browser address at /sites, so route-specific metadata is tested.
 await page.route(address+'/sites',async route=>{
  const response=await route.fetch({url:address+'/sites/index.html'});
  await route.fulfill({response});
 });
 try {
  const home=await page.goto(address+'/',{waitUntil:'domcontentloaded'});
  assert.equal(home.status(),200,label+' home status');
  await page.locator('h1').first().waitFor();
  assert.equal(await page.locator('h1').count(),1,label+' home H1 count');
  const homeTitle=await page.title();
  assert.ok(homeTitle.includes('Wuniflow'),label+' home title');
  assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://www.wuniflow.site/',label+' home canonical');
  const homeLink=page.locator('a[href="/sites"]').first();
  assert.ok(await homeLink.count(),label+' sites link absent');

  const response=await page.goto(address+'/sites',{waitUntil:'domcontentloaded'});
  assert.equal(response.status(),200,label+' sites status');
  await page.locator('h1').first().waitFor();
  assert.equal(await page.locator('h1').count(),1,label+' sites H1 count');
  assert.ok((await page.locator('h1').textContent()).includes('Sites profissionais'),label+' sites headline');
  assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://www.wuniflow.site/sites',label+' sites canonical');
  assert.equal(await page.locator('.sitesSeoCards article').count(),4,label+' service cards');
  assert.equal(await page.locator('.sitesSeoFaq details').count(),4,label+' FAQ questions');
  assert.ok(await page.locator('#sites-configurador').count(),label+' configurator anchor');
  assert.ok(await page.locator('a[href="#sites-configurador"]').count(),label+' direct configurator link');
  assert.ok(await page.locator('.sitesRealWindow').count(),label+' real portfolio');
  assert.ok(await page.locator('a[href^="https://wa.me/5561981240476"]').count(),label+' WhatsApp CTA');
  const labels=['O que vamos criar?','Dê forma à sua ideia.','Qual visual combina com você?','Os detalhes fazem a diferença.','Vamos preparar o próximo passo.','Sua ideia, pronta para conversar.'];
  for(let step=0;step<6;step++){
   await page.locator('#sites-configurador button').nth(step).click();
   await page.locator('.sitesCard h2').waitFor();
   assert.equal((await page.locator('.sitesCard h2').innerText()).trim(),labels[step],label+' step '+(step+1));
  }
  assert.ok(await page.locator('button.sitesSubmit').count(),label+' briefing submit missing');
  const details=page.locator('.sitesSeoFaq details').first();
  await details.locator('summary').click();
  assert.equal(await details.getAttribute('open'),'','FAQ expand failed');
  const horizontalScroll=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+4);
  assert.equal(horizontalScroll,false,label+' horizontal overflow');
  assert.deepEqual(errors,[],label+' JS page errors');
  console.log(label+': home / sites / 6 steps / FAQ / metadata / CTA / responsive PASS');
 } finally {await page.close();}
}
let browser;
try{
 await ready();
 const sitemap=await fetch(address+'/sitemap.xml');
 assert.equal(sitemap.status,200,'sitemap response');
 assert.ok((await sitemap.text()).includes('https://www.wuniflow.site/sites'),'sitemap /sites');
 const robots=await fetch(address+'/robots.txt');
 assert.equal(robots.status,200,'robots response');
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 await testPage(browser,{width:1440,height:900},'Desktop');
 await testPage(browser,{width:390,height:844},'Mobile');
 console.log('Browser smoke tests PASSED');
} finally {
 await browser?.close();
 server.kill('SIGTERM');
}
