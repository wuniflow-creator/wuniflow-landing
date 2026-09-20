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

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    if (!sheetId || !email || !privateKey) throw new Error('Google Sheets integration not configured');

    const b = req.body || {};
    if (!b.nome || !b.empresa || !b.whatsapp || !b.processo) return res.status(400).json({ ok: false, error: 'Campos obrigatórios ausentes' });

    const values = [[
      new Date().toISOString(), clean(b.nome,120), clean(b.empresa,160), clean(b.cargo,120),
      clean(b.whatsapp,50), clean(b.email,180), clean(b.processo,3000), 'Novo','','','','',
      clean(b.origem,120), clean(b.utm_source,180), clean(b.utm_medium,180), clean(b.utm_campaign,180),
      clean(b.utm_content,180), clean(b.utm_term,180), clean(b.pagina,500), clean(b.referrer,500)
    ]];

    const token = await getAccessToken(email, privateKey);
    const range = encodeURIComponent('Leads!A:T');
    const url = 'https://sheets.googleapis.com/v4/spreadsheets/' + encodeURIComponent(sheetId) + '/values/' + range + ':append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS';
    const response = await fetch(url, { method: 'POST', headers: { authorization: 'Bearer ' + token, 'content-type': 'application/json' }, body: JSON.stringify({ values }) });
    if (!response.ok) { console.error('Sheets append failed', response.status, await response.text()); throw new Error('Could not save lead'); }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Lead capture failed', error);
    return res.status(500).json({ ok: false, error: 'Não foi possível registrar o contato agora.' });
  }
}
