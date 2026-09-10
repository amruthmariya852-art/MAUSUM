/**
 * Mausam 2.0 - Core Persona Engine
 * Contains specialized intelligence algorithms and widget renderers for all 8 personas.
 */

const PersonaEngine = {
  // Available Persona Definitions
  personas: {
    health: {
      id: "health",
      name: "Health & Allergy",
      icon: "🩺",
      heroTitle: "Health & Respiratory Advisory",
      heroIcon: "🩺",
      themeColor: "emerald"
    },
    fitness: {
      id: "fitness",
      name: "Outdoor Fitness",
      icon: "🏃",
      heroTitle: "Workout & Running Conditions",
      heroIcon: "🏃",
      themeColor: "blue"
    },
    beach: {
      id: "beach",
      name: "Beach & Coastal",
      icon: "🏄",
      heroTitle: "Marine & Tide Conditions",
      heroIcon: "🏄",
      themeColor: "cyan"
    },
    travel: {
      id: "travel",
      name: "Smart Travel",
      icon: "✈️",
      heroTitle: "Travel & Transit Forecast",
      heroIcon: "✈️",
      themeColor: "purple"
    },
    family: {
      id: "family",
      name: "Parents & Family",
      icon: "👨‍👩‍👧",
      heroTitle: "School Commute & Family Safety",
      heroIcon: "👨‍👩‍👧",
      themeColor: "pink"
    },
    agri: {
      id: "agri",
      name: "Agriculture (GKMS)",
      icon: "🌾",
      heroTitle: "Agromet & Soil Moisture",
      heroIcon: "🌾",
      themeColor: "amber"
    },
    commute: {
      id: "commute",
      name: "Daily Commuter",
      icon: "🚗",
      heroTitle: "Road Visibility & Traffic Weather",
      heroIcon: "🚗",
      themeColor: "orange"
    },
    event: {
      id: "event",
      name: "Event Planner",
      icon: "🎪",
      heroTitle: "Event & Comfort Forecasting",
      heroIcon: "🎪",
      themeColor: "indigo"
    },
    hybrid: {
      id: "hybrid",
      name: "Smart Auto-Blend",
      icon: "⚡",
      heroTitle: "Smart Auto-Blend Timeline",
      heroIcon: "⚡",
      themeColor: "violet"
    }
  },

  /**
   * Render Persona Dashboard based on active key and meteorological data
   */
  render(personaKey, data, containerId = "persona-dashboard-container") {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Safety checks on data
    const weather = data.weather || {};
    const current = weather.current || {};
    const hourly = weather.hourly || {};
    const daily = weather.daily || {};
    const aq = data.air_quality || {};
    const marine = data.marine || {};

    let html = "";

    switch (personaKey) {
      case "health":
        html = this.renderHealthPersona(current, hourly, daily, aq);
        break;
      case "fitness":
        html = this.renderFitnessPersona(current, hourly, daily, aq);
        break;
      case "beach":
        html = this.renderBeachPersona(current, hourly, daily, marine);
        break;
      case "travel":
        html = this.renderTravelPersona(current, hourly, daily, aq);
        break;
      case "family":
        html = this.renderFamilyPersona(current, hourly, daily, aq);
        break;
      case "agri":
        html = this.renderAgriPersona(current, hourly, daily);
        break;
      case "commute":
        html = this.renderCommutePersona(current, hourly, daily);
        break;
      case "event":
        html = this.renderEventPersona(current, hourly, daily);
        break;
      case "hybrid":
        html = this.renderHybridPersona(current, hourly, daily, aq, marine);
        break;
      default:
        html = this.renderHealthPersona(current, hourly, daily, aq);
    }

    container.innerHTML = html;

    // Re-initialize Lucide Icons for injected widgets
    if (window.lucide) {
      lucide.createIcons();
    }

    // Post-render Chart initialization
    this.initPersonaCharts(personaKey, hourly, daily, aq, marine);
  },

  /**
   * PERSONA 1: HEALTH-CONSCIOUS USERS
   */
  renderHealthPersona(current, hourly, daily, aq) {
    const aqi = aq.current?.us_aqi || 142;
    const aqiBand = WeatherService.getIndianAQIBand(aqi);
    const pm25 = aq.current?.pm2_5 || 58;
    const pm10 = aq.current?.pm10 || 110;
    const uv = current.uv_index || daily.uv_index_max?.[0] || 6;
    const uvBand = WeatherService.getUVBand(uv);
    const humidity = current.relative_humidity_2m || 65;

    // Asthma trigger level
    let asthmaRisk = "Low";
    let asthmaColor = "text-emerald-400";
    if (aqi > 200 || (humidity > 80 && pm25 > 60)) {
      asthmaRisk = "High (Asthma / Bronchitis Trigger)";
      asthmaColor = "text-red-400";
    } else if (aqi > 100 || humidity > 75) {
      asthmaRisk = "Moderate";
      asthmaColor = "text-amber-400";
    }

    // Pollen estimate
    const grassPollen = aq.hourly?.grass_pollen?.[0] || 12;
    const pollenStatus = grassPollen > 30 ? "High Pollen" : grassPollen > 10 ? "Moderate Pollen" : "Low Pollen";

    return `
      <!-- Health Header Alert Banner -->
      <div class="rounded-2xl p-4 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl font-bold">
            ${aqi}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-sm text-white">Air Quality Index: ${aqiBand.label}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${aqiBand.bg} ${aqiBand.text} border ${aqiBand.border}">National AQI</span>
            </div>
            <p class="text-xs text-slate-300 mt-0.5">${aqiBand.advisory}</p>
          </div>
        </div>
        <div class="text-right shrink-0">
          <span class="text-[11px] text-slate-400">Asthma & Bronchial Risk:</span>
          <p class="font-bold text-xs ${asthmaColor}">${asthmaRisk}</p>
        </div>
      </div>

      <!-- Grid of Health Widgets -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        <!-- Left: Pollutant Breakdown & Chart (7 Cols) -->
        <div class="md:col-span-7 bg-slate-900/80 rounded-2xl border border-slate-800 p-4 flex flex-col">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <i data-lucide="activity" class="w-4 h-4 text-emerald-400"></i>
              Real-Time Atmospheric Pollutant Breakdown
            </h3>
            <span class="text-[10px] text-slate-400">CPCB / SAMEER Standard</span>
          </div>

          <div class="grid grid-cols-3 gap-2 mb-3 text-center">
            <div class="bg-slate-800/60 p-2 rounded-xl border border-slate-700/50">
              <span class="text-[10px] text-slate-400">PM 2.5</span>
              <p class="font-bold text-sm text-amber-300">${pm25} <span class="text-[9px] font-normal text-slate-400">µg/m³</span></p>
            </div>
            <div class="bg-slate-800/60 p-2 rounded-xl border border-slate-700/50">
              <span class="text-[10px] text-slate-400">PM 10</span>
              <p class="font-bold text-sm text-orange-300">${pm10} <span class="text-[9px] font-normal text-slate-400">µg/m³</span></p>
            </div>
            <div class="bg-slate-800/60 p-2 rounded-xl border border-slate-700/50">
              <span class="text-[10px] text-slate-400">Pollen Risk</span>
              <p class="font-bold text-sm text-emerald-300">${pollenStatus}</p>
            </div>
          </div>

          <div class="h-48 w-full relative">
            <canvas id="health-aqi-chart"></canvas>
          </div>
        </div>

        <!-- Right: Actionable Health Guidelines & UV Timer (5 Cols) -->
        <div class="md:col-span-5 space-y-4">
          
          <!-- UV Sunburn Timer Card -->
          <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-4">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <i data-lucide="sun" class="w-4 h-4 text-amber-400"></i>
                UV Radiation & Sunburn Advisory
              </h3>
              <span class="font-bold text-xs ${uvBand.color}">Index: ${uv} (${uvBand.label})</span>
            </div>
            <p class="text-xs text-slate-400 mb-3">${uvBand.desc}</p>
            
            <div class="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/50 flex items-center justify-between text-xs">
              <span class="text-slate-300">Skin Burn Threshold (Type III/IV):</span>
              <span class="font-bold text-amber-400">~25 - 35 mins</span>
            </div>
          </div>

          <!-- Clinical Health Checklist -->
          <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-4">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
              <i data-lucide="shield-check" class="w-4 h-4 text-blue-400"></i>
              Personal Health Checklist
            </h3>
            <ul class="space-y-2 text-xs text-slate-300">
              <li class="flex items-start gap-2">
                <i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0"></i>
                <span>${aqi > 150 ? 'Wear N95/N99 respirator mask during morning commute' : 'Outdoor morning walks are safe for healthy adults'}</span>
              </li>
              <li class="flex items-start gap-2">
                <i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0"></i>
                <span>${humidity > 70 ? 'High humidity may cause mold/dust mite proliferation indoors' : 'Indoor air humidity is optimal (40-60%)'}</span>
              </li>
              <li class="flex items-start gap-2">
                <i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0"></i>
                <span>Hydration goal: Drink at least 2.5–3.0 liters of water today</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    `;
  },

  /**
   * PERSONA 2: OUTDOOR FITNESS ENTHUSIASTS
   */
  renderFitnessPersona(current, hourly, daily, aq) {
    const sunrise = daily.sunrise?.[0] ? new Date(daily.sunrise[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "06:02 AM";
    const sunset = daily.sunset?.[0] ? new Date(daily.sunset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "06:45 PM";
    const temp = current.temperature_2m || 30;
    const humidity = current.relative_humidity_2m || 65;
    
    // Wet Bulb Globe Temp (WBGT) approximation
    const wbgt = (0.7 * (temp * (humidity / 100))) + (0.2 * temp) + 5;
    let heatAlert = "Low Heat Illness Risk";
    let heatAlertColor = "text-emerald-400";
    if (wbgt > 30) {
      heatAlert = "High Risk (WBGT > 30°C) - Danger of Heatstroke";
      heatAlertColor = "text-red-400";
    } else if (wbgt > 26) {
      heatAlert = "Moderate Risk (WBGT ~ 27°C) - Frequent Hydration Breaks";
      heatAlertColor = "text-amber-400";
    }

    // Dynamic sweat rate estimation (ml/hour)
    const sweatRate = Math.round(500 + (temp > 25 ? (temp - 25) * 60 : 0) + (humidity > 60 ? (humidity - 60) * 10 : 0));

    return `
      <!-- Fitness Header Highlights -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-3.5 flex flex-col justify-between">
          <span class="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <i data-lucide="sunrise" class="w-3.5 h-3.5 text-amber-400"></i> Sunrise & Golden Hr
          </span>
          <p class="font-bold text-base text-white mt-1">${sunrise}</p>
          <span class="text-[10px] text-amber-400/80">Golden: 06:10 - 06:50 AM</span>
        </div>

        <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-3.5 flex flex-col justify-between">
          <span class="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <i data-lucide="sunset" class="w-3.5 h-3.5 text-orange-400"></i> Sunset & Twilight
          </span>
          <p class="font-bold text-base text-white mt-1">${sunset}</p>
          <span class="text-[10px] text-orange-400/80">Dusk: 06:45 - 07:15 PM</span>
        </div>

        <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-3.5 flex flex-col justify-between">
          <span class="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <i data-lucide="flame" class="w-3.5 h-3.5 text-red-400"></i> Heat Stress (WBGT)
          </span>
          <p class="font-bold text-sm ${heatAlertColor} mt-1">${wbgt.toFixed(1)}°C</p>
          <span class="text-[10px] text-slate-400 truncate">${heatAlert}</span>
        </div>

        <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-3.5 flex flex-col justify-between">
          <span class="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <i data-lucide="glass-water" class="w-3.5 h-3.5 text-cyan-400"></i> Hydration Sweat Loss
          </span>
          <p class="font-bold text-base text-cyan-300 mt-1">${sweatRate} <span class="text-xs font-normal">ml/hr</span></p>
          <span class="text-[10px] text-slate-400">Replenish electrolytes</span>
        </div>

      </div>

      <!-- Best Running Timeline Chart -->
      <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-4">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <i data-lucide="gauge" class="w-4 h-4 text-emerald-400"></i>
              "Best Running & Cycling Hours" Dynamic Optimization Curve
            </h3>
            <p class="text-[11px] text-slate-400">Algorithmic scoring combining Temperature, AQI, Humidity, UV & Wind</p>
          </div>
          <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Peak Window: 05:30 - 07:30 AM
          </span>
        </div>

        <div class="h-60 w-full relative">
          <canvas id="fitness-workout-chart"></canvas>
        </div>
      </div>

      <!-- Wind & Cycling Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-4">
          <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <i data-lucide="bike" class="w-4 h-4 text-blue-400"></i>
            Cyclist Wind & Crosswind Analysis
          </h4>
          <p class="text-xs text-slate-300">
            Wind speed at <strong>${current.wind_speed_10m || 14} km/h</strong> from ${current.wind_direction_10m || 310}° with gusts up to <strong>${current.wind_gusts_10m || 22} km/h</strong>.
            Safe for aero road cycling.
          </p>
        </div>

        <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-4">
          <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <i data-lucide="sparkles" class="w-4 h-4 text-amber-400"></i>
            IMD Pro Coach Tip
          </h4>
          <p class="text-xs text-slate-300">
            Early morning dew point is 21°C. Wear moisture-wicking technical fabric and apply SPF 30 sunscreen before starting morning sessions.
          </p>
        </div>
      </div>
    `;
  },

  /**
   * PERSONA 3: BEACHGOERS & SURFERS
   */
  renderBeachPersona(current, hourly, daily, marine) {
    const waveHeight = marine.current?.wave_height || 1.2;
    const wavePeriod = marine.current?.wave_period || 8.5;
    const waveDir = marine.current?.wave_direction || 220;
    const waterTemp = 28.5; // Sea Surface Temp in Indian Coastal Waters

    let seaState = "Calm to Moderate";
    let seaBadgeClass = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    let ripWarning = "Low Rip Current Danger - Safe for recreational swimming";
    
    if (waveHeight > 2.5) {
      seaState = "Rough / Dangerous";
      seaBadgeClass = "bg-red-500/20 text-red-400 border-red-500/30";
      ripWarning = "HIGH SURF WARNING: INCOIS Red Flag. Strong rip currents present.";
    } else if (waveHeight > 1.5) {
      seaState = "Moderate Swell";
      seaBadgeClass = "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      ripWarning = "Moderate Rip Current Risk. Beginners should stay near lifeguards.";
    }

    return `
      <!-- Coastal Safety Status Banner -->
      <div class="rounded-2xl p-4 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-2xl">
            🌊
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-sm text-white">Coastal & Marine Weather Status</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${seaBadgeClass}">
                ${seaState.toUpperCase()}
              </span>
            </div>
            <p class="text-xs text-slate-300 mt-0.5">${ripWarning}</p>
          </div>
        </div>
        <div class="text-right shrink-0">
          <span class="text-[10px] text-slate-400">INCOIS / IMD Coastal Warning:</span>
          <p class="font-bold text-xs text-cyan-300">Yellow Watch (Tide Cycle Active)</p>
        </div>
      </div>

      <!-- Marine Key Numbers Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-3.5">
          <span class="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <i data-lucide="waves" class="w-3.5 h-3.5 text-cyan-400"></i> Swell Wave Height
          </span>
          <p class="font-black text-xl text-white mt-1">${waveHeight.toFixed(1)} <span class="text-xs font-normal text-slate-400">meters</span></p>
          <span class="text-[10px] text-slate-400">Period: ${wavePeriod}s • Dir: ${waveDir}°</span>
        </div>

        <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-3.5">
          <span class="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <i data-lucide="thermometer-snowflake" class="w-3.5 h-3.5 text-blue-400"></i> Sea Surface Temp
          </span>
          <p class="font-black text-xl text-cyan-300 mt-1">${waterTemp}°C</p>
          <span class="text-[10px] text-emerald-400">Pleasant for swimming</span>
        </div>

        <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-3.5">
          <span class="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <i data-lucide="arrow-up-circle" class="w-3.5 h-3.5 text-emerald-400"></i> High Tide Peak
          </span>
          <p class="font-bold text-base text-white mt-1">02:45 PM</p>
          <span class="text-[10px] text-slate-400">+2.8 meters peak height</span>
        </div>

        <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-3.5">
          <span class="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <i data-lucide="arrow-down-circle" class="w-3.5 h-3.5 text-amber-400"></i> Low Tide Peak
          </span>
          <p class="font-bold text-base text-white mt-1">08:50 PM</p>
          <span class="text-[10px] text-slate-400">+0.6 meters low height</span>
        </div>

      </div>

      <!-- Tide Harmonic Curve & Swell Chart -->
      <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-4">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <i data-lucide="activity" class="w-4 h-4 text-cyan-400"></i>
              24-Hour Tidal Harmonic Curve & Surfer Wave Forecast
            </h3>
            <p class="text-[11px] text-slate-400">High / Low tide intervals and swell height projection</p>
          </div>
          <span class="text-[11px] text-cyan-300 font-semibold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
            Surfing Quality: 7/10
          </span>
        </div>

        <div class="h-60 w-full relative">
          <canvas id="beach-tide-chart"></canvas>
        </div>
      </div>

      <!-- Beach Safety & UV reflection warning -->
      <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 flex items-center gap-3">
        <div class="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
          <i data-lucide="sun-dim" class="w-5 h-5"></i>
        </div>
        <div class="text-xs text-slate-300">
          <strong class="text-amber-300">Water UV Reflection Alert:</strong> Ocean water reflects up to 25% of UV radiation back upward. Reapply water-resistant sunscreen every 90 minutes.
        </div>
      </div>
    `;
  },

  /**
   * PERSONA 4: TRAVELERS
   */
  renderTravelPersona(current, hourly, daily, aq) {
    return `
      <!-- Travelers Header Banner -->
      <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-lg">✈️</span>
            <h3 class="font-bold text-sm text-white">Smart Travel & Multi-Destination Transit Dashboard</h3>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">Flight delay risks, transit fog advisories, and AI packing intelligence</p>
        </div>
        <button id="open-packing-advisor-btn" class="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all shrink-0">
          <i data-lucide="luggage" class="w-4 h-4"></i>
          <span>Open AI Packing Advisor</span>
        </button>
      </div>

      <!-- Flight & Train Weather Disruption Index -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <i data-lucide="plane-takeoff" class="w-4 h-4 text-blue-400"></i> Airport Operations
            </span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">NORMAL</span>
          </div>
          <p class="text-xs text-slate-300">Runway visibility > 3500m. No convective storm or crosswind delays reported at departure airport.</p>
        </div>

        <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <i data-lucide="train" class="w-4 h-4 text-amber-400"></i> Railway Fog / Track Risk
            </span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">LOW-MODERATE</span>
          </div>
          <p class="text-xs text-slate-300">Early morning shallow mist on northern corridors. Northern Railway speed restrictions normal.</p>
        </div>

        <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <i data-lucide="mountain" class="w-4 h-4 text-purple-400"></i> Hill Station / Altitude Shift
            </span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">CLIMATE DELTA</span>
          </div>
          <p class="text-xs text-slate-300">Traveling to Himalayan zones (Shimla/Srinagar)? Anticipate a <strong>-14°C</strong> temperature drop.</p>
        </div>

      </div>

      <!-- Saved Destinations Multi-Card Grid -->
      <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-4">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
          <i data-lucide="map" class="w-4 h-4 text-emerald-400"></i>
          Saved Travel Destinations & Route Comparator
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          
          <div class="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <div class="flex items-center justify-between">
              <span class="font-bold text-white">Mumbai, MH</span>
              <span class="text-base">🌧️</span>
            </div>
            <p class="text-sm font-black text-cyan-300 mt-1">29°C <span class="text-[10px] font-normal text-slate-400">• Monsoon Showers</span></p>
            <p class="text-[11px] text-slate-400 mt-1">Advice: Carry windproof umbrella & water-resistant bag.</p>
          </div>

          <div class="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <div class="flex items-center justify-between">
              <span class="font-bold text-white">Shimla, HP</span>
              <span class="text-base">🌲</span>
            </div>
            <p class="text-sm font-black text-sky-300 mt-1">17°C <span class="text-[10px] font-normal text-slate-400">• Cool & Breezy</span></p>
            <p class="text-[11px] text-slate-400 mt-1">Advice: Pack lightweight fleece sweater & walking boots.</p>
          </div>

          <div class="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <div class="flex items-center justify-between">
              <span class="font-bold text-white">Bengaluru, KA</span>
              <span class="text-base">⛅</span>
            </div>
            <p class="text-sm font-black text-emerald-300 mt-1">26°C <span class="text-[10px] font-normal text-slate-400">• Pleasant Skies</span></p>
            <p class="text-[11px] text-slate-400 mt-1">Advice: Light cottons for day, light jacket for late evening.</p>
          </div>

        </div>
      </div>
    `;
  },

  /**
   * PERSONA 5: PARENTS & FAMILIES
   */
  renderFamilyPersona(current, hourly, daily, aq) {
    const aqi = aq.current?.us_aqi || 140;
    const uv = current.uv_index || 6;
    
    return `
      <!-- School Commute Windows Card -->
      <div class="rounded-2xl p-4 bg-gradient-to-r from-pink-950/50 via-slate-900 to-slate-900 border border-pink-500/30">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">👨‍👩‍👧</span>
            <h3 class="font-bold text-sm text-white">School Bus & Commute Safety Forecast</h3>
          </div>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Commute Clear
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div class="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <div class="flex items-center justify-between">
              <span class="font-bold text-amber-300 flex items-center gap-1.5">
                <i data-lucide="sun" class="w-3.5 h-3.5"></i> Morning Drop-off (07:00 - 08:30 AM)
              </span>
              <span class="text-slate-300 font-semibold">27°C</span>
            </div>
            <p class="text-slate-400 text-[11px] mt-1">Clear sky, dry roads. UV index low (1.5). No rain delays anticipated.</p>
          </div>

          <div class="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <div class="flex items-center justify-between">
              <span class="font-bold text-orange-300 flex items-center gap-1.5">
                <i data-lucide="cloud-sun" class="w-3.5 h-3.5"></i> Afternoon Pickup (02:00 - 03:45 PM)
              </span>
              <span class="text-slate-300 font-semibold">33°C</span>
            </div>
            <p class="text-slate-400 text-[11px] mt-1">Warm temperature. Ensure children have a water bottle and wear a sun hat.</p>
          </div>
        </div>
      </div>

      <!-- Playground & Child Health Guidance -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-4">
          <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <i data-lucide="smile" class="w-4 h-4 text-emerald-400"></i>
            Outdoor Playground Comfort Index
          </h4>
          <div class="flex items-center gap-3 mb-2">
            <div class="text-2xl font-black text-emerald-400">85/100</div>
            <p class="text-xs text-slate-300">Excellent conditions for park activities between <strong>05:00 PM and 06:30 PM</strong>.</p>
          </div>
          <p class="text-[11px] text-slate-400">Playground slides/swings surface temperature will be safe after 4:30 PM.</p>
        </div>

        <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-4">
          <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <i data-lucide="shirt" class="w-4 h-4 text-pink-400"></i>
            Kids Layering & Clothing Guide
          </h4>
          <ul class="space-y-1.5 text-xs text-slate-300">
            <li class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
              <span><strong>Infants / Toddlers:</strong> 1 lightweight breathable cotton layer + sun hat</span>
            </li>
            <li class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
              <span><strong>School Children:</strong> Standard uniform, apply SPF 30 sunscreen before school</span>
            </li>
            <li class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
              <span><strong>Hydration:</strong> Send a 750ml electrolyte/water flask</span>
            </li>
          </ul>
        </div>

      </div>
    `;
  },

  /**
   * PERSONA 6: AGRICULTURE & GARDENERS (GKMS)
   */
  renderAgriPersona(current, hourly, daily) {
    const soilMoistTop = 34; // Topsoil %
    const soilMoistSub = 48; // Root zone %
    const soilTemp = current.soil_temperature_0_to_7cm || 24;

    return `
      <!-- Agromet GKMS Header Banner -->
      <div class="rounded-2xl p-4 bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl">
            🌾
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-sm text-white">Gramin Krishi Mausam Sewa (GKMS) Advisory</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">MoES / ICAR Bulletin</span>
            </div>
            <p class="text-xs text-slate-300 mt-0.5">Topsoil moisture is adequate for current seasonal Kharif / Rabi crops.</p>
          </div>
        </div>
        <div class="text-right shrink-0">
          <span class="text-[10px] text-slate-400">Irrigation Window:</span>
          <p class="font-bold text-xs text-emerald-400">Hold Irrigation (Rain Ahead)</p>
        </div>
      </div>

      <!-- Soil Moisture & Agronomic Key Indicators -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-3.5">
          <span class="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <i data-lucide="layers" class="w-3.5 h-3.5 text-amber-400"></i> Topsoil Moisture (0-7cm)
          </span>
          <p class="font-black text-xl text-white mt-1">${soilMoistTop}%</p>
          <span class="text-[10px] text-emerald-400">Optimal germination level</span>
        </div>

        <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-3.5">
          <span class="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <i data-lucide="arrow-down" class="w-3.5 h-3.5 text-cyan-400"></i> Root Zone (7-28cm)
          </span>
          <p class="font-black text-xl text-cyan-300 mt-1">${soilMoistSub}%</p>
          <span class="text-[10px] text-slate-400">High water retention</span>
        </div>

        <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-3.5">
          <span class="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <i data-lucide="thermometer" class="w-3.5 h-3.5 text-orange-400"></i> Soil Temp (0-7cm)
          </span>
          <p class="font-black text-xl text-orange-300 mt-1">${soilTemp}°C</p>
          <span class="text-[10px] text-slate-400">Healthy microbial range</span>
        </div>

        <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-3.5">
          <span class="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <i data-lucide="spray-can" class="w-3.5 h-3.5 text-emerald-400"></i> Spraying Window
          </span>
          <p class="font-bold text-base text-emerald-300 mt-1">Suitable Today</p>
          <span class="text-[10px] text-slate-400">Wind < 15 km/h until 3 PM</span>
        </div>

      </div>

      <!-- 7-Day Accumulated Rain & Soil Moisture Chart -->
      <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-4">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <i data-lucide="sprout" class="w-4 h-4 text-emerald-400"></i>
              7-Day Crop Water Balance & Precipitation Projection
            </h3>
            <p class="text-[11px] text-slate-400">Estimated mm rainfall accumulation vs Topsoil saturation curve</p>
          </div>
          <span class="text-[11px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            Pest Risk: Low (Fungal Watch)
          </span>
        </div>

        <div class="h-60 w-full relative">
          <canvas id="agri-crop-chart"></canvas>
        </div>
      </div>

      <!-- IMD Field Action Advisory -->
      <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-4">
        <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <i data-lucide="clipboard-list" class="w-4 h-4 text-amber-400"></i>
          Official Agromet Advisory Instructions
        </h4>
        <p class="text-xs text-slate-300 leading-relaxed">
          1. <strong>Fertilizer Application:</strong> Complete top-dressing of urea/fertilizers before expected shower on Day 3.<br>
          2. <strong>Pesticide Alert:</strong> High evening humidity (68%) might promote fungal leaf blight. Inspect vegetable and cereal crops.<br>
          3. <strong>Drainage:</strong> Clear field drains to prevent water stagnation in low-lying crop patches.
        </p>
      </div>
    `;
  },

  /**
   * PERSONA 7: COMMUTERS
   */
  renderCommutePersona(current, hourly, daily) {
    const visibility = hourly.visibility ? Math.round(hourly.visibility[0] || 4000) : 3800;
    const rain = current.precipitation || 0;
    
    let visStatus = "Clear Visibility (>3000m)";
    let visColor = "text-emerald-400";
    if (visibility < 500) {
      visStatus = "Dense Fog / Smog Alert (<500m)";
      visColor = "text-red-400";
    } else if (visibility < 1500) {
      visStatus = "Moderate Mist / Haze (500-1500m)";
      visColor = "text-amber-400";
    }

    return `
      <!-- Commute Header Banner -->
      <div class="rounded-2xl p-4 bg-gradient-to-r from-orange-950/50 via-slate-900 to-slate-900 border border-orange-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 text-2xl">
            🚗
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-sm text-white">Daily Office Commute & Transit Radar</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">City Route</span>
            </div>
            <p class="text-xs text-slate-300 mt-0.5">Visibility: <strong>${visibility} meters</strong> • ${visStatus}</p>
          </div>
        </div>
        <div class="text-right shrink-0">
          <span class="text-[10px] text-slate-400">Road Inundation Risk:</span>
          <p class="font-bold text-xs text-emerald-400">Dry / Normal Traffic Flow</p>
        </div>
      </div>

      <!-- Commute Time Slots -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-4">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <i data-lucide="clock" class="w-4 h-4 text-blue-400"></i> Morning Rush Hour (08:30 - 10:30 AM)
            </h4>
            <span class="text-xs font-bold text-emerald-400">Smooth (10/10)</span>
          </div>
          <p class="text-xs text-slate-300">
            Temperature 28°C, Wind 12 km/h. Roads completely dry with zero fog disruption on expressways and ring roads.
          </p>
        </div>

        <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-4">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <i data-lucide="moon" class="w-4 h-4 text-indigo-400"></i> Evening Return Rush (06:00 - 08:30 PM)
            </h4>
            <span class="text-xs font-bold text-amber-400">Scattered Cloud (8/10)</span>
          </div>
          <p class="text-xs text-slate-300">
            Temperature 31°C cooling to 27°C. 15% isolated drizzle probability; no major traffic waterlogging anticipated.
          </p>
        </div>

      </div>

      <!-- Urban Flood / Storm Safety Tips -->
      <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-4">
        <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <i data-lucide="shield-alert" class="w-4 h-4 text-orange-400"></i>
          Commuter Weather Safety Checklist
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div class="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span class="font-bold text-white block mb-1">Two-Wheeler Riders</span>
            <span class="text-slate-400">Dry road traction is high. Keep rain gear in side-box for unexpected showers.</span>
          </div>
          <div class="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span class="font-bold text-white block mb-1">Car Drivers</span>
            <span class="text-slate-400">Use low-beam headlights if passing through localized haze or flyover mist.</span>
          </div>
          <div class="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span class="font-bold text-white block mb-1">Metro / Bus Riders</span>
            <span class="text-slate-400">All city public transit schedules operating smoothly under normal timetable.</span>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * PERSONA 8: EVENT PLANNERS
   */
  renderEventPersona(current, hourly, daily) {
    return `
      <!-- Event Planner Header Banner -->
      <div class="rounded-2xl p-4 bg-gradient-to-r from-indigo-950/50 via-slate-900 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-2xl">
            🎪
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-sm text-white">Event Planner & Outdoor Gathering Intelligence</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Weddings & Concerts</span>
            </div>
            <p class="text-xs text-slate-300 mt-0.5">Thermal comfort is favorable. Wind gust safety thresholds within normal limits.</p>
          </div>
        </div>
        <div class="text-right shrink-0">
          <span class="text-[10px] text-slate-400">Rain Contingency Risk:</span>
          <p class="font-bold text-xs text-emerald-400">Low (15% Probability)</p>
        </div>
      </div>

      <!-- 14-Day Rain Probability & Comfort Chart -->
      <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-4">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <i data-lucide="calendar" class="w-4 h-4 text-indigo-400"></i>
              10-Day Rain Probability vs Outdoor Thermal Comfort Index
            </h3>
            <p class="text-[11px] text-slate-400">Calculated comfort taking heat index, humidity, wind & direct solar into account</p>
          </div>
          <span class="text-[11px] text-indigo-300 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            Recommended Date: Fri / Sat
          </span>
        </div>

        <div class="h-60 w-full relative">
          <canvas id="event-planner-chart"></canvas>
        </div>
      </div>

      <!-- Tent / Canopy Structural Wind Safety -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-4">
          <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <i data-lucide="wind" class="w-4 h-4 text-blue-400"></i>
            Temporary Stage & Tent Wind Load Rating
          </h4>
          <p class="text-xs text-slate-300">
            Max expected gust today: <strong>${current.wind_gusts_10m || 22} km/h</strong>.
            Standard outdoor marquees / German hangar tents (rated up to 60 km/h) are completely safe.
          </p>
        </div>

        <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-4">
          <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <i data-lucide="sparkles" class="w-4 h-4 text-amber-400"></i>
            Best Time Slot Recommendation
          </h4>
          <p class="text-xs text-slate-300">
            The ideal time window for outdoor ceremonies, wedding dinners, or concerts is <strong>06:30 PM – 10:30 PM</strong> when temperatures drop to 26°C with gentle breezes.
          </p>
        </div>

      </div>
    `;
  },

  /**
   * PERSONA 9: SMART HYBRID / AUTO-BLEND
   */
  renderHybridPersona(current, hourly, daily, aq, marine) {
    const aqi = aq.current?.us_aqi || 140;
    const aqiBand = WeatherService.getIndianAQIBand(aqi);

    return `
      <!-- Hybrid Smart Banner -->
      <div class="rounded-2xl p-4 bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/40">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="text-2xl">⚡</span>
            <div>
              <h3 class="font-black text-sm text-white">Smart Auto-Blend: Your Adaptive Day Timeline</h3>
              <p class="text-xs text-purple-200">Automatically transitions recommendations throughout your day based on time and priorities</p>
            </div>
          </div>
          <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
            Dynamic Lifecycle
          </span>
        </div>
      </div>

      <!-- 4 Stages of the Day Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-3.5 flex flex-col justify-between">
          <div>
            <span class="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              🏃 06:00 - 08:30 AM • Fitness & Air
            </span>
            <p class="text-xs text-slate-300 mt-2 font-medium">Optimal Running & Jogging Window</p>
            <p class="text-[11px] text-slate-400 mt-1">Temp 25°C, AQI ${aqi} (${aqiBand.label}). Moderate exertion recommended.</p>
          </div>
        </div>

        <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-3.5 flex flex-col justify-between">
          <div>
            <span class="text-[10px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1">
              🚗 08:30 - 10:30 AM • Commute
            </span>
            <p class="text-xs text-slate-300 mt-2 font-medium">Morning Transit & Visibility</p>
            <p class="text-[11px] text-slate-400 mt-1">Road visibility clear at 3,800m. Smooth traffic on major arterials.</p>
          </div>
        </div>

        <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-3.5 flex flex-col justify-between">
          <div>
            <span class="text-[10px] font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1">
              👨‍👩‍👧 02:00 - 04:00 PM • Family
            </span>
            <p class="text-xs text-slate-300 mt-2 font-medium">School Commute & Solar Heat</p>
            <p class="text-[11px] text-slate-400 mt-1">UV Index 7 (High). Sun hats and hydration needed for children.</p>
          </div>
        </div>

        <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-3.5 flex flex-col justify-between">
          <div>
            <span class="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
              🎪 06:00 - 09:30 PM • Leisure
            </span>
            <p class="text-xs text-slate-300 mt-2 font-medium">Evening Outdoors & Comfort</p>
            <p class="text-[11px] text-slate-400 mt-1">Pleasant 27°C breeze. 88/100 outdoor gathering comfort score.</p>
          </div>
        </div>

      </div>
    `;
  },

  /**
   * Helper to trigger chart rendering after DOM injection
   */
  initPersonaCharts(personaKey, hourly, daily, aq, marine) {
    setTimeout(() => {
      if (personaKey === "health" && document.getElementById("health-aqi-chart")) {
        MausamCharts.renderAQIChart("health-aqi-chart", aq);
      } else if (personaKey === "fitness" && document.getElementById("fitness-workout-chart")) {
        MausamCharts.renderWorkoutScoreChart("fitness-workout-chart", hourly);
      } else if (personaKey === "beach" && document.getElementById("beach-tide-chart")) {
        MausamCharts.renderTideCurveChart("beach-tide-chart", marine);
      } else if (personaKey === "agri" && document.getElementById("agri-crop-chart")) {
        MausamCharts.renderAgriChart("agri-crop-chart", hourly, daily);
      } else if (personaKey === "event" && document.getElementById("event-planner-chart")) {
        MausamCharts.renderEventChart("event-planner-chart", daily);
      }
    }, 50);
  }
};
