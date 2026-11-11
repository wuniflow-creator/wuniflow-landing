import {useRef, useState, type CSSProperties} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {useGSAP} from '@gsap/react';
import {ArrowUpRight, Bot, MessageSquare, UserRound, Check, Mail, ShieldCheck, Database, Bell, GitBranch} from 'lucide-react';
import './dimensional-workflow-hero.css';

gsap.registerPlugin(ScrollTrigger,useGSAP);
type Node = {label:string;caption:string;icon:typeof Bot;x:number;y:number};
type Chapter = {name:string;tag:string;title:string;description:string;steps:string[];nodes?:Node[];edges?:[number,number][];image?:string;imageAlt?:string;site?:string};
export type ScrollExperienceContent = {chapters:Chapter[];title:string;description:string};
const defaultContent:ScrollExperienceContent = {
 title:'Da primeira conversa à solução funcionando.',
 description:'Explore como conectamos atendimento, processos e experiências digitais.',
 chapters:[
 {name:'Atendimento com IA',tag:'01 / CONVERSAS QUE AVANÇAM',title:'Respostas úteis. Pessoas quando importa.',description:'Um assistente orientado pelas informações do seu negócio, com um caminho claro para sua equipe assumir o atendimento.',steps:['Cliente envia uma mensagem','IA consulta informações aprovadas','Responde ou encaminha para uma pessoa'],nodes:[{label:'Mensagem',caption:'CLIENTE',icon:MessageSquare,x:3,y:38},{label:'Assistente IA',caption:'SUA BASE DE CONHECIMENTO',icon:Bot,x:34,y:38},{label:'Resposta',caption:'ORIENTAÇÃO',icon:Check,x:69,y:14},{label:'Sua equipe',caption:'ATENDIMENTO HUMANO',icon:UserRound,x:69,y:64}],edges:[[0,1],[1,2],[1,3]]},
 {name:'Automação integrada',tag:'02 / MENOS ETAPAS MANUAIS',title:'Uma solicitação. Os próximos passos conectados.',description:'Conectamos formulários, CRM e notificações, respeitando validações, responsáveis e regras da sua operação.',steps:['Recebe o formulário ou solicitação','Valida campos e regras do processo','Atualiza o CRM e avisa o responsável'],nodes:[{label:'Solicitação',caption:'FORMULÁRIO OU E-MAIL',icon:Mail,x:3,y:20},{label:'Validação',caption:'REGRAS DO NEGÓCIO',icon:ShieldCheck,x:34,y:20},{label:'CRM',caption:'REGISTRO ORGANIZADO',icon:Database,x:69,y:20},{label:'Notificação',caption:'EQUIPE INFORMADA',icon:Bell,x:34,y:68}],edges:[[0,1],[1,2],[1,3]]},
 {name:'Sites e sistemas',tag:'03 / DA ESTRUTURA À EXPERIÊNCIA',title:'Sua ideia ganha forma. E entra em operação.',description:'Planejamento, desenvolvimento e design conectados para entregar uma experiência que representa o seu negócio.',steps:['Definimos estrutura e objetivos','Construímos recursos e integrações','Validamos a experiência antes de publicar'],image:'/assets/portfolio-barbearia-quaresma.jpg',imageAlt:'Captura real do site Barbearia Quaresma',site:'https://barbearia-quaresma.vercel.app/'}]
};
function Diagram({chapter,index}:{chapter:Chapter;index:number}) {
 return <div className="dw-panel" aria-hidden="true">
  <div className="dw-panel-bar"><GitBranch size={18}/><strong>{chapter.name}</strong><span>{chapter.image?'PROJETO REAL':'FLUXO ILUSTRATIVO'}</span></div>
  {chapter.nodes?<div className="dw-canvas">
   <svg viewBox="0 0 600 340" preserveAspectRatio="none" className="dw-wires"><defs><linearGradient id={'dw-wire-'+index}><stop stopColor="#a476de"/><stop offset="1" stopColor="#ed73cf"/></linearGradient></defs>{chapter.edges?.map(([a,b],i)=>{const n=chapter.nodes![a],m=chapter.nodes![b];const x=n.x*6+150,y=n.y*3.4+37.5,xx=m.x*6,yy=m.y*3.4+37.5;const d=a===1&&b===3&&index===1?`M${x-75} ${y+37.5} V${yy-37.5}`:`M${x} ${y} C${(x+xx)/2} ${y},${(x+xx)/2} ${yy},${xx} ${yy}`;return <g key={i}><path d={d} stroke={'url(#dw-wire-'+index+')'}/><path className="dw-signal" d={d}/></g>})}</svg>
   {chapter.nodes.map((node,i)=><div className="dw-node" key={node.label} style={{left:node.x+'%',top:node.y+'%','--node-delay':i*.55+'s'} as CSSProperties}><node.icon/><strong>{node.label}</strong><small>{node.caption}</small></div>)}
   <small className="dw-art-note">DEMONSTRAÇÃO CONCEITUAL · SEM DADOS DE CLIENTES</small>
  </div>:<div className="dw-build">
   <div className="dw-build-scene dw-plan"><small>01 / PLANEJAMENTO</small><h3>O projeto começa pelo objetivo.</h3>{chapter.steps.map((s,i)=><div key={s}><span>0{i+1}</span>{s}<Check size={16}/></div>)}</div>
   <div className="dw-build-scene dw-code"><small>02 / DESENVOLVIMENTO · EXEMPLO ILUSTRATIVO</small><pre>{`type Projeto = {\n  objetivo: string;\n  recursos: Recurso[];\n  integracoes: Integracao[];\n};\n\n// Cada etapa conecta design,\n// regras e experiência.\n\nexport function Experiencia() {\n  return <ProjetoSobMedida />;\n}`}</pre></div>
   <div className="dw-build-scene dw-finished"><img src={chapter.image} alt={chapter.imageAlt} width="1366" height="768" loading="lazy"/><span>03 / SITE PUBLICADO · BARBEARIA QUARESMA</span></div>
  </div>}
  <div className="dw-panel-footer"><ShieldCheck size={14}/>{chapter.image?'Design aplicado a um negócio real':'Regras claras · Atendimento humano quando necessário'}</div>
 </div>;
}
export default function DimensionalWorkflowHero({content=defaultContent}:{content?:ScrollExperienceContent}) {
 const root=useRef<HTMLElement>(null);const tl=useRef<gsap.core.Timeline|null>(null);const [active,setActive]=useState(0);const current=useRef(0);
 useGSAP(()=>{
  const element=root.current!;const cards=Array.from(element.querySelectorAll<HTMLElement>('.dw-chapter'));const mm=gsap.matchMedia();
  mm.add({desktop:'(min-width: 1000px) and (min-height: 700px)',motion:'(prefers-reduced-motion: no-preference)'},context=>{
   const motion=context.conditions?.motion;const pinned=context.conditions?.desktop&&motion;
   if(!motion)return;
   const panels=cards.map(c=>c.querySelector('.dw-panel'));
   if(pinned){
    element.classList.add('dw-pinned');
    const sync=(index:number)=>{if(current.current!==index){current.current=index;setActive(index)}cards.forEach((card,i)=>{card.inert=i!==index;card.setAttribute('aria-hidden',String(i!==index))})};
    sync(0);gsap.set(cards,{autoAlpha:0});gsap.set(cards[0],{autoAlpha:1});
    const timeline=gsap.timeline({scrollTrigger:{trigger:element.querySelector('.dw-viewport'),start:'top 80px',end:()=>'+='+Math.min(innerHeight*.8,800)*cards.length,pin:true,scrub:.4,invalidateOnRefresh:true,onUpdate:self=>sync(Math.min(cards.length-1,Math.floor(self.progress*cards.length)))}});tl.current=timeline;
    cards.forEach((card,i)=>{
     const t=i*3;timeline.addLabel('chapter-'+i,t);
     if(i){timeline.to(cards[i-1],{autoAlpha:0,y:-35,duration:.35},t).fromTo(card,{autoAlpha:0,y:35},{autoAlpha:1,y:0,duration:.45},t+.1)}
     timeline.fromTo(panels[i],{rotationY:-16,rotationX:9,y:22},{rotationY:-4,rotationX:3,y:-8,duration:2.8,ease:'none'},t);
     if(i===2){const scenes=card.querySelectorAll('.dw-build-scene');gsap.set(scenes,{autoAlpha:0});gsap.set(scenes[0],{autoAlpha:1});timeline.to(scenes[0],{autoAlpha:0,duration:.25},t+.7).to(scenes[1],{autoAlpha:1,duration:.25},t+.7).to(scenes[1],{autoAlpha:0,duration:.25},t+1.55).to(scenes[2],{autoAlpha:1,duration:.3},t+1.55)}
    });
    return ()=>{tl.current=null;element.classList.remove('dw-pinned');cards.forEach(c=>{c.inert=false;c.removeAttribute('aria-hidden')})};
   }
   cards.forEach(card=>{
    gsap.fromTo(card.querySelector('.dw-panel'),{rotationY:-12,rotationX:7,y:36},{rotationY:0,rotationX:0,y:0,ease:'power2.out',scrollTrigger:{trigger:card,start:'top 88%',end:'center center',scrub:.4}});
    ScrollTrigger.create({trigger:card,start:'top 55%',end:'bottom 55%',onEnter:()=>setActive(cards.indexOf(card)),onEnterBack:()=>setActive(cards.indexOf(card))});
   });
  });
  let mounted=true;document.fonts.ready.then(()=>{if(mounted)ScrollTrigger.refresh()});
  return ()=>{mounted=false;mm.revert()};
 },{scope:root,dependencies:[content],revertOnUpdate:true});
 const go=(index:number)=>{const timeline=tl.current;const trigger=timeline?.scrollTrigger;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;if(timeline&&trigger){window.scrollTo({top:trigger.start+(timeline.labels['chapter-'+index]+.5)/timeline.duration()*(trigger.end-trigger.start),behavior:reduced?'instant':'smooth'})}else root.current?.querySelectorAll<HTMLElement>('.dw-chapter')[index]?.scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'})};
 return <section ref={root} className="dw-experience" aria-label="Explore as soluções Wuniflow">
  <div className="dw-heading"><span>COMO A WUNIFLOW CONECTA SEU NEGÓCIO</span><h2>{content.title}</h2><p>{content.description}</p><a className="dw-skip" href="#dw-end">Pular demonstração ↓</a></div>
  <div className="dw-viewport">
   <nav className="dw-nav" aria-label="Escolher solução">{content.chapters.map((chapter,i)=><button key={chapter.name} onClick={()=>go(i)} aria-current={active===i?'step':undefined} aria-controls={'dw-chapter-'+i}><span>0{i+1}</span>{chapter.name}<i/></button>)}</nav>
   <div className="dw-chapters">{content.chapters.map((chapter,i)=><article className="dw-chapter" id={'dw-chapter-'+i} key={chapter.name}>
    <div className="dw-copy"><span>{chapter.tag}</span><h3>{chapter.title}</h3><p>{chapter.description}</p><ol>{chapter.steps.map((s,j)=><li key={s}><span>0{j+1}</span>{s}</li>)}</ol>{chapter.site&&<a href={chapter.site} target="_blank" rel="noopener noreferrer">Conhecer projeto real <ArrowUpRight size={16}/></a>}</div>
    <div className="dw-stage"><Diagram chapter={chapter} index={i}/></div>
   </article>)}</div>
  </div>
  <div className="dw-finale" id="dw-end" tabIndex={-1}><span>TECNOLOGIA COM UM OBJETIVO CLARO</span><h2>Seu negócio conectado.<br/>Sua equipe no controle.</h2><a href="/diagnostico">Planejar meu projeto <ArrowUpRight size={18}/></a></div>
 </section>;
}
