import { createSign } from 'node:crypto';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

const b64url = (value: string) => Buffer.from(value).toString('base64url');

async function getAccessToken(email: string, privateKey: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({ iss: email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }));
  const unsigned = header + '.' + payload;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const assertion = unsigned + '.' + signer.sign(privateKey, 'base64url');
  const body = new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion });
  const response = await fetch(TOKEN_URL, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body });
  if (!response.ok) throw new Error('Google authentication failed');
  const data = await response.json() as { access_token: string };
  return data.access_token;
}

const clean = (value: unknown, max = 1000) => String(value ?? '').trim().slice(0, max);
const projectId = () => 'WNF-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-' + crypto.randomUUID().slice(0,8).toUpperCase();
async function ensureDiagnosticosSheet(sheetId:string,token:string){
 const meta=await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(sheetId)+'?fields=sheets.properties.title',{headers:{authorization:'Bearer '+token}});
 if(!meta.ok) throw new Error('Could not inspect spreadsheet');
 const data=await meta.json() as any;if(data.sheets?.some((s:any)=>s.properties?.title==='Diagnosticos'))return;
 const r=await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(sheetId)+':batchUpdate',{method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify({requests:[{addSheet:{properties:{title:'Diagnosticos'}}}]})});
 if(!r.ok&&r.status!==409)throw new Error('Could not create Diagnosticos sheet');
}
async function appendDiagnosis(sheetId:string,token:string,id:string,b:any){
 await ensureDiagnosticosSheet(sheetId,token);
 const d=b.diagnostico||{};
 const row=[id,new Date().toISOString(),b.empresa,b.nome,b.cargo,b.email,b.whatsapp,d.segmento,d.cidade,d.problema,d.processo_atual,d.dificuldades,d.resultado,d.usuarios,d.perfis,d.dispositivos,d.funcionalidades,d.prioridades,d.dados,d.dashboard,d.ferramentas,d.integracoes,d.automacoes,d.ia,d.dados_existentes,d.prazo,d.referencia,d.observacoes,'Novo',b.consentimento?.aceito?'Sim':'Não',b.consentimento?.aceito?new Date().toISOString():'',b.consentimento?.versao||'',clean(b.submissionId,80)];
 const base='https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(sheetId)+'/values/';
 const url=base+encodeURIComponent('Diagnosticos!A:AG')+':append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS';
 const r=await fetch(url,{method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify({values:[row.map(v=>clean(v,10000))]})});
 if(!r.ok){console.error('Diagnosis append failed',r.status,await r.text());throw new Error('Could not save structured diagnosis');}
}
async function notifyPostDiagnosis(b:any,id:string){
  if(!b.diagnostico || b.consentimentoWhatsapp !== true){
    return {queued:false,reason:'not_applicable'};
  }

  const webhookUrl=process.env.N8N_POS_DIAGNOSTICO_WEBHOOK_URL;
  const webhookSecret=process.env.N8N_POS_DIAGNOSTICO_WEBHOOK_SECRET;

  if(!webhookUrl || !webhookSecret){
    console.warn('Post-diagnosis WhatsApp integration is not configured');
    return {queued:false,reason:'not_configured'};
  }

  try{
    const response=await fetch(webhookUrl,{
      method:'POST',
      headers:{
        'content-type':'application/json',
        'x-wuniflow-webhook-secret':webhookSecret
      },
      body:JSON.stringify({
        nome:clean(b.nome,120),
        empresa:clean(b.empresa,160),
        whatsapp:clean(b.whatsapp,50),
        projectId:id,
        submissionId:clean(b.submissionId,80),
        consentimentoWhatsapp:true
      }),
      signal:AbortSignal.timeout(12000)
    });

    if(!response.ok){
      console.error('Post-diagnosis WhatsApp queue failed with status',response.status);
      return {queued:false,reason:'workflow_error'};
    }

    return {queued:true};
  }catch(error){
    console.error('Post-diagnosis WhatsApp queue request failed');
    return {queued:false,reason:'request_error'};
  }
}

const diagnosisText = (d: any) => {
  if (!d || typeof d !== 'object') return '';
  const fields: [string,string][] = [
    ['Segmento','segmento'],['Cidade / UF','cidade'],['Problema','problema'],['Processo atual','processo_atual'],
    ['Dificuldades','dificuldades'],['Resultado esperado','resultado'],['Usuários','usuarios'],['Perfis e acessos','perfis'],
    ['Dispositivos','dispositivos'],['Funcionalidades','funcionalidades'],['Prioridades do MVP','prioridades'],['Dados e cadastros','dados'],
    ['Dashboard e relatórios','dashboard'],['Ferramentas atuais','ferramentas'],['Integrações','integracoes'],['Automações','automacoes'],
    ['Inteligência Artificial','ia'],['Dados existentes / migração','dados_existentes'],['Prazo','prazo'],['Referência','referencia'],
    ['Observações','observacoes']
  ];
  return fields.map(([label,key]) => clean(d[key],3000) ? label + ': ' + clean(d[key],3000) : '').filter(Boolean).join('\n\n');
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  res.setHeader('Cache-Control','no-store, max-age=0');res.setHeader('X-Content-Type-Options','nosniff');
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = (process.env.GOOGLE_PRIVATE_KEY || process.env.private_key)?.replace(/\\n/g, '\n');
    if (!sheetId || !email || !privateKey) { const missing = [!sheetId && 'GOOGLE_SHEET_ID', !email && 'GOOGLE_SERVICE_ACCOUNT_EMAIL', !privateKey && 'GOOGLE_PRIVATE_KEY'].filter(Boolean).join(', '); throw new Error('Google Sheets integration missing: ' + missing); }

    const b = req.body || {};
    const contentLength=Number(req.headers['content-length']||0);if(contentLength>100000)return res.status(413).json({ok:false,error:'Solicitação muito grande'});
    const trap=clean(b.website,100);if(trap)return res.status(200).json({ok:true});
    if (!b.nome || !b.empresa || !b.whatsapp || !b.processo) return res.status(400).json({ ok: false, error: 'Campos obrigatórios ausentes' });
    if (b.diagnostico && b.consentimentoWhatsapp !== true) return res.status(400).json({ ok: false, error: 'É necessário autorizar o contato pelo WhatsApp para enviar o diagnóstico.' });

    const diagnostic = diagnosisText(b.diagnostico);
    const processo = diagnostic ? clean(b.processo,3000) + '\n\n--- BRIEFING COMPLETO ---\n\n' + diagnostic : clean(b.processo,3000);
    const values = [[
      new Date().toISOString(), clean(b.nome,120), clean(b.empresa,160), clean(b.cargo,120),
      clean(b.whatsapp,50), clean(b.email,180), clean(processo,45000), 'Novo','','','','',
      clean(b.origem,120), clean(b.utm_source,180), clean(b.utm_medium,180), clean(b.utm_campaign,180),
      clean(b.utm_content,180), clean(b.utm_term,180), clean(b.pagina,500), clean(b.referrer,500), clean(b.submissionId,80)
    ]];

    const token = await getAccessToken(email, privateKey);
    const leadHeaderUrl='https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(sheetId)+'/values/'+encodeURIComponent('Leads!U1')+'?valueInputOption=RAW';
    await fetch(leadHeaderUrl,{method:'PUT',headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify({values:[['ID Submissão']]})});
    const submissionId=clean(b.submissionId,80);let diagnosisId=b.diagnostico?projectId():'';if(b.diagnostico&&submissionId){const checkUrl='https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(sheetId)+'/values/'+encodeURIComponent('Diagnosticos!A:AG');const check=await fetch(checkUrl,{headers:{authorization:'Bearer '+token}});if(check.ok){const rows=((await check.json())as any).values||[];const existing=rows.slice(1).find((x:any[])=>x[32]===submissionId);if(existing){const notification=await notifyPostDiagnosis(b,existing[0]);return res.status(200).json({ok:true,projectId:existing[0],confirmationQueued:notification.queued});}}}
    if(submissionId){const leadCheck=await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(sheetId)+'/values/'+encodeURIComponent('Leads!A:U'),{headers:{authorization:'Bearer '+token}});if(leadCheck.ok){const leadRows=((await leadCheck.json())as any).values||[];const duplicate=leadRows.slice(1).some((x:any[])=>x[20]===submissionId);if(duplicate&&diagnosisId){try{await appendDiagnosis(sheetId,token,diagnosisId,b);const notification=await notifyPostDiagnosis(b,diagnosisId);return res.status(200).json({ok:true,projectId:diagnosisId,confirmationQueued:notification.queued});}catch(e){console.error('Diagnosis retry failed',e);return res.status(500).json({ok:false,error:'Contato registrado, mas o diagnóstico não pôde ser concluído. Tente novamente.'});}}}}
    const range = encodeURIComponent('Leads!A:U');
    const url = 'https://sheets.googleapis.com/v4/spreadsheets/' + encodeURIComponent(sheetId) + '/values/' + range + ':append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS';
    const response = await fetch(url, { method: 'POST', headers: { authorization: 'Bearer ' + token, 'content-type': 'application/json' }, body: JSON.stringify({ values }) });
    if (!response.ok) { console.error('Sheets append failed', response.status, await response.text()); throw new Error('Could not save lead'); }
    if (diagnosisId) { try { await appendDiagnosis(sheetId,token,diagnosisId,b); } catch (e) { console.error('Structured diagnosis append failed after lead save',e); return res.status(500).json({ok:false,error:'Contato registrado, mas o diagnóstico não pôde ser concluído. Tente novamente.'}); } }

    const notification=diagnosisId?await notifyPostDiagnosis(b,diagnosisId):{queued:false};
    return res.status(200).json({ ok: true, projectId: diagnosisId || undefined, confirmationQueued: notification.queued });
  } catch (error) {
    console.error('Lead capture failed', error);
    return res.status(500).json({ ok: false, error: 'Não foi possível registrar o contato agora.' });
  }
}
