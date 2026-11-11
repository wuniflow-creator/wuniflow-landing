import React from 'react';
import { ArrowUpRight, Bot, ChartNoAxesCombined, CheckCircle2, LayoutDashboard, MonitorSmartphone, Sparkles, Workflow, ShieldCheck } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './SolutionsShowcase.css';

gsap.registerPlugin(ScrollTrigger);

const groups = [
  {
    id:'digital', number:'01', title:'Sites e experiências digitais',
    teaser:'Sua marca merece uma presença que impressiona e converte.',
    details:'Identidade, velocidade, interfaces e conversão em experiências digitais sob medida.',
    services:['Sites e Landing Pages'],
    example:'HI TECH · LANDING PAGE REAL',
    image:'/assets/portfolio-hi-tech.jpg',
    imageAlt:'Captura real do site HI TECH',
    link:'https://hi-tech-alpha.vercel.app',
    Icon:MonitorSmartphone
  },
  {
    id:'management', number:'02', title:'Sistemas e gestão',
    teaser:'Organize sua operação em uma plataforma feita para sua realidade.',
    details:'Softwares para equipes, RH, controle comercial e rotinas operacionais.',
    services:['Gestão de promotores','Jornada e geolocalização','RH operacional','Faltas e atestados','Gestão comercial e CRM'],
    example:'GPSTRADE · DASHBOARD REAL',
    image:'/assets/portfolio-gpstrade.webp',
    imageAlt:'Captura real do dashboard GPSTRADE',
    link:null,
    Icon:LayoutDashboard
  },
  {
    id:'automation', number:'03', title:'Automação e inteligência artificial',
    teaser:'Menos tarefas repetidas. Mais tempo para crescer.',
    details:'Fluxos, integrações e IA aplicados a processos reais, sempre com controle da equipe.',
    services:['Automações e integrações','IA aplicada à operação'],
    example:'FLUXOS E INTEGRAÇÕES',
    image:null,
    imageAlt:'',
    link:null,
    Icon:Workflow
  },
  {
    id:'operations', number:'04', title:'Dados e operações de campo',
    teaser:'Transforme informações dispersas em decisões rápidas.',
    details:'Planejamento, acompanhamento e análise de execução em campo, com indicadores úteis.',
    services:['Roteirização','Visitas e check-in','Loja Perfeita','Pesquisas de campo','Auditoria operacional','Dashboards executivos'],
    example:'INDICADORES OPERACIONAIS',
    image:'/assets/portfolio-gpstrade.webp',
    imageAlt:'Captura real de indicadores operacionais do GPSTRADE',
    link:null,
    Icon:ChartNoAxesCombined
  }
] as const;

export default function SolutionsShowcase(){
  const sectionRef = React.useRef<HTMLElement>(null);
  const [selected,setSelected] = React.useState(0);
  const active=groups[selected];
  const total=groups.reduce((n,g)=>n+g.services.length,0);

  React.useEffect(()=>{
    const section=sectionRef.current;
    if(!section)return;
    const mm=gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)',()=>{
      const cards=section.querySelectorAll('.wfsCategory');
      const tween=gsap.fromTo(cards,{opacity:0,y:22},{
        opacity:1,y:0,duration:.55,stagger:.09,ease:'power2.out',
        scrollTrigger:{trigger:section,start:'top 85%',once:true}
      });
      return ()=>{tween.scrollTrigger?.kill();tween.kill();gsap.set(cards,{clearProps:'all'})};
    });
    return ()=>mm.revert();
  },[]);

  return <section id="solucoes" ref={sectionRef} className="wfsShowcase" aria-labelledby="wfs-title">
    <div className="wfsHead">
      <div className="wfsHeadline">
        <span className="wfsKicker"><Sparkles size={15}/> TECNOLOGIA SOB MEDIDA</span>
        <h2 id="wfs-title">O que podemos construir <em>para sua empresa?</em></h2>
        <p>Da primeira ideia à operação funcionando. Escolha uma área e descubra como a Wuniflow pode apoiar seu negócio.</p>
      </div>
      <span className="wfsCount">{total} soluções, quatro frentes estratégicas</span>
    </div>
    <div className="wfsCategories" role="group" aria-label="Categorias de soluções">
      {groups.map((g,i)=><button
        key={g.id}
        className={'wfsCategory'+(selected===i?' isSelected':'')}
        type="button"
        aria-pressed={selected===i}
        aria-controls="wfs-detail"
        onClick={()=>setSelected(i)}>
        <span className="wfsCategoryTop"><span>{g.number} / 04</span><ArrowUpRight size={18}/></span>
        <span className="wfsCategoryIcon"><g.Icon size={26} strokeWidth={1.8}/></span>
        <strong>{g.title}</strong>
        <span className="wfsCategoryTeaser">{g.teaser}</span>
        <span className="wfsCategoryBottom">{g.services.length} {g.services.length===1?'solução':'soluções'} <span>{selected===i?'Explorando':'Explorar'} <ArrowUpRight size={15}/></span></span>
      </button>)}
    </div>
    <div id="wfs-detail" className="wfsDetail" aria-label={'Detalhes: '+active.title}>
      <div className="wfsDetailCopy">
        <span className="wfsDetailEyebrow">{active.number} / SOLUÇÃO EM DESTAQUE</span>
        <h3>{active.title}</h3>
        <p>{active.details}</p>
        <div className="wfsServices">
          {active.services.map(service=><span key={service}><CheckCircle2 size={17}/>{service}</span>)}
        </div>
        <a className="wfsMainCta" href="/diagnostico">Planejar minha solução <ArrowUpRight size={17}/></a>
      </div>
      <div className="wfsVisual">
        {active.image
          ? <div className="wfsVisualImage"><img key={active.image+active.id} src={active.image} alt={active.imageAlt} width={1366} height={768} loading="lazy" decoding="async"/><span>{active.example}</span></div>
          : <div className="wfsFlowExample" aria-label="Representação ilustrativa de automação com IA">
              <div><Bot size={30}/><strong>Atendimento</strong></div>
              <ArrowUpRight size={21}/>
              <div><Workflow size={30}/><strong>Integração</strong></div>
              <ArrowUpRight size={21}/>
              <div><ShieldCheck size={30}/><strong>Equipe</strong></div>
              <span>EXEMPLO ILUSTRATIVO · SEM DADOS DE CLIENTES</span>
            </div>}
        {active.link&&<a className="wfsExampleLink" href={active.link} target="_blank" rel="noopener noreferrer">Abrir projeto real <ArrowUpRight size={16}/></a>}
      </div>
    </div>
  </section>;
}
