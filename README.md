# 🌍 LifeLine360 – Hyper-Localized Disaster Management System  

A smarter, AI + IoT powered disaster management platform that delivers **hyper-local alerts** in real time.  
LifeLine360 integrates **environmental sensors, NLP pipelines, and mobile/web dashboards** to ensure faster response, efficient resource allocation, and safer communities.  

<p align="center">
  <a href="https://lifeline360-lemon.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/Live%20Demo-LifeLine360-FF416C?style=for-the-badge&logo=vercel&logoColor=white&labelColor=FF4B2B" alt="LifeLine360 Demo"/>
  </a>
</p>


## 🚨 The Problem  

Traditional disaster management systems suffer from:  
- ⏱️ **Slow Response** – Manual reporting causes critical delays.  
- 📉 **Data Gaps** – Lack of real-time, granular insights.  
- 📦 **Inefficient Allocation** – Resources often misdirected.  
- 🌐 **Communication Barriers** – Language & accessibility challenges.  

**LifeLine360** solves this by fusing **IoT + NLP** for real-time, localized disaster intelligence.  

---

## ✨ Key Features  

- 📢 **User Incident Reporting** – Extracts disaster details (type, location, urgency) from free-text.  
- 🏷️ **Emergency Message Prioritization** – Urgent cases automatically highlighted.  
- ⚠️ **Auto-Generated Alerts** – Clear, localized warnings sent to residents.  
- 📡 **IoT Sensor Network** – Flood, smoke, temperature, air quality, GPS-enabled tracking.  
- 📊 **Interactive Dashboard** – Real-time alerts, maps, and monitoring.  

---

## 🏗️ Tech Stack  

### 🔹 Hardware  
- **ESP32 / Raspberry Pi** – Central controller  
- **Sensors:** DHT22 (temp/humidity), Rain Drop, Gas (MQ-2/MQ-135), GPS, PMS5003 (air quality)  
- **Alert Modules:** Buzzer + LED indicators  
- **Communication:** Wi-Fi, LoRa, GSM  

### 🔹 Software

- **Backend API:** Node.js + Express
- **Database:** MongoDB
- **Real-time:** MQTT (HiveMQ) + WebSockets
- **Frontend:** React + Vite, Tailwind CSS, React Router

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/singhuday26/LifeLine360_Uday_final.git
   cd LifeLine360_Uday-branch-uday
   ```

2. **Install dependencies**

   ```bash
   npm install
   cd client && npm install && cd ..
   ```

3. **Start the backend server**

   ```bash
   npm run server
   ```

   The server will start on port 3001 and connect to HiveMQ MQTT broker.

4. **Start the frontend (in a new terminal)**

   ```bash
   npm run dev
   ```

   The React app will be available at `http://localhost:5173`.

---

## 🖥️ System Architecture  
