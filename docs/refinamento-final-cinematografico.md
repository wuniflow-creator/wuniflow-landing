# Refinamento final da direção cinematográfica

Branch: `codex/redesign-cinematografico`. Base: `a833c1b`. Data: 31/10/2026.
Estado: pronto para avaliação no Preview; não homologado para produção.

## Alterações preservando as cenas existentes

- Núcleo holográfico: segunda camada geométrica discreta, rotações mais lentas, luzes em movimento sutil, distribuição das partículas por profundidade e partículas com textura radial procedural.
- Colunas rígidas substituídas por quatro feixes com bordas e extremidades suavizadas em shader. É uma aproximação visual de iluminação volumétrica, sem simulação física de dispersão ou pós-processamento pesado.
- Densidade de pixels limitada a 1,25 no mobile e 1,4 no desktop. Compilação assíncrona de shaders quando suportada pela engine/driver. Mantidos carregamento separado, alvo de 30 fps e pausa fora da tela/aba oculta.
- Corrigido redesenho do canvas ao redimensionar em movimento reduzido: a imagem estática agora permanece visível.
- Tipografia: headline mais equilibrada no desktop, entrelinha mais confortável, cores secundárias mais claras e hierarquia mais consistente. Texto comercial original do Hero preservado.
- Espaçamentos: redução coordenada nos blocos principais, sem remover seções. No desktop 1440×960 observado: altura total de 7.939 para 7.185 px (754 px a menos).
- Mockups: bordas e reflexos sutis, sombras mais controladas, proporção do smartphone ajustada, perspectiva preservada e ciclos de movimento ampliados de 9 para 12 segundos. Contador acompanha a apresentação selecionada (01/03, 02/03, 03/03).
- Transições entre seções: mesma linha de luz e gradação grafite; sem adicionar efeitos de revelação diferentes por seção.
- Acessibilidade: grupos de controles identificados, estado existente dos botões mantido, atualização do fluxo anunciada educadamente. Abertura do menu por teclado leva ao primeiro link; Escape retorna foco ao botão. Link de pular conteúdo passa a focar o main. Foco visível reforçado.

## O que permanece intacto

Cases e suas imagens, configurador, diagnóstico, formulários, WhatsApp, APIs, autenticação, regras de negócio, dependências, SEO, rewrites e domínio. A revisão altera apenas apresentação/ciclo da cena e navegação acessível da home. Não foram enviados leads de teste nem substituídas integrações por mocks.

Nenhuma imagem ou filmagem externa nova foi utilizada. A textura suave de partículas é gerada em canvas (32×32); a cena continua sendo geometria WebGL. FORMA/NEXO/AURA continuam demonstrações conceituais identificadas, e as telas reais dos cases foram preservadas.

## Testes executados

- `npm run build`: TypeScript e build aprovados. Persistem os avisos não bloqueantes de chunk Three.js acima de 500 KB e diretiva `use client` do Lucide.
- `git diff --check`: aprovado.
- Edge headless/Playwright no build servido por `vite preview`, GPU por software (SwiftShader).
- Responsividade: 320, 360, 390, 480, 768, 800, 801, 1024, 1280, 1440, 1600 e 1920 px sem overflow horizontal. A cena permaneceu visível após redimensionamento.
- Movimento reduzido: duas capturas do canvas estáveis; ao reativar movimento, quadros diferentes.
- Teclado: Enter e Espaço alternam as apresentações; contador correto; Enter seleciona Agente de IA. Menu abre com foco no primeiro link e Escape fecha com foco devolvido. Tab e Enter ativam o link de pular conteúdo e focam o main.
- Contraste dos textos secundários amostrados contra o fundo grafite de referência `#12101a`: aproximadamente 7,34:1 a 10,21:1. Não constitui auditoria completa WCAG de todas as superfícies/gradientes.
- Rotas `/sites`, `/diagnostico`, `/admin`, `/admin-sites`: renderizadas com os títulos esperados e sem montar a cena da home.
- Nenhum `pageerror` observado na rodada concluída.

## Comparativos e performance

Capturas locais no artefato `wuniflow-refinement` deste chat: antes/depois do Hero e vitrine, desktop (1440) e mobile (390), além das quatro pranchas `comparativo-*.png`. Para comparações determinísticas foi usado movimento reduzido; a captura mobile inclui resize, expondo também a correção do canvas. Cabeçalho temporariamente oculto somente na captura final da vitrine para não encobrir conteúdo com o sticky header; a interface do site mantém sua navegação.

Amostras de laboratório, sem throttling controlado, DPR 1, movimento reduzido e renderização por software:

| Métrica | Base a833c1b | Refinamento |
| --- | --- | --- |
| DOMContentLoaded | 499 ms | 415 ms |
| LCP observado | 3.704 ms | 5.032 ms |
| CLS | 0,0320 | 0,0026 |
| Maior tarefa longa observada | 2.082 ms | 3.780 ms |

A amostra pós-refinamento teve LCP e tarefa longa maiores. Não é possível declarar melhora de performance nem homologação a partir desses testes; GPU/driver e compilação continuam sendo o gargalo. A compilação assíncrona depende do suporte do driver e não elimina o custo em todos os ambientes. Não são medições de campo nem pontuações Lighthouse.

Build final: JS principal ~99,85 KB gzip, Three.js separado ~133,54 KB gzip e CSS ~22,46 KB gzip. Nenhuma nova dependência adicionada neste refinamento.

## Pendências antes da homologação

1. Aprovação visual do Preview em desktop e mobile.
2. Medição em GPU real, aparelhos móveis de entrada e rede móvel; investigar inicialização do WebGL caso o custo observado se reproduza. Metas de Core Web Vitals ainda não homologadas.
3. Auditoria completa de acessibilidade em navegador/leitor de tela e validação visual em Safari/iOS.
4. Homologação externa dos fluxos comerciais e administrativos no ambiente apropriado, sem escrita involuntária em dados reais.

Somente a branch de desenvolvimento será enviada ao GitHub para gerar Preview. Nenhum merge na main, alteração de configuração remota ou deploy de produção está autorizado nesta entrega.
