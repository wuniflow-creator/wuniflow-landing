import React from 'react';
import {AlertTriangle,ArrowLeft,Eye,EyeOff,Flame,History,MessageCircle,Save,Search,ShieldCheck,Target,ThermometerSun,TimerReset,TrendingUp,UsersRound,WalletCards} from 'lucide-react';
import './site-admin.css';

const statusLabels:Record<string,string>={novo:'Novo',contatado:'Contatado',reuniao:'Reunião',proposta:'Proposta',negociacao:'Negociação',fechado:'Fechado',perdido:'Perdido'};

function isFollowUpOverdue(x:any){
  if(!x.nextFollowUp||['fechado','perdido'].includes(x.status))return false;
  const due=new Date(x.nextFollowUp).getTime();
  return Number.isFinite(due)&&due<Date.now();
}
function isHotWithoutContact(x:any){return x.temperature==='quente'&&!x.lastInteractionAt&&!['fechado','perdido'].includes(x.status)}
function pct(part:number,total:number){return total?Math.round((part/total)*100):0}

export default function SiteAdmin(){
  const[key,setKey]=React.useState(''),[showKey,setShowKey]=React.useState(false),[data,setData]=React.useState<any>(null),[error,setError]=React.useState(''),[loading,setLoading]=React.useState(false),[query,setQuery]=React.useState(''),[temperature,setTemperature]=React.useState('todos'),[statusFilter,setStatusFilter]=React.useState('todos'),[attentionFilter,setAttentionFilter]=React.useState('todos'),[saving,setSaving]=React.useState<string|null>(null),[drafts,setDrafts]=React.useState<Record<string,{status?:string,note?:string,nextFollowUp?:string}>>({});
  async function load(){
    setLoading(true);setError('');
    try{
      let session=await fetch('/api/admin-session',{credentials:'same-origin'});
      if(!session.ok){
        if(!key)throw new Error('Informe a chave administrativa');
        const login=await fetch('/api/admin-session',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({key})});
        if(!login.ok)throw new Error('Chave administrativa inválida');
        setKey('');
      }
      const r=await fetch('/api/site-admin',{credentials:'same-origin'});const j=await r.json();
      if(!r.ok)throw new Error(j.error||'Falha ao carregar');
      setData(j);
      const init:Record<string,any>={};(j.items||[]).forEach((x:any)=>{init[x.quoteId]={status:x.status,note:'',nextFollowUp:x.nextFollowUp?String(x.nextFollowUp).slice(0,16):''}});setDrafts(init);
    }catch(e:any){setError(e.message)}finally{setLoading(false)}
  }
  React.useEffect(()=>{fetch('/api/admin-session',{credentials:'same-origin'}).then(r=>{if(r.ok)load()}).catch(()=>{})},[]);
  async function logout(){await fetch('/api/admin-session',{method:'DELETE',credentials:'same-origin'});setData(null);setKey('')}
  const setDraft=(id:string,patch:any)=>setDrafts(d=>({...d,[id]:{...(d[id]||{}),...patch}}));
  async function saveLead(x:any){
    const d=drafts[x.quoteId]||{};setSaving(x.quoteId);setError('');
    try{
      const r=await fetch('/api/site-admin',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({action:'update',quoteId:x.quoteId,status:d.status||x.status,note:d.note||'',nextFollowUp:d.nextFollowUp||''})});
      const j=await r.json();if(!r.ok)throw new Error(j.error||'Falha ao salvar');
      await load();
    }catch(e:any){setError(e.message)}finally{setSaving(null)}
  }
  function openWhatsapp(x:any){
    const url='https://wa.me/'+String(x.phone||'').replace(/\D/g,'')+'?text='+encodeURIComponent('Olá, '+x.name+'! Aqui é da Wuniflow. Recebemos seu briefing de '+x.projectType+' e quero entender os próximos passos do seu projeto.');
    window.open(url,'_blank','noopener,noreferrer');
    fetch('/api/site-admin',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({action:'interaction',kind:'whatsapp_aberto',quoteId:x.quoteId,note:'WhatsApp aberto pelo painel comercial'})}).catch(()=>{});
  }
  const allItems=data?.items||[];
  const overdueCount=allItems.filter(isFollowUpOverdue).length;
  const hotNoContactCount=allItems.filter(isHotWithoutContact).length;
  const pipeline=data?.metrics?.pipeline||{};
  const activeTotal=Math.max(0,(data?.metrics?.total||0)-(pipeline.perdido||0));
  const contactRate=pct((pipeline.contatado||0)+(pipeline.reuniao||0)+(pipeline.proposta||0)+(pipeline.negociacao||0)+(pipeline.fechado||0),data?.metrics?.total||0);
  const proposalRate=pct((pipeline.proposta||0)+(pipeline.negociacao||0)+(pipeline.fechado||0),data?.metrics?.total||0);
  const closeRate=pct(pipeline.fechado||0,activeTotal||0);
  const items=allItems.filter((x:any)=>{
    const q=query.toLowerCase();
    const match=!q||[x.name,x.company,x.phone,x.email,x.projectType,x.segment].join(' ').toLowerCase().includes(q);
    const attention=attentionFilter==='todos'||(attentionFilter==='vencidos'&&isFollowUpOverdue(x))||(attentionFilter==='quentes-sem-contato'&&isHotWithoutContact(x));
    return match&&(temperature==='todos'||x.temperature===temperature)&&(statusFilter==='todos'||x.status===statusFilter)&&attention;
  });
  return <div className="siteAdminPage"><header><a href="/"><ArrowLeft/> WUNIFLOW</a><div><a href="/admin">Projetos</a><span><ShieldCheck/> CRM DE SITES</span>{data&&<button onClick={logout}>Sair</button>}</div></header><main>
    <section className="siteAdminHero"><small>FUNIL COMERCIAL · WUNIFLOW SITES</small><h1>CRM de leads e orçamentos</h1><p>Acompanhe cada oportunidade do primeiro briefing até o fechamento, com status, notas, follow-up, histórico e alertas de prioridade comercial.</p></section>
    {!data&&<section className="siteAdminLogin"><label>Chave administrativa<div><input type={showKey?'text':'password'} value={key} onChange={e=>setKey(e.target.value)} placeholder="Chave de acesso"/><button onClick={()=>setShowKey(v=>!v)}>{showKey?<EyeOff/>:<Eye/>}</button></div></label><button className="siteAdminPrimary" disabled={!key||loading} onClick={load}>{loading?'Entrando...':'Acessar CRM'}</button>{error&&<p>{error}</p>}</section>}
    {data&&<><section className="siteAdminMetrics"><article><UsersRound/><div><small>TOTAL DE LEADS</small><strong>{data.metrics.total}</strong></div></article><article><Flame/><div><small>LEADS QUENTES</small><strong>{data.metrics.quentes}</strong></div></article><article><ThermometerSun/><div><small>MORNOS</small><strong>{data.metrics.mornos}</strong></div></article><article><WalletCards/><div><small>TICKET ESTIMADO</small><strong>{data.metrics.ticket?data.metrics.ticket.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}):'—'}</strong></div></article></section>
    <section className="siteAdminConversion"><article><Target/><div><small>TAXA DE CONTATO</small><strong>{contactRate}%</strong><span>Leads que avançaram além de Novo</span></div></article><article><TrendingUp/><div><small>CHEGARAM À PROPOSTA</small><strong>{proposalRate}%</strong><span>Proposta, negociação ou fechado</span></div></article><article><ShieldCheck/><div><small>CONVERSÃO EM FECHADO</small><strong>{closeRate}%</strong><span>Fechados sobre oportunidades não perdidas</span></div></article></section>
    <section className="siteAdminAttention"><button className={attentionFilter==='vencidos'?'active':''} onClick={()=>setAttentionFilter(attentionFilter==='vencidos'?'todos':'vencidos')}><TimerReset/><div><small>FOLLOW-UPS VENCIDOS</small><strong>{overdueCount}</strong><span>Prioridade de retorno</span></div></button><button className={attentionFilter==='quentes-sem-contato'?'active':''} onClick={()=>setAttentionFilter(attentionFilter==='quentes-sem-contato'?'todos':'quentes-sem-contato')}><AlertTriangle/><div><small>QUENTES SEM CONTATO</small><strong>{hotNoContactCount}</strong><span>Leads de alta intenção ainda sem interação</span></div></button></section>
    <section className="siteAdminPipeline">{Object.keys(statusLabels).map(s=><button key={s} className={statusFilter===s?'active':''} onClick={()=>setStatusFilter(statusFilter===s?'todos':s)}><span>{statusLabels[s]}</span><b>{pipeline[s]||0}</b></button>)}</section>
    <section className="siteAdminToolbar"><label><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar nome, empresa, telefone, projeto..."/></label><select value={temperature} onChange={e=>setTemperature(e.target.value)}><option value="todos">Todas as temperaturas</option><option value="quente">Quentes</option><option value="morno">Mornos</option><option value="frio">Frios</option></select><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="todos">Todos os status</option>{Object.keys(statusLabels).map(s=><option key={s} value={s}>{statusLabels[s]}</option>)}</select><button onClick={load} disabled={loading}>{loading?'Atualizando...':'Atualizar'}</button></section>
    {error&&<div className="siteAdminError">{error}</div>}
    <section className="siteAdminList">{items.length===0?<div className="siteAdminEmpty">Nenhum lead encontrado para os filtros atuais.</div>:items.map((x:any)=>{const d=drafts[x.quoteId]||{},overdue=isFollowUpOverdue(x),hotNoContact=isHotWithoutContact(x);return <article className={(overdue?'needsAttention ':'')+(hotNoContact?'hotNoContact':'')} key={x.quoteId||x.leadId}>
      <div className="siteAdminLeadTop"><div><span className={'temp '+x.temperature}>{x.temperature}</span><span className={'crmStatus '+x.status}>{statusLabels[x.status]||x.status}</span>{overdue&&<span className="crmAlert overdue">Follow-up vencido</span>}{hotNoContact&&<span className="crmAlert hot">Quente sem contato</span>}<small>{x.createdAt?new Date(x.createdAt).toLocaleString('pt-BR'):'—'}</small><h2>{x.name}</h2><p>{x.company||'Sem empresa informada'} · {x.segment||'Segmento não informado'}</p></div><div className="siteAdminScore"><small>SCORE</small><strong>{x.score}</strong><span>/100</span></div></div>
      <div className="siteAdminLeadGrid"><div><small>PROJETO</small><b>{x.projectType}</b><span>{x.objective}</span></div><div><small>ESTIMATIVA</small><b>{typeof x.estimate==='number'?x.estimate.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}):String(x.estimate||'Sob consulta')}</b><span>{x.deadline||'Prazo não informado'}</span></div><div><small>VISUAL / RECURSOS</small><b>{x.style||'—'}</b><span>{x.features||'Sem extras'}</span></div><div><small>CONTATO</small><b>{x.phone}</b><span>{x.email||'Sem e-mail'}</span></div></div>
      <div className="siteAdminCrmBox"><div><label>Status comercial<select value={d.status??x.status} onChange={e=>setDraft(x.quoteId,{status:e.target.value})}>{Object.keys(statusLabels).map(s=><option key={s} value={s}>{statusLabels[s]}</option>)}</select></label><label>Próximo follow-up<input type="datetime-local" value={d.nextFollowUp||''} onChange={e=>setDraft(x.quoteId,{nextFollowUp:e.target.value})}/></label></div><label>Nova nota<textarea rows={3} value={d.note||''} onChange={e=>setDraft(x.quoteId,{note:e.target.value})} placeholder="Ex.: cliente pediu retorno na terça, proposta enviada, aguardando decisão..."/></label><div className="siteAdminCrmActions"><button onClick={()=>openWhatsapp(x)}><MessageCircle/> WhatsApp</button><button className="save" disabled={saving===x.quoteId} onClick={()=>saveLead(x)}><Save/> {saving===x.quoteId?'Salvando...':'Salvar atualização'}</button></div></div>
      {(x.notes||x.lastInteractionAt||x.nextFollowUp)&&<div className="siteAdminNotes"><small>ÚLTIMO REGISTRO</small>{x.notes&&<p>{x.notes}</p>}<div className="siteAdminDates">{x.lastInteractionAt&&<span>Última interação: <b>{new Date(x.lastInteractionAt).toLocaleString('pt-BR')}</b></span>}{x.nextFollowUp&&<span className={overdue?'dateOverdue':''}>Próximo follow-up: <b>{new Date(x.nextFollowUp).toLocaleString('pt-BR')}</b></span>}</div></div>}
      <details className="siteAdminHistory"><summary><History/> Histórico ({x.history?.length||0})</summary><div>{(x.history||[]).length===0?<p>Nenhuma interação registrada ainda.</p>:(x.history||[]).map((h:any,i:number)=><article key={i}><small>{h.createdAt?new Date(h.createdAt).toLocaleString('pt-BR'):'—'} · {h.action}</small><b>{h.fromStatus!==h.toStatus?(statusLabels[h.fromStatus]||h.fromStatus)+' → '+(statusLabels[h.toStatus]||h.toStatus):(statusLabels[h.toStatus]||h.toStatus)}</b>{h.note&&<p>{h.note}</p>}</article>)}</div></details>
    </article>})}</section></>}
  </main></div>
}
