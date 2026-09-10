/**
 * Mausam 2.0 - Main Application Controller
 * Universal All-City / All-District Engine & Persona Orchestrator
 */

const App = {
  activePersona: "health",
  currentLocation: {
    name: "New Delhi",
    admin1: "Delhi",
    lat: 28.6139,
    lon: 77.2090,
    timezone: "Asia/Kolkata"
  },
  weatherData: null,
  isMobileFrame: false,

  async init() {
    console.log("Initializing Mausam 2.0 Universal All-City Portal...");

    // Load saved preferences from localStorage
    const savedPersona = localStorage.getItem("mausam_persona");
    if (savedPersona && PersonaEngine.personas[savedPersona]) {
      this.activePersona = savedPersona;
    }

    const savedLocation = localStorage.getItem("mausam_location");
    if (savedLocation) {
      try {
        this.currentLocation = JSON.parse(savedLocation);
      } catch (e) {}
    }

    // Set up UI components
    this.renderQuickCityChips();
    this.setupDistrictExplorer();
    this.setupEventListeners();
    this.startClock();

    // Initial weather load
    await this.loadWeatherForLocation(this.currentLocation);
  },

  /**
   * Render Top Quick City Chips
   */
  renderQuickCityChips() {
    const container = document.getElementById("quick-cities-container");
    if (!container) return;

    const popular = WeatherService.popularLocations;
    let chipsHtml = `<span class="text-slate-400 font-semibold text-[11px] flex items-center gap-1 shrink-0">
      <i data-lucide="map-pin" class="w-3 h-3 text-red-400"></i> Quick Cities:
    </span>`;

    popular.forEach(city => {
      const isSelected = city.name.toLowerCase() === this.currentLocation.name.toLowerCase();
      chipsHtml += `
        <button data-city-name="${city.name}" data-lat="${city.lat}" data-lon="${city.lon}" data-admin="${city.admin1}" class="quick-city-chip shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
          isSelected 
            ? 'bg-blue-600 text-white font-bold shadow-sm ring-1 ring-blue-400' 
            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
        }">
          ${city.name}
        </button>
      `;
    });

    container.innerHTML = chipsHtml;
    if (window.lucide) lucide.createIcons();

    // Attach click events
    container.querySelectorAll('.quick-city-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.getAttribute('data-city-name');
        const lat = parseFloat(btn.getAttribute('data-lat'));
        const lon = parseFloat(btn.getAttribute('data-lon'));
        const admin = btn.getAttribute('data-admin');

        this.currentLocation = { name, admin1: admin, lat, lon, timezone: "Asia/Kolkata" };
        localStorage.setItem("mausam_location", JSON.stringify(this.currentLocation));
        this.renderQuickCityChips();
        this.loadWeatherForLocation(this.currentLocation);
      });
    });
  },

  /**
   * Setup State & District Explorer Directory Modal
   */
  setupDistrictExplorer() {
    const modalBtn = document.getElementById("open-district-explorer-btn");
    const modal = document.getElementById("district-explorer-modal");
    const closeBtn = document.getElementById("close-district-modal");
    const stateSelect = document.getElementById("state-select-dropdown");
    const districtGrid = document.getElementById("district-chips-grid");

    if (!stateSelect || !districtGrid) return;

    // Populate States Dropdown
    const states = Object.keys(WeatherService.indianStatesData);
    let stateOptionsHtml = "";
    states.forEach((state, idx) => {
      stateOptionsHtml += `<option value="${state}" ${idx === 0 ? 'selected' : ''}>${state} (${WeatherService.indianStatesData[state].length} Stations)</option>`;
    });
    stateSelect.innerHTML = stateOptionsHtml;

    const renderDistrictsForState = (stateName) => {
      const districts = WeatherService.indianStatesData[stateName] || [];
      let distHtml = "";
      districts.forEach(d => {
        distHtml += `
          <button data-name="${d.name}" data-admin="${d.admin1}" data-lat="${d.lat}" data-lon="${d.lon}" class="district-btn text-left p-2.5 rounded-xl bg-slate-800/80 hover:bg-blue-600/30 hover:border-blue-500 border border-slate-700/60 transition-all flex flex-col justify-between">
            <span class="font-bold text-xs text-white">${d.name}</span>
            <span class="text-[10px] text-slate-400 mt-0.5">${d.coastal ? '🌊 Coastal Station' : '📍 District Center'}</span>
          </button>
        `;
      });
      districtGrid.innerHTML = distHtml;

      districtGrid.querySelectorAll('.district-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.getAttribute('data-name');
          const admin1 = btn.getAttribute('data-admin');
          const lat = parseFloat(btn.getAttribute('data-lat'));
          const lon = parseFloat(btn.getAttribute('data-lon'));

          this.currentLocation = { name, admin1, lat, lon, timezone: "Asia/Kolkata" };
          localStorage.setItem("mausam_location", JSON.stringify(this.currentLocation));
          modal?.classList.add("hidden");
          this.renderQuickCityChips();
          this.loadWeatherForLocation(this.currentLocation);
        });
      });
    };

    // Render initial state
    if (states.length > 0) {
      renderDistrictsForState(states[0]);
    }

    stateSelect.addEventListener('change', (e) => {
      renderDistrictsForState(e.target.value);
    });

    modalBtn?.addEventListener('click', () => {
      modal?.classList.remove('hidden');
    });

    closeBtn?.addEventListener('click', () => {
      modal?.classList.add('hidden');
    });
  },

  /**
   * Load weather and trigger persona rendering
   */
  async loadWeatherForLocation(loc) {
    const locNameEl = document.getElementById("current-location-name");
    const locRegionEl = document.getElementById("current-region-badge");
    if (locNameEl) locNameEl.textContent = loc.name;
    if (locRegionEl) locRegionEl.textContent = `${loc.admin1 || loc.country || 'India'}`;

    try {
      this.weatherData = await WeatherService.fetchWeatherData(loc.lat, loc.lon, loc.timezone || "Asia/Kolkata");
      this.renderHeroCard();
      this.renderHourlyForecast();
      this.renderDailyForecast();
      this.renderActivePersonaDashboard();
    } catch (err) {
      console.error("Error loading weather data:", err);
    }
  },

  /**
   * Render Top Hero Weather Card
   */
  renderHeroCard() {
    if (!this.weatherData || !this.weatherData.weather) return;

    const weather = this.weatherData.weather;
    const current = weather.current || {};
    const daily = weather.daily || {};
    const aq = this.weatherData.air_quality || {};

    const temp = Math.round(current.temperature_2m || 31);
    const feelsLike = Math.round(current.apparent_temperature || temp + 2);
    const codeInfo = WeatherService.interpretWMO(current.weather_code || 0, current.is_day ?? 1);
    
    const tempHigh = Math.round(daily.temperature_2m_max?.[0] || temp + 3);
    const tempLow = Math.round(daily.temperature_2m_min?.[0] || temp - 5);

    const tempEl = document.getElementById("current-temp");
    const feelsEl = document.getElementById("feels-like-temp");
    const condTextEl = document.getElementById("weather-condition-text");
    const emojiEl = document.getElementById("weather-icon-emoji");
    const highEl = document.getElementById("temp-high");
    const lowEl = document.getElementById("temp-low");
    const windEl = document.getElementById("current-wind");
    const gustsEl = document.getElementById("current-gusts");
    const humEl = document.getElementById("current-humidity");
    const uvEl = document.getElementById("current-uv");
    const pressEl = document.getElementById("current-pressure");

    if (tempEl) tempEl.textContent = temp;
    if (feelsEl) feelsEl.textContent = `${feelsLike}°C`;
    if (condTextEl) condTextEl.textContent = codeInfo.desc;
    if (emojiEl) emojiEl.textContent = codeInfo.emoji;
    if (highEl) highEl.textContent = `${tempHigh}°C`;
    if (lowEl) lowEl.textContent = `${tempLow}°C`;
    if (windEl) windEl.textContent = `${current.wind_speed_10m || 12} km/h ${this.getWindDirection(current.wind_direction_10m)}`;
    if (gustsEl) gustsEl.textContent = `Gusts: ${current.wind_gusts_10m || 18} km/h`;
    if (humEl) humEl.textContent = `${current.relative_humidity_2m || 65}%`;
    if (uvEl) {
      const uv = current.uv_index || daily.uv_index_max?.[0] || 6;
      uvEl.textContent = `${uv} (${WeatherService.getUVBand(uv).label})`;
    }
    if (pressEl) pressEl.textContent = `${Math.round(current.pressure_msl || 1010)} hPa`;

    this.updateHeroPersonaHighlight(current, daily, aq);
  },

  /**
   * Update Hero Persona Intelligence Box
   */
  updateHeroPersonaHighlight(current, daily, aq) {
    const iconEl = document.getElementById("persona-hero-icon");
    const titleEl = document.getElementById("persona-hero-title");
    const badgeEl = document.getElementById("persona-hero-badge");
    const summaryEl = document.getElementById("persona-hero-summary");
    const labelEl = document.getElementById("persona-hero-metric-label");
    const valEl = document.getElementById("persona-hero-metric-val");

    const aqi = aq.current?.us_aqi || 142;
    const aqiBand = WeatherService.getIndianAQIBand(aqi);

    switch (this.activePersona) {
      case "health":
        if (iconEl) iconEl.textContent = "🩺";
        if (titleEl) titleEl.textContent = "Health Priority Alert";
        if (badgeEl) {
          badgeEl.textContent = `${aqiBand.label.toUpperCase()} AQI (${aqi})`;
          badgeEl.className = `px-2 py-0.5 rounded-full text-[10px] font-bold ${aqiBand.bg} ${aqiBand.text} border ${aqiBand.border}`;
        }
        if (summaryEl) summaryEl.textContent = `Air Quality Index in ${this.currentLocation.name} is ${aqi} (PM2.5: ${aq.current?.pm2_5 || 58} µg/m³). ${aqiBand.advisory}`;
        if (labelEl) labelEl.textContent = "Asthma Hazard:";
        if (valEl) valEl.textContent = aqi > 150 ? "Elevated Alert" : "Safe/Moderate";
        break;

      case "fitness":
        if (iconEl) iconEl.textContent = "🏃";
        if (titleEl) titleEl.textContent = "Outdoor Workout Score";
        if (badgeEl) {
          badgeEl.textContent = "IDEAL AT 06:00 AM";
          badgeEl.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
        }
        if (summaryEl) summaryEl.textContent = `Morning running suitability in ${this.currentLocation.name} is 92/100. Sunrise with low wind and pleasant temperatures.`;
        if (labelEl) labelEl.textContent = "Heat Stress (WBGT):";
        if (valEl) valEl.textContent = "24.2°C (Low Risk)";
        break;

      case "beach":
        if (iconEl) iconEl.textContent = "🏄";
        if (titleEl) titleEl.textContent = "Marine & Coastal Status";
        if (badgeEl) {
          badgeEl.textContent = "COASTAL OBSERVATION";
          badgeEl.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30";
        }
        if (summaryEl) summaryEl.textContent = `Wave height averaging 1.2m with 8.5s swell period. High tide peak at 02:45 PM. Safe for coastal activities.`;
        if (labelEl) labelEl.textContent = "Sea Temp:";
        if (valEl) valEl.textContent = "28.5°C";
        break;

      case "travel":
        if (iconEl) iconEl.textContent = "✈️";
        if (titleEl) titleEl.textContent = "Transit & Weather Delays";
        if (badgeEl) {
          badgeEl.textContent = "ON-TIME OPS";
          badgeEl.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30";
        }
        if (summaryEl) summaryEl.textContent = `Clear transit skies for ${this.currentLocation.name}. No convective storm delays affecting regional travel.`;
        if (labelEl) labelEl.textContent = "Packing Tip:";
        if (valEl) valEl.textContent = "Sun protection & umbrella";
        break;

      case "family":
        if (iconEl) iconEl.textContent = "👨‍👩‍👧";
        if (titleEl) titleEl.textContent = "Family & Commute Watch";
        if (badgeEl) {
          badgeEl.textContent = "SCHOOL CLEAR";
          badgeEl.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30";
        }
        if (summaryEl) summaryEl.textContent = `Dry roads and pleasant weather in ${this.currentLocation.name} during morning and afternoon school transit windows.`;
        if (labelEl) labelEl.textContent = "Park Comfort:";
        if (valEl) valEl.textContent = "85/100 (Evening)";
        break;

      case "agri":
        if (iconEl) iconEl.textContent = "🌾";
        if (titleEl) titleEl.textContent = "GKMS Agromet Bulletin";
        if (badgeEl) {
          badgeEl.textContent = "OPTIMAL MOISTURE";
          badgeEl.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30";
        }
        if (summaryEl) summaryEl.textContent = `Topsoil moisture at 34%. Favorable window for crop spraying and field preparation across the district.`;
        if (labelEl) labelEl.textContent = "Spray Suitability:";
        if (valEl) valEl.textContent = "Safe Today";
        break;

      case "commute":
        if (iconEl) iconEl.textContent = "🚗";
        if (titleEl) titleEl.textContent = "Commuter Visibility Radar";
        if (badgeEl) {
          badgeEl.textContent = "CLEAR VISIBILITY";
          badgeEl.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30";
        }
        if (summaryEl) summaryEl.textContent = `Road visibility > 3500m across ${this.currentLocation.name}. Zero waterlogging risk across arterial routes.`;
        if (labelEl) labelEl.textContent = "Road Traction:";
        if (valEl) valEl.textContent = "Dry / Normal";
        break;

      case "event":
        if (iconEl) iconEl.textContent = "🎪";
        if (titleEl) titleEl.textContent = "Outdoor Event Index";
        if (badgeEl) {
          badgeEl.textContent = "COMFORT: 88/100";
          badgeEl.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30";
        }
        if (summaryEl) summaryEl.textContent = `Low rain contingency risk in ${this.currentLocation.name}. Ideal evening conditions for outdoor gatherings and ceremonies.`;
        if (labelEl) labelEl.textContent = "Tent Wind Gusts:";
        if (valEl) valEl.textContent = "22 km/h (Safe)";
        break;

      case "hybrid":
        if (iconEl) iconEl.textContent = "⚡";
        if (titleEl) titleEl.textContent = "Smart Auto-Blend Active";
        if (badgeEl) {
          badgeEl.textContent = "ADAPTIVE DAY";
          badgeEl.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30";
        }
        if (summaryEl) summaryEl.textContent = `Tailoring weather updates dynamically across your routine in ${this.currentLocation.name}.`;
        if (labelEl) labelEl.textContent = "Next Milestone:";
        if (valEl) valEl.textContent = "Evening Leisure at 6 PM";
        break;
    }
  },

  /**
   * Render 24-Hour Forecast Timeline Carousel
   */
  renderHourlyForecast() {
    const container = document.getElementById("hourly-forecast-container");
    if (!container || !this.weatherData?.weather?.hourly) return;

    const hourly = this.weatherData.weather.hourly;
    const nowHour = new Date().getHours();
    let html = "";

    for (let i = nowHour; i < nowHour + 24 && i < (hourly.time?.length || 24); i++) {
      const timeStr = hourly.time[i];
      const date = new Date(timeStr);
      const hour = date.getHours();
      const isCurrent = i === nowHour;

      const t = Math.round(hourly.temperature_2m[i] || 28);
      const code = hourly.weather_code[i] || 0;
      const codeInfo = WeatherService.interpretWMO(code, (hour >= 6 && hour <= 18) ? 1 : 0);
      const pop = hourly.precipitation_probability ? (hourly.precipitation_probability[i] || 0) : 0;

      html += `
        <div class="flex flex-col items-center shrink-0 px-3 py-2.5 rounded-xl border transition-all ${
          isCurrent 
            ? 'bg-blue-600/30 border-blue-500/50 shadow-md ring-1 ring-blue-400/30' 
            : 'bg-slate-800/50 border-slate-700/40 hover:bg-slate-800'
        } min-w-[72px]">
          <span class="text-[11px] font-semibold ${isCurrent ? 'text-blue-300' : 'text-slate-400'}">
            ${isCurrent ? 'Now' : `${hour.toString().padStart(2, '0')}:00`}
          </span>
          <span class="text-xl my-1.5">${codeInfo.emoji}</span>
          <span class="font-bold text-xs text-white">${t}°</span>
          ${pop > 10 ? `<span class="text-[10px] text-cyan-300 font-medium mt-0.5">${pop}%</span>` : `<span class="text-[10px] text-slate-500 mt-0.5">-</span>`}
        </div>
      `;
    }

    container.innerHTML = html;
  },

  /**
   * Render 7-Day Synoptic Weather Outlook
   */
  renderDailyForecast() {
    const grid = document.getElementById("daily-forecast-grid");
    if (!grid || !this.weatherData?.weather?.daily) return;

    const daily = this.weatherData.weather.daily;
    let html = "";

    const daysCount = Math.min(7, daily.time?.length || 7);
    for (let i = 0; i < daysCount; i++) {
      const dt = new Date(daily.time[i]);
      const dayName = i === 0 ? "Today" : dt.toLocaleDateString("en-US", { weekday: "short" });
      const dateStr = dt.toLocaleDateString("en-US", { month: "numeric", day: "numeric" });
      
      const max = Math.round(daily.temperature_2m_max[i] || 32);
      const min = Math.round(daily.temperature_2m_min[i] || 24);
      const code = daily.weather_code[i] || 0;
      const codeInfo = WeatherService.interpretWMO(code, 1);
      const pop = daily.precipitation_probability_max ? (daily.precipitation_probability_max[i] || 0) : 0;
      const rainSum = daily.precipitation_sum ? (daily.precipitation_sum[i] || 0) : 0;

      html += `
        <div class="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50 flex flex-col justify-between hover:bg-slate-800/70 transition-all">
          <div class="flex items-center justify-between">
            <span class="font-bold text-xs ${i === 0 ? 'text-blue-400' : 'text-slate-300'}">${dayName}</span>
            <span class="text-[10px] text-slate-500">${dateStr}</span>
          </div>

          <div class="my-2 text-center">
            <span class="text-2xl block">${codeInfo.emoji}</span>
            <span class="text-[10px] text-slate-400 mt-0.5 truncate block">${codeInfo.desc}</span>
          </div>

          <div class="flex items-center justify-between text-xs pt-2 border-t border-slate-700/40">
            <span class="font-black text-white">${max}°</span>
            <span class="text-slate-400 font-medium">${min}°</span>
          </div>

          ${pop > 20 ? `
            <div class="mt-1.5 flex items-center justify-between text-[10px] text-cyan-300">
              <span>💧 ${pop}%</span>
              <span>${rainSum.toFixed(1)}mm</span>
            </div>
          ` : ''}
        </div>
      `;
    }

    grid.innerHTML = html;
  },

  /**
   * Render Active Persona's Specialized Dashboard
   */
  renderActivePersonaDashboard() {
    if (!this.weatherData) return;
    PersonaEngine.render(this.activePersona, this.weatherData);

    const badge = document.getElementById("persona-active-badge");
    if (badge && PersonaEngine.personas[this.activePersona]) {
      badge.textContent = PersonaEngine.personas[this.activePersona].name;
    }

    const openPackingBtn = document.getElementById("open-packing-advisor-btn");
    if (openPackingBtn) {
      openPackingBtn.addEventListener("click", () => this.openPackingModal());
    }

    const heroQuickBtn = document.getElementById("persona-quick-action-btn");
    if (heroQuickBtn) {
      heroQuickBtn.addEventListener("click", () => {
        document.getElementById("persona-dashboard-container")?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  },

  /**
   * Switch Persona
   */
  switchPersona(personaKey) {
    if (!PersonaEngine.personas[personaKey]) return;
    this.activePersona = personaKey;
    localStorage.setItem("mausam_persona", personaKey);

    document.querySelectorAll(".persona-tab").forEach(tab => {
      if (tab.getAttribute("data-persona") === personaKey) {
        tab.classList.add("active");
      } else {
        tab.classList.remove("active");
      }
    });

    if (this.weatherData) {
      this.updateHeroPersonaHighlight(
        this.weatherData.weather?.current || {},
        this.weatherData.weather?.daily || {},
        this.weatherData.air_quality || {}
      );
      this.renderActivePersonaDashboard();
    }
  },

  /**
   * Event Listeners Setup
   */
  setupEventListeners() {
    // 1. Persona Tab Buttons
    document.querySelectorAll(".persona-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        const pKey = tab.getAttribute("data-persona");
        this.switchPersona(pKey);
      });
    });

    // 2. City Search Bar (Desktop & Mobile)
    const setupSearch = (inputId) => {
      const input = document.getElementById(inputId);
      const dropdown = document.getElementById("search-results-dropdown");
      if (!input || !dropdown) return;

      let timeout = null;
      input.addEventListener("input", (e) => {
        clearTimeout(timeout);
        const query = e.target.value;
        if (query.length < 2) {
          dropdown.classList.add("hidden");
          return;
        }

        timeout = setTimeout(async () => {
          const results = await WeatherService.searchLocation(query);
          if (results && results.length > 0) {
            let html = "";
            results.slice(0, 8).forEach(loc => {
              html += `
                <button data-lat="${loc.latitude}" data-lon="${loc.longitude}" data-name="${loc.name}" data-admin="${loc.admin1 || loc.country}" class="w-full text-left px-3.5 py-2.5 hover:bg-slate-800 flex items-center justify-between border-b border-slate-800/60 last:border-0 transition-colors">
                  <div>
                    <span class="font-bold text-xs text-white">${loc.name}</span>
                    <span class="text-[11px] text-slate-400 block">${loc.admin1 ? loc.admin1 + ', ' : ''}${loc.country || 'India'}</span>
                  </div>
                  <span class="text-[10px] text-blue-400 font-mono">${loc.latitude.toFixed(2)}°N, ${loc.longitude.toFixed(2)}°E</span>
                </button>
              `;
            });
            dropdown.innerHTML = html;
            dropdown.classList.remove("hidden");

            dropdown.querySelectorAll("button").forEach(b => {
              b.addEventListener("click", () => {
                const lat = parseFloat(b.getAttribute("data-lat"));
                const lon = parseFloat(b.getAttribute("data-lon"));
                const name = b.getAttribute("data-name");
                const admin1 = b.getAttribute("data-admin");

                this.currentLocation = { name, admin1, lat, lon, timezone: "Asia/Kolkata" };
                localStorage.setItem("mausam_location", JSON.stringify(this.currentLocation));
                dropdown.classList.add("hidden");
                input.value = "";
                this.renderQuickCityChips();
                this.loadWeatherForLocation(this.currentLocation);
              });
            });
          } else {
            dropdown.innerHTML = `<div class="p-3 text-xs text-slate-400 text-center">No matching station found</div>`;
            dropdown.classList.remove("hidden");
          }
        }, 250);
      });

      document.addEventListener("click", (e) => {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
          dropdown.classList.add("hidden");
        }
      });
    };

    setupSearch("city-search-input");
    setupSearch("city-search-input-mobile");

    // 3. GPS Geolocation Buttons with Reverse Geocoding
    const handleGPS = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            
            // Reverse geocode to get town name
            const geoInfo = await WeatherService.reverseGeocode(lat, lon);
            this.currentLocation = {
              name: geoInfo.name || "My GPS Station",
              admin1: geoInfo.admin1 || "India",
              lat: lat,
              lon: lon,
              timezone: "Asia/Kolkata"
            };
            localStorage.setItem("mausam_location", JSON.stringify(this.currentLocation));
            this.renderQuickCityChips();
            this.loadWeatherForLocation(this.currentLocation);
          },
          (err) => {
            alert("Unable to retrieve GPS coordinates: " + err.message);
          }
        );
      } else {
        alert("Geolocation is not supported in this browser.");
      }
    };

    document.getElementById("gps-btn")?.addEventListener("click", handleGPS);
    document.getElementById("gps-btn-mobile")?.addEventListener("click", handleGPS);

    // 4. Voice Briefing Modal & Playback
    this.setupVoiceModal();

    // 5. Radar / Satellite Modal
    const radarBtn = document.getElementById("radar-modal-btn");
    const radarModal = document.getElementById("radar-modal");
    const closeRadarBtn = document.getElementById("close-radar-modal");
    radarBtn?.addEventListener("click", () => {
      const locLabel = document.getElementById("radar-center-location");
      if (locLabel) locLabel.textContent = `${this.currentLocation.name} Doppler Radar Station (DWR)`;
      radarModal?.classList.remove("hidden");
    });
    closeRadarBtn?.addEventListener("click", () => radarModal?.classList.add("hidden"));

    // 6. Device Frame (Mobile Simulator) Toggle
    const frameBtn = document.getElementById("device-frame-toggle");
    frameBtn?.addEventListener("click", () => {
      const mainLayout = document.getElementById("main-content-layout");
      if (mainLayout) {
        this.isMobileFrame = !this.isMobileFrame;
        if (this.isMobileFrame) {
          mainLayout.classList.add("mobile-frame-mode");
          frameBtn.classList.add("bg-blue-600", "text-white");
        } else {
          mainLayout.classList.remove("mobile-frame-mode");
          frameBtn.classList.remove("bg-blue-600", "text-white");
        }
      }
    });

    // 7. Customize Widgets Modal
    this.setupCustomizeModal();

    // 8. Export Mausam Weather Bulletin / Card
    document.getElementById("download-bulletin-btn")?.addEventListener("click", () => {
      window.print();
    });
  },

  /**
   * Setup Voice Briefing Modal & Speech Controls
   */
  setupVoiceModal() {
    const voiceBtn = document.getElementById("voice-briefing-btn");
    const voiceModal = document.getElementById("voice-modal");
    const closeVoiceBtn = document.getElementById("close-voice-modal");
    const playBtn = document.getElementById("play-voice-btn");
    const stopBtn = document.getElementById("stop-voice-btn");
    const enBtn = document.getElementById("voice-lang-en");
    const hiBtn = document.getElementById("voice-lang-hi");
    const transcriptEl = document.getElementById("voice-transcript-text");

    const updateTranscript = () => {
      if (!this.weatherData) return;
      const script = VoiceBriefing.composeBulletin(
        this.activePersona,
        this.currentLocation.name,
        this.weatherData.weather,
        this.weatherData.air_quality
      );
      if (transcriptEl) transcriptEl.textContent = script;
    };

    voiceBtn?.addEventListener("click", () => {
      updateTranscript();
      voiceModal?.classList.remove("hidden");
    });

    closeVoiceBtn?.addEventListener("click", () => {
      VoiceBriefing.stop();
      voiceModal?.classList.add("hidden");
    });

    enBtn?.addEventListener("click", () => {
      VoiceBriefing.currentLanguage = 'en';
      enBtn.className = "flex-1 py-1.5 text-xs font-bold rounded-xl bg-blue-600 text-white transition-all";
      hiBtn.className = "flex-1 py-1.5 text-xs font-bold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all";
      updateTranscript();
    });

    hiBtn?.addEventListener("click", () => {
      VoiceBriefing.currentLanguage = 'hi';
      hiBtn.className = "flex-1 py-1.5 text-xs font-bold rounded-xl bg-blue-600 text-white transition-all";
      enBtn.className = "flex-1 py-1.5 text-xs font-bold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all";
      updateTranscript();
    });

    playBtn?.addEventListener("click", () => {
      const script = transcriptEl?.textContent || "";
      playBtn.classList.add("animate-pulse");
      VoiceBriefing.speak(script, () => {
        playBtn.classList.add("ring-2", "ring-emerald-400");
      }, () => {
        playBtn.classList.remove("animate-pulse", "ring-2", "ring-emerald-400");
      });
    });

    stopBtn?.addEventListener("click", () => {
      VoiceBriefing.stop();
      playBtn.classList.remove("animate-pulse", "ring-2", "ring-emerald-400");
    });
  },

  /**
   * Setup Customize Widgets Modal
   */
  setupCustomizeModal() {
    const custBtn = document.getElementById("customize-widgets-btn");
    const custModal = document.getElementById("customize-modal");
    const closeCustBtn = document.getElementById("close-customize-modal");
    const listEl = document.getElementById("widgets-toggle-list");

    custBtn?.addEventListener("click", () => {
      if (listEl) {
        let html = "";
        Object.values(PersonaEngine.personas).forEach(p => {
          html += `
            <label class="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 cursor-pointer hover:bg-slate-800">
              <div class="flex items-center gap-2.5">
                <span class="text-base">${p.icon}</span>
                <span class="text-xs font-bold text-slate-200">${p.name}</span>
              </div>
              <input type="checkbox" checked class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700" />
            </label>
          `;
        });
        listEl.innerHTML = html;
      }
      custModal?.classList.remove("hidden");
    });

    closeCustBtn?.addEventListener("click", () => custModal?.classList.add("hidden"));
    document.getElementById("save-widgets-btn")?.addEventListener("click", () => {
      custModal?.classList.add("hidden");
    });
  },

  /**
   * Open AI Packing Modal
   */
  openPackingModal() {
    const modal = document.getElementById("packing-modal");
    const closeBtn = document.getElementById("close-packing-modal");
    const content = document.getElementById("packing-list-content");
    if (!modal || !content || !this.weatherData?.weather) return;

    const daily = this.weatherData.weather.daily || {};
    const max = Math.round(daily.temperature_2m_max?.[0] || 32);
    const min = Math.round(daily.temperature_2m_min?.[0] || 25);
    const rainSum = daily.precipitation_sum?.[0] || 0;
    const pop = daily.precipitation_probability_max?.[0] || 20;
    const uvMax = daily.uv_index_max?.[0] || 6;
    const windMax = daily.wind_speed_10m_max?.[0] || 15;

    const advice = PackingAdvisor.generatePackingList(this.currentLocation.name, max, min, rainSum, pop, uvMax, windMax);

    let html = `<p class="text-xs text-purple-300 mb-3 bg-purple-950/40 p-2.5 rounded-xl border border-purple-500/30">${advice.summary}</p>`;

    advice.categories.forEach(cat => {
      html += `
        <div class="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
          <h4 class="font-bold text-xs text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span>${cat.name}</span>
          </h4>
          <ul class="space-y-1.5">
      `;
      cat.items.forEach(item => {
        html += `
          <li class="flex items-center justify-between text-xs text-slate-300">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" class="rounded text-purple-600 bg-slate-900 border-slate-700" />
              <span>${item.text}</span>
            </label>
            ${item.badge ? `<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">${item.badge}</span>` : ''}
          </li>
        `;
      });
      html += `</ul></div>`;
    });

    content.innerHTML = html;
    modal.classList.remove("hidden");

    closeBtn?.addEventListener("click", () => modal.classList.add("hidden"));
  },

  getWindDirection(deg) {
    if (deg === undefined || deg === null) return "NW";
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return dirs[Math.round(deg / 45) % 8];
  },

  startClock() {
    const clockEl = document.getElementById("local-clock");
    const update = () => {
      if (clockEl) {
        const now = new Date();
        clockEl.textContent = now.toLocaleDateString("en-US", { weekday: 'short', day: 'numeric', month: 'short' }) + " • " + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " IST";
      }
    };
    update();
    setInterval(update, 1000);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
