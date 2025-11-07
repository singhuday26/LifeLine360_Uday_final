✅ 1. NLP Backend Folder Structure

(Create inside /services/nlp/ and /models/ and /workers/)

/services
   /nlp
      languageDetect.js
      piiRedact.js
      normalize.js
      entityExtract.js
      urgencyClassify.js
      dedupeCluster.js
      correlateWithSensors.js
      ruleEngine.js
      runPipeline.js

/services/geo
      geocode.js

/models
      Communication.js
      NlpExtraction.js
      AlertCandidate.js

/workers
      nlpWorker.js

/routes
      nlpRoutes.js
      commRoutes.js

codes:languageDetect.js
import { franc } from "franc";

export function detectLanguage(text) {
  const langCode = franc(text || "", { minLength: 3 });
  return langCode === "und" ? "unknown" : langCode;
}

codes:piiRedact.js
export function redactPII(text) {
  if (!text) return text;

  return text
    .replace(/\b\d{10}\b/g, "**********")      // phone
    .replace(/\S+@\S+\.\S+/g, "***@***")       // email
    .replace(/\b\d{4}\s\d{4}\s\d{4}\b/g, "***") // Aadhaar-like
    .trim();
}

normalize.js:
export function normalize(text) {
  return text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[@#][A-Za-z0-9_]+/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

entityExtract.js:
const hazardKeywords = ["flood", "fire", "landslide", "gas", "earthquake"];
const needKeywords = ["help", "rescue", "urgent", "stuck", "injured"];

export function extractEntities(text) {
  const hazards = hazardKeywords.filter(k => text.includes(k));
  const needs = needKeywords.filter(k => text.includes(k));

  return {
    hazards,
    needs,
    victims: /\b(\d+)\s*(people|persons|injured|trapped)\b/.test(text)
  };
}

urgencyClassify.js:
export function classifyUrgency(entities) {
  let score = 0;

  if (entities.hazards.length) score += 0.4;
  if (entities.needs.length) score += 0.3;
  if (entities.victims) score += 0.3;

  return Math.min(score, 1.0);
}

dedupeCluster.js:
import crypto from "crypto";

export function getMessageHash(text) {
  return crypto.createHash("sha1").update(text).digest("hex");
}

correlateWithSensors.js:
import SensorData from "../../models/SensorData.js";

export async function correlateWithSensors({ lat, lon, timestamp }) {
  if (!lat || !lon) return { sensorScore: 0, nearbySensors: [] };

  const windowMs = process.env.NLP_TIME_WINDOW_MIN * 60000;

  const sensors = await SensorData.find({
    ts: {
      $gte: new Date(timestamp - windowMs),
      $lte: new Date(timestamp + windowMs)
    }
  }).limit(20);

  return {
    sensorScore: sensors.length ? 0.7 : 0.1,
    nearbySensors: sensors
  };
}

ruleEngine.js:

export function applyRules({ entities, urgency, sensorResult }) {
  const hazardScore = entities.hazards.length ? 0.6 : 0.2;

  const final = (
    hazardScore * 0.35 +
    urgency * 0.25 +
    sensorResult.sensorScore * 0.35 +
    0.05
  );

  return {
    finalScore: final,
    severity:
      final > 0.75 ? "CRITICAL" :
      final > 0.45 ? "WARNING" :
                     "INFO"
  };
}

runPipeline.js:
import { detectLanguage } from "./languageDetect.js";
import { redactPII } from "./piiRedact.js";
import { normalize } from "./normalize.js";
import { extractEntities } from "./entityExtract.js";
import { classifyUrgency } from "./urgencyClassify.js";
import { getMessageHash } from "./dedupeCluster.js";
import { correlateWithSensors } from "./correlateWithSensors.js";
import { applyRules } from "./ruleEngine.js";

export async function runNlpPipeline(comm) {
  const lang = detectLanguage(comm.text);
  const redacted = redactPII(comm.text);
  const clean = normalize(redacted);
  const entities = extractEntities(clean);
  const urgency = classifyUrgency(entities);
  const hash = getMessageHash(clean);

  const sensorResult = await correlateWithSensors({
    lat: comm.lat, lon: comm.lon, timestamp: comm.createdAt
  });

  const rules = applyRules({ entities, urgency, sensorResult });

  return {
    lang,
    entities,
    urgency,
    sensorResult,
    finalScore: rules.finalScore,
    severity: rules.severity,
    hash
  };
}

nlpWorker.js:
import Communication from "../models/Communication.js";
import AlertCandidate from "../models/AlertCandidate.js";
import { runNlpPipeline } from "../services/nlp/runPipeline.js";

export async function startNlpWorker() {
  console.log("✅ NLP Worker running…");

  setInterval(async () => {
    const pending = await Communication.find({ processed: false }).limit(5);

    for (const comm of pending) {
      const result = await runNlpPipeline(comm);

    await AlertCandidate.create({
        commId: comm._id,
        ...result
      });

    comm.processed = true;
      await comm.save();
    }
  }, 3000);
}
