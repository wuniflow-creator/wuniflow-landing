import React from 'react';
import { ArrowUpRight, ArrowLeft, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './PortfolioCarousel.css';

gsap.registerPlugin(ScrollTrigger);

type Project = {
  name: string;
  category: string;
  description: string;
  href: string;
  image: string;
  imageAlt: string;
};

const projects: Project[] = [
  {name:'NYX Tarot',category:'LANDING PAGE · EXPERIÊNCIA DIGITAL',description:'Experiência de leitura de baralho com escolha de perguntas, atendimento e agendamento pelo WhatsApp.',href:'https://nyx-tarot.lovable.app',image:'/assets/portfolio-nyx-tarot.jpg',imageAlt:'Captura real do site NYX Tarot'},
  {name:'HI TECH',category:'LANDING PAGE · ESTÉTICA AUTOMOTIVA',description:'Apresentação de serviços de estética automotiva, cuidados personalizados e agendamento.',href:'https://hi-tech-alpha.vercel.app',image:'/assets/portfolio-hi-tech.jpg',imageAlt:'Captura real do site HI TECH'},
  {name:'AxéHub',category:'PLATAFORMA DIGITAL',description:'Plataforma digital para gestão de casas de axé.',href:'https://axehub.pro',image:'/assets/portfolio-axehub-v3.webp',imageAlt:'Captura real da plataforma AxéHub'},
  {name:'Axé Performance IA',category:'SISTEMA WEB · PLATAFORMA SAAS',description:'Plataforma digital de gestão para professores, alunos e turmas de capoeira.',href:'https://axeperformanceia.com.br/',image:'/assets/portfolio-axe-performance-v3.webp',imageAlt:'Captura real da plataforma Axé Performance IA'},
  {name:'Barbearia Quaresma',category:'LANDING PAGE · BARBEARIA',description:'Site para barbearia em Ceilândia, com apresentação de serviços, galeria de trabalhos e agendamento pelo WhatsApp.',href:'https://barbearia-quaresma.vercel.app/',image:'/assets/portfolio-barbearia-quaresma.jpg',imageAlt:'Captura real do site Barbearia Quaresma'}
];

export default function PortfolioCarousel() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const [progress,setProgress] = React.useState(0);
  const [mobileIndex,setMobileIndex] = React.useState(0);

  React.useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!section || !track || !viewport) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const distance = () => Math.max(0,track.scrollWidth - viewport.clientWidth);
      if (distance() < 1) return;
      const tween = gsap.to(track,{
        x:()=>-distance(),
        ease:'none',
        scrollTrigger:{
          trigger:section,
          start:'top top',
          end:()=>'+='+distance(),
          scrub:0.55,
          pin:true,
          pinSpacing:true,
          anticipatePin:1,
          invalidateOnRefresh:true,
          onUpdate:self=>setProgress(self.progress)
        }
      });
      return ()=>{tween.scrollTrigger?.kill();tween.kill();setProgress(0)};
    });
    return ()=>mm.revert();
  },[]);

  const goTo = (index:number) => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const card = track.children[index] as HTMLElement | undefined;
    if (!card) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    viewport.scrollTo({left:card.offsetLeft - track.offsetLeft,behavior:reduced?'auto':'smooth'});
    setMobileIndex(index);
  };

  const onMobileScroll = () => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || window.matchMedia('(min-width: 900px)').matches) return;
    const children = Array.from(track.children) as HTMLElement[];
    const index = children.reduce((best,child,i)=>Math.abs(child.offsetLeft - track.offsetLeft - viewport.scrollLeft) < Math.abs(children[best].offsetLeft - track.offsetLeft - viewport.scrollLeft)?i:best,0);
    setMobileIndex(index);
  };

  return <section id="cases" ref={sectionRef} className="wfPortfolio" aria-labelledby="portfolio-title">
    <div className="wfPortfolioHeading">
      <div><span className="wfPortfolioEyebrow">PROJETOS EM DESTAQUE / WUNIFLOW</span>
        <h2 id="portfolio-title">Projetos que falam <em>por si.</em></h2>
        <p>Explore experiências reais. Cada projeto combina identidade, tecnologia e objetivos de negócio.</p>
      </div>
      <span className="wfPortfolioHint" aria-hidden="true">EXPLORE OS PROJETOS <ArrowRight size={17}/></span>
    </div>
    <div className="wfPortfolioViewport" ref={viewportRef} onScroll={onMobileScroll} tabIndex={0} aria-label="Portfólio de projetos. No celular, deslize para ver os demais.">
      <div className="wfPortfolioTrack" ref={trackRef}>
        {projects.map((project,index)=><article className="wfPortfolioCard" key={project.href}>
          <a className="wfPortfolioMedia" href={project.href} target="_blank" rel="noopener noreferrer" aria-label={'Visitar '+project.name+' em nova aba'}>
            <img src={project.image} alt={project.imageAlt} width={1366} height={768} loading="lazy" decoding="async"/>
            <span className="wfPortfolioVisit">Ver projeto <ArrowUpRight size={17}/></span>
          </a>
          <div className="wfPortfolioMeta"><span>{project.category}</span><span>0{index+1} / 0{projects.length}</span></div>
          <h3>{project.name}</h3>
          <p>{project.description}</p>
          <a className="wfPortfolioLink" href={project.href} target="_blank" rel="noopener noreferrer">Conhecer projeto <ArrowUpRight size={17}/></a>
        </article>)}
      </div>
    </div>
    <div className="wfPortfolioFooter">
      <span className="wfPortfolioCounter"><b>{String(mobileIndex+1).padStart(2,'0')}</b><span> / {String(projects.length).padStart(2,'0')}</span></span>
      <div className="wfPortfolioProgress" aria-hidden="true"><span style={{transform:'scaleX('+progress+')'}}/></div>
      <div className="wfPortfolioMobileControls" aria-label="Navegação do portfólio">
        <button type="button" aria-label="Projeto anterior" disabled={mobileIndex===0} onClick={()=>goTo(mobileIndex-1)}><ArrowLeft size={19}/></button>
        <button type="button" aria-label="Próximo projeto" disabled={mobileIndex===projects.length-1} onClick={()=>goTo(mobileIndex+1)}><ArrowRight size={19}/></button>
      </div>
    </div>
  </section>;
}
