import React from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import './scroll-story.css';

// Demonstração visual dos serviços WuniFlow; não representa dados reais de clientes.
const stages = [
  {
    kicker: '01 / DIAGNÓSTICO',
    title: 'Do processo manual ao plano certo.',
    description: 'Entendemos onde estão as planilhas, as mensagens e os gargalos. Mapeamos o fluxo antes de escrever uma linha de código.',
    label: 'Mapeamento operacional'
  },
  {
    kicker: '02 / DESENVOLVIMENTO + AUTOMAÇÃO',
    title: 'Sistemas que conversam entre si.',
    description: 'Criamos sites, plataformas e ferramentas conectadas a fluxos, APIs e inteligência artificial — respeitando cada regra de negócio.',
    label: 'Arquitetura de soluções'
  },
  {
    kicker: '03 / VISÃO PARA DECIDIR',
    title: 'Da execução ao dado confiável.',
    description: 'A operação ganha visibilidade por meio de painéis, acompanhamento de equipes e indicadores úteis para tomar decisões.',
    label: 'Inteligência operacional'
  }
] as const;

const showcases = [
  {src:'/cinematic/wuniflow-workshop.webp',alt:'Cena conceitual de profissionais analisando processos em um estúdio de tecnologia',tag:'DA CONVERSA AO PLANO',name:'Estratégia antes do código',note:'Cena conceitual gerada com IA',href:'/diagnostico'},
  {src:'/assets/portfolio-barbearia-quaresma.jpg',alt:'Captura real do site Barbearia Quaresma',tag:'PROJETO REAL · SITE',name:'Barbearia Quaresma',note:'Design aplicado a um negócio real',href:'https://barbearia-quaresma.vercel.app/'},
  {src:'/assets/portfolio-gpstrade.webp',alt:'Captura real da interface do GPSTRADE',tag:'PRODUTO WUNIFLOW · SISTEMA',name:'GPSTRADE',note:'Interface real de gestão operacional',href:'/diagnostico'}
];
function ProcessVisual({ stage }: { stage: number }) {
  const [expanded,setExpanded] = React.useState(false);
  const item=showcases[stage];
  return <div className={'wfShowcase '+(stage===0?'isPhoto':'isProduct')+(expanded?' isExpanded':'')}>
    <div className="wfShowcaseMedia">
      <img src={item.src} alt={item.alt} loading="lazy" decoding="async" width={1536} height={stage===2?1272:1024}/>
      <span className="wfShowcaseTag">{item.tag}</span>
      <div className="wfShowcaseCaption"><small>{item.note}</small><strong>{item.name}</strong></div>
    </div>
    <div className="wfShowcaseFooter">
      <span>WUNIFLOW / {stage===0?'ESTRATÉGIA':'PORTFÓLIO'}</span>
      {stage===0?<a href={item.href}>Conversar sobre meu projeto <ArrowUpRight size={16}/></a>:<button type="button" onClick={()=>setExpanded(!expanded)} aria-expanded={expanded}>{expanded?'Ver composição':'Ampliar interface'} <ArrowUpRight size={16}/></button>}
    </div>
    {stage===1&&<a className="wfShowcaseVisit" href={item.href} target="_blank" rel="noopener noreferrer">Explorar site publicado <ArrowUpRight size={16}/></a>}
  </div>;
}

export default function ScrollStory() {
  const cards = React.useRef<(HTMLElement | null)[]>([]);
  const [visible, setVisible] = React.useState<boolean[]>([false,false,false]);
  const [motionEnabled, setMotionEnabled] = React.useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  React.useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setMotionEnabled(!reduce.matches);
    sync();
    reduce.addEventListener('change', sync);
    return () => reduce.removeEventListener('change',sync);
  }, []);

  React.useEffect(() => {
    if (!motionEnabled || !('IntersectionObserver' in window)) {
      setVisible([true,true,true]);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const index = cards.current.findIndex(card => card === entry.target);
        if (index < 0) continue;
        setVisible(previous => previous[index] ? previous : previous.map((value,i) => i === index ? true : value));
        observer.unobserve(entry.target);
      }
    }, {rootMargin:'0px 0px -8% 0px',threshold:0.12});
    cards.current.forEach(card => {if(card) observer.observe(card)});
    return () => observer.disconnect();
  }, [motionEnabled]);

  // Cada quadro recebe uma transformação sutil baseada apenas no deslocamento da própria seção.
  React.useEffect(() => {
    if (!motionEnabled) return;
    let scheduled = 0;
    const update = () => {
      scheduled = 0;
      const height = Math.max(window.innerHeight,1);
      cards.current.forEach(card => {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const value = Math.max(0,Math.min(1,(height-rect.top)/(height+rect.height)));
        card.style.setProperty('--wf-scroll',value.toFixed(3));
      });
    };
    const queue = () => {if (!scheduled) scheduled = window.requestAnimationFrame(update)};
    update();
    window.addEventListener('scroll',queue,{passive:true});
    window.addEventListener('resize',queue);
    return () => {window.removeEventListener('scroll',queue);window.removeEventListener('resize',queue);if(scheduled)cancelAnimationFrame(scheduled)};
  },[motionEnabled]);

  return (
    <section className={'wfStory '+(motionEnabled?'wfStoryMotion':'wfStoryStatic')} aria-label="Como a WuniFlow transforma processos em soluções digitais">
      <div className="wfStoryContainer">
        <div className="wfStoryHeading">
          <span>COMO A WUNIFLOW TRANSFORMA NEGÓCIOS</span>
          <strong>PROCESSO → TECNOLOGIA → DECISÃO</strong>
        </div>
        <div className="wfStoryCards">
          {stages.map((stage,index) => <article
            key={stage.kicker}
            ref={node => { cards.current[index] = node }}
            className={'wfStoryCard'+(visible[index]?' isVisible':'')+(index===1?' wfStoryReverse':'')}
            aria-labelledby={'wf-story-title-'+index}>
            <div className="wfStoryCopy">
              <span className="wfStoryIndex">{stage.kicker}</span>
              <h2 id={'wf-story-title-'+index}>{stage.title}</h2>
              <p>{stage.description}</p>
              <a className="wfStoryLink" href="/diagnostico">Quero digitalizar minha operação <ArrowRight size={18}/></a>
              <div className="wfStorySteps" aria-hidden="true">
                {stages.map((_,i)=><span key={i} className={i===index?'isActive':''}>{'0'+(i+1)}</span>)}
              </div>
            </div>
            <div className="wfStoryFrame"><ProcessVisual stage={index}/></div>
          </article>)}
        </div>
      </div>
    </section>
  );
}
