import React from 'react';
import { ArrowRight, BarChart3, Bot, CheckCircle2, ClipboardList, Code2, Database, GitBranch, LayoutDashboard, MapPin, Workflow } from 'lucide-react';
import './scroll-story.css';

// Uma representação conceitual da entrega WuniFlow, não dados reais de clientes.
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
        <div className="wfProcessLayers" aria-hidden="true">
          <div className={'wfProcessLayer' + (stage === 0 ? ' isActive' : '')}>
            <div className="wfProcessPanel wfProcessIntake">
              <span className="wfProcessTag"><ClipboardList size={15}/> DIAGNÓSTICO</span>
              <h3>Como sua operação funciona hoje?</h3>
              <div className="wfProcessField"><span>Solicitações em mensagens</span><span className="wfProcessPill">DESCONECTADO</span></div>
              <div className="wfProcessField"><span>Controles em planilhas</span><span className="wfProcessPill">MANUAL</span></div>
              <div className="wfProcessField"><span>Dados de diferentes equipes</span><span className="wfProcessPill">DISPERSOS</span></div>
              <div className="wfProcessInsight"><CheckCircle2 size={16}/> Mapeamento de processos e oportunidades</div>
            </div>
            <div className="wfProcessSideNote"><MapPin size={17}/><span>CAMPO</span><i/><ClipboardList size={17}/><span>GESTÃO</span><i/><Database size={17}/><span>DADOS</span></div>
          </div>
          <div className={'wfProcessLayer' + (stage === 1 ? ' isActive' : '')}>
            <div className="wfProcessSystemLabel"><Workflow size={16}/> ARQUITETURA INTEGRADA</div>
            <div className="wfProcessFlow">
              <div className="wfProcessNode"><Code2 size={25}/><b>Plataforma</b><small>Site, SaaS ou app</small></div>
              <span className="wfProcessConnector"><ArrowRight size={22}/></span>
              <div className="wfProcessNode"><GitBranch size={25}/><b>Integrações</b><small>APIs e workflows</small></div>
              <span className="wfProcessConnector"><ArrowRight size={22}/></span>
              <div className="wfProcessNode"><Bot size={25}/><b>Automação + IA</b><small>Fluxos inteligentes</small></div>
            </div>
            <div className="wfProcessInsight"><CheckCircle2 size={16}/> Processos conectados sem retrabalho</div>
          </div>
          <div className={'wfProcessLayer' + (stage === 2 ? ' isActive' : '')}>
            <div className="wfProcessDashboard">
              <div className="wfProcessDashboardTitle"><span><LayoutDashboard size={17}/> Visão operacional</span><small>PAINEL ILUSTRATIVO</small></div>
              <div className="wfProcessKpis">
                <div><MapPin size={17}/><span>Equipes e campo</span><b>Acompanhamento</b></div>
                <div><Workflow size={17}/><span>Fluxos integrados</span><b>Visibilidade</b></div>
                <div><BarChart3 size={17}/><span>Indicadores</span><b>Decisão</b></div>
              </div>
              <div className="wfProcessBars" aria-label="Representação decorativa de visualização de indicadores">
                {[40,65,55,78,70,91,80,100].map((height,index) => <span key={index} style={{height: height+'%'}} />)}
              </div>
              <div className="wfProcessInsight"><CheckCircle2 size={16}/> Dados organizados para acompanhamento</div>
            </div>
          </div>
        </div>
      </div>
      <div className="wfProcessBottom"><span>ESTRATÉGIA</span><span>TECNOLOGIA</span><span>RESULTADOS</span></div>
    </div>
  );
}

// O arquivo é servido apenas no ambiente onde estiver publicado.
const VIDEO_SRC = '/cinematic/wuniflow-scroll.mp4';

function VideoVisual({ progress }: { progress: number }) {
  const ref = React.useRef<HTMLVideoElement>(null);
  const desired = React.useRef(0);
  const [ready, setReady] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  const seekToScroll = React.useCallback(() => {
    const video = ref.current;
    if (!video || !ready || video.seeking || !Number.isFinite(video.duration) || video.duration <= 0) return;
    const target = Math.min(Math.max(0, desired.current), Math.max(0, video.duration - .045));
    if (Math.abs(video.currentTime - target) > .04) {
      try { video.currentTime = target; } catch { setFailed(true); }
    }
  }, [ready]);

  React.useEffect(() => {
    const video = ref.current;
    if (!video || !ready) return;
    desired.current = progress * video.duration;
    seekToScroll();
  }, [progress, ready, seekToScroll]);

  return (
    <div className="wfFilmShell">
      <div className="wfFilmScreen">
        <video ref={ref} className={'wfFilmVideo'+(ready&&!failed?' wfFilmReady':'')}
          src={VIDEO_SRC} playsInline muted preload="auto" aria-label="Vídeo ilustrativo dos serviços da WuniFlow"
          onLoadedMetadata={() => { setReady(true); ref.current?.pause(); }}
          onSeeked={seekToScroll}
          onError={() => setFailed(true)}
        />
        {(!ready || failed) && <ProcessVisual stage={Math.min(stages.length-1,Math.floor(progress*stages.length))}/>}
      </div>
      <div className="wfFilmCaption">
        <span>WUNIFLOW AUTOMATIONS</span><span>{ready&&!failed?'VÍDEO INTERATIVO · CONTROLE POR ROLAGEM':'NARRATIVA VISUAL · SISTEMAS E AUTOMAÇÃO'}</span>
      </div>
    </div>
  );
}

export default function ScrollStory() {
  const section = React.useRef<HTMLElement>(null);
  const [progress,setProgress] = React.useState(0);
  const [reduced,setReduced] = React.useState(true);
  const [desktop,setDesktop] = React.useState(false);

  React.useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const wideQuery = window.matchMedia('(min-width: 850px)');
    const sync = () => {setReduced(motionQuery.matches);setDesktop(wideQuery.matches)};
    sync();
    motionQuery.addEventListener('change',sync);
    wideQuery.addEventListener('change',sync);
    return () => {motionQuery.removeEventListener('change',sync);wideQuery.removeEventListener('change',sync)};
  }, []);

  React.useEffect(() => {
    if (!desktop || reduced) {setProgress(0);return};
    let frame = 0;
    const recalc = () => {
      frame=0;
      const node=section.current;
      if(!node)return;
      const rect=node.getBoundingClientRect();
      const distance=Math.max(1,rect.height-window.innerHeight);
      const value=Math.min(1,Math.max(0,-rect.top/distance));
      setProgress(previous=>Math.abs(previous-value)>.003?value:previous);
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(recalc)};
    recalc();
    window.addEventListener('scroll',schedule,{passive:true});
    window.addEventListener('resize',schedule);
    return ()=>{window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);if(frame)cancelAnimationFrame(frame)};
  },[desktop,reduced]);

  // Exibe as três etapas sem altura artificial enquanto o vídeo é apresentado no Hero.
  const animated=false;
  const active=animated?Math.min(stages.length-1,Math.floor(progress*stages.length)):0;
  return (
    <section ref={section} className={'wfStory'+(animated?' wfStoryAnimated':'')} aria-label="Da estratégia aos sistemas e dashboards da WuniFlow">
      <div className="wfStorySticky">
        <div className="wfStoryContainer">
          <div className="wfStoryHeading"><span>COMO A WUNIFLOW TRANSFORMA NEGÓCIOS</span><strong>PROCESSO → TECNOLOGIA → DECISÃO</strong></div>
          {animated ? (
            <div className="wfStoryGrid">
              <div className="wfStoryCopy">
                <span className="wfStoryIndex">{stages[active].kicker}</span>
                <h2 key={'h'+active}>{stages[active].title}</h2>
                <p key={'p'+active}>{stages[active].description}</p>
                <a className="wfStoryLink" href="/diagnostico">Quero digitalizar minha operação <ArrowRight size={18}/></a>
                <div className="wfStorySteps" aria-label="Etapas do processo">
                  {stages.map((item,index)=><span key={item.kicker} className={index===active?'isActive':''}>{'0'+(index+1)}</span>)}
                </div>
              </div>
              <VideoVisual progress={progress}/>
            </div>
          ) : (
            <div className="wfStoryMobile">
              {stages.map((stage,index)=><div className="wfStoryMobileStage" key={stage.kicker}>
                <div className="wfStoryCopy"><span className="wfStoryIndex">{stage.kicker}</span><h2>{stage.title}</h2><p>{stage.description}</p></div>
                <ProcessVisual stage={index}/>
              </div>)}
              <a className="wfStoryLink" href="/diagnostico">Quero digitalizar minha operação <ArrowRight size={18}/></a>
            </div>
          )}
          {animated&&<div className="wfStoryProgress" aria-hidden="true"><span style={{transform:'scaleX('+progress+')'}}/></div>}
        </div>
      </div>
    </section>
  );
}
