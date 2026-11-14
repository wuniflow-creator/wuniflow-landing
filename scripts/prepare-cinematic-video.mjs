#!/usr/bin/env node
/**
 * Prepara uma única solicitação de image-to-video da Wuniflow via OpenRouter.
 *
 * Padrão: apenas imprime a configuração e o payload; não consulta APIs nem gera.
 * Envio (somente após autorização explícita de orçamento):
 *   node scripts/prepare-cinematic-video.mjs --submit --approve-cost-usd=0.80
 *
 * OPENROUTER_API_KEY é lida somente de process.env e nunca impressa/salva.
 * O envio faz uma única tentativa, sem retry automático.
 */
const MODEL = "google/veo-3.1-fast";
const VIDEO_SECONDS = 8;
const MAX_APPROVED_USD = 0.80;
const REFERENCE_IMAGE =
  "https://www.wuniflow.site/cinematic/wuniflow-hero-real-desktop.webp";

const PROMPT = [
  "Single continuous 8-second photorealistic commercial film shot, no cuts.",
  "Use the supplied first frame as the exact opening composition and preserve its real enterprise workstation, desk, professional computers, materials, and spatial layout.",
  "A measured, smooth cinematic dolly-in toward a real modern software team's workstation in a contemporary Brazilian office. Professional desktop monitor and laptop, keyboard, restrained desk objects, realistic glass, metal and graphite surfaces; softly occupied office in the deep background.",
  "Natural practical office lighting, deep black and graphite tones, with restrained violet and magenta accents only in ambient light. Premium editorial corporate photography, 35mm lens, shallow depth of field, subtle film grain, believable exposure and reflections.",
  "Keep the camera motion slow, steady, and suitable for a reversible scroll-controlled presentation. No cuts, no scene transition, no people crossing the frame, no abrupt actions.",
  "Preserve any authentic Wuniflow dashboard already visible on the supplied screen exactly as captured; do not redraw, replace, or invent dashboard UI, text, or logos. Keep screen geometry stable.",
  "Leave calm negative space in the left third for website copy.",
  "No holograms, robots, floating graphics, neon interfaces, sci-fi, futuristic props, or fictional technology."
].join(" ");

const request = {
  model: MODEL,
  prompt: PROMPT,
  aspect_ratio: "16:9",
  duration: VIDEO_SECONDS,
  resolution: "1080p",
  generate_audio: false,
  frame_images: [
    {
      type: "image_url",
      image_url: { url: REFERENCE_IMAGE },
      frame_type: "first_frame"
    }
  ]
};

const submit = process.argv.includes("--submit");
const approvalArg = process.argv.find((arg) => arg.startsWith("--approve-cost-usd="));
const approvedBudget = approvalArg ? Number(approvalArg.split("=")[1]) : undefined;

function printPreparedRequest() {
  console.log("Solicitação preparada (nenhuma geração foi enviada).");
  console.log(`OPENROUTER_API_KEY: ${process.env.OPENROUTER_API_KEY ? "configurada" : "ausente"}`);
  console.log(`Referência: ${REFERENCE_IMAGE}`);
  console.log("Custo de referência para 8 s, 1080p, sem áudio: US$ 0,80 por tentativa.");
  console.log("Payload:");
  console.log(JSON.stringify(request, null, 2));
}

function parsePrice(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (value && typeof value === "object") {
    for (const key of ["price", "rate", "amount", "per_second"]) {
      const parsed = parsePrice(value[key]);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return Number.NaN;
}

async function main() {
  if (!submit) {
    printPreparedRequest();
    return;
  }

  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY não está configurada nesta sessão; nenhum envio foi feito.");
  }
  if (!Number.isFinite(approvedBudget) || approvedBudget < 0) {
    throw new Error("Para habilitar o envio, informe --approve-cost-usd=<limite autorizado>.");
  }

  // Confere capabilities/preço atuais e a URL da imagem antes de qualquer POST cobrável.
  const [catalogResponse, imageResponse] = await Promise.all([
    fetch("https://openrouter.ai/api/v1/videos/models"),
    fetch(REFERENCE_IMAGE, { method: "HEAD" })
  ]);
  if (!catalogResponse.ok) throw new Error(`Falha ao consultar catálogo: HTTP ${catalogResponse.status}. Nenhum vídeo foi enviado.`);
  if (!imageResponse.ok || !imageResponse.headers.get("content-type")?.startsWith("image/")) {
    throw new Error("A imagem de referência não está acessível como imagem HTTPS direta. Nenhum vídeo foi enviado.");
  }

  const catalog = await catalogResponse.json();
  const model = catalog.data?.find((item) => item.id === MODEL);
  if (!model) throw new Error("Modelo não listado no catálogo atual. Nenhum vídeo foi enviado.");
  const supports = (values, expected) => Array.isArray(values) && values.includes(expected);
  if (
    !supports(model.supported_durations, VIDEO_SECONDS) ||
    !supports(model.supported_resolutions, request.resolution) ||
    !supports(model.supported_aspect_ratios, request.aspect_ratio) ||
    !supports(model.supported_frame_images, "first_frame")
  ) {
    throw new Error("As capacidades atuais do modelo não correspondem ao payload. Nenhum vídeo foi enviado.");
  }

  const skus = model.pricing_skus ?? {};
  const noAudioPrices = Object.entries(skus)
    .filter(([name]) => /no.?audio|without.?audio/i.test(name))
    .map(([name, value]) => ({ name, rate: parsePrice(value) }))
    .filter(({ rate }) => Number.isFinite(rate) && rate >= 0);
  const exact1080 = noAudioPrices.find(({ name }) => /1080/i.test(name));
  const generic = noAudioPrices.find(({ name }) => !/720|768|4k|2k|1k|1080/i.test(name));
  const sku = exact1080 ?? generic;
  if (!sku) throw new Error("Não foi possível verificar o preço sem áudio para 1080p no catálogo. Nenhum vídeo foi enviado.");
  const estimatedCost = sku.rate * VIDEO_SECONDS;

  if (estimatedCost > approvedBudget || estimatedCost > MAX_APPROVED_USD) {
    throw new Error(
      `Preço atual estimado US$${estimatedCost.toFixed(2)} supera o limite. Nenhum vídeo foi enviado.`
    );
  }

  console.log(
    `Enviando uma única geração: ${MODEL}, 1080p, 16:9, 8 s, sem áudio; estimativa US$${estimatedCost.toFixed(2)}.`
  );

  const response = await fetch("https://openrouter.ai/api/v1/videos", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    // Não exibe corpo da resposta para evitar registrar dados inesperados do provedor.
    throw new Error(`OpenRouter recusou o envio (HTTP ${response.status}).`);
  }

  const job = await response.json();
  console.log(JSON.stringify({
    id: job.id,
    status: job.status,
    polling_url: job.polling_url
  }, null, 2));
  console.log("Nenhuma repetição automática será feita; uma nova tentativa exige nova execução e aprovação.");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
