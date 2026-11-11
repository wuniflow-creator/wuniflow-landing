import {readFileSync,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
const src=p=>readFileSync(p,'utf8');
const home=src('src/main.tsx');
const sites=src('src/Sites.tsx');
const diag=src('src/Diagnostico.tsx');
const routes=JSON.parse(src('vercel.json'));
const build=JSON.parse(src('package.json')).scripts.build;
for(const [path,html] of [['/sites','/sites/index.html'],['/diagnostico','/diagnostico/index.html'],['/admin','/admin/index.html'],['/admin-sites','/admin-sites/index.html']]){
 assert.ok(routes.rewrites.some(x=>x.source===path&&x.destination===html),'Missing route '+path);
}
assert.ok(home.includes("href=\"/sites\""),'Home must link to Sites');
assert.ok(home.includes("href=\"/diagnostico\""),'Home must link to Diagnostico');
assert.ok(home.includes('HeroFilm'),'Hero missing');
assert.ok(home.includes('PortfolioCarousel'),'PortfolioCarousel missing');
assert.ok(sites.includes("fetch('/api/site-leads'"),'Site leads endpoint changed');
assert.ok(diag.includes("fetch('/api/leads'"),'Diagnostico leads endpoint changed');
assert.ok(sites.includes('wa.me/5561981240476'),'Sales WhatsApp number missing');
assert.ok(sites.includes('const steps=['),'Six-stage configurator missing');
assert.ok(sites.includes('sitesSeoFaq'),'Commercial FAQ missing');
assert.ok(sites.includes('id="sites-configurador"'),'Configurator anchor missing');
assert.ok(sites.includes('sitesRealWindow'),'Real projects carousel missing');
for(const file of ['api/site-leads.ts','api/leads.ts']){
 assert.ok(existsSync(file),'API file missing: '+file);
}
assert.ok(existsSync('dist/sitemap.xml')&&existsSync('dist/robots.txt'),'SEO discovery files absent');
console.log('Release contract checks: navigation, six-stage configurator, APIs, WhatsApp, carousel and sitemap OK');
