import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const b = req.body || {};
    const clean = (v: unknown, max = 1000) => String(v ?? '').trim().slice(0, max);
    if (!b.nome || !b.empresa || !b.whatsapp || !b.processo) return res.status(400).json({ ok: false });
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Leads!A:T',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [[
        new Date().toISOString(), clean(b.nome,120), clean(b.empresa,160), clean(b.cargo,120),
        clean(b.whatsapp,50), clean(b.email,180), clean(b.processo,3000), 'Novo','','','','',
        clean(b.origem,120), clean(b.utm_source,180), clean(b.utm_medium,180), clean(b.utm_campaign,180),
        clean(b.utm_content,180), clean(b.utm_term,180), clean(b.pagina,500), clean(b.referrer,500)
      ]] },
    });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Lead capture failed', error);
    return res.status(500).json({ ok: false, error: 'Não foi possível registrar o contato agora.' });
  }
}