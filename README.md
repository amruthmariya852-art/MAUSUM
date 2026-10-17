# Mausam 2.0 - Next-Gen Personalized Weather Experience
### Ministry of Earth Sciences (MoES) | India Meteorological Department (IMD)
**Problem Statement ID:** 26076 | **Category:** Software | **Theme:** Smart Automation

---

## 🌟 Executive Summary
The standard **'Mausam'** application by IMD delivers comprehensive meteorological information, but presents a uniform, non-contextual interface to every citizen regardless of their distinct daily weather sensitivities.

**Mausam 2.0** transforms meteorological delivery into an **adaptive, persona-driven, smart automation platform**. Using machine learning heuristics, real-time meteorological feeds, and multi-variable domain scoring, Mausam 2.0 dynamically restructures its homepage to serve **8 specialized personas** alongside a **Smart Auto-Blend** lifecycle engine.

---

## 👥 The 8 Persona Implementations

| # | Persona | Core Problem Addressed | Tailored Meteorological Intelligence | Key Actionable Metric |
|---|---|---|---|---|
| 1 | 🩺 **Health-Conscious** | Respiratory issues, allergies, UV skin sensitivity | Real-time CPCB/National AQI (PM2.5, PM10, NO₂, O₃, SO₂, CO), Pollen Index (grass/tree/weed), UV Sunburn timer, Humidity asthma barometer | *“N95 respirator recommended during morning commute; Burn threshold 25 mins”* |
| 2 | 🏃 **Outdoor Fitness** | Sub-optimal workout conditions & heat illness | Dynamic "Best Running/Cycling Hours" score curve (0–100), Sunrise/Sunset/Golden hours, Wet-Bulb Globe Temp (WBGT), Sweat-rate hydration estimator | *“Peak workout window: 05:30–07:30 AM; Hydration loss: 680 ml/hr”* |
| 3 | 🏄 **Beachgoers & Surfers** | Coastal safety, high surf, and rip current dangers | INCOIS/IMD Coastal Sea condition status, High/Low tide harmonic curve, Swell height & period, Sea Surface Temp (SST), Water UV reflection factor | *“High tide peak at 02:45 PM (+2.8m); Ocean swell 1.2m (Surfing score: 7/10)”* |
| 4 | ✈️ **Travelers** | Weather transit delays and clothing uncertainty | Saved destination comparator, Airport crosswind/storm delays, Railway morning fog index, Elevation/climate delta, AI Smart Packing checklist | *“AI Packing generated: Waterproof umbrella, light fleece for Shimla (+14°C delta)”* |
| 5 | 👨‍👩‍👧 **Parents & Families** | School commute safety & children's outdoor comfort | School commute transit windows (07:00–08:30 AM & 02:00–03:45 PM), Minute-by-minute rain radar, Playground comfort index, Kids layering guide | *“Dry morning school transit; Playground safe after 04:30 PM (Comfort: 85/100)”* |
| 6 | 🌾 **Agriculture (GKMS)** | Irrigation waste & pest infestations | Topsoil (0–7cm) & Root-zone (7–28cm) moisture %, 7-day crop water balance, Spraying suitability window, IMD Gramin Krishi Mausam Sewa bulletins | *“Topsoil moisture 34%; Hold irrigation due to Day 3 rainfall; Spraying window open”* |
| 7 | 🚗 **Daily Commuters** | Traffic waterlogging, fog hazards & road safety | Morning/Evening rush hour weather ratings, Fog/Smog visibility distance meter (meters), Urban road waterlogging index, Gale wind traffic alert | *“Visibility 3,800m (Clear); Zero waterlogging risk across metropolitan flyovers”* |
| 8 | 🎪 **Event Planners** | Outdoor wedding/concert rain disruptions | 14-day synoptic rain probability curve, Outdoor Thermal Comfort Index, Temporary stage/tent wind load threshold monitor | *“Rain contingency risk: 15%; Best time slot: 06:30–10:30 PM (Comfort: 88/100)”* |
| 9 | ⚡ **Smart Auto-Blend** | All-day routine transitions | Weaves morning workout → commute → school pickup → evening leisure into an adaptive timeline | *“Adaptive timeline updates throughout the day”* |

---

## 🛠️ System Architecture & Technology Stack

```
mausam-personalized-app/
├── server.py                  # Python 3 backend with live API proxy, geocoding & caching
├── static/
│   ├── index.html             # High-performance responsive web client & PWA UI
│   ├── css/
│   │   └── styles.css         # Glassmorphism, radar sweep animations & mobile frame simulator
│   ├── js/
│   │   ├── weatherService.js  # Live Open-Meteo & IMD meteorological data fetcher
│   │   ├── personaEngine.js   # Specialized algorithms & widget renderers for all 8 personas
│   │   ├── charts.js          # Chart.js renderers (Tides, Workout scores, AQI, Rain balance)
│   │   ├── packingAdvisor.js  # Forecast-aware AI packing checklist generator
│   │   ├── voiceBriefing.js   # Web Speech API TTS voice engine (English & Hindi)
│   │   └── app.js             # Master state orchestrator & user preference store
└── README.md
```

### Key Technical Highlights:
- **Zero External Backend Dependencies**: Runs on standard Python 3.12 library (`http.server`, `urllib`, `json`).
- **Live Real-Time Meteorological Gateway**: Connects to live weather, air quality, marine, and soil moisture APIs with instant geocoding for all Indian districts and global cities.
- **Multilingual Voice Weather Bulletins**: Speech synthesis in English and Hindi (`hi-IN` & `en-IN`) for universal accessibility and elderly/rural user assistance.
- **Simulated IMD Doppler Radar (DWR) & Satellite Cloud Imagery**: Live radar sweep visualization with reflectivity dBZ color coding.
- **Mobile PWA & Desktop Dual-View**: Switch between full desktop view and realistic smartphone simulation with 1 click.
- **Custom Homepage Layout**: Users can reorder and toggle persona modules to build their dream dashboard.

---

## 🚀 How to Run & Verify

1. Open PowerShell / Command Prompt and navigate to the project directory:
   ```powershell
   cd C:\Users\hp\.gemini\antigravity\scratch\mausam-personalized-app
   ```
2. Start the Mausam Server:
   ```powershell
   python server.py
   ```
3. Open your browser and navigate to:
   ```
   http://127.0.0.1:8000
   ```

---

## 🏛️ Government Compliance & Alignment
- **Ministry of Earth Sciences (MoES)**
- **India Meteorological Department (IMD)**
- **Indian National Centre for Ocean Information Services (INCOIS)**
- **Central Pollution Control Board (CPCB / SAMEER)**
- **Gramin Krishi Mausam Sewa (GKMS)**
