import { createHmac, timingSafeEqual } from 'node:crypto';
const COOKIE='wuniflow_admin_session',MAX_AGE=60*60*8;
const enc=(v:string)=>Buffer.from(v).toString('base64url');
const sign=(v:string,key:string)=>createHmac('sha256',key).update(v).digest('base64url');
const eq=(a:string,b:string)=>{try{const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y)}catch{return false}};
export function makeAdminSession(key:string){const payload=enc(JSON.stringify({exp:Math.floor(Date.now()/1000)+MAX_AGE}));return payload+'.'+sign(payload,key)}
export function validAdminSession(req:any,key:string){const raw=String(req.headers?.cookie||'').split(';').map((x:string)=>x.trim()).find((x:string)=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);if(!raw)return false;const [p,s]=raw.split('.');if(!p||!s||!eq(sign(p,key),s))return false;try{return Number(JSON.parse(Buffer.from(p,'base64url').toString()).exp)>Math.floor(Date.now()/1000)}catch{return false}}
export function sessionCookie(token:string){return COOKIE+'='+token+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age='+MAX_AGE}
export function clearSessionCookie(){return COOKIE+'=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'}
