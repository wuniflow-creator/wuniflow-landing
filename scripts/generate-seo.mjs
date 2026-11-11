import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

// URLs correspond to the ACTIVE Vercel redirect: apex -> www (308).
// Do not switch these to apex until the Vercel project-domain redirect is reversed.
const ORIGIN = 'https://www.wuniflow.site';
const social = ORIGIN + '/assets/social-preview.png';
const organization = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'ProfessionalService'],
  '@id': ORIGIN + '/#organization',
  name: 'Wuniflow Automations',
  url: ORIGIN + '/',
  logo: ORIGIN + '/assets/wuniflow-logo-oficial.png',
  image: social,
  description: 'Desenvolvimento de sistemas sob medida, automações com inteligência artificial, sites e soluções para operações comerciais.',
  areaServed: { '@type': 'Country', name: 'Brasil' },
  contactPoint: { '@type': 'ContactPoint', contactType: 'sales', email: 'contato@wuniflow.site', availableLanguage: 'Portuguese' },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Serviços Wuniflow',
    itemListElement: ['Sistemas sob medida','Automação empresarial e inteligência artificial','Trade Marketing e Field Sales','Criação de sites e landing pages'].map(name => ({ '@type':'OfferCatalog', name }))
  }
};
const pages = [
  {
    path:'/', index:true,
    title:'Software Sob Medida e Automação Empresarial | Wuniflow',
    description:'Desenvolvemos sistemas sob medida, automações com IA, soluções para Trade Marketing e sites profissionais para empresas.',
    schema:[organization,{ '@context':'https://schema.org','@type':'WebSite','@id':ORIGIN+'/#website',name:'Wuniflow Automations',url:ORIGIN+'/',inLanguage:'pt-BR',publisher:{'@id':ORIGIN+'/#organization'} }]
  },
  {
    path:'/sites', index:true,
    title:'Criação de Sites e Landing Pages Profissionais | Wuniflow',
    description:'Criação de sites profissionais, landing pages e lojas virtuais com design premium, velocidade e foco em conversão. Solicite seu projeto.',
    schema:[{
      '@context':'https://schema.org','@type':'Service','@id':ORIGIN+'/sites#service',
      name:'Criação de Sites e Landing Pages Profissionais',
      serviceType:'Criação de sites, landing pages, sites institucionais, catálogos digitais e lojas virtuais',
      provider:{'@id':ORIGIN+'/#organization'},
      areaServed:{'@type':'Country',name:'Brasil'},
      url:ORIGIN+'/sites',
      description:'Desenvolvimento de experiências digitais profissionais para empresas.'
    }]
  },
  {
    path:'/diagnostico',index:false,
    title:'Diagnóstico de Sistemas e Automação | Wuniflow',
    description:'Conte os desafios da sua empresa e solicite um diagnóstico para desenvolver sistemas, integrações e automações sob medida.'
  },
  {path:'/admin',index:false,title:'Administração de Projetos | Wuniflow',description:'Área administrativa de acesso restrito da Wuniflow.'},
  {path:'/admin-sites',index:false,title:'Gestão Comercial de Sites | Wuniflow',description:'Painel comercial de acesso restrito da Wuniflow.'}
];
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;').replaceAll('>','&gt;');
const htmlTemplate=readFileSync('dist/index.html','utf8');
if (!htmlTemplate.includes('</head>')) throw new Error('dist/index.html sem head');
for(const page of pages){
  const url=ORIGIN + (page.path==='/'?'/':page.path);
  const meta=[
    '<title>'+esc(page.title)+'</title>',
    '<meta name="description" content="'+esc(page.description)+'" />',
    '<meta name="robots" content="'+(page.index?'index, follow':'noindex, follow, noarchive')+'" />',
    '<link rel="canonical" href="'+url+'" />',
    '<meta property="og:type" content="website" />',
    '<meta property="og:url" content="'+url+'" />',
    '<meta property="og:title" content="'+esc(page.title)+'" />',
    '<meta property="og:description" content="'+esc(page.description)+'" />',
    '<meta property="og:image" content="'+social+'" />',
    '<meta property="og:image:alt" content="Wuniflow Automations — tecnologia e automação" />',
    '<meta property="og:site_name" content="Wuniflow Automations" />',
    '<meta property="og:locale" content="pt_BR" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    '<meta name="twitter:title" content="'+esc(page.title)+'" />',
    '<meta name="twitter:description" content="'+esc(page.description)+'" />',
    '<meta name="twitter:image" content="'+social+'" />'
  ];
  if(page.schema)for(const item of page.schema)meta.push('<script type="application/ld+json">'+JSON.stringify(item).replaceAll('<','\\u003c')+'</script>');
  const content=htmlTemplate.replace('</head>',meta.join('\n')+'\n</head>');
  const target=page.path==='/'?'dist/index.html':join('dist',page.path.slice(1),'index.html');
  if(page.path!=='/')mkdirSync(join('dist',page.path.slice(1)),{recursive:true});
  writeFileSync(target,content);
  if(page.description.length>155)throw new Error('description longa: '+page.path);
}
writeFileSync('dist/robots.txt','User-agent: *\nAllow: /\nSitemap: '+ORIGIN+'/sitemap.xml\n');
const urls=pages.filter(x=>x.index).map(x=>'<url><loc>'+ORIGIN+(x.path==='/'?'/':x.path)+'</loc></url>');
writeFileSync('dist/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.join('\n')+'\n</urlset>\n');
console.log('SEO HTML generated for',pages.map(x=>x.path).join(', '));
