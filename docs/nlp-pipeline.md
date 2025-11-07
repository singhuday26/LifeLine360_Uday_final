# LifeLine360 NLP Pipeline

## Overview

The NLP pipeline ingests community communications, redacts PII, extracts actionable intelligence, and fuses it with sensor anomalies to generate alert candidates. A background worker processes queued communications and streams candidate updates to authorized reviewers via Server-Sent Events (SSE).

## Processing Stages

1. **Language Detection** `services/nlp/languageDetect.js`
   - Uses `franc` with ISO-639-3 mapping.
2. **PII Redaction** `services/nlp/piiRedact.js`
   - Masks emails, phone numbers, Aadhaar-like identifiers.
3. **Normalization** `services/nlp/normalize.js`
   - Removes URLs, handles, hashtags, normalizes characters.
4. **Entity & Hazard Extraction** `services/nlp/entityExtract.js`
   - Keyword driven entities (hazard, need, resource, victim).
5. **Location Extraction & Geocoding**
   - Extracts gazetteer or pattern matches, geocodes via Nominatim (`services/geo/geocode.js`).
6. **Urgency Classification** `services/nlp/urgencyClassify.js`
   - Heuristic scoring based on language and victims.
7. **Dedupe/Clustering** `services/nlp/dedupeCluster.js`
   - SHA1 hash of shingles to cluster near-duplicates.
8. **Correlation with Sensors** `services/nlp/correlateWithSensors.js`
   - Finds anomalies within 1.5 km / ±20 minutes using weights from `.env`.
9. **Rule Engine & Scoring** `services/nlp/ruleEngine.js`
   - Applies weighted confidence, severity mapping, builds explanation.

## Data Flow

- `POST /api/comms/ingest` stores a `Communication` document and enqueues processing.
- `workers/nlpWorker.js` drains the queue, executes `runNlpPipeline`, and emits SSE updates through `sse/nlpStream.js` when candidates change.
- `NlpExtraction` stores per-text features for auditability.
- `AlertCandidate` keeps fused evidence and lifecycle state.
- Admins subscribe to `/api/nlp/stream` and manage candidates via `/api/nlp/candidates` and `/api/alerts/verify`.

## Key Models

- `models/Communication.js`
- `models/NlpExtraction.js`
- `models/AlertCandidate.js`

## Environment Configuration

```env
NLP_MAX_DISTANCE_KM=1.5
NLP_TIME_WINDOW_MIN=20
NLP_SENSOR_WEIGHTS="hazard:0.35,urgency:0.25,sensor:0.35,geo:0.05"
NOMINATIM_BASE=https://nominatim.openstreetmap.org
```

## Testing

Unit and integration tests are located under `tests/nlp`. Execute all tests with:

```sh
npm run test
```

## Operational Notes

- SSE stream and verification routes require admin roles.
- Geocoding results are cached in-memory and respect OSM usage policies.
- When sensor correlation is unavailable, candidates remain INFO with low confidence until manual verification.
