import React from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, ChartNoAxesCombined, Check, ChevronDown, ClipboardList, Code2, FileText, MapPin, MessageCircle, Route, Search, Sheet, Workflow, Rocket, TrendingUp, Blocks } from 'lucide-react';
import './ConversionSections.css';
gsap.registerPlugin(ScrollTrigger);

const problems=[
 {title:'Planilhas demais',description:'Informações espalhadas, controles paralelos e retrabalho.',impact:'Retrabalho e informações dispersas',Icon:Sheet},
 {title:'Gestão pelo WhatsApp',description:'Processos críticos dependem de mensagens, grupos e cobranças manuais.',impact:'Dificuldade de acompanhar solicitações e responsáveis',Icon:MessageCircle},
 {title:'Pouca visibilidade do campo',description:'Dificuldade para acompanhar jornada, visitas e execução.',impact:'Menos visibilidade sobre a execução operacional',Icon:MapPin},
 {title:'Relatórios demorados',description:'Horas consolidando dados antes de chegar à decisão.',impact:'Decisões que dependem de consolidação manual',Icon:ChartNoAxesCombined},
 {title:'Sistemas desconectados',description:'Dados repetidos e processos quebrados entre plataformas.',impact:'Informações duplicadas e processos fragmentados',Icon:Workflow},
 {title:'Software que não acompanha',description:'Sua operação se adapta à ferramenta — quando deveria ser o contrário.',impact:'Limitações para acompanhar a evolução da empresa',Icon:Blocks}
];
const stages=[
 {title:'Diagnóstico',desc:'Entendemos o negócio, seus desafios e os resultados esperados.',Icon:Search},
 {title:'Mapeamento',desc:'Identificamos fluxos, regras do negócio, integrações e oportunidades.',Icon:Route},
 {title:'Proposta',desc:'Definimos o escopo, as funcionalidades, os prazos e as condições do projeto.',Icon:FileText},
 {title:'Desenvolvimento',desc:'Construímos a solução e realizamos validações durante a implementação.',Icon:Code2},
 {title:'Implantação',desc:'Executamos os testes necessários e preparamos a solução para entrar em operação.',Icon:Rocket},
 {title:'Evolução',desc:'Acompanhamos novas necessidades e oportunidades de melhoria.',Icon:TrendingUp}
];
function useReveal(root:React.RefObject<HTMLElement|null>, selector:string){
 React.useEffect(()=>{
  const element=root.current;if(!element)return;
  const mm=gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)',()=>{
   const targets=element.querySelectorAll(selector);
   const tween=gsap.fromTo(targets,{opacity:0,y:18},{opacity:1,y:0,duration:.48,stagger:.07,ease:'power2.out',scrollTrigger:{trigger:element,start:'top 86%',once:true}});
   return ()=>{tween.scrollTrigger?.kill();tween.kill();gsap.set(targets,{clearProps:'opacity,transform'})};
  });
  return ()=>mm.revert();
 },[root,selector]);
}
export function ProblemsExplorer(){
 const root=React.useRef<HTMLElement>(null);
 const [chosen,setChosen]=React.useState(0);
 useReveal(root,'.wfcProblem');
 const selected=problems[chosen];
 return <section ref={root} className="wfcSection wfcProblems" aria-labelledby="wfcProblemsTitle">
  <div className="wfcHeading"><span className="wfcEyebrow">O CUSTO DA COMPLEXIDADE</span><h2 id="wfcProblemsTitle">Sua operação cresceu.<br/><em>Os controles acompanharam?</em></h2><p>Quando a gestão depende de ferramentas improvisadas, a equipe perde tempo e a liderança perde visibilidade.</p></div>
  <div className="wfcProblemLayout">
   <div className="wfcProblemGrid" role="group" aria-label="Desafios operacionais">
    {problems.map((p,i)=><button className={'wfcProblem'+(chosen===i?' isActive':'')} key={p.title} type="button" aria-pressed={chosen===i} aria-controls="wfcProblemDetail" onClick={()=>setChosen(i)}>
      <span className="wfcProblemTop"><p.Icon size={22}/><small>0{i+1}</small></span>
      <strong>{p.title}</strong><span className="wfcProblemBottom">Analisar impacto <ArrowUpRight size={16}/></span>
     </button>)}
   </div>
   <div id="wfcProblemDetail" className="wfcProblemDetail" aria-label={'Impacto de '+selected.title}>
    <span className="wfcEyebrow">IMPACTO OPERACIONAL · 0{chosen+1}</span>
    <h3>{selected.impact}</h3>
    <p>{selected.description}</p>
    <div className="wfcInsight"><ClipboardList size={22}/><span>Identificar a causa é o primeiro passo para construir uma solução adequada à sua operação.</span></div>
    <a href="/diagnostico" className="wfcCta">Diagnosticar minha operação <ArrowUpRight size={17}/></a>
   </div>
  </div>
 </section>;
}
export function ProcessJourney(){
 const root=React.useRef<HTMLElement>(null);
 const [current,setCurrent]=React.useState(0);
 useReveal(root,'.wfcStage');
 return <section id="processo" ref={root} className="wfcSection wfcProcess" aria-labelledby="wfcProcessTitle">
  <div className="wfcHeading"><span className="wfcEyebrow">DA DOR À SOLUÇÃO</span><h2 id="wfcProcessTitle">Um processo claro.<br/><em>Sem tecnologia pela tecnologia.</em></h2><p>Da primeira conversa à evolução contínua, cada etapa tem um propósito definido.</p></div>
  <div className="wfcProcessLayout">
   <div className="wfcTimeline" role="group" aria-label="Etapas do nosso processo">
    <div className="wfcProgress" aria-hidden="true"><span style={{transform:'scaleX('+((current+1)/stages.length)+')'}}/></div>
    {stages.map((s,i)=><button key={s.title} type="button" onClick={()=>setCurrent(i)} className={'wfcStage'+(current===i?' isActive':'')} aria-expanded={current===i} aria-controls="wfcStageDetail">
      <span className="wfcStageRail"><span className="wfcStageCircle">{i<current?<Check size={17}/>:<s.Icon size={18}/>}</span>{i<stages.length-1&&<i aria-hidden="true"/>}</span>
      <span className="wfcStageCopy"><small>0{i+1} / 06</small><strong>{s.title}</strong>{current===i&&<span className="wfcStageMobileDesc">{s.desc}</span>}</span><ChevronDown className="wfcStageChevron" size={17}/>
     </button>)}
   </div>
   <div id="wfcStageDetail" className="wfcStageDetail" aria-label={'Detalhes da etapa '+stages[current].title}>
    <span className="wfcEyebrow">COMO TRABALHAMOS · 0{current+1} / 06</span>
    <span className="wfcDetailIcon">{React.createElement(stages[current].Icon,{size:32})}</span>
    <h3>{stages[current].title}</h3>
    <p>{stages[current].desc}</p>
    <div className="wfcStepIndicator" aria-label={'Etapa '+(current+1)+' de '+stages.length}>{stages.map((s,i)=><span key={s.title} className={i<=current?'isFilled':''}/>)}</div>
    <a href="/diagnostico" className="wfcCta">Começar meu projeto <ArrowUpRight size={17}/></a>
   </div>
  </div>
 </section>;
}
