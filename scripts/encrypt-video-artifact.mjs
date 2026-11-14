#!/usr/bin/env node
/**
 * AES-256-GCM encrypts the generated MP4 before artifact upload.
 * The 32-byte base64 key is supplied only through WUNIFLOW_VIDEO_ARTIFACT_KEY.
 */
import { createCipheriv, randomBytes } from "node:crypto";
import { readFile, writeFile, unlink } from "node:fs/promises";
import { resolve } from "node:path";

const keyText = process.env.WUNIFLOW_VIDEO_ARTIFACT_KEY;
if (!keyText) throw new Error("WUNIFLOW_VIDEO_ARTIFACT_KEY ausente.");

const key = Buffer.from(keyText, "base64");
if (key.length !== 32 || key.toString("base64").replace(/=+$/, "") !== keyText.replace(/=+$/, "")) {
  throw new Error("WUNIFLOW_VIDEO_ARTIFACT_KEY deve ser uma chave base64 de 32 bytes.");
}

if (process.argv.includes("--check")) {
  console.log("Chave de criptografia do artifact validada.");
  process.exit(0);
}

const input = process.argv[2];
const output = process.argv[3];
if (!input || !output) {
  throw new Error("Uso: node scripts/encrypt-video-artifact.mjs <video.mp4> <video.mp4.enc>");
}

const source = resolve(input);
const destination = resolve(output);
const plaintext = await readFile(source);
if (!plaintext.length) throw new Error("Arquivo de vídeo vazio.");

const iv = randomBytes(12);
const cipher = createCipheriv("aes-256-gcm", key, iv);
const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
const tag = cipher.getAuthTag();
const header = Buffer.from("WUNIFLOW-VIDEO-V1\0", "ascii");
await writeFile(destination, Buffer.concat([header, iv, tag, ciphertext]), { flag: "wx" });
await unlink(source);
console.log("Vídeo criptografado para revisão; o MP4 sem criptografia foi removido do runner.");
