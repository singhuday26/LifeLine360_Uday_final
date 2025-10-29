**Project:** LifeLine360 - A Hyper-Local Disaster Intelligence Platform.

**Tech Stack:**

* **Frontend:** React + Vite, Tailwind CSS, React Router.
* **Backend:** Node.js + Express.
* **Database:** MongoDB.
* **Real-time:** MQTT (HiveMQ) and WebSockets.

**Full Process Workflow (The "Source of Truth"):**

**1. Data Source (Hardware):**

* An ESP32/Arduino prototype reads from multiple sensors (DHT, MQ-2, PMS5003, Rain, GPS, etc.).
* It bundles this data into a single JSON object.

**2. Real-time Ingestion (MQTT):**

* The ESP32 publishes this JSON payload to an MQTT topic on HiveMQ. Based on the video demo, the topic is `testtopic1/shubhayusensordata`.
* **This is the single source of truth for all live sensor data.**

**3. Backend Processing (Node.js):**

* Our Node.js server subscribes to the `testtopic1/shubhayusensordata` MQTT topic.
* When a new message arrives:
  1. It parses the JSON payload.
  2. It saves the full payload to a MongoDB collection named `sensor_readings`.
  3. It pushes this new JSON payload to all connected React clients via a WebSocket.

**4. Backend API (Node.js):**

* The backend also provides standard REST APIs:
  * `GET /api/stats`: Returns a JSON object for the main dashboard KPIs (e.g., `{ "activeAlerts": 12, "sensorsOnline": 847, "communityReports": 2400 }`).
  * `GET /api/alerts/hotspots`: Returns a list of all active incidents for the "Incident Hotspot Map".

**5. Frontend (React):**

* **Goal: NO HARDCODED DATA.** Every component must be data-driven.
* The React app connects to the backend WebSocket to receive the live sensor JSON.
* It uses a **Global React Context** to store this live data.
* All components (like `DashboardKPIs` and `DeepSensorTelemetry`) consume this Global Context to display live data.
* Other components (like the `HotspotMap` and `OverviewStats`) fetch data from the REST APIs (`/api/stats`, `/api/alerts/hotspots`).

**Key Data Structure (from ESP32/MQTT):**

**JSON**

```
{
  "temperature": 30.2,
  "humidity": 80.4,
  "smoke": 1245,
  "rainAnalog": 3589,
  "isFlame": false,
  "pm25": 0,
  "pm10": 0,
  "latitude": 0.0000,
  "longitude": 0.0000,
  "waterLevel": 0.0,
  "shake": 0.00
}
```

My instructions will follow this workflow.
