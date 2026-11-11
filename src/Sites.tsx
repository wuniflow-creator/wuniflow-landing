import React from 'react';
import './sites.css';
import {ArrowLeft,ArrowRight,Building2,CheckCircle2,Clock3,FileText,Headphones,LayoutTemplate,MessageCircle,PackageOpen,PanelsTopLeft,ShieldCheck,ShoppingCart,SlidersHorizontal,Sparkles,Zap} from 'lucide-react';

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

const sitePortfolioExamples=[
  {name:'HI TECH',segment:'ESTÉTICA AUTOMOTIVA',headline:'Sites que valorizam o seu negócio.',description:'Design, presença e conversão para marcas que querem se destacar.',image:'/assets/portfolio-hi-tech.jpg',alt:'Captura real da landing page HI TECH, projeto de estética automotiva',url:'https://hi-tech-alpha.vercel.app'},
  {name:'Barbearia Quaresma',segment:'SERVIÇOS E AGENDAMENTO',headline:'Sua marca com presença profissional.',description:'Projetos pensados para apresentar serviços e facilitar contatos.',image:'/assets/portfolio-barbearia-quaresma.jpg',alt:'Captura real do site Barbearia Quaresma',url:'https://barbearia-quaresma.vercel.app/'},
  {name:'NYX Tarot',segment:'EXPERIÊNCIA DIGITAL',headline:'Uma experiência com identidade própria.',description:'Cada negócio pode ter uma vitrine digital com personalidade.',image:'/assets/portfolio-nyx-tarot.jpg',alt:'Captura real do site NYX Tarot',url:'https://nyx-tarot.lovable.app'}
] as const;


export default function Sites(){
  // SEO is rendered in route-specific HTML at build time (scripts/generate-seo.mjs).
  const[sitePortfolioIndex,setSitePortfolioIndex]=React.useState(0);
  const[portfolioAutoplay,setPortfolioAutoplay]=React.useState(()=>typeof window!=='undefined'&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const[portfolioInView,setPortfolioInView]=React.useState(false);
  const portfolioRef=React.useRef<HTMLDivElement|null>(null);
  const touchStartX=React.useRef<number|null>(null);
  React.useEffect(()=>{
    const node=portfolioRef.current;
    if(!node||typeof IntersectionObserver==='undefined'){setPortfolioInView(true);return}
    const observer=new IntersectionObserver(entries=>setPortfolioInView(Boolean(entries[0]?.isIntersecting)),{threshold:0.3});
    observer.observe(node);
    return ()=>observer.disconnect();
  },[]);
  React.useEffect(()=>{
    if(!portfolioAutoplay||!portfolioInView)return;
    const id=window.setInterval(()=>{
      if(document.visibilityState==='visible')setSitePortfolioIndex(i=>(i+1)%sitePortfolioExamples.length);
    },6500);
    return ()=>window.clearInterval(id);
  },[portfolioAutoplay,portfolioInView]);
  const selectPortfolio=(index:number)=>{setPortfolioAutoplay(false);setSitePortfolioIndex((index+sitePortfolioExamples.length)%sitePortfolioExamples.length)};
  const portfolio=sitePortfolioExamples[sitePortfolioIndex];
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
  const validStep=(index:number)=>index===0?!!s.tipo:index===1?!!s.objetivo:index===2?!!s.estilo:index===4?!!s.prazo:true;
  const canContinue=validStep(step);
  const goToStep=(target:number)=>{
    if(target<0||target>=steps.length)return;
    setStep(target);setError('');
    document.getElementById('sites-configurador')?.scrollIntoView({behavior:'smooth',block:'start'});
  };
  const continueStep=()=>{
    if(step>=steps.length-1||!canContinue)return;
    const next=step+1;
    setStep(next);setError('');
    document.getElementById('sites-configurador')?.scrollIntoView({behavior:'smooth',block:'start'});
  };

  async function submit(){
    if(!s.prazo){setStep(4);setError('Informe quando gostaria de colocar o projeto no ar.');document.getElementById('sites-configurador')?.scrollIntoView({behavior:'smooth',block:'start'});return}
    if(!s.nome.trim()||!s.whatsapp.trim()){setError('Informe seu nome e WhatsApp para receber a proposta.');return}
    setSending(true);setError('');
    try{
      const r=await fetch('/api/site-leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...s,estimativa:sobConsulta?null:total,origem:'Wuniflow Sites',pagina:window.location.href,submissionId:crypto.randomUUID()})});
      if(!r.ok) throw new Error();
      setDone(true);
    }catch{setError('Não foi possível registrar sua solicitação agora. Tente novamente.')}
    finally{setSending(false)}
  }
  // O clique abre WhatsApp; o visitante precisa enviar a mensagem para acionar Evolution → n8n.
  const whatsappMessage=done
    ? 'Olá! Vim pelo configurador de soluções digitais da WuniFlow. Meu briefing já foi registrado. Tipo de projeto: '+s.tipo+'. Objetivo: '+s.objetivo+'. Gostaria de receber orientação sobre a proposta.'
    : 'Olá! Vim pelo configurador de soluções digitais da WuniFlow. Tenho interesse em '+s.tipo+'. Meu objetivo é '+s.objetivo+'. Gostaria de orientação para meu projeto.';
  const whatsappHref='https://wa.me/5561981240476?text='+encodeURIComponent(whatsappMessage);

  if(done)return <div className="sitesPage"><div className="sitesDone"><CheckCircle2/><span>BRIEFING RECEBIDO</span><h1>Seu projeto já está com a Wuniflow.</h1><p>Registramos suas escolhas. Agora você pode abrir o WhatsApp com a conversa iniciada.</p><a className="sitesPrimary" href={whatsappHref} target="_blank" rel="noreferrer"><MessageCircle/> Continuar no WhatsApp</a><a href="/">Voltar para a Wuniflow</a></div></div>;

  return <div className="sitesPage">
    <header className="sitesHeader"><div className="sitesHeaderInner"><a className="sitesBrand" href="/"><b>W</b><span>WUNIFLOW<small>SITES</small></span></a><a className="sitesMobileHome" href="/" aria-label="Ir para a página inicial da Wuniflow">← Página inicial</a><nav className="sitesTopNav"><a className="sitesHomeLink" href="/" aria-label="Voltar para a página principal da Wuniflow"><span className="sitesHomeLong">← Página principal</span><span className="sitesHomeShort">← Página inicial</span></a><a href="/diagnostico">Sistemas e aplicativos</a><span></span><a className="sitesExpertCta" href={whatsappHref} target="_blank" rel="noreferrer"><MessageCircle/><span className="sitesExpertLong">Fale com um especialista</span><span className="sitesExpertShort">Especialista</span></a></nav></div></header>
    <main className="sitesShell">
      <section className="sitesHero">
        <div className="sitesHeroCopy">
          <span className="sitesEyebrow"><Sparkles/> CRIE SEU PROJETO EM POUCOS MINUTOS</span>
          <h1>Seu próximo site.<br/><em>Do seu jeito.</em></h1>
          <p>Escolha o escopo, o estilo e os recursos. No final, veja uma estimativa e envie um briefing organizado para a Wuniflow.</p>
          <a className="sitesHeroCta" href="#sites-configurador">Montar meu site <ArrowRight/></a>
          <div className="sitesTrustRow">
            <div><i><Zap/></i><span><b>Briefing</b><small>organizado</small></span></div>
            <div><i><Clock3/></i><span><b>Estimativa</b><small>rápida</small></span></div>
            <div><i><ShieldCheck/></i><span><b>Sem</b><small>compromisso</small></span></div>
            <div><i><PanelsTopLeft/></i><span><b>Projeto</b><small>sob medida</small></span></div>
          </div>
        </div>
        <div className="sitesShowcase sitesRealShowcase" ref={portfolioRef} aria-roledescription="carrossel" aria-label="Portfólio real de sites desenvolvidos">
          <div className="sitesRealWindow">
            <div className="sitesRealBrowserBar"><span className="sitesRealDots" aria-hidden="true"><i/><i/><i/></span><span className="sitesRealDomain">PROJETOS REAIS · WUNIFLOW</span><span className="sitesRealBrand">W</span></div>
            <div className="sitesRealScene"
              onTouchStart={e=>{touchStartX.current=e.touches[0]?.clientX??null}}
              onTouchEnd={e=>{if(touchStartX.current===null)return;const dx=(e.changedTouches[0]?.clientX??touchStartX.current)-touchStartX.current;touchStartX.current=null;if(Math.abs(dx)>45)selectPortfolio(sitePortfolioIndex+(dx<0?1:-1))}}
            >
              <img key={portfolio.image} src={portfolio.image} alt={portfolio.alt} width={1366} height={768} loading={sitePortfolioIndex===0?'eager':'lazy'} fetchPriority={sitePortfolioIndex===0?'high':'auto'} decoding="async" />
              <div className="sitesRealShade" aria-hidden="true"/>
              <div className="sitesRealText">
                <span className="sitesRealEyebrow">{portfolio.segment}</span>
                <h3>{portfolio.headline}</h3>
                <p>{portfolio.description}</p>
                <span className="sitesRealProjectName">PROJETO REAL <b>{portfolio.name}</b></span>
                <div className="sitesRealActions">
                  <a className="sitesRealPrimary" href="#sites-configurador">Quero um site assim <ArrowRight size={16}/></a>
                  <a className="sitesRealExternal" href={portfolio.url} target="_blank" rel="noopener noreferrer">Ver projeto <ArrowRight size={14}/></a>
                </div>
              </div>
            </div>
            <div className="sitesRealControls" aria-label="Controles da vitrine">
              <span>PROJETOS QUE INSPIRAM</span>
              <div className="sitesRealPagination" role="group" aria-label="Selecionar projeto">{sitePortfolioExamples.map((example,i)=><button key={example.name} type="button" className={i===sitePortfolioIndex?'isActive':''} aria-label={`Visualizar projeto ${example.name}`} aria-current={i===sitePortfolioIndex?'true':undefined} onClick={()=>selectPortfolio(i)}>{i+1}</button>)}</div>
              <button type="button" className="sitesRealPause" aria-label={portfolioAutoplay?'Pausar troca automática':'Retomar troca automática'} onClick={()=>setPortfolioAutoplay(value=>!value)}>{portfolioAutoplay?'Pausar':'Reproduzir'}</button>
            </div>
          </div>
        </div>
      </section>
      <nav className="sitesProgress" id="sites-configurador" aria-label="Etapas de configuração do site">{steps.map((x,i)=><button type="button" className={i===step?'active':i<step?'done':''} key={x} onClick={()=>goToStep(i)} aria-current={i===step?'step':undefined} aria-label={`Ir para etapa ${i+1} de ${steps.length}: ${x}`}><b aria-hidden="true">{i<step?'✓':i+1}</b><span className="sitesStepLong">{x}</span><span className="sitesStepShort">{['Proj.','Estr.','Visual','Extras','Oper.','Resumo'][i]}</span></button>)}</nav>
      <div className="sitesGrid">
        <section className="sitesCard">
          {step===0&&<><small>ETAPA 01 DE 06</small><h2>O que vamos criar?</h2><p>Escolha o formato que mais combina com o que você precisa hoje.</p><div className="sitesOptions">{projectTypes.map(([t,d])=><button className={s.tipo===t?'selected':''} onClick={()=>update('tipo',t)} key={t}><div className="sitesOptionTop"><i>{t==='Landing Page'?<LayoutTemplate/>:t==='Site Institucional'?<Building2/>:t==='Catálogo Digital'?<PackageOpen/>:t==='Loja Virtual'?<ShoppingCart/>:<SlidersHorizontal/>}</i><span className="sitesOptionRadio">{s.tipo===t?'✓':''}</span></div><b>{t}</b><span>{d}</span><small>{basePrices[t]===null?'Sob consulta':'A partir de '+basePrices[t]!.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</small></button>)}</div><div className="sitesFields"><label>Objetivo principal<select value={s.objetivo} onChange={e=>update('objetivo',e.target.value)}>{objectives.map(x=><option key={x}>{x}</option>)}</select></label><label>Segmento da empresa<input value={s.segmento} onChange={e=>update('segmento',e.target.value)} placeholder="Ex.: clínica, restaurante, consultoria..."/></label></div></>}
          {step===1&&<><small>ETAPA 02 DE 06</small><h2>Dê forma à sua ideia.</h2><p>Marque as páginas ou áreas que você imagina para o projeto.</p><div className="sitesChecks">{['Home','Sobre','Serviços','Produtos','Portfólio','Depoimentos','FAQ','Contato','Blog'].map(x=><label key={x}><input type="checkbox" checked={s.estrutura.includes(x)} onChange={()=>toggle('estrutura',x)}/><span>{x}</span></label>)}</div><label>Páginas, fluxos ou necessidades especiais<textarea rows={5} value={s.observacoes} onChange={e=>update('observacoes',e.target.value)} placeholder="Descreva o que você precisa..."/></label></>}
          {step===2&&<><small>ETAPA 03 DE 06</small><h2>Qual visual combina com você?</h2><p>Escolha uma direção. Isso não fecha o design; apenas orienta nossa proposta.</p><div className="sitesStyleGrid">{styles.map((x,i)=><button key={x} className={s.estilo===x?'selected':''} onClick={()=>update('estilo',x)}><div className={'sitesStylePreview s'+i}></div><b>{x}</b><span>Ver direção visual</span></button>)}</div></>}
          {step===3&&<><small>ETAPA 04 DE 06</small><h2>Os detalhes fazem a diferença.</h2><p>Selecione recursos extras. Alguns itens precisam de avaliação técnica.</p><div className="sitesResourceList">{resources.map(x=><label key={x}><input type="checkbox" checked={s.recursos.includes(x)} onChange={()=>toggle('recursos',x)}/><div><b>{x}</b><span>{extraPrices[x]===0?'Sob consulta':'+'+extraPrices[x].toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span></div></label>)}</div></>}
          {step===4&&<><small>ETAPA 05 DE 06</small><h2>Vamos preparar o próximo passo.</h2><div className="sitesFields"><label>Textos do site<select value={s.textos} onChange={e=>update('textos',e.target.value)}><option>Tenho</option><option>Preciso de ajuda</option><option>Quero que a Wuniflow produza</option></select></label><label>Fotos e imagens<select value={s.imagens} onChange={e=>update('imagens',e.target.value)}><option>Tenho</option><option>Banco de imagens</option><option>Preciso produzir</option></select></label><label>Domínio<select value={s.dominio} onChange={e=>update('dominio',e.target.value)}><option>Já tenho</option><option>Ainda não tenho</option><option>Não sei</option></select></label><label>Quando gostaria de colocar no ar?<select value={s.prazo} onChange={e=>update('prazo',e.target.value)}><option value="">Selecione</option><option>O quanto antes</option><option>Até 15 dias</option><option>Até 30 dias</option><option>30 a 60 dias</option><option>Estou pesquisando</option></select></label></div>{error&&<p className="sitesError" role="alert">{error}</p>}</>}
          {step===5&&<><small>ETAPA 06 DE 06</small><h2>Sua ideia, pronta para conversar.</h2><p>Deixe seus dados para registrarmos o briefing antes de abrir o WhatsApp.</p><div className="sitesSummaryBox"><div><span>Projeto</span><b>{s.tipo}</b></div><div><span>Objetivo</span><b>{s.objetivo}</b></div><div><span>Estilo</span><b>{s.estilo}</b></div><div><span>Prazo</span><b>{s.prazo||'Não informado'}</b></div></div><div className="sitesFields"><label>Seu nome *<input value={s.nome} onChange={e=>update('nome',e.target.value)}/></label><label>Empresa<input value={s.empresa} onChange={e=>update('empresa',e.target.value)}/></label><label>WhatsApp *<input value={s.whatsapp} onChange={e=>update('whatsapp',e.target.value)} placeholder="(31) 99999-9999"/></label><label>E-mail<input type="email" value={s.email} onChange={e=>update('email',e.target.value)}/></label></div>{error&&<p className="sitesError">{error}</p>}<button className="sitesPrimary sitesSubmit" onClick={submit} disabled={sending}>{sending?'Enviando...':<><FileText/> Registrar briefing e continuar</>}</button></>}
          <div className="sitesNav"><button onClick={()=>goToStep(step-1)} disabled={step===0}><ArrowLeft/> Voltar</button>{step<5&&<button className="sitesPrimary" disabled={!canContinue} onClick={continueStep}>Continuar <ArrowRight/></button>}</div>
        </section>
        <aside className="sitesAside"><div className="sitesAsideHead"><div className="sitesAsideIcon"><FileText/></div><div className="sitesAsideTitle"><b>Seu projeto, em resumo</b><span>ESTIMATIVA</span></div></div><dl><div><dt>Projeto</dt><dd>{s.tipo}</dd></div><div><dt>Estilo</dt><dd>{s.estilo}</dd></div><div><dt>Recursos</dt><dd>{s.recursos.length||'Nenhum extra'}</dd></div></dl><hr/><small>INVESTIMENTO ESTIMADO</small><strong>{estimate}</strong><p>{sobConsulta?'Há itens que precisam de avaliação. A proposta final confirma o investimento.':'Estimativa inicial baseada nas escolhas realizadas. O valor final pode variar conforme o briefing.'}</p><ul><li>✓ Sem compromisso para começar</li><li>✓ Briefing organizado ao final</li><li>✓ Resposta consultiva da nossa equipe</li><li>✓ Cada detalhe pode ser ajustado</li></ul><a className="sitesAsideHelp" href={whatsappHref} target="_blank" rel="noreferrer"><Headphones/><span><b>Dúvidas? Fale com um especialista.</b><small>Receba orientação personalizada.</small></span><ArrowRight/></a></aside>
      </div>
    </main>
  </div>
}
