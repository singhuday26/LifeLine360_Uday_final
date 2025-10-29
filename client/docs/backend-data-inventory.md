# Backend Data Inventory (Step 1)

This document captures the data contracts the frontend expects so that the backend can expose consistent, reliable endpoints. It covers the four live data domains surfaced across the app today: sensors, alerts, hotspots, and platform metrics.

> **Scope:** Step 1 of the integration plan – catalogue existing frontend usage and define the corresponding API endpoints/payloads. No code changes are included here.

## 1. Environment variables

The frontend reads all runtime URLs from Vite environment variables. Configure these in `client/.env` (and restart `npm run dev` after changes):

```bash
VITE_API_URL=https://your-backend.example.com
VITE_API_ENDPOINT=/api/sensors/recent
VITE_ALERTS_ENDPOINT=/api/alerts
VITE_HOTSPOTS_ENDPOINT=/api/hotspots
VITE_STATS_ENDPOINT=/api/metrics
VITE_POLL_INTERVAL=3000
```

The existing `useSensorData` hook already consumes `VITE_API_URL` plus `VITE_API_ENDPOINT`. Additional hooks/services should reuse the same pattern when you implement Steps 2–4.

## 2. Endpoint overview

| Domain            | Method | Path (suggested)      | Consumers                                                                                       | Refresh cadence           |
|-------------------|--------|-----------------------|--------------------------------------------------------------------------------------------------|---------------------------|
| Sensor stream     | GET    | `/api/sensors/recent` | `useSensorData`, `Dashboard`, `SensorReadings`, `EnhancedHotspotMap` (live status), hero counters | 3s poll (configurable)    |
| Alert feed        | GET    | `/api/alerts`         | `Alerts`, `AlertCard`, `AlertStats`, `SensorPage` live feed                                      | 8s poll / WebSocket       |
| Hotspot incidents | GET    | `/api/hotspots`       | `HotspotMap`, `HotspotMarker`, Sensors page copy                                                 | 5–10s poll or push        |
| Platform metrics  | GET    | `/api/metrics`        | `Statistics`, hero stats, dashboard header badges                                                | 30–60s poll / on demand   |

> Adjust paths to match your backend routing; the key is to provide structured JSON that satisfies the contracts below.

## 3. Data contracts

### 3.1 Sensor reading object

Used throughout `Dashboard.jsx`, `SensorReadings.jsx`, and `useSensorData.js`.

| Field         | Type             | Required | Description / Usage                                                                               |
|---------------|------------------|----------|---------------------------------------------------------------------------------------------------|
| `id`          | string ⟂ number  | ✅        | Unique reading identifier. Used as React keys when iterating.                                     |
| `timestamp`   | ISO string       | ✅        | Capture time; frontend sorts newest first and shows relative age.                                 |
| `temperature` | number           | ✅        | Celsius. Drives cards, critical alert computation, and thresholds.                                |
| `humidity`    | number           | ✅        | Percentage. Same as above.                                                                        |
| `gasValue`    | number           | ✅        | ppm gas sensor reading. Thresholds at 300/500.                                                     |
| `smoke`       | number           | ✅        | ppm smoke sensor reading. Thresholds at 1000/2000.                                                |
| `pm25`        | number           | ✅        | µg/m³ fine particulates. Thresholds at 12/35.                                                     |
| `pm10`        | number           | ✅        | µg/m³ coarse particulates. Thresholds at 20/50.                                                   |
| `waterLevel`  | number           | ✅        | Meters. Thresholds at 10/15; used in dashboards.                                                  |
| `rainLevel`   | number           | ➖        | Millimeters of rainfall (preferred). `SensorReadings` falls back to `rainAnalog` if missing.      |
| `rainAnalog`  | number           | ➖        | Raw analog value (0–4095). Converted to percentage if `rainLevel` absent.                         |
| `rainIntensity` | number         | ➖        | Percentage intensity (optional modern replacement for `rainAnalog`).                              |
| `isFlame`     | boolean          | ✅        | Flame sensor. Drives critical alerts.                                                             |
| `isRaining`   | boolean          | ➖        | Optional quick flag for rain detection.                                                           |
| `shake`       | number           | ✅        | G-force for vibration; thresholds at 0.3/0.8.                                                     |
| `latitude`    | number           | ✅        | GPS (decimal degrees). Displayed in Sensor Readings and Dashboard cards.                          |
| `longitude`   | number           | ✅        | GPS (decimal degrees).                                                                            |

Additional fields may be included; the frontend ignores unknown keys.

### 3.2 Alert object

Powering `Alerts.jsx`, `AlertCard.jsx`, `AlertStats.jsx`, and the live alert feed in `SensorsPage.jsx`.

| Field               | Type             | Required | Description / Usage                                                                                                                        |
|---------------------|------------------|----------|--------------------------------------------------------------------------------------------------------------------------------------------|
| `id`                | string ⟂ number  | ✅        | Unique alert identifier.                                                                                                                   |
| `type`              | enum             | ✅        | Must match one of `critical`, `warning`, `info`, `success` as defined in `ALERT_TYPES` (mapping to icon/colors).                            |
| `title`             | string           | ✅        | Short headline.                                                                                                                            |
| `description`       | string           | ✅        | Detailed info; displayed when card expanded.                                                                                               |
| `location`          | string           | ✅        | Human-friendly location label.                                                                                                             |
| `source`            | string           | ✅        | One of the allowed sources (Sensor Network, Community Reports, Weather Service, Emergency Services, Social Media, Government, News Sources, Automated Systems). |
| `category`          | string           | ✅        | Match the `ALERT_CATEGORIES` list (Fire, Flood, Storm, Earthquake, Power Outage, Medical, Traffic, Security, Environmental, Infrastructure). |
| `timestamp`         | ISO string       | ✅        | Used for relative display and filtering.                                                                                                   |
| `severity`          | enum             | ✅        | Values: `Critical`, `High`, `Medium`, `Low`. Determines pill styling.                                                                      |
| `affectedPopulation` | number          | ✅        | Used in AlertCard compact layout.                                                                                                          |
| `status`            | enum             | ✅        | Values: `Active`, `Investigating`, `Responding`, `Resolved` (extend if needed, but keep `Resolved` for stats).                              |
| `confidence`        | number           | ✅        | Percentage (0–100). Displayed on card.                                                                                                     |
| `isRead`            | boolean          | ✅        | Controls badge dot and helps build unread counts.                                                                                          |
| `isDismissed`       | boolean          | ✅        | Filtered out from view while keeping for history.                                                                                          |
| `tags`              | string[]         | ➖        | Optional hashtags (displayed as chips).                                                                                                    |

Additional backend endpoints should support POST/PUT actions for `markAsRead`, `dismiss`, and `clearAll` if you want those buttons to persist server-side state (out of scope for Step 1, but the UI calls these handlers).

### 3.3 Hotspot object

Used by `HotspotMap.jsx`/`HotspotMarker.jsx`. The current implementation positions markers using `x`/`y` percentages; adapt as follows:

| Field       | Type            | Required | Description / Usage                                                                                             |
|-------------|-----------------|----------|---------------------------------------------------------------------------------------------------------------|
| `id`        | string ⟂ number | ✅        | Unique incident id.                                                                                           |
| `type`      | enum            | ✅        | Align with `HOTSPOT_TYPES`: `fire`, `flood`, `storm`, `power`, `emergency`.                                   |
| `intensity` | enum            | ✅        | One of `low`, `medium`, `high`, `critical` (maps to marker visuals).                                         |
| `latitude`  | number          | ✅        | Preferred for real map embedding. If you continue to use the pseudo-map, compute `x`/`y` percentages from latitude/longitude on the frontend. |
| `longitude` | number          | ✅        | As above.                                                                                                     |
| `x`         | number          | ➖        | Percentage (0–100) fallback if you keep the current map shell.                                               |
| `y`         | number          | ➖        | Percentage (0–100).                                                                                           |
| `timestamp` | ISO string      | ✅        | Tooltip shows relative time.                                                                                  |
| `reports`   | number          | ✅        | Number of corroborating reports.                                                                              |
| `verified`  | boolean         | ✅        | Shows green badge when true.                                                                                  |

### 3.4 Metrics object

Feeds the animated counters in `Statistics.jsx`, hero stats, and dashboard header badges.

| Field                | Type   | Required | Description / Usage                                                        |
|----------------------|--------|----------|----------------------------------------------------------------------------|
| `alertsProcessed`    | number | ✅        | Total alerts handled (maps to “Alerts Processed”).                         |
| `citizensProtected`  | number | ✅        | Maps to “Protected Citizens”.                                              |
| `monitoringLocations`| number | ✅        | Maps to “Monitoring Locations”.                                            |
| `avgResponseSeconds` | number | ✅        | Converted to seconds with one decimal place (displayed as “Avg Response Time (s)”). |
| `sensorsOnline`      | number | ➖        | Could replace the hardcoded 847 in hero/map.                               |
| `reportsPerHour`     | number | ➖        | Could replace the hardcoded 2.4k in hero map module.                       |

Return any additional KPI fields you need; the counter component can be expanded in Step 2.

## 4. Enumerations recap

To avoid drift between frontend expectations and backend values:

- **Alert Types (`alert.type`):** `critical`, `warning`, `info`, `success`.
- **Alert Severity (`alert.severity`):** `Critical`, `High`, `Medium`, `Low`.
- **Alert Status (`alert.status`):** `Active`, `Investigating`, `Responding`, `Resolved` (extendable; ensure `Resolved` is used when closing).
- **Alert Categories:** `Fire`, `Flood`, `Storm`, `Earthquake`, `Power Outage`, `Medical`, `Traffic`, `Security`, `Environmental`, `Infrastructure`.
- **Alert Sources:** `Sensor Network`, `Community Reports`, `Weather Service`, `Emergency Services`, `Social Media`, `Government`, `News Sources`, `Automated Systems`.
- **Hotspot Types:** `fire`, `flood`, `storm`, `power`, `emergency`.
- **Hotspot Intensity:** `low`, `medium`, `high`, `critical`.

## 5. Outstanding questions for backend alignment

1. **Historical data volume:** do we limit sensor/alert arrays (e.g., latest 50 records) or support pagination? Frontend currently slices arrays client-side.
2. **Authentication model:** should requests include credentials/headers (JWT, API key)? `useSensorData` assumes public access.
3. **Websocket support:** do we plan to expose push channels for alerts/sensors? The UI has timers that could be replaced with sockets.
4. **CORS configuration:** confirm allowed origins match the Vite dev server (`http://localhost:5173`) and production URL.
5. **Rate limiting:** what are the backend’s expectations so we can tune `VITE_POLL_INTERVAL` accordingly?

Once these decisions are made, we can move on to Step 2 (hook/service implementations) with confidence.
