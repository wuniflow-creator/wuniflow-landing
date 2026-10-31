# Diagnóstico e homologação do redesign Wuniflow

Data: 31/10/2026. Branch: `codex/redesign-cinematografico`.

## Origem confirmada

Projeto existente Vercel: `wuniflow/wuniflow-landing` (`prj_zkkUFWCAxlFDSNBaIO9P3jwFICK5`).
Repositório: https://github.com/wuniflow-creator/wuniflow-landing.
Commit publicado e base do clone: `2bfc5066530ab42ddb67343daa5b3b88aafb35ab`.
Domínios preservados: `wuniflow.site`, `www.wuniflow.site` e aliases existentes.
Nenhum deploy, push, merge, alteração de configuração remota ou migração foi executado.

## Inventário e diagnóstico

- React + TypeScript + Vite, Lucide React, CSS próprio. Node 24.x configurado na Vercel.
- `src/main.tsx`: seleção de rotas por pathname, home e componentes de apresentação em linha.
- `src/styles.css`: estilos compartilhados de home, diagnóstico e administração, com sucessivas camadas de sobrescritas. Principal risco de regressão visual.
- `src/Sites.tsx` + `sites.css`: configurador de seis etapas, tipos de projeto, recursos, estimativa, briefing e WhatsApp `5561981240476`; SEO específico e dados estruturados.
- `src/Diagnostico.tsx`: seis etapas, perguntas operacionais, validação de preenchimento, consentimento, identificação estável da submissão, tratamento de falhas e impressão do briefing pelo navegador.
- `src/Admin.tsx`: análise de projetos, complexidade, referência comercial, aprovação humana e proposta. `SiteAdmin.tsx` + `site-admin.css`: CRM de leads de sites.
- `src/lib/pricing-engine.ts`: regras de complexidade e referências internas; `internal-analysis-prompt.ts`: orientação de análise interna.
- `api/leads.ts`: Google Sheets, identificador de submissão, diagnóstico, notificações via webhook n8n quando configurado.
- `api/site-leads.ts`: funil de sites, scoring, Google Sheets e persistência via REST Supabase.
- `api/admin-session.ts` e `_admin-session.ts`: sessão administrativa HMAC com expiração, cookies HttpOnly/Secure/SameSite, checagem de origem.
- `api/site-admin.ts`: leitura e gestão do funil/histórico comercial. `api/project-analysis.ts`: análise interna, OpenRouter e triagem TypeSafe Jev com alternativas de processamento.
- `supabase/migrations`: duas migrações existentes para funil e scoring; preservadas e não executadas.
- Três imagens locais reais de produtos em `src/public/public/public/cases`; mantidas. Duas PNG têm aproximadamente 1,3–1,4 MB cada; otimização futura merece comparação visual.
- `index.html`: descrição, título, Open Graph, canonical e robots. `vercel.json`: rewrites de quatro rotas, noindex para admin e cabeçalhos de proteção.
- README menciona GA4, GTM e Meta Pixel como próximas integrações; não foram considerados ativos sem evidência.
- O README informa um WhatsApp diferente do configurador. Nenhum número foi substituído por suposição.

## Comparação visual e plano executado

A home anterior combinava hero escuro com blocos claros, proposta concentrada em operações de campo e link discreto para o configurador de sites. Já continha navegação móvel, dashboard ilustrativo, telas reais, dores, capacidades, processo e CTAs de diagnóstico. Movimento existente era principalmente hover e rolagem suave.

1. Reutilizar conteúdo, cases, imagens e rotas; manter stack e contratos dos formulários.
2. Aplicar composição preto/grafite com roxo e magenta em folha nova `src/cinematic.css`, integralmente limitada por `.cinematicHome`.
3. Modernizar hero com tipografia ampla, iluminação, grade sutil e dashboard em perspectiva. Identificar o dashboard como demonstração.
4. Destacar sites e landing pages no CTA principal, faixa de serviços, seção própria e fechamento. Direcionar ao configurador já existente.
5. Apresentar automações, IA e sistemas/dashboards com chamadas para diagnóstico.
6. Adicionar entrada animada, desenho de gráfico e flutuação discreta em desktop, respeitando movimento reduzido. Nenhum vídeo ou biblioteca adicional de animação.
7. Melhorar navegação: link para pular conteúdo, fechamento ao selecionar item ou pressionar Escape e nome acessível do menu.
8. Atualizar título/descrições SEO para refletir os serviços ampliados, mantendo canonical e domínio.
9. Adicionar `.gitignore` e lockfile. O repositório anterior não possuía lockfile e usa dependências `latest`: o lockfile registra a resolução atual, mas não permite reconstruir as versões históricas usadas no deploy.

## Evidências de verificação local

- `npm run build`: TypeScript e build Vite aprovados. Avisos não bloqueantes da diretiva `use client` em Lucide React; sem erro de compilação.
- `npm install`: auditoria reportou zero vulnerabilidades na resolução atual.
- Edge headless via Playwright: cinco rotas renderizadas; nenhum `pageerror` observado.
- Home: 320, 390, 768, 1024 e 1440 px sem overflow horizontal. Inspeção visual de desktop e mobile.
- Imagens dos três cases: carregamento e decode confirmados após rolagem; lazy loading preservado.
- Menu móvel: abrir, navegar e confirmar fechamento. Movimento reduzido: animação computada `none`.
- Configurador com API interceptada localmente: seis etapas, payload com Landing Page, estimativa de R$ 1.490, conclusão e WhatsApp original conferidos.
- Diagnóstico com API interceptada localmente: bloqueio de campos vazios, seis etapas, consentimento obrigatório, resposta 500, mensagem de erro, nova tentativa com mesmo ID, sucesso e identificação do projeto.
- APIs, migrações, estilos anteriores, autenticação, rotas e componentes dos formulários/admin não foram editados.

## Limites e homologação externa

Os testes com interceptação verificam a interface e seu contrato; não comprovam gravação real. Vite local não executa as funções serverless de `api/`. Não foram usados segredos de produção nem criados leads de teste em serviços reais.

Antes de produção: homologar em ambiente de preview isolado com credenciais/dados de teste; conferir Sheets/Supabase, entrega n8n/WhatsApp, sessão/login/logout dos dois administradores, análise interna, impressão do briefing e links compartilhados/SEO. Avaliar desempenho e acessibilidade com auditoria específica. A seleção das versões históricas das dependências permanece desconhecida por ausência de lockfile na origem.

## Reversão e publicação

Alterações estão somente na branch local. Produção continua no commit de origem. Reverter o commit do redesign restaura a apresentação anterior; nenhum dado precisa ser revertido. Publicação em produção depende de autorização explícita do responsável. Não foi criado preview remoto nesta etapa.
