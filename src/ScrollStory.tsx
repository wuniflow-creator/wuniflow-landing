import React from 'react';
import { ArrowRight, BarChart3, Bot, CheckCircle2, ClipboardList, Code2, Database, GitBranch, LayoutDashboard, MapPin, Workflow } from 'lucide-react';
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

function ProcessVisual({ stage }: { stage: number }) {
  return (
    <div className="wfProcessDisplay" aria-label={stages[stage].label}>
      <div className="wfProcessTop">
        <span className="wfProcessBrand">W <span>WUNIFLOW / SOLUÇÕES DIGITAIS</span></span>
        <span className="wfProcessDemo">ILUSTRAÇÃO CONCEITUAL</span>
      </div>
      <div className="wfProcessViewport">
        {stage === 0 && <div className="wfProcessLayer isActive">
          <div className="wfProcessPanel wfProcessIntake">
            <span className="wfProcessTag"><ClipboardList size={15}/> DIAGNÓSTICO OPERACIONAL</span>
            <h3>Como sua operação funciona hoje?</h3>
            <div className="wfProcessField"><span>Solicitações em mensagens</span><span className="wfProcessPill">DESCONECTADO</span></div>
            <div className="wfProcessField"><span>Controles em planilhas</span><span className="wfProcessPill">MANUAL</span></div>
            <div className="wfProcessField"><span>Dados de diferentes equipes</span><span className="wfProcessPill">DISPERSOS</span></div>
            <div className="wfProcessInsight"><CheckCircle2 size={16}/> Mapeamento de processos e oportunidades</div>
          </div>
          <div className="wfProcessSideNote"><MapPin size={17}/><span>CAMPO</span><i/><ClipboardList size={17}/><span>GESTÃO</span><i/><Database size={17}/><span>DADOS</span></div>
        </div>}
        {stage === 1 && <div className="wfProcessLayer isActive">
          <div className="wfProcessSystemLabel"><Workflow size={16}/> ARQUITETURA INTEGRADA</div>
          <div className="wfProcessFlow">
            <div className="wfProcessNode"><Code2 size={25}/><b>Plataforma</b><small>Sites, SaaS e apps</small></div>
            <span className="wfProcessConnector"><ArrowRight size={22}/></span>
            <div className="wfProcessNode"><GitBranch size={25}/><b>Integrações</b><small>APIs e workflows</small></div>
            <span className="wfProcessConnector"><ArrowRight size={22}/></span>
            <div className="wfProcessNode"><Bot size={25}/><b>Automação + IA</b><small>Fluxos inteligentes</small></div>
          </div>
          <div className="wfProcessInsight"><CheckCircle2 size={16}/> Sistemas conectados, menos retrabalho</div>
        </div>}
        {stage === 2 && <div className="wfProcessLayer isActive">
          <div className="wfProcessDashboard">
            <div className="wfProcessDashboardTitle"><span><LayoutDashboard size={17}/> Visão operacional</span><small>PAINEL ILUSTRATIVO</small></div>
            <div className="wfProcessKpis">
              <div><MapPin size={17}/><span>Equipes e campo</span><b>Acompanhamento</b></div>
              <div><Workflow size={17}/><span>Fluxos integrados</span><b>Visibilidade</b></div>
              <div><BarChart3 size={17}/><span>Indicadores</span><b>Decisão</b></div>
            </div>
            <div className="wfProcessBars" aria-label="Gráfico ilustrativo, sem dados reais">
              {[40,65,55,78,70,91,80,100].map((height,index) => <span key={index} style={{height: height+'%'}} />)}
            </div>
            <div className="wfProcessInsight"><CheckCircle2 size={16}/> Dados organizados para acompanhamento</div>
          </div>
        </div>}
      </div>
      <div className="wfProcessBottom"><span>ESTRATÉGIA</span><span>TECNOLOGIA</span><span>RESULTADOS</span></div>
    </div>
  );
}

export default function ScrollStory() {
  const cards = React.useRef<(HTMLElement | null)[]>([]);
  const [visible, setVisible] = React.useState<boolean[]>([false,false,false]);
  const [motionEnabled, setMotionEnabled] = React.useState(false);

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
