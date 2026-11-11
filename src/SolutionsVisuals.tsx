import { Activity, ArrowRight, Bot, CheckCircle2, ClipboardCheck, Database, FileCheck2, GitBranch, LayoutDashboard, MessageCircle, ShieldCheck, Sparkles, Users, Workflow } from 'lucide-react';
import './SolutionsVisuals.css';

/** These are intentionally illustrative marketing previews. No employee records or live metrics. */
export function HrSystemPreview() {
  return <div className="wfsAppPreview" role="img" aria-label="Demonstração ilustrativa de interface de sistema de Faltas e Atestados, sem dados reais">
    <div className="wfsAppTop"><div className="wfsAppBrand"><span className="wfsAppBrandMark"><ClipboardCheck size={17}/></span><div><strong>Faltas & Atestados</strong><small>Gestão de pessoas</small></div></div><span className="wfsAppDemo">LAYOUT ILUSTRATIVO</span></div>
    <div className="wfsAppBody">
      <aside className="wfsAppSide" aria-hidden="true"><span className="isCurrent"><LayoutDashboard size={14}/> Painel</span><span><Users size={14}/> Equipe</span><span><FileCheck2 size={14}/> Solicitações</span><span><Activity size={14}/> Indicadores</span></aside>
      <div className="wfsAppContent">
        <div className="wfsAppIntro"><div><small>VISÃO DA OPERAÇÃO</small><h4>Painel de acompanhamento</h4></div><span><ShieldCheck size={13}/> Gestão organizada</span></div>
        <div className="wfsAppStats">
          <div><span>Colaboradores</span><Users size={16}/><strong>Visão centralizada</strong></div>
          <div><span>Solicitações</span><FileCheck2 size={16}/><strong>Fluxo de análise</strong></div>
          <div><span>Monitoramento</span><Activity size={16}/><strong>Acompanhamento</strong></div>
        </div>
        <div className="wfsAppOverview">
          <div className="wfsAppChart">
            <span>Indicadores por período <small>Exemplo visual</small></span>
            <svg viewBox="0 0 330 122" preserveAspectRatio="none" aria-hidden="true">
              <defs><linearGradient id="wfsHrChartGradient" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#aa5fbb" stopOpacity=".28"/><stop offset="1" stopColor="#aa5fbb" stopOpacity="0"/></linearGradient></defs>
              <path d="M0 24 H330 M0 57 H330 M0 91 H330" fill="none" stroke="#dfd2e5" strokeWidth="1" strokeDasharray="3 5"/>
              <path d="M0 95 C27 80 49 89 76 65 S124 87 151 48 S205 74 232 40 S283 55 330 15 V122 H0Z" fill="url(#wfsHrChartGradient)"/>
              <path d="M0 95 C27 80 49 89 76 65 S124 87 151 48 S205 74 232 40 S283 55 330 15" fill="none" stroke="#9c4fab" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="wfsAppStatus"><span>Gestão de solicitações</span><p><CheckCircle2 size={14}/> Registro organizado</p><p><CheckCircle2 size={14}/> Análise e acompanhamento</p><p><CheckCircle2 size={14}/> Relatórios operacionais</p></div>
        </div>
      </div>
    </div>
    <div className="wfsAppBottom">PRÉVIA CONCEITUAL · SEM DADOS DE COLABORADORES</div>
  </div>;
}

const stages=[
  {title:'Entrada',subtitle:'WhatsApp · Formulário',Icon:MessageCircle,kind:'01'},
  {title:'IA e triagem',subtitle:'Entende e classifica',Icon:Bot,kind:'02'},
  {title:'Automação',subtitle:'Orquestra processos',Icon:Workflow,kind:'03'},
  {title:'Registro',subtitle:'CRM · Dados · Equipe',Icon:Database,kind:'04'}
] as const;

export function AutomationFlowPreview() {
  return <div className="wfsAutoSystem" role="img" aria-label="Demonstração ilustrativa de fluxo: mensagem, triagem por IA, automação e registro no CRM">
    <div className="wfsAutoTop"><div><span className="wfsAutoTopIcon"><GitBranch size={18}/></span><strong>Fluxo de atendimento inteligente</strong></div><span className="wfsAutoTopTag"><span/> ARQUITETURA ILUSTRATIVA</span></div>
    <div className="wfsAutoHero"><div><span className="wfsAutoEyebrow"><Sparkles size={13}/> INTELIGÊNCIA APLICADA</span><h4>Uma conversa.<br/><em>Um processo conectado.</em></h4><p>Atendimento, decisões e registro no mesmo fluxo.</p></div><div className="wfsAutoSeal"><Bot size={32}/><span>IA + AUTOMAÇÃO</span></div></div>
    <div className="wfsAutoFlow">
      {stages.map((stage,i)=><div className="wfsAutoFlowUnit" key={stage.kind}>
        <div className={'wfsAutoNode wfsAutoNode'+i}>
          <span className="wfsAutoNodeCode">{stage.kind} / 04</span>
          <span className="wfsAutoNodeIcon"><stage.Icon size={23}/></span>
          <strong>{stage.title}</strong>
          <small>{stage.subtitle}</small>
        </div>
        {i<stages.length-1&&<div className="wfsAutoJoin" aria-hidden="true"><span/><ArrowRight size={15}/></div>}
      </div>)}
    </div>
    <div className="wfsAutoBottom"><div><span className="wfsAutoBottomDot"/><div><strong>Atendimento com contexto</strong><small>Encaminhamento para sua equipe quando necessário</small></div></div><span><ShieldCheck size={15}/> CONTROLE HUMANO</span></div>
    <div className="wfsAutoDisclaimer">EXEMPLO DE ARQUITETURA · NÃO REPRESENTA UMA EXECUÇÃO EM TEMPO REAL</div>
  </div>;
}
