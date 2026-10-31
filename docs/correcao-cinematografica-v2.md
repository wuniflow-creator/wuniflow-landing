# Correção visual cinematográfica — v2

Branch: `codex/redesign-cinematografico`. Base: `7b861c8`. Data: 31/10/2026.

## Mudança de direção visual

O dashboard estático do Hero foi substituído por uma escultura 3D procedural: núcleo facetado, estrutura interna, três órbitas, partículas espaciais, iluminação violeta/magenta e palco em perspectiva. Three.js/WebGL produz geometria real, perspectiva e iluminação; não é um vídeo nem apenas um fundo com gradientes. A headline, navegação e os dois botões anteriores permanecem.

A vitrine de sites substitui os quatro cards anteriores: notebook e smartphone em perspectiva, superfícies metálicas, interfaces de demonstração e três apresentações selecionáveis. O botão leva ao configurador real em `/sites`, sem alterar preços, campos, submissão ou WhatsApp.

A jornada Site → Captação → Agente de IA → Automação → Dashboard tem conexões animadas e etapas exploráveis por botões. A demonstração explica possibilidades; não executa nem simula os endpoints comerciais. As dores passam a um tratamento editorial com divisórias e menos caixas.

## Implementação e acessibilidade

- `src/CinematicScenes.tsx`: cena WebGL, vitrine e jornada, isoladas da lógica comercial.
- `src/scenes.css`: direção visual limitada à home; desktop e mobile.
- Parallax limitado ao ponteiro e deslocamento vertical de no máximo 0,12 unidade no mundo 3D.
- Pixel ratio limitado a 1,5; 240 partículas; alvo de aproximadamente 30 fps, sem promessa de taxa mínima.
- Importação dinâmica de Three.js; inicialização adiada 2,2 s para priorizar conteúdo comercial. SVG geométrico estático enquanto carrega ou sem WebGL. A cena é aprimoramento progressivo; botões e textos não dependem dela.
- Renderização pausa fora da tela e com a aba oculta. Preferência de movimento reduzido congela o canvas e desliga animações CSS.
- ResizeObserver, IntersectionObserver, eventos e recursos GPU são liberados na desmontagem.
- Botões das apresentações e etapas têm estado `aria-pressed` e suporte nativo ao teclado.
- Revisão orientada pela skill React Best Practices: estado transitório fora de renderizações React, carregamento separado, limpeza do efeito, fallback e respeito às preferências do usuário.

## Inventário de mídia: real, conceitual e ausente

- Preservadas as três imagens reais dos cases GPSTRADE, DIA A DIA CONECTA e Faltas & Atestados em `src/public/public/public/cases/`.
- Nenhuma imagem nova externa ou gerada foi utilizada na home.
- Núcleo: geometria procedural renderizada ao vivo. Não é filmagem ou imagem produzida por IA.
- Notebook e smartphone: modelos visuais HTML/CSS em perspectiva. FORMA, NEXO e AURA são identidades fictícias e interfaces conceituais, identificadas na página. Não são cases de clientes nem capturas de produtos reais.
- Elementos arquitetônicos nas telas são ilustrações procedurais CSS; não são fotografias.
- Fluxo: demonstração interativa de arquitetura comercial, sem dados ou integrações fictícias substituindo serviços reais.
- Nenhum vídeo de fundo, stock footage ou vídeo gerado foi utilizado. A dependência de mídia cinematográfica externa permanece ausente; optou-se pela cena 3D programática.
- As gravações `.webm` são capturas reais do navegador durante a verificação, não assets reproduzidos pelo site.
- Mídia já utilizada em `/sites` permanece intacta, incluindo sua imagem externa existente.

## Evidências de validação

Capturas e gravações ficam nos artefatos locais `wuniflow-v2` deste chat; não são enviadas como dependências do site:

- `hero-desktop-final.png`, `hero-mobile-final.png`.
- `sites-desktop-final.png`, `sites-mobile-final.png`.
- `sites-nexo.png`, `flow-desktop.png`.
- Gravação WebM da sessão de movimento e troca de interfaces.
- Teste comparou duas capturas do canvas em instantes diferentes: quadros distintos. Sob movimento reduzido: quadros idênticos.
- Alternância para NEXO e AURA verificada; etapa Agente de IA apresenta o conteúdo correspondente.
- Larguras 320, 390, 768, 1024 e 1440: sem overflow horizontal.
- Rotas `/sites`, `/diagnostico`, `/admin` e `/admin-sites`: renderizaram sem montar a cena 3D.
- Nenhum `pageerror` observado na sessão de validação.
- `npm run build`: aprovado. Avisos não bloqueantes de chunk Three.js acima de 500 KB e diretiva `use client` de Lucide React.
- `git diff --check`: aprovado.
- Nenhuma edição nas APIs, autenticação, configurador, diagnóstico, cases/imagens, regras de negócio, SEO ou `vercel.json`.

## Performance: resultados e limites

Medição do build em `vite preview`, Edge headless, 1440×1000, DPR 1, WebGL por SwiftShader (GPU por software), sem throttling controlado:

- DOMContentLoaded: aproximadamente 418 ms.
- LCP observado: 4.904 ms; CLS: 0,0126.
- Houve tarefas longas na inicialização, incluindo 1.188 e 1.069 ms. A experiência não está homologada para hardware móvel de entrada.
- Não se trata de pontuação Lighthouse, Core Web Vitals de campo ou garantia para aparelhos reais. A captura de vídeo e o renderer por software também afetam o ambiente de teste.
- Bundle principal: aproximadamente 99 KB gzip; Three.js separado: aproximadamente 134 KB gzip; CSS: 21,4 KB gzip. A cena só importa Three.js quando a home é montada.
- As duas imagens grandes dos cases foram preservadas e continuam com lazy loading. Não foi executada conversão destrutiva de mídia.

Os ajustes reduziram complexidade dos materiais, limitaram resolução e frequência, adiaram inicialização e reservaram o espaço do canvas. Aprovação de performance para produção exige teste em dispositivos reais e medição de rede móvel. A prévia serve para avaliação visual e técnica; não representa autorização de produção.

## Entrega

Push somente na branch existente. Preview automático da Vercel. Nenhum merge na main, alteração de domínio, segredo, banco ou deployment de produção. As integrações reais foram mantidas; a navegação de verificação não submeteu leads nem executou operações administrativas.
