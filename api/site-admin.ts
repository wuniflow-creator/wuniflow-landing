import { createSign } from 'node:crypto';
import { validAdminSession } from './_admin-session.js';

const TOKEN_URL='https://oauth2.googleapis.com/token';
const SCOPE='https://www.googleapis.com/auth/spreadsheets';
const STATUSES=['novo','contatado','reuniao','proposta','negociacao','fechado','perdido'] as const;
const b64url=(value:string)=>Buffer.from(value).toString('base64url');
const clean=(v:unknown,max=5000)=>String(v??'').trim().slice(0,max);
async function getAccessToken(email:string,privateKey:string){
  const now=Math.floor(Date.now()/1000);
  const header=b64url(JSON.stringify({alg:'RS256',typ:'JWT'}));
  const payload=b64url(JSON.stringify({iss:email,scope:SCOPE,aud:TOKEN_URL,iat:now,exp:now+3600}));
  const unsigned=header+'.'+payload;
  const signer=createSign('RSA-SHA256');signer.update(unsigned);signer.end();
  const assertion=unsigned+'.'+signer.sign(privateKey,'base64url');
  const body=new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion});
  const response=await fetch(TOKEN_URL,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body});
  if(!response.ok)throw new Error('Google authentication failed');
  return (await response.json() as {access_token:string}).access_token;
}
async function ensureSheet(sheetId:string,token:string,title:string,headers:string[]){
  const meta=await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(sheetId)+'?fields=sheets.properties.title',{headers:{authorization:'Bearer '+token}});
  if(!meta.ok)throw new Error('Could not inspect spreadsheet');
  const data=await meta.json() as any;
  if(!data.sheets?.some((s:any)=>s.properties?.title===title)){
    const create=await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(sheetId)+':batchUpdate',{method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify({requests:[{addSheet:{properties:{title}}}]})});
    if(!create.ok&&create.status!==409)throw new Error('Could not create '+title+' sheet');
  }
  const end=String.fromCharCode(64+headers.length);
  await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(sheetId)+'/values/'+encodeURIComponent(title+'!A1:'+end+'1')+'?valueInputOption=RAW',{method:'PUT',headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify({values:[headers]})});
}
async function readRange(sheetId:string,token:string,range:string){
  const r=await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(sheetId)+'/values/'+encodeURIComponent(range),{headers:{authorization:'Bearer '+token}});
  if(r.status===400||r.status===404)return [];
  if(!r.ok)throw new Error('Could not read '+range);
  return ((await r.json() as any).values||[]) as any[][];
}
async function appendHistory(sheetId:string,token:string,row:any[]){
  const url='https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(sheetId)+'/values/'+encodeURIComponent('SiteLeadHistory!A:H')+':append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS';
  const r=await fetch(url,{method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify({values:[row]})});
  if(!r.ok)throw new Error('Could not append history');
}
function metricsFor(items:any[]){
  const numeric=items.map(x=>Number(String(x.estimate).replace(/[^0-9.,-]/g,'').replace(/\./g,'').replace(',','.'))).filter(Number.isFinite);
  const pipeline=Object.fromEntries(STATUSES.map(s=>[s,items.filter(x=>x.status===s).length]));
  return {total:items.length,quentes:items.filter(x=>x.temperature==='quente').length,mornos:items.filter(x=>x.temperature==='morno').length,frios:items.filter(x=>x.temperature==='frio').length,ticket:numeric.length?Math.round(numeric.reduce((a,b)=>a+b,0)/numeric.length):0,pipeline};
}
export default async function handler(req:any,res:any){
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('X-Content-Type-Options','nosniff');
  const secret=process.env.WUNIFLOW_ADMIN_KEY;
  if(!secret||!validAdminSession(req,secret))return res.status(401).json({ok:false,error:'Não autorizado'});
  try{
    const sheetId=process.env.GOOGLE_SHEET_ID,email=process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey=(process.env.GOOGLE_PRIVATE_KEY||process.env.private_key)?.replace(/\\n/g,'\n');
    if(!sheetId||!email||!privateKey)throw new Error('Google Sheets integration missing');
    const token=await getAccessToken(email,privateKey);
    await ensureSheet(sheetId,token,'SiteLeads',['Criado em','Lead ID','Quote ID','Nome','Empresa','WhatsApp','E-mail','Segmento','Projeto','Objetivo','Estrutura','Estilo','Recursos','Textos','Imagens','Domínio','Prazo','Estimativa','Score','Temperatura','Status','Observações','Última interação','Próximo follow-up']);
    await ensureSheet(sheetId,token,'SiteLeadHistory',['Criado em','Lead ID','Quote ID','Ação','Status anterior','Status novo','Nota','Responsável']);

    if(req.method==='GET'){
      const [rows,historyRows]=await Promise.all([readRange(sheetId,token,'SiteLeads!A2:X'),readRange(sheetId,token,'SiteLeadHistory!A2:H')]);
      const historyByQuote=new Map<string,any[]>();
      historyRows.forEach(x=>{
        const quoteId=x[2]||'';if(!quoteId)return;
        const arr=historyByQuote.get(quoteId)||[];
        arr.push({createdAt:x[0]||'',action:x[3]||'',fromStatus:x[4]||'',toStatus:x[5]||'',note:x[6]||'',actor:x[7]||'Admin'});
        historyByQuote.set(quoteId,arr);
      });
      const items=rows.map((x:any[])=>({
        createdAt:x[0]||'',leadId:x[1]||'',quoteId:x[2]||'',name:x[3]||'',company:x[4]||'',phone:x[5]||'',email:x[6]||'',segment:x[7]||'',projectType:x[8]||'',objective:x[9]||'',pages:x[10]||'',style:x[11]||'',features:x[12]||'',textStatus:x[13]||'',imageStatus:x[14]||'',domainStatus:x[15]||'',deadline:x[16]||'',estimate:x[17]||'',score:Number(x[18]||0),temperature:String(x[19]||'frio').toLowerCase(),status:String(x[20]||'novo').toLowerCase(),notes:x[21]||'',lastInteractionAt:x[22]||'',nextFollowUp:x[23]||'',history:(historyByQuote.get(x[2]||'')||[]).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))).slice(0,30)
      })).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
      return res.status(200).json({ok:true,items,metrics:metricsFor(items),statuses:STATUSES});
    }

    if(req.method==='POST'){
      const body=req.body||{};
      const action=clean(body.action,40);
      const quoteId=clean(body.quoteId,80);
      if(!quoteId)return res.status(400).json({ok:false,error:'Lead inválido'});
      const rows=await readRange(sheetId,token,'SiteLeads!A2:X');
      const idx=rows.findIndex(x=>String(x[2]||'')===quoteId);
      if(idx<0)return res.status(404).json({ok:false,error:'Lead não encontrado'});
      const row=rows[idx],rowNumber=idx+2;
      const currentStatus=String(row[20]||'novo').toLowerCase();
      const now=new Date().toISOString();

      if(action==='update'){
        const status=clean(body.status,40).toLowerCase()||currentStatus;
        if(!STATUSES.includes(status as any))return res.status(400).json({ok:false,error:'Status inválido'});
        const note=clean(body.note,3000);
        const nextFollowUp=clean(body.nextFollowUp,80);
        const currentNote=clean(row[21],5000);
        const latestNote=note||currentNote;
        const url='https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(sheetId)+'/values/'+encodeURIComponent('SiteLeads!U'+rowNumber+':X'+rowNumber)+'?valueInputOption=USER_ENTERED';
        const update=await fetch(url,{method:'PUT',headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify({values:[[status,latestNote,now,nextFollowUp]]})});
        if(!update.ok)throw new Error('Could not update lead');
        const changed=status!==currentStatus?'status_and_note':'note';
        await appendHistory(sheetId,token,[now,row[1]||'',quoteId,changed,currentStatus,status,note||'Atualização do lead','Admin']);
        return res.status(200).json({ok:true,status,lastInteractionAt:now,nextFollowUp});
      }

      if(action==='interaction'){
        const kind=clean(body.kind,60)||'interacao';
        const note=clean(body.note,3000);
        const currentNote=clean(row[21],5000);
        const latestNote=note||currentNote;
        const url='https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(sheetId)+'/values/'+encodeURIComponent('SiteLeads!V'+rowNumber+':W'+rowNumber)+'?valueInputOption=USER_ENTERED';
        const update=await fetch(url,{method:'PUT',headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify({values:[[latestNote,now]]})});
        if(!update.ok)throw new Error('Could not update interaction');
        await appendHistory(sheetId,token,[now,row[1]||'',quoteId,kind,currentStatus,currentStatus,note||'', 'Admin']);
        return res.status(200).json({ok:true,lastInteractionAt:now});
      }

      return res.status(400).json({ok:false,error:'Ação inválida'});
    }

    return res.status(405).json({ok:false,error:'Method not allowed'});
  }catch(e){
    console.error('site-admin error',e instanceof Error?e.message:'unknown');
    return res.status(500).json({ok:false,error:'Não foi possível concluir a operação agora.'});
  }
}
