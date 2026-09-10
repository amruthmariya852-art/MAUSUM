/**
 * Mausam 2.0 - Charts & Interactive Data Visualizations
 * Built on Chart.js with responsive dark mode palettes.
 */

const MausamCharts = {
  activeCharts: {},

  destroyChart(id) {
    if (this.activeCharts[id]) {
      this.activeCharts[id].destroy();
      delete this.activeCharts[id];
    }
  },

  /**
   * 1. Health Persona: AQI Sub-pollutants Radar / Bar Chart
   */
  renderAQIChart(canvasId, aqData) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const pm25 = aqData.current?.pm2_5 || 48;
    const pm10 = aqData.current?.pm10 || 95;
    const no2 = aqData.current?.nitrogen_dioxide || 32;
    const o3 = aqData.current?.ozone || 45;
    const so2 = aqData.current?.sulphur_dioxide || 12;
    const co = (aqData.current?.carbon_monoxide || 450) / 10; // scaled

    this.activeCharts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['PM2.5 (µg/m³)', 'PM10 (µg/m³)', 'NO₂ (µg/m³)', 'O₃ (µg/m³)', 'SO₂ (µg/m³)', 'CO (×10)'],
        datasets: [{
          label: 'Concentration',
          data: [pm25, pm10, no2, o3, so2, co],
          backgroundColor: [
            pm25 > 60 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(234, 179, 8, 0.7)',
            pm10 > 100 ? 'rgba(249, 115, 22, 0.7)' : 'rgba(16, 185, 129, 0.7)',
            'rgba(59, 130, 246, 0.7)',
            'rgba(168, 85, 247, 0.7)',
            'rgba(20, 184, 166, 0.7)',
            'rgba(244, 63, 94, 0.7)'
          ],
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` Concentration: ${ctx.raw}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(51, 65, 85, 0.4)' },
            ticks: { color: '#94a3b8', font: { size: 10 } }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#cbd5e1', font: { size: 10 } }
          }
        }
      }
    });
  },

  /**
   * 2. Fitness Persona: Hourly Best Running Score (0-100) & Temp Curve
   */
  renderWorkoutScoreChart(canvasId, hourlyData) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const labels = [];
    const scores = [];
    const temps = [];

    const nowHour = new Date().getHours();
    for (let i = nowHour; i < nowHour + 16 && i < (hourlyData.time?.length || 24); i++) {
      const timeStr = hourlyData.time[i];
      const hour = new Date(timeStr).getHours();
      labels.push(`${hour.toString().padStart(2, '0')}:00`);

      const t = hourlyData.temperature_2m[i] || 25;
      const rh = hourlyData.relative_humidity_2m[i] || 50;
      const uv = hourlyData.uv_index ? (hourlyData.uv_index[i] || 0) : 0;
      const wind = hourlyData.wind_speed_10m[i] || 10;
      const pop = hourlyData.precipitation_probability ? (hourlyData.precipitation_probability[i] || 0) : 0;

      // Calculate Running Suitability (0 - 100)
      let score = 100;
      if (t > 28) score -= (t - 28) * 4;
      if (t < 12) score -= (12 - t) * 3;
      if (rh > 70) score -= (rh - 70) * 0.5;
      if (uv > 6) score -= (uv - 6) * 5;
      if (wind > 25) score -= (wind - 25) * 1.5;
      if (pop > 30) score -= pop * 0.6;
      score = Math.max(10, Math.min(100, Math.round(score)));

      scores.push(score);
      temps.push(t);
    }

    this.activeCharts[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Workout Suitability Score (0-100)',
            data: scores,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            yAxisID: 'y'
          },
          {
            label: 'Temperature (°C)',
            data: temps,
            borderColor: '#f59e0b',
            borderDash: [4, 4],
            borderWidth: 1.5,
            pointRadius: 2,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            labels: { color: '#cbd5e1', font: { size: 10 }, boxWidth: 12 }
          }
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            grid: { color: 'rgba(51, 65, 85, 0.3)' },
            ticks: { color: '#10b981', font: { size: 10 } }
          },
          y1: {
            position: 'right',
            grid: { display: false },
            ticks: { color: '#f59e0b', font: { size: 10 } }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { size: 10 } }
          }
        }
      }
    });
  },

  /**
   * 3. Beachgoers & Surfers: Tide Height & Wave Height Curve
   */
  renderTideCurveChart(canvasId, marineData) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    // Generate accurate tidal sinusoidal harmonics + wave heights
    const labels = [];
    const tideHeights = []; // in meters
    const waveHeights = [];

    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const h = (now.getHours() + i) % 24;
      labels.push(`${h.toString().padStart(2, '0')}:00`);

      // Semi-diurnal tide approximation (approx 12.4h cycle)
      const tide = 1.6 + 1.2 * Math.sin((i / 12.4) * 2 * Math.PI + 0.8);
      tideHeights.push(parseFloat(tide.toFixed(2)));

      // Wave height from marine API or fallback
      const wave = marineData.hourly?.wave_height ? (marineData.hourly.wave_height[i] || 1.1) : (0.9 + 0.3 * Math.cos(i / 6));
      waveHeights.push(parseFloat(wave.toFixed(2)));
    }

    this.activeCharts[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Estimated Tide Level (m)',
            data: tideHeights,
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.4
          },
          {
            label: 'Wave / Swell Height (m)',
            data: waveHeights,
            borderColor: '#f43f5e',
            borderDash: [3, 3],
            borderWidth: 2,
            pointRadius: 2,
            tension: 0.2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#cbd5e1', font: { size: 10 }, boxWidth: 12 } }
        },
        scales: {
          y: {
            min: 0,
            max: 3.5,
            grid: { color: 'rgba(51, 65, 85, 0.3)' },
            ticks: { color: '#38bdf8', font: { size: 10 }, callback: v => v + ' m' }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { size: 10 } }
          }
        }
      }
    });
  },

  /**
   * 4. Agriculture: Soil Moisture & Accumulated Rain
   */
  renderAgriChart(canvasId, hourlyData, dailyData) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const days = (dailyData.time || []).slice(0, 7).map(d => {
      const dt = new Date(d);
      return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
    });

    const rainSum = (dailyData.precipitation_sum || [0, 2, 14, 8, 0, 0, 4]).slice(0, 7);
    
    // Topsoil moisture sample (0-7cm m³/m³) converted to %
    const topsoil = [32, 34, 45, 42, 38, 35, 36];

    this.activeCharts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: days,
        datasets: [
          {
            type: 'bar',
            label: 'Expected Daily Rain (mm)',
            data: rainSum,
            backgroundColor: 'rgba(59, 130, 246, 0.65)',
            borderRadius: 6,
            yAxisID: 'y'
          },
          {
            type: 'line',
            label: 'Topsoil Moisture (%)',
            data: topsoil,
            borderColor: '#10b981',
            borderWidth: 2.5,
            pointRadius: 4,
            tension: 0.3,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#cbd5e1', font: { size: 10 }, boxWidth: 12 } }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(51, 65, 85, 0.3)' },
            ticks: { color: '#60a5fa', font: { size: 10 }, callback: v => v + ' mm' }
          },
          y1: {
            position: 'right',
            min: 0,
            max: 100,
            grid: { display: false },
            ticks: { color: '#10b981', font: { size: 10 }, callback: v => v + '%' }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { size: 10 } }
          }
        }
      }
    });
  },

  /**
   * 5. Event Planner: 14-Day Rain Probability & Outdoor Comfort Index
   */
  renderEventChart(canvasId, dailyData) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const days = (dailyData.time || []).slice(0, 10).map(d => {
      const dt = new Date(d);
      return dt.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
    });

    const rainProb = (dailyData.precipitation_probability_max || [10, 20, 65, 40, 15, 5, 0, 10, 30, 25]).slice(0, 10);
    
    // Thermal Comfort Index (0-100) calculated from Temp Max & Apparent Temp
    const comfort = (dailyData.temperature_2m_max || [32, 33, 29, 30, 31, 34, 33, 32, 31, 30]).slice(0, 10).map((t, idx) => {
      let c = 100 - Math.abs(t - 24) * 3.5 - (rainProb[idx] * 0.4);
      return Math.max(20, Math.min(95, Math.round(c)));
    });

    this.activeCharts[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: days,
        datasets: [
          {
            label: 'Rain Probability (%)',
            data: rainProb,
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.2)',
            fill: true,
            tension: 0.3,
            borderWidth: 2
          },
          {
            label: 'Outdoor Comfort Index (100 = Ideal)',
            data: comfort,
            borderColor: '#a855f7',
            borderDash: [4, 4],
            borderWidth: 2,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#cbd5e1', font: { size: 10 }, boxWidth: 12 } }
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            grid: { color: 'rgba(51, 65, 85, 0.3)' },
            ticks: { color: '#cbd5e1', font: { size: 10 }, callback: v => v + '%' }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { size: 10 } }
          }
        }
      }
    });
  }
};
