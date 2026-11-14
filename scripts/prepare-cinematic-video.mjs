#!/usr/bin/env node
/**
 * OpenRouter video request for Wuniflow.
 * Default is dry-run. --validate performs authenticated, no-cost GET/HEAD only.
 * --submit performs exactly one POST, only after an explicit $0.80 budget approval.
 * OPENROUTER_API_KEY is read from process.env and never printed or persisted.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const MODEL = "google/veo-3.1-fast";
const VIDEO_SECONDS = 8;
const MAX_APPROVED_USD = 0.80;
const API_BASE = "https://openrouter.ai/api/v1";
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
  frame_images: [{
    type: "image_url",
    image_url: { url: REFERENCE_IMAGE },
    frame_type: "first_frame"
  }]
};

const args = process.argv.slice(2);
const submit = args.includes("--submit");
const validateOnly = args.includes("--validate");
const approvalArg = args.find((arg) => arg.startsWith("--approve-cost-usd="));
const approvedBudget = approvalArg ? Number(approvalArg.split("=")[1]) : undefined;
const outputArg = args.find((arg) => arg.startsWith("--output="));
const outputPath = outputArg ? resolve(outputArg.slice("--output=".length)) : undefined;

function keyConfigured() {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

function printPreparedRequest() {
  console.log("Solicitação preparada. Nenhuma chamada de API foi enviada.");
  console.log("OPENROUTER_API_KEY: " + (keyConfigured() ? "configurada" : "ausente"));
  console.log("Modelo: " + MODEL + " | 1080p | 16:9 | 8 s | sem áudio");
  console.log("Referência: " + REFERENCE_IMAGE);
  console.log("Custo de referência: US$ 0,80 por tentativa.");
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

async function readJson(response, name) {
  if (!response.ok) {
    throw new Error(name + " falhou (HTTP " + response.status + ").");
  }
  return response.json();
}

async function preflight() {
  if (!keyConfigured()) {
    throw new Error("OPENROUTER_API_KEY ausente. Nenhuma geração foi enviada.");
  }

  const headers = { Authorization: "Bearer " + process.env.OPENROUTER_API_KEY };
  const [catalogResponse, imageResponse] = await Promise.all([
    fetch(API_BASE + "/videos/models", { headers }),
    fetch(REFERENCE_IMAGE, { method: "HEAD" })
  ]);

  const catalog = await readJson(catalogResponse, "Consulta autenticada ao catálogo OpenRouter");
  if (!imageResponse.ok || !imageResponse.headers.get("content-type")?.startsWith("image/")) {
    throw new Error("A imagem de referência não está acessível como imagem HTTPS direta.");
  }

  const model = catalog.data?.find((item) => item.id === MODEL);
  if (!model) throw new Error("Modelo não encontrado no catálogo de vídeo atual.");

  const supports = (values, expected) => Array.isArray(values) && values.includes(expected);
  const requirements = [
    ["supported_durations", VIDEO_SECONDS],
    ["supported_resolutions", request.resolution],
    ["supported_aspect_ratios", request.aspect_ratio],
    ["supported_frame_images", "first_frame"]
  ];
  for (const [field, expected] of requirements) {
    if (!supports(model[field], expected)) {
      throw new Error("Capacidade incompatível no catálogo: " + field + ".");
    }
  }

  const prices = Object.entries(model.pricing_skus ?? {})
    .filter(([name]) => /no.?audio|without.?audio/i.test(name))
    .map(([name, value]) => ({ name, rate: parsePrice(value) }))
    .filter(({ rate }) => Number.isFinite(rate) && rate >= 0);
  const exact1080 = prices.find(({ name }) => /1080/i.test(name));
  const generic = prices.find(({ name }) => !/720|768|4k|2k|1k|1080/i.test(name));
  const sku = exact1080 ?? generic;
  if (!sku) throw new Error("Preço sem áudio para 1080p não pôde ser validado.");
  const estimate = sku.rate * VIDEO_SECONDS;
  if (estimate > MAX_APPROVED_USD) {
    throw new Error("Estimativa atual ultrapassa o limite fixo de US$ 0,80.");
  }

  return { headers, model, estimate };
}

async function wait(ms) {
  await new Promise((resolveWait) => setTimeout(resolveWait, ms));
}

async function generateOnce(headers) {
  if (!outputPath) throw new Error("--output=<arquivo.mp4> é obrigatório para geração.");
  if (approvedBudget !== MAX_APPROVED_USD) {
    throw new Error("Geração exige aprovação exata de US$ 0,80.");
  }

  const response = await fetch(API_BASE + "/videos", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(request)
  });
  const job = await readJson(response, "Envio OpenRouter");
  if (!job.id || !job.polling_url) {
    throw new Error("OpenRouter não retornou identificadores válidos para acompanhar o único envio.");
  }

  console.log("Geração enviada uma vez. Aguardando conclusão; nenhum retry de POST será feito.");
  const pollUrl = new URL(job.polling_url, "https://openrouter.ai");
  if (pollUrl.origin !== "https://openrouter.ai") {
    throw new Error("URL de acompanhamento inesperada; POST não será repetido.");
  }

  const deadline = Date.now() + 20 * 60 * 1000;
  let current = job;
  while (!["completed", "failed", "cancelled", "expired"].includes(current.status)) {
    if (Date.now() >= deadline) {
      throw new Error("Tempo limite de acompanhamento excedido. O POST não será repetido.");
    }
    await wait(15000);
    current = await readJson(
      await fetch(pollUrl, { headers }),
      "Consulta do status OpenRouter"
    );
  }
  if (current.status !== "completed") {
    throw new Error("A geração terminou com status " + current.status + ". O POST não será repetido.");
  }

  const contentUrl = API_BASE + "/videos/" + encodeURIComponent(job.id) + "/content";
  const videoResponse = await fetch(contentUrl, { headers });
  if (!videoResponse.ok || !videoResponse.headers.get("content-type")?.startsWith("video/")) {
    throw new Error("Download do vídeo falhou (HTTP " + videoResponse.status + "). O POST não será repetido.");
  }
  const bytes = Buffer.from(await videoResponse.arrayBuffer());
  if (!bytes.length) throw new Error("O vídeo baixado está vazio.");
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, bytes, { flag: "wx" });
  console.log("Vídeo recebido para criptografia. Bytes: " + bytes.length);
}

async function main() {
  if (!submit && !validateOnly) {
    printPreparedRequest();
    return;
  }
  if (submit && validateOnly) {
    throw new Error("Use apenas um modo: --validate ou --submit.");
  }

  const { headers, estimate } = await preflight();
  if (validateOnly) {
    console.log("Validação sem custo aprovada: autenticação, imagem, capacidades e orçamento.");
    console.log("Custo estimado atual: US$ " + estimate.toFixed(2) + ". Nenhuma geração foi enviada.");
    return;
  }

  await generateOnce(headers);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
