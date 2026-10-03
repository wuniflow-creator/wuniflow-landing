const clean=(v:unknown,max=5000)=>String(v??'').trim().slice(0,max);
export default async function handler(req:any,res:any){
  if(req.method!=='POST') return res.status(405).json({ok:false,error:'Method not allowed'});
  res.setHeader('Cache-Control','no-store, max-age=0');
  try{
    const body=req.body||{};
    const contentLength=Number(req.headers['content-length']||0);
    if(contentLength>100000) return res.status(413).json({ok:false,error:'Solicitação muito grande'});
    if(!body.nome||!body.whatsapp||!body.tipo) return res.status(400).json({ok:false,error:'Campos obrigatórios ausentes'});

    const url='https://fqdjnlcyodrorzhndwjc.supabase.co';
    const publishableKey='sb_publishable_7wP57SA7gmZB09J4W6aD6g_88MVUv3v';

    const leadId=crypto.randomUUID();
    const lead={
      id:leadId,
      name:clean(body.nome,120),
      email:clean(body.email,180)||null,
      phone:clean(body.whatsapp,50),
      company:clean(body.empresa,160)||null,
      segment:clean(body.segmento,120)||null,
      status:'novo',
      source:clean(body.origem,120)||'Wuniflow Sites',
      created_at:new Date().toISOString()
    };

    const quote={
      id:crypto.randomUUID(),
      lead_id:leadId,
      project_type:clean(body.tipo,120),
      objective:clean(body.objetivo,160)||null,
      pages:Array.isArray(body.estrutura)?body.estrutura:[],
      style:clean(body.estilo,120)||null,
      features:Array.isArray(body.recursos)?body.recursos:[],
      content_status:{textos:clean(body.textos,120),imagens:clean(body.imagens,120)},
      domain_status:clean(body.dominio,120)||null,
      deadline:clean(body.prazo,120)||null,
      estimated_total:typeof body.estimativa==='number'?body.estimativa:null,
      notes:clean(body.observacoes,5000)||null,
      submission_id:clean(body.submissionId,100)||null,
      created_at:new Date().toISOString()
    };

    const headers={apikey:publishableKey,Authorization:'Bearer '+publishableKey,'Content-Type':'application/json',Prefer:'return=minimal'};
    const l=await fetch(url.replace(/\/$/,'')+'/rest/v1/leads',{method:'POST',headers,body:JSON.stringify(lead)});
    if(!l.ok){console.error('Supabase leads insert failed',l.status,await l.text());throw new Error('Lead insert failed')}
    const q=await fetch(url.replace(/\/$/,'')+'/rest/v1/site_quotes',{method:'POST',headers,body:JSON.stringify(quote)});
    if(!q.ok){console.error('Supabase site quote insert failed',q.status,await q.text());throw new Error('Quote insert failed')}

    return res.status(200).json({ok:true,leadId,quoteId:quote.id});
  }catch(e){
    console.error('site-leads error',e instanceof Error?e.message:'unknown');
    return res.status(500).json({ok:false,error:'Não foi possível registrar a solicitação agora.'});
  }
}
