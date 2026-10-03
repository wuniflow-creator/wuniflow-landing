import React from 'react';
import {ArrowLeft,Eye,EyeOff,Flame,Search,ShieldCheck,ThermometerSun,UsersRound,WalletCards} from 'lucide-react';
import './site-admin.css';

export default function SiteAdmin(){
  const[key,setKey]=React.useState(''),[showKey,setShowKey]=React.useState(false),[data,setData]=React.useState<any>(null),[error,setError]=React.useState(''),[loading,setLoading]=React.useState(false),[query,setQuery]=React.useState(''),[temperature,setTemperature]=React.useState('todos');
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
    }catch(e:any){setError(e.message)}finally{setLoading(false)}
  }
  React.useEffect(()=>{fetch('/api/admin-session',{credentials:'same-origin'}).then(r=>{if(r.ok)load()}).catch(()=>{})},[]);
  async function logout(){await fetch('/api/admin-session',{method:'DELETE',credentials:'same-origin'});setData(null);setKey('')}
  const items=(data?.items||[]).filter((x:any)=>{
    const q=query.toLowerCase();
    const match=!q||[x.name,x.company,x.phone,x.email,x.projectType,x.segment].join(' ').toLowerCase().includes(q);
    return match&&(temperature==='todos'||x.temperature===temperature);
  });
  return <div className="siteAdminPage"><header><a href="/"><ArrowLeft/> WUNIFLOW</a><div><a href="/admin">Projetos</a><span><ShieldCheck/> LEADS DE SITES</span>{data&&<button onClick={logout}>Sair</button>}</div></header><main>
    <section className="siteAdminHero"><small>FUNIL COMERCIAL · WUNIFLOW SITES</small><h1>Leads e orçamentos</h1><p>Acompanhe os briefings enviados pelo configurador de sites e priorize contatos com maior intenção comercial.</p></section>
    {!data&&<section className="siteAdminLogin"><label>Chave administrativa<div><input type={showKey?'text':'password'} value={key} onChange={e=>setKey(e.target.value)} placeholder="Chave de acesso"/><button onClick={()=>setShowKey(v=>!v)}>{showKey?<EyeOff/>:<Eye/>}</button></div></label><button className="siteAdminPrimary" disabled={!key||loading} onClick={load}>{loading?'Entrando...':'Acessar painel'}</button>{error&&<p>{error}</p>}</section>}
    {data&&<><section className="siteAdminMetrics"><article><UsersRound/><div><small>TOTAL DE LEADS</small><strong>{data.metrics.total}</strong></div></article><article><Flame/><div><small>LEADS QUENTES</small><strong>{data.metrics.quentes}</strong></div></article><article><ThermometerSun/><div><small>MORNOS</small><strong>{data.metrics.mornos}</strong></div></article><article><WalletCards/><div><small>TICKET ESTIMADO</small><strong>{data.metrics.ticket?data.metrics.ticket.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}):'—'}</strong></div></article></section>
    <section className="siteAdminToolbar"><label><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar nome, empresa, telefone, projeto..."/></label><select value={temperature} onChange={e=>setTemperature(e.target.value)}><option value="todos">Todas as temperaturas</option><option value="quente">Quentes</option><option value="morno">Mornos</option><option value="frio">Frios</option></select><button onClick={load} disabled={loading}>{loading?'Atualizando...':'Atualizar'}</button></section>
    {error&&<div className="siteAdminError">{error}</div>}
    <section className="siteAdminList">{items.length===0?<div className="siteAdminEmpty">Nenhum lead encontrado.</div>:items.map((x:any)=><article key={x.quoteId||x.leadId}>
      <div className="siteAdminLeadTop"><div><span className={'temp '+x.temperature}>{x.temperature}</span><small>{x.createdAt?new Date(x.createdAt).toLocaleString('pt-BR'):'—'}</small><h2>{x.name}</h2><p>{x.company||'Sem empresa informada'} · {x.segment||'Segmento não informado'}</p></div><div className="siteAdminScore"><small>SCORE</small><strong>{x.score}</strong><span>/100</span></div></div>
      <div className="siteAdminLeadGrid"><div><small>PROJETO</small><b>{x.projectType}</b><span>{x.objective}</span></div><div><small>ESTIMATIVA</small><b>{typeof x.estimate==='number'?x.estimate.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}):String(x.estimate||'Sob consulta')}</b><span>{x.deadline||'Prazo não informado'}</span></div><div><small>VISUAL / RECURSOS</small><b>{x.style||'—'}</b><span>{x.features||'Sem extras'}</span></div><div><small>CONTATO</small><b>{x.phone}</b><span>{x.email||'Sem e-mail'}</span></div></div>
      {x.notes&&<div className="siteAdminNotes"><small>OBSERVAÇÕES</small><p>{x.notes}</p></div>}
      <div className="siteAdminActions"><a href={'https://wa.me/'+String(x.phone||'').replace(/\D/g,'')+'?text='+encodeURIComponent('Olá, '+x.name+'! Aqui é da Wuniflow. Recebemos seu briefing de '+x.projectType+' e quero entender os próximos passos do seu projeto.')} target="_blank" rel="noreferrer">Abrir WhatsApp</a></div>
    </article>)}</section></>}
  </main></div>
}
