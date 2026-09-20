export type PricingInput=Record<string,string>;
export type PricingAnalysis={score:number;level:'Baixa'|'Média'|'Alta'|'Muito alta';estimatedHours:{min:number;max:number};drivers:string[];risks:string[];missing:string[];commercial:{implementationSuggested:number;maintenanceSuggested:number};version:string};
const has=(v:string|undefined,...terms:string[])=>{const s=(v||'').toLowerCase();return terms.some(t=>s.includes(t))};
export function analyzeProject(a:PricingInput):PricingAnalysis{
 let score=8;const drivers:string[]=[];const risks:string[]=[];const missing:string[]=[];
 const add=(n:number,label:string)=>{score+=n;drivers.push(label)};
 const text=Object.values(a).join(' ').toLowerCase();
 if(has(text,'integra','api','erp','crm','whatsapp'))add(10,'Integrações externas');
 if(has(text,'inteligência artificial',' ia ','openai','agente','chatbot'))add(10,'Inteligência Artificial');
 if(has(text,'geolocal','gps','rota','check-in','check in'))add(8,'Operação de campo / geolocalização');
 if(has(text,'pagamento','pix','cobran','assinatura'))add(9,'Pagamentos ou cobrança');
 if(has(text,'dashboard','relatório','indicador','bi'))add(5,'Dashboards e relatórios');
 if(has(text,'aprova','permiss','perfil','admin','gestor','supervisor'))add(5,'Perfis, permissões e aprovações');
 if(has(text,'migra','planilha','excel','dados existentes'))add(6,'Migração/importação de dados');
 if(has(text,'app','android','ios','mobile'))add(8,'Experiência mobile/app');
 if((a.funcionalidades||'').length>500)add(6,'Escopo funcional extenso');
 if((a.prazo||'').match(/urgente|semana|15 dias|30 dias/i)){score+=7;risks.push('Prazo informado pode exigir redução de escopo ou execução acelerada')};
 if(!a.prioridades)missing.push('Prioridades do MVP');if(!a.usuarios)missing.push('Quantidade/perfil de usuários');if(!a.prazo)missing.push('Prazo desejado');
 score=Math.min(100,score);const level=score<25?'Baixa':score<45?'Média':score<70?'Alta':'Muito alta';
 const min=Math.max(24,Math.round(score*1.8));const max=Math.round(min*1.55);
 // Valores abaixo são referências internas iniciais e exigem aprovação humana antes de qualquer proposta.
 const ranges:Record<string,[number,number]|null>={Baixa:[2500,4500],Média:[4500,8000],Alta:[8000,15000],'Muito alta':null};
 const range=ranges[level];const implementationSuggested=range?Math.round((range[0]+range[1])/2):15000;
 const maintenanceSuggested=Math.max(297,Math.round(implementationSuggested*.08));
 return{score,level,estimatedHours:{min,max},drivers,risks,missing,commercial:{implementationSuggested,maintenanceSuggested},version:'wuniflow-pricing-v2'};
}