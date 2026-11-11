import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
const origin='https://www.wuniflow.site';
const pages=[['/','index.html',true],['/sites','sites/index.html',true],['/diagnostico','diagnostico/index.html',false],['/admin','admin/index.html',false],['/admin-sites','admin-sites/index.html',false]];
for(const [path,file,index] of pages){
 const html=readFileSync('dist/'+file,'utf8');
 const expected=origin+(path==='/'?'/':path);
 const count=(re)=>(html.match(re)||[]).length;
 assert.equal(count(/<title>/g),1,path+' title');
 assert.equal(count(/<meta name="description"/g),1,path+' description');
 assert.equal(count(/<link rel="canonical"/g),1,path+' canonical');
 assert.equal(count(/<meta property="og:image"/g),1,path+' og:image');
 assert.ok(html.includes('href="'+expected+'"'),path+' canonical URL');
 assert.ok(html.includes('content="'+(index?'index, follow':'noindex, follow, noarchive')+'"'),path+' robots');
 assert.ok(html.includes('lang="pt-BR"'),path+' lang');
 assert.equal(count(/<meta name="twitter:card"/g),1,path+' twitter');
 if(index)assert.ok(html.includes('application/ld+json'),path+' schema');
}
const robots=readFileSync('dist/robots.txt','utf8');
const sitemap=readFileSync('dist/sitemap.xml','utf8');
assert.ok(robots.includes('Sitemap: '+origin+'/sitemap.xml'));
assert.ok(sitemap.includes(origin+'/sites'));
assert.ok(!sitemap.includes('/admin'));
assert.ok(!sitemap.includes('/diagnostico'));
assert.ok(existsSync('dist/assets/social-preview.png'),'OG preview image missing');
console.log('SEO smoke tests: 5 routes, metadata, robots, sitemap, JSON-LD OK');
