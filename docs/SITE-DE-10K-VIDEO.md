# WuniFlow — produção do vídeo Site de 10K

## Escopo autorizado
- Somente branch `feature/site-de-10k-scroll-story-20261109` e Preview.
- Nenhuma geração paga sem aprovação explícita do custo em créditos.
- Nunca modificar `main`, aliases ou domínios de produção nesta etapa.

## Direção criativa
Filme sem áudio, 16:9, duração proposta de 8 segundos, movimentos contínuos de câmera com tempo uniformemente progressivo. Paleta estritamente preto/grafite/roxo/magenta; sem azul ou ciano. Evitar marcas geradas por IA, texto incrustado ou interfaces fictícias apresentadas como produto real. Os textos e a identidade são renderizados em HTML.

### Storyboard (plano contínuo)
- 0–2,5s: travelling suave por arquitetura de vidro grafite e linhas luminosas roxo/magenta — ESTRATÉGIA.
- 2,5–5,5s: mesma câmera aproxima um conjunto de planos digitais e módulos geométricos, sem jump cuts — CRIAÇÃO.
- 5,5–8s: convergência visual dos módulos e revelação de ambiente digital integrado, mantendo área escura para sobreposição de texto — EVOLUÇÃO.

### Prompt de geração (inglês)
Premium cinematic technology brand film for WuniFlow Automations website, 16:9, 8 seconds, silent, seamless forward camera dolly through an elegant black graphite architectural space filled with polished dark glass planes, subtle violet and magenta luminous lines, sophisticated volumetric light, physically coherent geometry. High contrast without harsh flashing. Slow constant camera movement with clear temporal continuity optimized for interactive scroll video scrubbing. Keep left half relatively dark with negative space for HTML text overlay. One single take, absolutely no cuts, no text, no logos, no people, no blue, no cyan, no abrupt camera acceleration, no misleading product screens.

### Modelos consultados (preflight em 09/11/2026)
- Grok Video 1.5 Lite: 8 créditos por 8 segundos na consulta.
- Cinema Studio 3.0 (720p padrão): 40 créditos por 8 segundos na consulta.
- Seedance 2.5: 56 créditos por 8 segundos na consulta.
Preços são estimativas do conector para uma geração, não cobranças executadas. Podem variar.

## Integração técnica
1. Gerar vídeo somente após aprovação dos créditos.
2. Confirmar que o movimento é contínuo; vídeos com cortes bruscos são inadequados para scrub.
3. Otimizar o material original com FFmpeg após obter o arquivo, mantendo duração e sequência temporal; ajustar densidade de keyframes para buscas frequentes.
4. Colocar arquivo público no projeto ou serviço de mídia estável e configurar `VITE_CINEMATIC_SCROLL_VIDEO` na Preview. Exemplo: `/cinematic/scroll-story.mp4`.
5. Criar pôster otimizado e validar 360/390/768/1440 px, scroll rápido em ambos sentidos, reduced motion, teclado, links e formulários.
6. Comparar LCP/transferência de mídia antes e depois; poster estático deve continuar se vídeo falhar.

## Estado real
O React e o CSS já fornecem narrativa por scroll, poster e fallback. O filme de IA ainda NÃO foi gerado nem incluído. A publicação em produção NÃO está autorizada.
