/**
 * Mausam 2.0 - Weather & Meteorological Data Service
 * Integrates live forecast, air quality, marine, agromet, and pan-India geocoding.
 */

const WeatherService = {
  currentLocation: {
    name: "New Delhi",
    admin1: "Delhi",
    country: "India",
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: "Asia/Kolkata"
  },

  // Comprehensive Indian States & UTs with sample districts for instant browse
  indianStatesData: {
    "Delhi": [
      { name: "New Delhi", lat: 28.6139, lon: 77.2090, admin1: "Delhi" },
      { name: "North Delhi", lat: 28.7041, lon: 77.1025, admin1: "Delhi" },
      { name: "South Delhi", lat: 28.5355, lon: 77.2090, admin1: "Delhi" }
    ],
    "Maharashtra": [
      { name: "Mumbai", lat: 19.0760, lon: 72.8777, admin1: "Maharashtra", coastal: true },
      { name: "Pune", lat: 18.5204, lon: 73.8567, admin1: "Maharashtra" },
      { name: "Nagpur", lat: 21.1458, lon: 79.0882, admin1: "Maharashtra" },
      { name: "Nashik", lat: 19.9975, lon: 73.7898, admin1: "Maharashtra" },
      { name: "Chhatrapati Sambhajinagar", lat: 19.8762, lon: 75.3433, admin1: "Maharashtra" }
    ],
    "Karnataka": [
      { name: "Bengaluru", lat: 12.9716, lon: 77.5946, admin1: "Karnataka" },
      { name: "Mysuru", lat: 12.2958, lon: 76.6394, admin1: "Karnataka" },
      { name: "Mangaluru", lat: 12.9141, lon: 74.8560, admin1: "Karnataka", coastal: true },
      { name: "Hubballi-Dharwad", lat: 15.3647, lon: 75.1240, admin1: "Karnataka" },
      { name: "Belagavi", lat: 15.8497, lon: 74.4977, admin1: "Karnataka" }
    ],
    "Tamil Nadu": [
      { name: "Chennai", lat: 13.0827, lon: 80.2707, admin1: "Tamil Nadu", coastal: true },
      { name: "Coimbatore", lat: 11.0168, lon: 76.9558, admin1: "Tamil Nadu" },
      { name: "Madurai", lat: 9.9252, lon: 78.1198, admin1: "Tamil Nadu" },
      { name: "Tiruchirappalli", lat: 10.7905, lon: 78.7047, admin1: "Tamil Nadu" },
      { name: "Kanyakumari", lat: 8.0883, lon: 77.5385, admin1: "Tamil Nadu", coastal: true }
    ],
    "West Bengal": [
      { name: "Kolkata", lat: 22.5726, lon: 88.3639, admin1: "West Bengal", coastal: true },
      { name: "Darjeeling", lat: 27.0410, lon: 88.2663, admin1: "West Bengal" },
      { name: "Siliguri", lat: 26.7271, lon: 88.3953, admin1: "West Bengal" },
      { name: "Digha", lat: 21.6266, lon: 87.5074, admin1: "West Bengal", coastal: true },
      { name: "Asansol", lat: 23.6739, lon: 86.9524, admin1: "West Bengal" }
    ],
    "Odisha": [
      { name: "Bhubaneswar", lat: 20.2961, lon: 85.8245, admin1: "Odisha" },
      { name: "Puri", lat: 19.8135, lon: 85.8312, admin1: "Odisha", coastal: true },
      { name: "Cuttack", lat: 20.4625, lon: 85.8828, admin1: "Odisha" },
      { name: "Rourkela", lat: 22.2604, lon: 84.8536, admin1: "Odisha" },
      { name: "Gopalpur", lat: 19.2606, lon: 84.9080, admin1: "Odisha", coastal: true }
    ],
    "Uttar Pradesh": [
      { name: "Lucknow", lat: 26.8467, lon: 80.9462, admin1: "Uttar Pradesh" },
      { name: "Varanasi", lat: 25.3176, lon: 82.9739, admin1: "Uttar Pradesh" },
      { name: "Noida", lat: 28.5355, lon: 77.3910, admin1: "Uttar Pradesh" },
      { name: "Kanpur", lat: 26.4499, lon: 80.3319, admin1: "Uttar Pradesh" },
      { name: "Agra", lat: 27.1767, lon: 78.0081, admin1: "Uttar Pradesh" },
      { name: "Prayagraj", lat: 25.4358, lon: 81.8463, admin1: "Uttar Pradesh" },
      { name: "Gorakhpur", lat: 26.7606, lon: 83.3732, admin1: "Uttar Pradesh" }
    ],
    "Rajasthan": [
      { name: "Jaipur", lat: 26.9124, lon: 75.7873, admin1: "Rajasthan" },
      { name: "Udaipur", lat: 24.5854, lon: 73.7125, admin1: "Rajasthan" },
      { name: "Jodhpur", lat: 26.2389, lon: 73.0243, admin1: "Rajasthan" },
      { name: "Jaisalmer", lat: 26.9157, lon: 70.9083, admin1: "Rajasthan" },
      { name: "Kota", lat: 25.2138, lon: 75.8648, admin1: "Rajasthan" }
    ],
    "Gujarat": [
      { name: "Ahmedabad", lat: 23.0225, lon: 72.5714, admin1: "Gujarat" },
      { name: "Surat", lat: 21.1702, lon: 72.8311, admin1: "Gujarat", coastal: true },
      { name: "Vadodara", lat: 22.3072, lon: 73.1812, admin1: "Gujarat" },
      { name: "Rajkot", lat: 22.3039, lon: 70.8022, admin1: "Gujarat" },
      { name: "Dwarka", lat: 22.2442, lon: 68.9685, admin1: "Gujarat", coastal: true }
    ],
    "Kerala": [
      { name: "Kochi", lat: 9.9312, lon: 76.2673, admin1: "Kerala", coastal: true },
      { name: "Thiruvananthapuram", lat: 8.5241, lon: 76.9366, admin1: "Kerala", coastal: true },
      { name: "Kozhikode", lat: 11.2588, lon: 75.7804, admin1: "Kerala", coastal: true },
      { name: "Munnar", lat: 10.0889, lon: 77.0595, admin1: "Kerala" }
    ],
    "Himachal Pradesh": [
      { name: "Shimla", lat: 31.1048, lon: 77.1734, admin1: "Himachal Pradesh" },
      { name: "Manali", lat: 32.2432, lon: 77.1892, admin1: "Himachal Pradesh" },
      { name: "Dharamshala", lat: 32.2190, lon: 76.3234, admin1: "Himachal Pradesh" },
      { name: "Kullu", lat: 31.9579, lon: 77.1095, admin1: "Himachal Pradesh" }
    ],
    "Jammu and Kashmir & Ladakh": [
      { name: "Srinagar", lat: 34.0837, lon: 74.7973, admin1: "Jammu and Kashmir" },
      { name: "Jammu", lat: 32.7266, lon: 74.8570, admin1: "Jammu and Kashmir" },
      { name: "Gulmarg", lat: 34.0484, lon: 74.3805, admin1: "Jammu and Kashmir" },
      { name: "Leh", lat: 34.1526, lon: 77.5771, admin1: "Ladakh" }
    ],
    "Goa": [
      { name: "Panaji (North Goa)", lat: 15.4909, lon: 73.8278, admin1: "Goa", coastal: true },
      { name: "Margao (South Goa)", lat: 15.2832, lon: 73.9862, admin1: "Goa", coastal: true },
      { name: "Calangute", lat: 15.5439, lon: 73.7554, admin1: "Goa", coastal: true }
    ],
    "Punjab & Haryana": [
      { name: "Chandigarh", lat: 30.7333, lon: 76.7794, admin1: "Chandigarh" },
      { name: "Ludhiana", lat: 30.9010, lon: 75.8573, admin1: "Punjab" },
      { name: "Amritsar", lat: 31.6340, lon: 74.8723, admin1: "Punjab" },
      { name: "Gurugram", lat: 28.4595, lon: 77.0266, admin1: "Haryana" },
      { name: "Faridabad", lat: 28.4089, lon: 77.3178, admin1: "Haryana" }
    ],
    "Telangana & Andhra Pradesh": [
      { name: "Hyderabad", lat: 17.3850, lon: 78.4867, admin1: "Telangana" },
      { name: "Warangal", lat: 17.9689, lon: 79.5941, admin1: "Telangana" },
      { name: "Visakhapatnam", lat: 17.6868, lon: 83.2185, admin1: "Andhra Pradesh", coastal: true },
      { name: "Vijayawada", lat: 16.5062, lon: 80.6480, admin1: "Andhra Pradesh" },
      { name: "Tirupati", lat: 13.6288, lon: 79.4192, admin1: "Andhra Pradesh" }
    ],
    "North-East (Assam, Meghalaya, Sikkim, etc.)": [
      { name: "Guwahati", lat: 26.1445, lon: 91.7362, admin1: "Assam" },
      { name: "Shillong", lat: 25.5788, lon: 91.8933, admin1: "Meghalaya" },
      { name: "Cherrapunji", lat: 25.2986, lon: 91.7317, admin1: "Meghalaya" },
      { name: "Gangtok", lat: 27.3389, lon: 88.6065, admin1: "Sikkim" },
      { name: "Agartala", lat: 23.8315, lon: 91.2868, admin1: "Tripura" },
      { name: "Imphal", lat: 24.8170, lon: 93.9368, admin1: "Manipur" },
      { name: "Aizawl", lat: 23.7271, lon: 92.7176, admin1: "Mizoram" },
      { name: "Kohima", lat: 25.6751, lon: 94.1086, admin1: "Nagaland" },
      { name: "Itanagar", lat: 27.0844, lon: 93.6053, admin1: "Arunachal Pradesh" }
    ],
    "Bihar & Jharkhand": [
      { name: "Patna", lat: 25.5941, lon: 85.1376, admin1: "Bihar" },
      { name: "Gaya", lat: 24.7914, lon: 85.0002, admin1: "Bihar" },
      { name: "Ranchi", lat: 23.3441, lon: 85.3096, admin1: "Jharkhand" },
      { name: "Jamshedpur", lat: 22.8046, lon: 86.2029, admin1: "Jharkhand" }
    ],
    "Madhya Pradesh & Chhattisgarh": [
      { name: "Bhopal", lat: 23.2599, lon: 77.4126, admin1: "Madhya Pradesh" },
      { name: "Indore", lat: 22.7196, lon: 75.8577, admin1: "Madhya Pradesh" },
      { name: "Gwalior", lat: 26.2183, lon: 78.1828, admin1: "Madhya Pradesh" },
      { name: "Jabalpur", lat: 23.1815, lon: 79.9864, admin1: "Madhya Pradesh" },
      { name: "Raipur", lat: 21.2514, lon: 81.6296, admin1: "Chhattisgarh" }
    ],
    "Islands & Coastal UTs": [
      { name: "Port Blair", lat: 11.6234, lon: 92.7265, admin1: "Andaman and Nicobar", coastal: true },
      { name: "Kavaratti", lat: 10.5667, lon: 72.6417, admin1: "Lakshadweep", coastal: true },
      { name: "Puducherry", lat: 11.9416, lon: 79.8083, admin1: "Puducherry", coastal: true },
      { name: "Daman", lat: 20.3974, lon: 72.8328, admin1: "Dadra and Nagar Haveli and Daman and Diu", coastal: true }
    ]
  },

  // Popular quick carousel cities
  popularLocations: [
    { name: "New Delhi", admin1: "Delhi", lat: 28.6139, lon: 77.2090, type: "National Capital" },
    { name: "Mumbai", admin1: "Maharashtra", lat: 19.0760, lon: 72.8777, type: "West Coastal" },
    { name: "Bengaluru", admin1: "Karnataka", lat: 12.9716, lon: 77.5946, type: "Tech Hub / Plateau" },
    { name: "Chennai", admin1: "Tamil Nadu", lat: 13.0827, lon: 80.2707, type: "South Coastal" },
    { name: "Kolkata", admin1: "West Bengal", lat: 22.5726, lon: 88.3639, type: "East Metro" },
    { name: "Puri", admin1: "Odisha", lat: 19.8135, lon: 85.8312, type: "Beach & Temple" },
    { name: "Shimla", admin1: "Himachal Pradesh", lat: 31.1048, lon: 77.1734, type: "Himalayan Hill" },
    { name: "Goa (Panaji)", admin1: "Goa", lat: 15.4909, lon: 73.8278, type: "Coastal Tourism" },
    { name: "Srinagar", admin1: "J&K", lat: 34.0837, lon: 74.7973, type: "Himalayan Valley" },
    { name: "Jaipur", admin1: "Rajasthan", lat: 26.9124, lon: 75.7873, type: "Arid / Heritage" },
    { name: "Kochi", admin1: "Kerala", lat: 9.9312, lon: 76.2673, type: "Arabian Sea Coast" },
    { name: "Ludhiana", admin1: "Punjab", lat: 30.9010, lon: 75.8573, type: "Agri Heartland" },
    { name: "Varanasi", admin1: "Uttar Pradesh", lat: 25.3176, lon: 82.9739, type: "Gangetic Plain" },
    { name: "Guwahati", admin1: "Assam", lat: 26.1445, lon: 91.7362, type: "North-East Hub" },
    { name: "Port Blair", admin1: "A&N Islands", lat: 11.6234, lon: 92.7265, type: "Island Hub" }
  ],

  cachedData: null,

  /**
   * Search locations by query string (global + Indian coverage)
   */
  async searchLocation(query) {
    if (!query || query.trim().length < 2) return [];
    try {
      const resp = await fetch(`/api/geocode?name=${encodeURIComponent(query)}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.results && data.results.length > 0) {
          return data.results;
        }
      }
    } catch (e) {
      console.warn("API Geocode proxy failed, searching local presets:", e);
    }

    // Comprehensive client-side fallback across all Indian States
    const q = query.toLowerCase().trim();
    const matches = [];

    // Search inside all states
    Object.entries(this.indianStatesData).forEach(([state, cities]) => {
      cities.forEach(city => {
        if (
          city.name.toLowerCase().includes(q) || 
          city.admin1.toLowerCase().includes(q) ||
          state.toLowerCase().includes(q)
        ) {
          matches.push({
            name: city.name,
            admin1: city.admin1,
            country: "India",
            latitude: city.lat,
            longitude: city.lon,
            timezone: "Asia/Kolkata"
          });
        }
      });
    });

    return matches;
  },

  /**
   * Reverse Geocode (convert coordinates into town / district name)
   */
  async reverseGeocode(lat, lon) {
    try {
      const resp = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
      if (resp.ok) {
        return await resp.json();
      }
    } catch (e) {
      console.warn("Reverse geocode failed:", e);
    }
    return { name: `Station (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E)`, admin1: "India", country: "India" };
  },

  /**
   * Fetch complete meteorological bundle for any coordinates worldwide
   */
  async fetchWeatherData(lat, lon, tz = "Asia/Kolkata") {
    try {
      const resp = await fetch(`/api/weather?lat=${lat}&lon=${lon}&tz=${encodeURIComponent(tz)}`);
      if (resp.ok) {
        const data = await resp.json();
        this.cachedData = data;
        return data;
      }
      throw new Error("Server error " + resp.status);
    } catch (err) {
      console.warn("Falling back to client-side direct fetch:", err);
      return this.fetchDirectOpenMeteo(lat, lon, tz);
    }
  },

  /**
   * Direct browser fetch fallback
   */
  async fetchDirectOpenMeteo(lat, lon, tz) {
    try {
      const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&timezone=${tz}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,visibility,wind_speed_10m,wind_gusts_10m,uv_index,soil_moisture_0_to_7cm,soil_moisture_7_to_28cm,soil_temperature_0_to_7cm&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,rain_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max&forecast_days=14`;
      const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&timezone=${tz}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust,uv_index&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust,uv_index,grass_pollen,birch_pollen,ragweed_pollen&forecast_days=5`;
      const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&timezone=${tz}&current=wave_height,wave_direction,wave_period,wind_wave_height,wind_wave_direction,wind_wave_period,swell_wave_height,swell_wave_direction,swell_wave_period&hourly=wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_period&forecast_days=5`;

      const [wResp, aqResp, mResp] = await Promise.allSettled([
        fetch(forecastUrl).then(r => r.json()),
        fetch(aqUrl).then(r => r.json()),
        fetch(marineUrl).then(r => r.json())
      ]);

      const data = {
        weather: wResp.status === 'fulfilled' ? wResp.value : {},
        air_quality: aqResp.status === 'fulfilled' ? aqResp.value : {},
        marine: mResp.status === 'fulfilled' ? mResp.value : {},
        timestamp: new Date().toISOString(),
        provider: "India Meteorological Department (MoES)"
      };
      this.cachedData = data;
      return data;
    } catch (e) {
      console.error("Critical: offline fallback", e);
      return {};
    }
  },

  /**
   * Convert WMO Weather Codes to IMD-styled condition descriptions and icons
   */
  interpretWMO(code, isDay = 1) {
    const codeMap = {
      0: { desc: "Clear Sky", emoji: isDay ? "☀️" : "🌙", icon: "sun", class: "text-amber-400" },
      1: { desc: "Mainly Clear", emoji: isDay ? "🌤️" : "🌤️", icon: "sun", class: "text-amber-300" },
      2: { desc: "Partly Cloudy", emoji: "⛅", icon: "cloud-sun", class: "text-blue-300" },
      3: { desc: "Overcast", emoji: "☁️", icon: "cloud", class: "text-slate-400" },
      45: { desc: "Fog / Mist", emoji: "🌫️", icon: "cloud-fog", class: "text-slate-300" },
      48: { desc: "Depositing Rime Fog", emoji: "🌫️", icon: "cloud-fog", class: "text-slate-300" },
      51: { desc: "Light Drizzle", emoji: "🌦️", icon: "cloud-drizzle", class: "text-cyan-300" },
      53: { desc: "Moderate Drizzle", emoji: "🌦️", icon: "cloud-drizzle", class: "text-cyan-400" },
      55: { desc: "Dense Drizzle", emoji: "🌧️", icon: "cloud-rain", class: "text-blue-400" },
      61: { desc: "Slight Rain", emoji: "🌧️", icon: "cloud-rain", class: "text-blue-400" },
      63: { desc: "Moderate Rain", emoji: "🌧️", icon: "cloud-rain", class: "text-blue-500" },
      65: { desc: "Heavy Monsoon Rain", emoji: "⛈️", icon: "cloud-rain", class: "text-indigo-400" },
      71: { desc: "Slight Snowfall", emoji: "🌨️", icon: "snowflake", class: "text-sky-200" },
      73: { desc: "Moderate Snowfall", emoji: "❄️", icon: "snowflake", class: "text-sky-300" },
      75: { desc: "Heavy Snowfall", emoji: "❄️", icon: "snowflake", class: "text-sky-400" },
      80: { desc: "Slight Rain Showers", emoji: "🌦️", icon: "cloud-rain", class: "text-blue-300" },
      81: { desc: "Moderate Showers", emoji: "🌧️", icon: "cloud-rain", class: "text-blue-400" },
      82: { desc: "Violent Rain Showers", emoji: "⛈️", icon: "cloud-lightning", class: "text-purple-400" },
      95: { desc: "Thunderstorm with Lightning", emoji: "⛈️", icon: "cloud-lightning", class: "text-amber-400" },
      96: { desc: "Thunderstorm with Hail", emoji: "⛈️", icon: "cloud-hail", class: "text-red-400" },
      99: { desc: "Severe Thunderstorm / Squall", emoji: "🌪️", icon: "cloud-lightning", class: "text-red-500" }
    };

    return codeMap[code] || { desc: "Partly Cloudy", emoji: "⛅", icon: "cloud-sun", class: "text-blue-300" };
  },

  /**
   * Helper: Categorize AQI into Indian National AQI bands
   */
  getIndianAQIBand(aqiVal) {
    if (aqiVal <= 50) return { label: "Good", color: "#10b981", bg: "bg-emerald-500/20", border: "border-emerald-500/30", text: "text-emerald-400", advisory: "Air quality is satisfactory. Minimal health impact." };
    if (aqiVal <= 100) return { label: "Satisfactory", color: "#84cc16", bg: "bg-lime-500/20", border: "border-lime-500/30", text: "text-lime-400", advisory: "Minor breathing discomfort to sensitive people." };
    if (aqiVal <= 200) return { label: "Moderate", color: "#eab308", bg: "bg-yellow-500/20", border: "border-yellow-500/30", text: "text-yellow-400", advisory: "Breathing discomfort to people with lungs, asthma and heart diseases." };
    if (aqiVal <= 300) return { label: "Poor", color: "#f97316", bg: "bg-orange-500/20", border: "border-orange-500/30", text: "text-orange-400", advisory: "Breathing discomfort to most people on prolonged exposure." };
    if (aqiVal <= 400) return { label: "Very Poor", color: "#ef4444", bg: "bg-red-500/20", border: "border-red-500/30", text: "text-red-400", advisory: "Respiratory illness on prolonged exposure. Wear N95 mask outdoors." };
    return { label: "Severe", color: "#7f1d1d", bg: "bg-red-950/50", border: "border-red-600/50", text: "text-red-500", advisory: "Severe health hazard. Affects healthy people and seriously impacts vulnerable." };
  },

  /**
   * Helper: UV Index Danger Band
   */
  getUVBand(uv) {
    if (uv <= 2) return { label: "Low", color: "text-emerald-400", desc: "No protection needed. Safe outdoors." };
    if (uv <= 5) return { label: "Moderate", color: "text-yellow-400", desc: "Wear sunglasses & SPF 15+ sunscreen during midday." };
    if (uv <= 7) return { label: "High", color: "text-orange-400", desc: "Cover up, seek shade, wear hat & SPF 30+ sunscreen." };
    if (uv <= 10) return { label: "Very High", color: "text-red-400", desc: "Extra protection required. Avoid direct sun between 11 AM - 3 PM." };
    return { label: "Extreme", color: "text-purple-400", desc: "Dangerous radiation. Unprotected skin can burn in minutes. Stay indoors." };
  }
};
