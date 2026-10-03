import { createSign } from 'node:crypto';
import { validAdminSession } from './_admin-session.js';

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
  const body=new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion});
  const response=await fetch(TOKEN_URL,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body});
  if(!response.ok)throw new Error('Google authentication failed');
  return (await response.json() as {access_token:string}).access_token;
}
export default async function handler(req:any,res:any){
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='GET')return res.status(405).json({ok:false,error:'Method not allowed'});
  const secret=process.env.WUNIFLOW_ADMIN_KEY;
  if(!secret||!validAdminSession(req,secret))return res.status(401).json({ok:false,error:'Não autorizado'});
  try{
    const sheetId=process.env.GOOGLE_SHEET_ID,email=process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey=(process.env.GOOGLE_PRIVATE_KEY||process.env.private_key)?.replace(/\\n/g,'\n');
    if(!sheetId||!email||!privateKey)throw new Error('Google Sheets integration missing');
    const token=await getAccessToken(email,privateKey);
    const url='https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(sheetId)+'/values/'+encodeURIComponent('SiteLeads!A2:V');
    const r=await fetch(url,{headers:{authorization:'Bearer '+token}});
    if(r.status===400||r.status===404)return res.status(200).json({ok:true,items:[],metrics:{total:0,quentes:0,mornos:0,frios:0,ticket:0}});
    if(!r.ok)throw new Error('Could not read SiteLeads');
    const data=await r.json() as any;
    const rows:Array<any[]>=data.values||[];
    const items=rows.map((x:any[])=>({
      createdAt:x[0]||'',leadId:x[1]||'',quoteId:x[2]||'',name:x[3]||'',company:x[4]||'',phone:x[5]||'',email:x[6]||'',segment:x[7]||'',projectType:x[8]||'',objective:x[9]||'',pages:x[10]||'',style:x[11]||'',features:x[12]||'',textStatus:x[13]||'',imageStatus:x[14]||'',domainStatus:x[15]||'',deadline:x[16]||'',estimate:x[17]||'',score:Number(x[18]||0),temperature:String(x[19]||'frio').toLowerCase(),status:x[20]||'novo',notes:x[21]||''
    })).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
    const numeric=items.map(x=>Number(String(x.estimate).replace(/[^0-9.,-]/g,'').replace(/\./g,'').replace(',','.'))).filter(Number.isFinite);
    const metrics={total:items.length,quentes:items.filter(x=>x.temperature==='quente').length,mornos:items.filter(x=>x.temperature==='morno').length,frios:items.filter(x=>x.temperature==='frio').length,ticket:numeric.length?Math.round(numeric.reduce((a,b)=>a+b,0)/numeric.length):0};
    return res.status(200).json({ok:true,items,metrics});
  }catch(e){
    console.error('site-admin error',e instanceof Error?e.message:'unknown');
    return res.status(500).json({ok:false,error:'Não foi possível carregar os leads agora.'});
  }
}
