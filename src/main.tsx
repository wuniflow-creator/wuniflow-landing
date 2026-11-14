import React from'react';import{initializeTracking}from'./tracking';initializeTracking();import{createRoot}from'react-dom/client';import {ArrowUpRight} from 'lucide-react';import{ArrowRight,BarChart3,Bot,CheckCircle2,Cloud,MapPin,Menu,Route,ShieldCheck,Sparkles,Users,Workflow,X}from'lucide-react';import'./styles.css';import './cinematic.css';import './landing-contrast.css';import './sites-premium.css';import Diagnostico from './Diagnostico';import Admin from './Admin';import Sites from './Sites';import SiteAdmin from './SiteAdmin';
import ScrollStory from './ScrollStory';
import HeroFilm from './HeroFilm';
import PortfolioCarousel from './PortfolioCarousel';
import SolutionsShowcase from './SolutionsShowcase';
import { ProblemsExplorer, ProcessJourney } from './ConversionSections';

const pains=[['Planilhas demais','Informações espalhadas, controles paralelos e retrabalho.'],['Gestão pelo WhatsApp','Processos críticos dependem de mensagens, grupos e cobranças manuais.'],['Pouca visibilidade do campo','Dificuldade para acompanhar jornada, visitas e execução.'],['Relatórios demorados','Horas consolidando dados antes de chegar à decisão.'],['Sistemas desconectados','Dados repetidos e processos quebrados entre plataformas.'],['Software que não acompanha','Sua operação se adapta à ferramenta — quando deveria ser o contrário.']];
const caps=['Sites e Landing Pages','Gestão de promotores','Jornada e geolocalização','Roteirização','Visitas e check-in','Loja Perfeita','Pesquisas de campo','Auditoria operacional','Dashboards executivos','RH operacional','Faltas e atestados','Gestão comercial e CRM','Automações e integrações','IA aplicada à operação'];
function App(){const[open,setOpen]=React.useState(false);return <><header className="landingHeader"><div className="landingHeaderInner"><a className="brand" href="#inicio" aria-label="Wuniflow Soluções Digitais — início"><b aria-hidden="true">W</b><span>WUNIFLOW<small>SOLUÇÕES DIGITAIS</small></span></a><nav className={`landingNav ${open?'open':''}`} id="landing-navigation"><a href="#solucoes">Soluções</a><a href="/sites">Sites</a><a href="#cases">Cases</a><a href="#processo">Como funciona</a><a href="/diagnostico">Diagnóstico</a></nav><button className="menu landingMenu" onClick={()=>setOpen(!open)} aria-label={open?'Fechar menu':'Abrir menu'} aria-expanded={open} aria-controls="landing-navigation">{open?<X/>:<Menu/>}</button><a className="topcta landingHeaderCta" href="/diagnostico">Agendar diagnóstico</a></div></header><main>
<section className="hero cinematicHero" id="inicio" aria-labelledby="cinematic-title">
  <HeroFilm />
  <div className="heroFilmShade" aria-hidden="true" />
  <div className="cinematicGrain" aria-hidden="true" />
  <div className="herocopy cinematicCopy">
    <div className="eyebrow"><Sparkles/> DESIGN DIGITAL <i/> SISTEMAS <i/> AUTOMAÇÃO</div>
    <h1 id="cinematic-title">Transformamos ideias em tecnologia.<br/>E tecnologia em <em>resultados.</em></h1>
    <p>Desenvolvemos sites de alto impacto, sistemas inteligentes, plataformas SaaS e automações com IA para empresas que querem evoluir.</p>
    <div className="actions"><a className="primary" href="/diagnostico">Iniciar meu projeto <ArrowRight/></a><a className="secondary" href="#solucoes">Explorar soluções <ArrowRight/></a></div>
    <div className="trust"><span><CheckCircle2/> Sites e experiências digitais</span><span><CheckCircle2/> Sistemas e plataformas SaaS</span><span><CheckCircle2/> Automação e IA aplicada</span></div>
    <div className="heroProof"><b>ESTRATÉGIA <i/> DESIGN <i/> TECNOLOGIA</b><span>Da primeira ideia à próxima fase do seu negócio.</span></div>
  </div>
  <div className="visual cinematicVisual" aria-label="Captura real do dashboard GPSTRADE, um produto da WuniFlow">
    <div className="stageAura" aria-hidden="true"/><div className="stageOrbit stageOrbitOne" aria-hidden="true"/><div className="stageOrbit stageOrbitTwo" aria-hidden="true"/>
    <div className="stageWindow"><div className="stageBar"><span/><span/><span/><b>CAPTURA REAL · GPSTRADE</b><small>W / 01</small></div><img src="/assets/portfolio-gpstrade.webp" alt="Captura real do dashboard GPSTRADE, produto de gestão de campo da WuniFlow" width="1536" height="1272" fetchPriority="high" decoding="async"/></div>
    <div className="stageFloat stageFloatWeb"><span>01 / DIGITAL</span><b>Sites e experiências</b><small>Design · performance · conversão</small></div>
    <div className="stageFloat stageFloatSystems"><span>02 / SOFTWARE</span><b>Sistemas e SaaS</b><small>Interfaces pensadas para operar</small></div>
    <div className="stageFloat stageFloatAutomation"><span>03 / INTELLIGENCE</span><b>Automação + IA</b><small>Integrações · dados · produtividade</small></div>
    <p className="stageCaption">TECNOLOGIA CONECTADA À OPERAÇÃO <span>BR · WUNIFLOW</span></p>
  </div>
</section>
<ScrollStory />
<section className="proofStrip"><div><span>TECNOLOGIA APLICADA A</span><b>Trade Marketing</b><i/><b>Field Sales</b><i/><b>Operações de campo</b><i/><b>Gestão de equipes</b></div></section>
<ProblemsExplorer />
<section className="statement"><span>UMA NOVA LÓGICA</span><h2>Seu processo não precisa caber em um software genérico.</h2><p>A Wuniflow começa pela operação e constrói a tecnologia ao redor dela — conectando campo, gestão, dados e decisão.</p><div className="statementLine"><b>Diagnóstico</b><i/> <b>Processo</b><i/> <b>Tecnologia</b><i/> <b>Evolução</b></div></section>
<PortfolioCarousel />
<SolutionsShowcase />
<section className="founder"><div><span>POR QUE WUNIFLOW</span><h2>A tecnologia começa onde o problema realmente acontece: na operação.</h2></div><p>Experiência prática em gestão de equipes de campo, supervisão, vendas externas e Trade Marketing combinada com software, automação e IA. Primeiro entendemos o processo. Depois desenhamos a solução e a tecnologia necessária para sustentá-la.</p></section>
<ProcessJourney />
<section className="preCta"><span>SE O PROCESSO AINDA DEPENDE DE PLANILHA, GRUPO OU RETRABALHO</span><h2>Existe espaço para digitalizar.</h2><a className="primary" href="/diagnostico">Mapear minha operação <ArrowRight/></a></section><section id="contato" className="contact"><div><span>DIAGNÓSTICO DE DIGITALIZAÇÃO OPERACIONAL</span><h2>Conte como sua operação funciona hoje.</h2><p>Preencha o diagnóstico para que nossa equipe analise seu cenário, identifique oportunidades e entre em contato com os próximos passos.</p><a className="primary" href="/diagnostico">Iniciar diagnóstico <ArrowRight/></a><a className="contactWhatsapp" href="https://wa.me/5561981240476?text=Ol%C3%A1!%20Vim%20pela%20p%C3%A1gina%20principal%20da%20WuniFlow%20e%20gostaria%20de%20conversar%20sobre%20um%20projeto%20para%20minha%20empresa.%20Podem%20me%20orientar%3F" target="_blank" rel="noopener noreferrer">Conversar pelo WhatsApp</a></div></section></main>
<footer><a className="brand" href="#inicio" aria-label="Wuniflow Soluções Digitais — início"><b aria-hidden="true">W</b><span>WUNIFLOW<small>SOLUÇÕES DIGITAIS</small></span></a><p>Tecnologia que simplifica o seu negócio.</p><div><a href="mailto:contato@wuniflow.site">contato@wuniflow.site</a></div><small>© 2026 Wuniflow Soluções Digitais.</small></footer></>}const path=window.location.pathname.replace(/\/$/,'');const isDiagnostico=path==='/diagnostico',isAdmin=path==='/admin',isSites=path==='/sites',isSiteAdmin=path==='/admin-sites';createRoot(document.getElementById('root')!).render(isDiagnostico?<Diagnostico/>:isAdmin?<Admin/>:isSiteAdmin?<SiteAdmin/>:isSites?<Sites/>:<App/>);
