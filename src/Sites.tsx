import React from 'react';
import './sites.css';
import {ArrowLeft,ArrowRight,CheckCircle2,Globe2,LayoutTemplate,Palette,PlugZap,Rocket,FileText,MessageCircle,Sparkles} from 'lucide-react';

type State={
  tipo:string; objetivo:string; segmento:string; estrutura:string[]; estilo:string; recursos:string[];
  textos:string; imagens:string; dominio:string; prazo:string; nome:string; empresa:string; whatsapp:string; email:string; observacoes:string;
};

const basePrices:Record<string,number|null>={
  'Landing Page':1490,'Site Institucional':2490,'Catálogo Digital':2290,'Loja Virtual':null,'Projeto Personalizado':null
};
const extraPrices:Record<string,number>={
  'Blog':450,'Agendamento':490,'SEO':390,'Analytics + Pixel':290,'Área administrativa':850,'Chat com IA':790,'Integração CRM':0,'Pagamento online':0,'Multi-idioma':0
};
const projectTypes=[
  ['Landing Page','Uma página focada em conversão e captação.'],
  ['Site Institucional','Apresente sua empresa, serviços e diferenciais.'],
  ['Catálogo Digital','Produtos ou serviços organizados sem checkout.'],
  ['Loja Virtual','Venda online com pagamentos e operação.'],
  ['Projeto Personalizado','Quando o escopo precisa ser desenhado sob medida.']
];
const objectives=['Receber contatos','Apresentar minha empresa','Vender produtos','Agendar serviços','Captar leads','Mostrar portfólio'];
const styles=['Minimalista Premium','Corporativo Moderno','Tecnológico','Criativo','Luxo'];
const resources=['Blog','Agendamento','SEO','Analytics + Pixel','Área administrativa','Chat com IA','Integração CRM','Pagamento online','Multi-idioma'];

export default function Sites(){
  const[step,setStep]=React.useState(0);
  const[sending,setSending]=React.useState(false);
  const[done,setDone]=React.useState(false);
  const[error,setError]=React.useState('');
  const[s,setS]=React.useState<State>({tipo:'Landing Page',objetivo:'Receber contatos',segmento:'',estrutura:[],estilo:'Minimalista Premium',recursos:[],textos:'Tenho',imagens:'Tenho',dominio:'Ainda não tenho',prazo:'',nome:'',empresa:'',whatsapp:'',email:'',observacoes:''});
  const update=<K extends keyof State>(k:K,v:State[K])=>setS(x=>({...x,[k]:v}));
  const toggle=(k:'estrutura'|'recursos',v:string)=>update(k,s[k].includes(v)?s[k].filter(x=>x!==v):[...s[k],v]);
  const base=basePrices[s.tipo];
  const extras=s.recursos.reduce((sum,r)=>sum+(extraPrices[r]||0),0);
  const sobConsulta=base===null||s.recursos.some(r=>extraPrices[r]===0);
  const total=(base||0)+extras;
  const estimate=sobConsulta?'Sob consulta':total.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const steps=['Projeto','Estrutura','Visual','Recursos','Operação','Resumo'];
  const canContinue=step===0?!!s.tipo:step===1?!!s.objetivo:step===2?!!s.estilo:step===4?!!s.prazo:true;

  async function submit(){
    if(!s.nome||!s.whatsapp){setError('Informe seu nome e WhatsApp para receber a proposta.');return}
    setSending(true);setError('');
    try{
      const r=await fetch('/api/site-leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...s,estimativa:sobConsulta?null:total,origem:'Wuniflow Sites',pagina:window.location.href,submissionId:crypto.randomUUID()})});
      if(!r.ok) throw new Error();
      setDone(true);
    }catch{setError('Não foi possível registrar sua solicitação agora. Tente novamente.')}
    finally{setSending(false)}
  }
  const whatsappText=encodeURIComponent('Olá! Acabei de montar meu projeto de site na Wuniflow e gostaria de receber a proposta.');
  const whatsappHref='https://wa.me/553171348570?text='+whatsappText;

  if(done)return <div className="sitesPage"><div className="sitesDone"><CheckCircle2/><span>BRIEFING RECEBIDO</span><h1>Seu projeto já está com a Wuniflow.</h1><p>Registramos suas escolhas. Agora você pode abrir o WhatsApp com a conversa iniciada.</p><a className="sitesPrimary" href={whatsappHref} target="_blank" rel="noreferrer"><MessageCircle/> Continuar no WhatsApp</a><a href="/">Voltar para a Wuniflow</a></div></div>;

  return <div className="sitesPage">
    <header className="sitesHeader"><a className="sitesBrand" href="/"><b>W</b><span>WUNIFLOW<small>SITES</small></span></a><div><a href="/">Wuniflow</a><a href="/diagnostico">Sistemas e aplicativos</a></div></header>
    <main className="sitesShell">
      <section className="sitesHero"><div><span><Sparkles/> CRIE SEU PROJETO EM POUCOS MINUTOS</span><h1>Seu próximo site.<br/><em>Do seu jeito.</em></h1><p>Escolha o escopo, o estilo e os recursos. No final, veja uma estimativa e envie um briefing organizado para a Wuniflow.</p></div><div className="sitesHeroIcon"><Globe2/></div></section>
      <div className="sitesProgress">{steps.map((x,i)=><div className={i===step?'active':i<step?'done':''} key={x}><b>{i<step?'✓':i+1}</b><span>{x}</span></div>)}</div>
      <div className="sitesGrid">
        <section className="sitesCard">
          {step===0&&<><small>ETAPA 01 DE 06</small><h2>O que vamos criar?</h2><p>Escolha o formato que mais combina com o que você precisa hoje.</p><div className="sitesOptions">{projectTypes.map(([t,d])=><button className={s.tipo===t?'selected':''} onClick={()=>update('tipo',t)} key={t}><LayoutTemplate/><b>{t}</b><span>{d}</span><small>{basePrices[t]===null?'Sob consulta':'A partir de '+basePrices[t]!.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</small></button>)}</div><div className="sitesFields"><label>Objetivo principal<select value={s.objetivo} onChange={e=>update('objetivo',e.target.value)}>{objectives.map(x=><option key={x}>{x}</option>)}</select></label><label>Segmento da empresa<input value={s.segmento} onChange={e=>update('segmento',e.target.value)} placeholder="Ex.: clínica, restaurante, consultoria..."/></label></div></>}
          {step===1&&<><small>ETAPA 02 DE 06</small><h2>Dê forma à sua ideia.</h2><p>Marque as páginas ou áreas que você imagina para o projeto.</p><div className="sitesChecks">{['Home','Sobre','Serviços','Produtos','Portfólio','Depoimentos','FAQ','Contato','Blog'].map(x=><label key={x}><input type="checkbox" checked={s.estrutura.includes(x)} onChange={()=>toggle('estrutura',x)}/><span>{x}</span></label>)}</div><label>Páginas, fluxos ou necessidades especiais<textarea rows={5} value={s.observacoes} onChange={e=>update('observacoes',e.target.value)} placeholder="Descreva o que você precisa..."/></label></>}
          {step===2&&<><small>ETAPA 03 DE 06</small><h2>Qual visual combina com você?</h2><p>Escolha uma direção. Isso não fecha o design; apenas orienta nossa proposta.</p><div className="sitesStyleGrid">{styles.map((x,i)=><button key={x} className={s.estilo===x?'selected':''} onClick={()=>update('estilo',x)}><div className={'sitesStylePreview s'+i}></div><b>{x}</b><span>Ver direção visual</span></button>)}</div></>}
          {step===3&&<><small>ETAPA 04 DE 06</small><h2>Os detalhes fazem a diferença.</h2><p>Selecione recursos extras. Alguns itens precisam de avaliação técnica.</p><div className="sitesResourceList">{resources.map(x=><label key={x}><input type="checkbox" checked={s.recursos.includes(x)} onChange={()=>toggle('recursos',x)}/><div><b>{x}</b><span>{extraPrices[x]===0?'Sob consulta':'+'+extraPrices[x].toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span></div></label>)}</div></>}
          {step===4&&<><small>ETAPA 05 DE 06</small><h2>Vamos preparar o próximo passo.</h2><div className="sitesFields"><label>Textos do site<select value={s.textos} onChange={e=>update('textos',e.target.value)}><option>Tenho</option><option>Preciso de ajuda</option><option>Quero que a Wuniflow produza</option></select></label><label>Fotos e imagens<select value={s.imagens} onChange={e=>update('imagens',e.target.value)}><option>Tenho</option><option>Banco de imagens</option><option>Preciso produzir</option></select></label><label>Domínio<select value={s.dominio} onChange={e=>update('dominio',e.target.value)}><option>Já tenho</option><option>Ainda não tenho</option><option>Não sei</option></select></label><label>Quando gostaria de colocar no ar?<select value={s.prazo} onChange={e=>update('prazo',e.target.value)}><option value="">Selecione</option><option>O quanto antes</option><option>Até 15 dias</option><option>Até 30 dias</option><option>30 a 60 dias</option><option>Estou pesquisando</option></select></label></div></>}
          {step===5&&<><small>ETAPA 06 DE 06</small><h2>Sua ideia, pronta para conversar.</h2><p>Deixe seus dados para registrarmos o briefing antes de abrir o WhatsApp.</p><div className="sitesSummaryBox"><div><span>Projeto</span><b>{s.tipo}</b></div><div><span>Objetivo</span><b>{s.objetivo}</b></div><div><span>Estilo</span><b>{s.estilo}</b></div><div><span>Prazo</span><b>{s.prazo||'Não informado'}</b></div></div><div className="sitesFields"><label>Seu nome *<input value={s.nome} onChange={e=>update('nome',e.target.value)}/></label><label>Empresa<input value={s.empresa} onChange={e=>update('empresa',e.target.value)}/></label><label>WhatsApp *<input value={s.whatsapp} onChange={e=>update('whatsapp',e.target.value)} placeholder="(31) 99999-9999"/></label><label>E-mail<input type="email" value={s.email} onChange={e=>update('email',e.target.value)}/></label></div>{error&&<p className="sitesError">{error}</p>}<button className="sitesPrimary sitesSubmit" onClick={submit} disabled={sending}>{sending?'Enviando...':<><FileText/> Registrar briefing e continuar</>}</button></>}
          <div className="sitesNav"><button onClick={()=>setStep(Math.max(0,step-1))} disabled={step===0}><ArrowLeft/> Voltar</button>{step<5&&<button className="sitesPrimary" disabled={!canContinue} onClick={()=>setStep(step+1)}>Continuar <ArrowRight/></button>}</div>
        </section>
        <aside className="sitesAside"><div className="sitesAsideIcon"><FileText/></div><div className="sitesAsideTitle"><b>Seu projeto, em resumo</b><span>ESTIMATIVA</span></div><dl><div><dt>Projeto</dt><dd>{s.tipo}</dd></div><div><dt>Estilo</dt><dd>{s.estilo}</dd></div><div><dt>Recursos</dt><dd>{s.recursos.length||'Nenhum extra'}</dd></div></dl><hr/><small>INVESTIMENTO ESTIMADO</small><strong>{estimate}</strong><p>{sobConsulta?'Há itens que precisam de avaliação. A proposta final confirma o investimento.':'Estimativa inicial baseada nas escolhas realizadas.'}</p><ul><li>✓ Sem cadastro para começar</li><li>✓ Briefing organizado ao final</li><li>✓ Cada detalhe pode ser ajustado</li></ul></aside>
      </div>
    </main>
  </div>
}
