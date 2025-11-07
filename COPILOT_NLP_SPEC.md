# LifeLine360 — Advanced NLP Alert Tagging (End-to-End Spec for Copilot)

**Goal:** Implement a production-ready NLP pipeline that ingests community text (social posts, field reports),  **extracts entities & locations** ,  **classifies hazards, urgency, and needs** ,  **redacts PII** , **geocodes** to our sectors, **correlates** with IoT anomalies, and produces **Verified Alert Candidates** with  **confidence + explanations** , surfacing them to the dashboard (SSE) and to the human verification queue.

We already have:

* **Backend:** Express 5, MongoDB, JWT auth, SSE, MQTT/WebSockets, `SensorData` model, `/api/sensors/ingest|latest`
* **Frontend:** React 19 + Vite, AuthProvider, protected routes, dashboard
* **Envs:** `.env` + Vite env alignment
* **Auth/Admin:** login/me + role guards
* **Note:** Avoid paid Google APIs; prefer open/free options.

---

## 0) High-Level Architecture

<pre class="overflow-visible!" data-start="1366" data-end="2606"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>/server
  /models
    Communication.js          // raw & processed comms
    NlpExtraction.js          // entity/tags/urgency/geo outputs
    AlertCandidate.js         // fused SNS+IoT candidates
  /services
    nlp/
      languageDetect.js
      piiRedact.js
      normalize.js
      entityExtract.js         // hazards, resources, intents
      locationExtract.js       // toponyms + lat/lng
      urgencyClassify.js       // low/med/high (with score)
      dedupeCluster.js         // near-duplicate texts
      correlateWithSensors.js  // time/space fusion
      ruleEngine.js            // transparent </span><span>if</span><span>/then scoring
      pipeline.js              // orchestrator
    geo/geocode.js             // OpenStreetMap/Nominatim or Photon
  /routes
    commsRoutes.js             // POST /api/comms/ingest
    nlpRoutes.js               // GET /api/nlp/candidates, POST verify/reject
  /sse
    nlpStream.js               // /api/nlp/stream (candidates + decisions)
  /workers
    nlpWorker.js               // background queue processor
  /utils
    scoring.js                 // confidence formulae
    sectorIndex.js             // sectorizer (grid: e.g., 25km²)
  /tests
    nlp/*.test.js              // unit & integration tests
</span></span></code></div></div></pre>

**Event flow:**

1. `POST /api/comms/ingest` → store raw text → enqueue job
2. `nlpWorker` runs `pipeline.js`: detect lang → redact PII → normalize → extract entities/locations → geocode → classify hazard/urgency → dedupe/cluster → correlate with nearby sensor anomalies → score → create/update `AlertCandidate`
3. SSE pushes new candidates → Frontend “Verification Queue”
4. Verifier (admin) `POST /api/alerts/verify` accepts/rejects → persists decision → broadcasts via SSE → moves to Alerts feed

---

## 1) Mongo Schemas (Mongoose)

**`models/Communication.js`**

<pre class="overflow-visible!" data-start="3180" data-end="3873"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-js"><span><span>import</span><span> mongoose </span><span>from</span><span></span><span>"mongoose"</span><span>;

</span><span>const</span><span></span><span>CommunicationSchema</span><span> = </span><span>new</span><span> mongoose.</span><span>Schema</span><span>({
  </span><span>source</span><span>: { </span><span>type</span><span>: </span><span>String</span><span>, </span><span>enum</span><span>: [</span><span>"twitter"</span><span>,</span><span>"whatsapp"</span><span>,</span><span>"form"</span><span>,</span><span>"sms"</span><span>,</span><span>"other"</span><span>], </span><span>default</span><span>: </span><span>"other"</span><span> },
  </span><span>text</span><span>: { </span><span>type</span><span>: </span><span>String</span><span>, </span><span>required</span><span>: </span><span>true</span><span> },
  </span><span>lang</span><span>: { </span><span>type</span><span>: </span><span>String</span><span>, </span><span>default</span><span>: </span><span>"und"</span><span> },
  </span><span>receivedAt</span><span>: { </span><span>type</span><span>: </span><span>Date</span><span>, </span><span>default</span><span>: </span><span>Date</span><span>.</span><span>now</span><span> },
  </span><span>// optional raw fields</span><span>
  </span><span>userHandle</span><span>: </span><span>String</span><span>,
  </span><span>externalId</span><span>: </span><span>String</span><span>,
  </span><span>// geo if provided by source</span><span>
  </span><span>rawLat</span><span>: </span><span>Number</span><span>,
  </span><span>rawLng</span><span>: </span><span>Number</span><span>,
  </span><span>// processing refs</span><span>
  </span><span>processed</span><span>: { </span><span>type</span><span>: </span><span>Boolean</span><span>, </span><span>default</span><span>: </span><span>false</span><span> },
  </span><span>piiRedactedText</span><span>: </span><span>String</span><span>,
  </span><span>sectorId</span><span>: </span><span>String</span><span>, </span><span>// computed grid code</span><span>
}, { </span><span>timestamps</span><span>: </span><span>true</span><span> });

</span><span>export</span><span></span><span>default</span><span> mongoose.</span><span>model</span><span>(</span><span>"Communication"</span><span>, </span><span>CommunicationSchema</span><span>);
</span></span></code></div></div></pre>

**`models/NlpExtraction.js`**

<pre class="overflow-visible!" data-start="3905" data-end="4810"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-js"><span><span>import</span><span> mongoose </span><span>from</span><span></span><span>"mongoose"</span><span>;

</span><span>const</span><span></span><span>NlpExtractionSchema</span><span> = </span><span>new</span><span> mongoose.</span><span>Schema</span><span>({
  </span><span>commId</span><span>: { </span><span>type</span><span>: mongoose.</span><span>Schema</span><span>.</span><span>Types</span><span>.</span><span>ObjectId</span><span>, </span><span>ref</span><span>: </span><span>"Communication"</span><span>, </span><span>required</span><span>: </span><span>true</span><span> },
  </span><span>tokens</span><span>: [</span><span>String</span><span>],
  </span><span>entities</span><span>: [{
    </span><span>type</span><span>: { </span><span>type</span><span>: </span><span>String</span><span>, </span><span>enum</span><span>: [</span><span>"HAZARD"</span><span>,</span><span>"LOCATION"</span><span>,</span><span>"NEED"</span><span>,</span><span>"RESOURCE"</span><span>,</span><span>"VICTIM"</span><span>,</span><span>"ORG"</span><span>,</span><span>"MISC"</span><span>] },
    </span><span>value</span><span>: </span><span>String</span><span>,
    </span><span>start</span><span>: </span><span>Number</span><span>,
    </span><span>end</span><span>: </span><span>Number</span><span>,
    </span><span>confidence</span><span>: </span><span>Number</span><span>
  }],
  </span><span>hazards</span><span>: [{
    </span><span>label</span><span>: { </span><span>type</span><span>: </span><span>String</span><span>, </span><span>enum</span><span>: [</span><span>"FIRE"</span><span>,</span><span>"FLOOD"</span><span>,</span><span>"GAS_LEAK"</span><span>,</span><span>"HEATWAVE"</span><span>,</span><span>"LANDSLIDE"</span><span>,</span><span>"EARTHQUAKE"</span><span>,</span><span>"OTHER"</span><span>] },
    </span><span>confidence</span><span>: </span><span>Number</span><span>
  }],
  </span><span>urgency</span><span>: { </span><span>level</span><span>: { </span><span>type</span><span>: </span><span>String</span><span>, </span><span>enum</span><span>: [</span><span>"LOW"</span><span>,</span><span>"MEDIUM"</span><span>,</span><span>"HIGH"</span><span>] }, </span><span>score</span><span>: </span><span>Number</span><span> },
  </span><span>geo</span><span>: { </span><span>lat</span><span>: </span><span>Number</span><span>, </span><span>lng</span><span>: </span><span>Number</span><span>, </span><span>resolvedFrom</span><span>: </span><span>String</span><span> },
  </span><span>sectorId</span><span>: </span><span>String</span><span>,
  </span><span>dedupeGroupId</span><span>: </span><span>String</span><span>,   </span><span>// hash or cluster id</span><span>
  </span><span>explanation</span><span>: </span><span>String</span><span>,     </span><span>// human-readable</span><span>
}, { </span><span>timestamps</span><span>: </span><span>true</span><span> });

</span><span>export</span><span></span><span>default</span><span> mongoose.</span><span>model</span><span>(</span><span>"NlpExtraction"</span><span>, </span><span>NlpExtractionSchema</span><span>);
</span></span></code></div></div></pre>

**`models/AlertCandidate.js`**

<pre class="overflow-visible!" data-start="4843" data-end="5836"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-js"><span><span>import</span><span> mongoose </span><span>from</span><span></span><span>"mongoose"</span><span>;

</span><span>const</span><span></span><span>EvidenceSchema</span><span> = </span><span>new</span><span> mongoose.</span><span>Schema</span><span>({
  </span><span>type</span><span>: { </span><span>type</span><span>: </span><span>String</span><span>, </span><span>enum</span><span>: [</span><span>"SENSOR"</span><span>,</span><span>"COMM"</span><span>] },
  </span><span>refId</span><span>: </span><span>String</span><span>,   </span><span>// SensorData _id or Communication/NlpExtraction _id</span><span>
  </span><span>label</span><span>: </span><span>String</span><span>,   </span><span>// e.g., "PM2.5 spike", "FIRE mention"</span><span>
  </span><span>score</span><span>: </span><span>Number</span><span>,
  </span><span>timestamp</span><span>: </span><span>Date</span><span>
}, { </span><span>_id</span><span>: </span><span>false</span><span> });

</span><span>const</span><span></span><span>AlertCandidateSchema</span><span> = </span><span>new</span><span> mongoose.</span><span>Schema</span><span>({
  </span><span>sectorId</span><span>: { </span><span>type</span><span>: </span><span>String</span><span>, </span><span>index</span><span>: </span><span>true</span><span> },
  </span><span>centroid</span><span>: { </span><span>lat</span><span>: </span><span>Number</span><span>, </span><span>lng</span><span>: </span><span>Number</span><span> },
  </span><span>hazard</span><span>: { </span><span>type</span><span>: </span><span>String</span><span>, </span><span>enum</span><span>: [</span><span>"FIRE"</span><span>,</span><span>"FLOOD"</span><span>,</span><span>"GAS_LEAK"</span><span>,</span><span>"HEATWAVE"</span><span>,</span><span>"LANDSLIDE"</span><span>,</span><span>"EARTHQUAKE"</span><span>,</span><span>"OTHER"</span><span>] },
  </span><span>severity</span><span>: { </span><span>type</span><span>: </span><span>String</span><span>, </span><span>enum</span><span>: [</span><span>"INFO"</span><span>,</span><span>"WARNING"</span><span>,</span><span>"CRITICAL"</span><span>], </span><span>default</span><span>: </span><span>"INFO"</span><span> },
  </span><span>confidence</span><span>: </span><span>Number</span><span>,  </span><span>// 0..1</span><span>
  </span><span>evidence</span><span>: [</span><span>EvidenceSchema</span><span>],
  </span><span>// lifecycle</span><span>
  </span><span>status</span><span>: { </span><span>type</span><span>: </span><span>String</span><span>, </span><span>enum</span><span>: [</span><span>"PENDING"</span><span>,</span><span>"VERIFIED"</span><span>,</span><span>"REJECTED"</span><span>], </span><span>default</span><span>: </span><span>"PENDING"</span><span> },
  </span><span>verifier</span><span>: { </span><span>userId</span><span>: </span><span>String</span><span>, </span><span>name</span><span>: </span><span>String</span><span>, </span><span>at</span><span>: </span><span>Date</span><span> },
  </span><span>explanation</span><span>: </span><span>String</span><span>
}, { </span><span>timestamps</span><span>: </span><span>true</span><span> });

</span><span>export</span><span></span><span>default</span><span> mongoose.</span><span>model</span><span>(</span><span>"AlertCandidate"</span><span>, </span><span>AlertCandidateSchema</span><span>);
</span></span></code></div></div></pre>

---

## 2) NLP Pipeline (Services)

**Libraries (free/open):**

* Tokenization & language: `franc` (lang detect), `iso-639-3` mapping
* PII redaction: regex set (emails, phones, Aadhaar-like patterns), simple NER via heuristics
* Entity extraction: rule/regex + keyword lists; optional `compromise` (nlp_compromise) for PoS/NER lite
* Location extraction: keyword gazetteer + regex; **Geocode** via **Nominatim/Photon** (OSM)
* Urgency: heuristic scoring (exclamation, imperative verbs, keywords like “urgent”, “help”, “trapped”)
* Dedupe: MinHash/SimHash or cosine similarity on TF-IDF → cluster id
* Correlation: haversine distance + time window to `SensorData` spikes; rule engine merges scores

**Create files** under `/services/nlp` as listed; Copilot, implement each.

**`pipeline.js` (orchestrator) — required signature**

<pre class="overflow-visible!" data-start="6666" data-end="7971"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-js"><span><span>// input: Communication doc</span><span>
</span><span>// output: { extraction, maybeCandidate }</span><span>
</span><span>export</span><span></span><span>async</span><span></span><span>function</span><span></span><span>runNlpPipeline</span><span>(</span><span>comm</span><span>) {
  </span><span>const</span><span> lang = </span><span>await</span><span></span><span>detectLanguage</span><span>(comm.</span><span>text</span><span>);
  </span><span>const</span><span> redacted = </span><span>await</span><span></span><span>piiRedact</span><span>(comm.</span><span>text</span><span>);
  </span><span>const</span><span> norm = </span><span>await</span><span></span><span>normalizeText</span><span>(redacted, lang);
  </span><span>const</span><span> entities = </span><span>await</span><span></span><span>extractEntities</span><span>(norm);
  </span><span>const</span><span> loc = </span><span>await</span><span></span><span>extractLocation</span><span>(norm, entities);
  </span><span>const</span><span> geo = </span><span>await</span><span></span><span>geocodeIfNeeded</span><span>(loc, comm.</span><span>rawLat</span><span>, comm.</span><span>rawLng</span><span>); </span><span>// Nominatim/Photon</span><span>
  </span><span>const</span><span> sectorId = </span><span>sectorize</span><span>(geo?.</span><span>lat</span><span>, geo?.</span><span>lng</span><span>);
  </span><span>const</span><span> hazards = </span><span>await</span><span></span><span>detectHazards</span><span>(norm, entities);
  </span><span>const</span><span> urgency = </span><span>await</span><span></span><span>classifyUrgency</span><span>(norm, entities);

  </span><span>const</span><span> dedupeGroupId = </span><span>await</span><span></span><span>clusterNearDuplicates</span><span>(norm);
  </span><span>const</span><span> explanation = </span><span>buildExplanation</span><span>({ hazards, urgency, geo, entities });

  </span><span>const</span><span> extraction = </span><span>await</span><span></span><span>NlpExtraction</span><span>.</span><span>create</span><span>({
    </span><span>commId</span><span>: comm.</span><span>_id</span><span>, </span><span>tokens</span><span>: [], entities, hazards, urgency,
    geo, sectorId, dedupeGroupId, explanation
  });

  </span><span>// correlate with sensors; may yield an AlertCandidate</span><span>
  </span><span>const</span><span> candidate = </span><span>await</span><span></span><span>correlateWithSensorsAndUpsertCandidate</span><span>({
    sectorId, geo, hazards, urgency, </span><span>extractionId</span><span>: extraction.</span><span>_id</span><span>, </span><span>commId</span><span>: comm.</span><span>_id</span><span>
  });

  </span><span>await</span><span></span><span>Communication</span><span>.</span><span>updateOne</span><span>({ </span><span>_id</span><span>: comm.</span><span>_id</span><span> }, { </span><span>$set</span><span>: { </span><span>processed</span><span>: </span><span>true</span><span>, lang, </span><span>piiRedactedText</span><span>: redacted, sectorId } });

  </span><span>return</span><span> { extraction, candidate };
}
</span></span></code></div></div></pre>

**Correlation:**

* Time window: **±20 minutes**
* Space window: **≤1.5 km** from extraction geo/sector centroid
* Sensor anomaly flags (examples):
  * PM2.5 ≥ **150** → “AQ Unhealthy”
  * MQ-2 increase ≥ **baseline + 200** → “Smoke/Gas spike”
  * DHT22: Temp ≥ **40°C** & RH ≤ **20%** → “Heatwave risk”
  * HC-SR04: Water level distance ↓ **>30%** fast → “Rapid rise”
* Rule scoring (weights):
  * Hazard mention (FIRE/FLOOD/…) = **0.35**
  * Urgency HIGH =  **0.25** , MED =  **0.15** , LOW = **0.05**
  * Sensor anomaly match (same hazard proxy) = **0.35**
  * Location confidence/geocode quality = **0.05**

    → **confidence = clamp(sum, 0..1)**
* Severity mapping:
  * **CRITICAL** : confidence ≥ **0.80** or **2+ sensors** agree
  * **WARNING** : confidence **0.55–0.79**
  * **INFO** : confidence **< 0.55**

**Explainability example (store in `explanation`):**

“Detected *FIRE* in Sector A from text (‘smoke, flames’) with HIGH urgency; matched MQ-2 spike (+240) 0.9 km away within 12 min. Confidence 0.84.”

---

## 3) Routes & SSE

**`routes/commsRoutes.js`**

<pre class="overflow-visible!" data-start="9070" data-end="9303"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-js"><span><span>// POST /api/comms/ingest  (auth: public or admin; apply rate-limit)</span><span>
</span><span>// body: { text, source?, rawLat?, rawLng?, userHandle?, externalId? }</span><span>
router.</span><span>post</span><span>(</span><span>"/ingest"</span><span>, authOptional, </span><span>async</span><span> (req,res)=>{ ... enqueue </span><span>NLP</span><span> job ... });
</span></span></code></div></div></pre>

**`workers/nlpWorker.js`**

<pre class="overflow-visible!" data-start="9332" data-end="9639"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-js"><span><span>// simple in-process queue (BullMQ optional later)</span><span>
</span><span>export</span><span></span><span>async</span><span></span><span>function</span><span></span><span>handleCommQueued</span><span>(</span><span>commId</span><span>) {
  </span><span>const</span><span> comm = </span><span>await</span><span></span><span>Communication</span><span>.</span><span>findById</span><span>(commId);
  </span><span>if</span><span> (!comm) </span><span>return</span><span>;
  </span><span>const</span><span> { extraction, candidate } = </span><span>await</span><span></span><span>runNlpPipeline</span><span>(comm);
  </span><span>if</span><span> (candidate) nlpStream.</span><span>broadcastCandidate</span><span>(candidate);
}
</span></span></code></div></div></pre>

**`routes/nlpRoutes.js`**

<pre class="overflow-visible!" data-start="9667" data-end="9810"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-js"><span><span>// GET /api/nlp/candidates?status=PENDING&sectorId=...</span><span>
</span><span>// POST /api/alerts/verify { candidateId, decision: "VERIFY"|"REJECT", note? }</span><span>
</span></span></code></div></div></pre>

**`sse/nlpStream.js`**

<pre class="overflow-visible!" data-start="9835" data-end="9921"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-js"><span><span>// GET /api/nlp/stream  -> pushes {type:"CANDIDATE"| "DECISION", payload:{}}</span><span>
</span></span></code></div></div></pre>

---

## 4) Geo & Sectorizer

**`utils/sectorIndex.js`**

* Use a simple grid (e.g., geohash precision 6 or custom sector code).
* Expose: `sectorize(lat, lng)` and `sectorCentroid(sectorId)`.

**`services/geo/geocode.js`**

* Implement **Nominatim/Photon** (free OSM) with  **user-agent** ,  **rate limit** .
* Cache results in Mongo (`GeoCache` optional) to avoid quota issues.

---

## 5) Security & Privacy

* **PII Redaction** on all external text before storage in `piiRedactedText`.
* Keep original `text` only if necessary; else store **hashed** original for dedupe and audits.
* Rate-limit `/api/comms/ingest` (e.g., 30/min per IP).
* Content moderation: drop obviously abusive/spam messages.
* All NLP outputs include `explanation` for reviewer transparency.
* Add `.env` keys:
  <pre class="overflow-visible!" data-start="10726" data-end="10908"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>NLP_MAX_DISTANCE_KM</span><span>=</span><span>1.5</span><span>
  </span><span>NLP_TIME_WINDOW_MIN</span><span>=</span><span>20</span><span>
  </span><span>NLP_SENSOR_WEIGHTS</span><span>=</span><span>"hazard:0.35,urgency:0.25,sensor:0.35,geo:0.05"</span><span>
  </span><span>NOMINATIM_BASE</span><span>=https://nominatim.openstreetmap.org
  </span></span></code></div></div></pre>

---

## 6) Frontend Hooks (minimal to integrate)

* **New page:** “Verification Queue” (role: admin)
  * Subscribes to **`/api/nlp/stream`**
  * Shows cards: hazard, sector, severity, confidence, evidence list, explanation
  * Buttons: **Verify** / **Reject** → call `/api/alerts/verify`
* **Dashboard:**
  * Overlay candidate markers on map (orange), verified alerts (red), rejected (grey, hidden by default)
  * Tooltip: hazard, confidence, last update, evidence summary

---

## 7) Tests (Vitest/Jest)

Create fixtures under `/tests/nlp/fixtures/`:

* `fire_tweet_1.json` → “fire near Sector A, heavy smoke”
* `flood_whatsapp_1.json` → “water rising fast at bridge”
* `spam_1.json` → “buy crypto”
* `ambiguous_1.json` → “it’s burning hot” (should be HEATWAVE if DHT22 supports)

Unit tests:

* `languageDetect.test.js`
* `piiRedact.test.js`
* `entityExtract.test.js`
* `urgencyClassify.test.js`
* `correlateWithSensors.test.js` (mock SensorData)
* `ruleEngine.test.js` (confidence & severity mapping)

Integration test:

* Post `/api/comms/ingest` → expect `NlpExtraction` created → expect `AlertCandidate` when synthetic `SensorData` in range.

---

## 8) Sample Requests (Postman/cURL)

**Ingest a community report**

<pre class="overflow-visible!" data-start="12157" data-end="12382"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-http"><span>POST /api/comms/ingest
Content-Type: application/json
Authorization: Bearer <token>

{
  "source": "twitter",
  "text": "Heavy smoke near Vijayawada road, flames visible!",
  "rawLat": 16.506,
  "rawLng": 80.648
}
</span></code></div></div></pre>

**List pending candidates**

<pre class="overflow-visible!" data-start="12412" data-end="12508"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>GET</span><span></span><span>/</span><span>api</span><span>/</span><span>nlp</span><span>/</span><span>candidates?status</span><span>=</span><span>PENDING</span><span>&</span><span>sectorId</span><span>=</span><span>SEC_A
</span><span>Authorization</span><span>: Bearer </span><span><</span><span>adminToken</span><span>></span><span>
</span></span></code></div></div></pre>

**Verify**

<pre class="overflow-visible!" data-start="12521" data-end="12742"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-http"><span>POST /api/alerts/verify
Content-Type: application/json
Authorization: Bearer <adminToken>

{
  "candidateId": "64f...",
  "decision": "VERIFY",
  "note": "Cross-checked with PM2.5 spike and call from patrol"
}
</span></code></div></div></pre>

---

## 9) Operational Notes

* **Fallbacks:** If geocode fails, use **sector from closest sensor** location.
* **Clustering:** Combine multiple comms within 15 min & 1 km into one candidate (aggregate evidence).
* **Internationalization:** Detect language; process English + fallback keyword lists for Hindi/Telugu (“aag”, “baarish”, “bhaari barish”, “aag lag gayi”).
* **Throttle geocode** (1 req/sec) and  **cache** .
* **Observability:** Log each pipeline stage time; warn when geocode or correlation fails.

---

## 10) Deliverables Check (Definition of Done)

* Schemas created & indexed (sectorId index on `NlpExtraction`, `AlertCandidate`).
* Routes live: `/api/comms/ingest`, `/api/nlp/candidates`, `/api/alerts/verify`, `/api/nlp/stream`.
* Worker processes new comms automatically; retries on failure.
* Confidence & severity consistent with rule weights.
* Frontend: Verification Queue + Map overlays wired.
* Tests: ≥10 unit tests + 1 integration passing.
* Docs: `docs/nlp-pipeline.md` with diagrams and sample flows.

---

### Tone check to Copilot

> Be explicit, deterministic, and production-oriented. Prefer  **pure JS/TS + small open libraries** . Avoid paid APIs. Ensure clean error handling, logging, and testability. Follow file paths & names exactly. Generate code in place, then propose indexes and sample data.
>
