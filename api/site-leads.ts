import { createSign } from 'node:crypto';

const clean=(v:unknown,max=5000)=>String(v??'').trim().slice(0,max);
const TOKEN_URL='https://oauth2.googleapis.com/token';
const SCOPE='https://www.googleapis.com/auth/spreadsheets';
const b64url=(value:string)=>Buffer.from(value).toString('base64url');
async function getAccessToken(email:string,privateKey:string){
  const now=Math.floor(Date.now()/1000);
  const header=b64url(JSON.stringify({alg:'RS256',typ:'JWT'}));
  const payload=b64url(JSON.stringify({iss:email,scope:SCOPE,aud:TOKEN_URL,iat:now,exp:now+3600}));
  const unsigned=header+'.'+payload;
  const signer=createSign('RSA-SHA256');signer.update(unsigned);signer.end();
  const assertion=unsigned+'.'+signer.sign(privateKey,'base64url');
  const body=new URLSearchParams({grant_type:'urn:ietf:params:oauth-grant-type:jwt-bearer'.replace('params:oauth-grant-type','params:oauth:grant-type'),assertion});
  const response=await fetch(TOKEN_URL,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body});
  if(!response.ok)throw new Error('Google authentication failed');
  return (await response.json() as {access_token:string}).access_token;
}
function scoreLead(b:any){
  let score=10;
  const prazo=clean(b.prazo,120).toLowerCase();
  if(prazo.includes('15 dias')||prazo.includes('quanto antes'))score+=30;
  else if(prazo.includes('30 dias'))score+=22;
  else if(prazo.includes('60 dias'))score+=12;
  if(clean(b.empresa,160))score+=12;
  if(clean(b.segmento,120))score+=8;
  const features=Array.isArray(b.recursos)?b.recursos.length:0;
  score+=Math.min(20,features*4);
  if(typeof b.estimativa==='number'&&b.estimativa>=3000)score+=10;
  if(['Vender produtos','Agendar serviços','Captar leads','Receber contatos'].includes(clean(b.objetivo,160)))score+=10;
  score=Math.max(0,Math.min(100,score));
  return {score,temperature:score>=70?'quente':score>=40?'morno':'frio'};
}
async function appendSiteLeadSheet(b:any,leadId:string,quoteId:string,score:number,temperature:string){
  const sheetId=process.env.GOOGLE_SHEET_ID,email=process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey=(process.env.GOOGLE_PRIVATE_KEY||process.env.private_key)?.replace(/\\n/g,'\n');
  if(!sheetId||!email||!privateKey)return;
  const token=await getAccessToken(email,privateKey);
  const meta=await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(sheetId)+'?fields=sheets.properties.title',{headers:{authorization:'Bearer '+token}});
  if(!meta.ok)throw new Error('Could not inspect spreadsheet');
  const data=await meta.json() as any;
  if(!data.sheets?.some((s:any)=>s.properties?.title==='SiteLeads')){
    const create=await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(sheetId)+':batchUpdate',{method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify({requests:[{addSheet:{properties:{title:'SiteLeads'}}}]})});
    if(!create.ok&&create.status!==409)throw new Error('Could not create SiteLeads sheet');
    await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(sheetId)+'/values/'+encodeURIComponent('SiteLeads!A1:X1')+'?valueInputOption=RAW',{method:'PUT',headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify({values:[['Criado em','Lead ID','Quote ID','Nome','Empresa','WhatsApp','E-mail','Segmento','Projeto','Objetivo','Estrutura','Estilo','Recursos','Textos','Imagens','Domínio','Prazo','Estimativa','Score','Temperatura','Status','Observações','Última interação','Próximo follow-up']]})});
  }
  const row=[new Date().toISOString(),leadId,quoteId,clean(b.nome,120),clean(b.empresa,160),clean(b.whatsapp,50),clean(b.email,180),clean(b.segmento,120),clean(b.tipo,120),clean(b.objetivo,160),Array.isArray(b.estrutura)?b.estrutura.join(', '):'',clean(b.estilo,120),Array.isArray(b.recursos)?b.recursos.join(', '):'',clean(b.textos,120),clean(b.imagens,120),clean(b.dominio,120),clean(b.prazo,120),typeof b.estimativa==='number'?b.estimativa:'Sob consulta',score,temperature,'novo',clean(b.observacoes,5000),'',''];
  const url='https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(sheetId)+'/values/'+encodeURIComponent('SiteLeads!A:X')+':append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS';
  const r=await fetch(url,{method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify({values:[row]})});
  if(!r.ok)throw new Error('Could not append SiteLeads');
}
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
    const qualification=scoreLead(body);
    const lead={
      id:leadId,
      name:clean(body.nome,120),
      email:clean(body.email,180)||null,
      phone:clean(body.whatsapp,50),
      company:clean(body.empresa,160)||null,
      segment:clean(body.segmento,120)||null,
      status:'novo',
      lead_score:qualification.score,
      lead_temperature:qualification.temperature,
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
    try{await appendSiteLeadSheet(body,leadId,quote.id,qualification.score,qualification.temperature)}catch(sheetError){console.error('Site lead sheet mirror failed',sheetError instanceof Error?sheetError.message:'unknown')}

    return res.status(200).json({ok:true,leadId,quoteId:quote.id,score:qualification.score,temperature:qualification.temperature});
  }catch(e){
    console.error('site-leads error',e instanceof Error?e.message:'unknown');
    return res.status(500).json({ok:false,error:'Não foi possível registrar a solicitação agora.'});
  }
}
