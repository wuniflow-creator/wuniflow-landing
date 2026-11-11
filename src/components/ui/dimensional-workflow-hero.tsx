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
  mm.add({room:'(min-height: 650px) and (min-width: 1000px)',phone:'(max-width: 999px)',motion:'(prefers-reduced-motion: no-preference)'},context=>{
   const motion=context.conditions?.motion;const phone=!!context.conditions?.phone;
   const panels=cards.map(c=>c.querySelector<HTMLElement>('.dw-panel')!);
   const stages=cards.map(c=>c.querySelector<HTMLElement>('.dw-stage')!);
   const copies=cards.map(c=>c.querySelector<HTMLElement>('.dw-copy')!);
   // On phones, use native page scrolling and readable stacked chapters: no pinned GSAP stage.
   // This avoids overlapping 3D panels during touch/click and browser viewport resize.
   if(!motion || phone)return;
   if(context.conditions?.room){
    element.classList.add('dw-pinned');element.classList.toggle('dw-phone',phone);
    const viewport=element.querySelector<HTMLElement>('.dw-viewport')!;
    const intro=element.querySelector('.dw-deck-intro');
    const fit=()=>Math.max(.28,Math.min(1,(phone?element.clientWidth*.88:element.clientWidth*.51)/600,phone?(viewport.clientHeight-310)/430:1));
    element.style.setProperty('--dw-fit',String(fit()));
    const sync=(index:number)=>{if(current.current!==index){current.current=index;setActive(index)}copies.forEach((copy,i)=>{copy.inert=i!==index;copy.setAttribute('aria-hidden',String(i!==index))})};
    sync(-1);
    gsap.set(copies,{autoAlpha:0,y:25});
    gsap.set(stages,{left:phone?'50%':'72%',top:phone?'65%':'51%',xPercent:-50,yPercent:-50});
    gsap.set(panels,{transformPerspective:1400,transformOrigin:'50% 50%'});
    panels.forEach((panel,i)=>gsap.set(panel,{x:(i-1)*(phone?50:105),y:(i===1?-14:22),z:-i*100,rotationY:-34,rotationX:14,rotationZ:-5+i*2,scale:fit()*.78,autoAlpha:1,zIndex:3-i}));
    const timeline=gsap.timeline({defaults:{ease:'power2.inOut'},scrollTrigger:{trigger:viewport,start:()=>phone?'top 70px':'top 80px',end:()=>'+='+Math.min(viewport.clientHeight*(phone?1.12:1.05),950)*cards.length,pin:true,scrub:.55,invalidateOnRefresh:true,onRefresh:()=>element.style.setProperty('--dw-fit',String(fit())),onUpdate:self=>{const time=self.animation?.time()??0;sync(time<1?-1:time>=12?3:Math.min(2,Math.floor((time-1)/3.7)))}}});tl.current=timeline;
    timeline.to(intro,{autoAlpha:0,y:-28,duration:.6},.35);
    cards.forEach((card,i)=>{
     const t=1+i*3.7;timeline.addLabel('chapter-'+i,t+.5);
     panels.forEach((panel,j)=>timeline.to(panel,{x:j===i?0:j<i?(phone?-180:-450):(phone?140:360),y:j===i?0:40,z:j===i?70:-400,rotationY:j===i?-7:j<i?38:-38,rotationX:j===i?6:14,rotationZ:0,scale:()=>j===i?fit():fit()*.7,autoAlpha:j===i?1:0,zIndex:j===i?10:1,duration:.85},t-.3));
     timeline.to(copies[i],{autoAlpha:1,y:0,duration:.5},t+.05);
     const nodes=card.querySelectorAll('.dw-node');nodes.forEach((node,j)=>timeline.to(node,{z:35,y:-9,scale:1.06,duration:.3},t+.4+j*.48).to(node,{z:0,y:0,scale:1,duration:.3},t+.8+j*.48));
     if(i===2){const scenes=card.querySelectorAll('.dw-build-scene');gsap.set(scenes,{autoAlpha:0});gsap.set(scenes[0],{autoAlpha:1});timeline.to(scenes[0],{autoAlpha:0,x:-20,duration:.3},t+.8).fromTo(scenes[1],{autoAlpha:0,x:25},{autoAlpha:1,x:0,duration:.35},t+.85).to(scenes[1],{autoAlpha:0,x:-20,duration:.3},t+1.8).fromTo(scenes[2],{autoAlpha:0,x:25},{autoAlpha:1,x:0,duration:.4},t+1.85)}
     timeline.to(copies[i],{autoAlpha:0,y:-25,duration:.4},t+3.15);
    });
    const close=12;
    panels.forEach((panel,i)=>timeline.to(panel,{x:(i-1)*(phone?105:230),y:i===1?90:-35,z:-260,rotationY:(i-1)*-16,rotationX:10,rotationZ:(i-1)*5,scale:()=>fit()*.75,autoAlpha:.2,duration:.9},close));
    timeline.fromTo('.dw-deck-close',{autoAlpha:0,y:20},{autoAlpha:1,y:0,duration:.7},close+.25).to({},{duration:.65});
    return ()=>{tl.current=null;element.classList.remove('dw-pinned','dw-phone');copies.forEach(c=>{c.inert=false;c.removeAttribute('aria-hidden')})};
   }
   cards.forEach(card=>{
    gsap.fromTo(card.querySelector('.dw-panel'),{rotationY:-20,rotationX:10,y:36},{rotationY:-3,rotationX:2,y:0,ease:'power2.out',scrollTrigger:{trigger:card,start:'top 88%',end:'center center',scrub:.4}});
    ScrollTrigger.create({trigger:card,start:'top 55%',end:'bottom 55%',onEnter:()=>setActive(cards.indexOf(card)),onEnterBack:()=>setActive(cards.indexOf(card))});
   });
  });
  let mounted=true;document.fonts.ready.then(()=>{if(mounted)ScrollTrigger.refresh()});
  return ()=>{mounted=false;mm.revert()};
 },{scope:root,dependencies:[content],revertOnUpdate:true});
 const go=(index:number)=>{const timeline=tl.current;const trigger=timeline?.scrollTrigger;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;if(timeline&&trigger){window.scrollTo({top:trigger.start+(timeline.labels['chapter-'+index]+.5)/timeline.duration()*(trigger.end-trigger.start),behavior:reduced?'auto':'smooth'})}else root.current?.querySelectorAll<HTMLElement>('.dw-chapter')[index]?.scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'})};
 return <section ref={root} className="dw-experience" aria-label="Explore as soluções Wuniflow">
  <div className="dw-heading"><span>COMO A WUNIFLOW CONECTA SEU NEGÓCIO</span><h2>{content.title}</h2><p>{content.description}</p><a className="dw-skip" href="#dw-end">Pular demonstração ↓</a></div>
  <div className="dw-viewport">
   <div className="dw-deck-intro"><span>SOLUÇÕES QUE SE CONECTAM</span><h3>Menos tarefas soltas.<br/><em>Mais possibilidades.</em></h3><p>Atendimento, automação e experiências digitais em um mesmo fluxo.</p><button type="button" onClick={()=>go(0)}>Explorar a experiência ↓</button></div>
   <nav className="dw-nav" aria-label="Escolher solução">{content.chapters.map((chapter,i)=><button key={chapter.name} onClick={()=>go(i)} aria-current={active===i?'step':undefined} aria-controls={'dw-chapter-'+i}><span>0{i+1}</span>{chapter.name}<i/></button>)}</nav>
   <div className="dw-chapters">{content.chapters.map((chapter,i)=><article className="dw-chapter" id={'dw-chapter-'+i} key={chapter.name}>
    <div className="dw-copy"><span>{chapter.tag}</span><h3>{chapter.title}</h3><p>{chapter.description}</p><ol>{chapter.steps.map((s,j)=><li key={s}><span>0{j+1}</span>{s}</li>)}</ol>{chapter.site&&<a href={chapter.site} target="_blank" rel="noopener noreferrer">Conhecer projeto real <ArrowUpRight size={16}/></a>}</div>
    <div className="dw-stage"><Diagram chapter={chapter} index={i}/></div>
   </article>)}</div>
   <div className="dw-deck-close"><span>DO PRIMEIRO CONTATO À ENTREGA</span><h3>O trabalho avança.<br/><em>Sua equipe no controle.</em></h3><p>Continue para planejar sua solução com a Wuniflow.</p></div>
  </div>
  <div className="dw-finale" id="dw-end" tabIndex={-1}><span>TECNOLOGIA COM UM OBJETIVO CLARO</span><h2>Seu negócio conectado.<br/>Sua equipe no controle.</h2><a href="/diagnostico">Planejar meu projeto <ArrowUpRight size={18}/></a></div>
 </section>;
}
