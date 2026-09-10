"""
Mausam Personalized Homepage - Backend Server (Python 3.12 Standard Library)
MoES / India Meteorological Department - Problem Statement ID: 26076
"""

import http.server
import socketserver
import urllib.request
import urllib.parse
import json
import os
import sys
from datetime import datetime

PORT = int(os.environ.get("PORT", 8000))
DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")


class MausamRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        query = urllib.parse.parse_qs(parsed_url.query)

        # API: Geocoding search proxy
        if path == "/api/geocode":
            self.handle_geocode(query)
            return

        # API: Reverse Geocode proxy (coords -> city name)
        if path == "/api/reverse-geocode":
            self.handle_reverse_geocode(query)
            return

        # API: Unified Weather & Persona Data Proxy
        if path == "/api/weather":
            self.handle_weather(query)
            return

        # API: Health check
        if path == "/api/health":
            self.send_json_response(
                {
                    "status": "healthy",
                    "service": "Mausam Personalized API",
                    "version": "2.1.0",
                }
            )
            return

        # Static files fallback
        super().do_GET()

    def send_json_response(self, data, status_code=200):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "public, max-age=300")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode("utf-8"))

    def handle_geocode(self, query):
        q = query.get("name", [""])[0].strip()
        if not q:
            self.send_json_response({"results": []})
            return

        try:
            url = f"https://geocoding-api.open-meteo.com/v1/search?name={urllib.parse.quote(q)}&count=20&language=en&format=json"
            req = urllib.request.Request(
                url, headers={"User-Agent": "MausamApp/2.1 (MoES/IMD)"}
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                data = json.loads(response.read().decode("utf-8"))
                self.send_json_response(data)
        except Exception as e:
            # Fallback extensive Indian cities lookup
            fallback = self.fallback_indian_cities(q)
            self.send_json_response(
                {"results": fallback, "fallback": True, "error": str(e)}
            )

    def handle_reverse_geocode(self, query):
        lat = query.get("lat", [""])[0].strip()
        lon = query.get("lon", [""])[0].strip()
        if not lat or not lon:
            self.send_json_response({"name": "Custom Location", "admin1": "India"})
            return

        try:
            url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json&zoom=10"
            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": "MausamPersonalizedApp/2.1 (MoES-IMD-Hackathon)"
                },
            )
            with urllib.request.urlopen(req, timeout=4) as response:
                data = json.loads(response.read().decode("utf-8"))
                addr = data.get("address", {})
                city_name = (
                    addr.get("city")
                    or addr.get("town")
                    or addr.get("district")
                    or addr.get("county")
                    or addr.get("state_district")
                    or "Local Station"
                )
                state_name = addr.get("state") or addr.get("country") or "India"
                self.send_json_response(
                    {
                        "name": city_name,
                        "admin1": state_name,
                        "country": addr.get("country", "India"),
                    }
                )
        except Exception:
            self.send_json_response(
                {
                    "name": f"Station ({float(lat):.2f}°N, {float(lon):.2f}°E)",
                    "admin1": "India",
                    "country": "India",
                }
            )

    def fallback_indian_cities(self, query):
        cities = [
            # Northern India
            {
                "name": "New Delhi",
                "latitude": 28.6139,
                "longitude": 77.2090,
                "country": "India",
                "admin1": "Delhi",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Noida",
                "latitude": 28.5355,
                "longitude": 77.3910,
                "country": "India",
                "admin1": "Uttar Pradesh",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Gurugram",
                "latitude": 28.4595,
                "longitude": 77.0266,
                "country": "India",
                "admin1": "Haryana",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Chandigarh",
                "latitude": 30.7333,
                "longitude": 76.7794,
                "country": "India",
                "admin1": "Chandigarh",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Ludhiana",
                "latitude": 30.9010,
                "longitude": 75.8573,
                "country": "India",
                "admin1": "Punjab",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Amritsar",
                "latitude": 31.6340,
                "longitude": 74.8723,
                "country": "India",
                "admin1": "Punjab",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Shimla",
                "latitude": 31.1048,
                "longitude": 77.1734,
                "country": "India",
                "admin1": "Himachal Pradesh",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Manali",
                "latitude": 32.2432,
                "longitude": 77.1892,
                "country": "India",
                "admin1": "Himachal Pradesh",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Dharamshala",
                "latitude": 32.2190,
                "longitude": 76.3234,
                "country": "India",
                "admin1": "Himachal Pradesh",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Srinagar",
                "latitude": 34.0837,
                "longitude": 74.7973,
                "country": "India",
                "admin1": "Jammu and Kashmir",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Jammu",
                "latitude": 32.7266,
                "longitude": 74.8570,
                "country": "India",
                "admin1": "Jammu and Kashmir",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Leh",
                "latitude": 34.1526,
                "longitude": 77.5771,
                "country": "India",
                "admin1": "Ladakh",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Dehradun",
                "latitude": 30.3165,
                "longitude": 78.0322,
                "country": "India",
                "admin1": "Uttarakhand",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Haridwar",
                "latitude": 29.9457,
                "longitude": 78.1642,
                "country": "India",
                "admin1": "Uttarakhand",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Lucknow",
                "latitude": 26.8467,
                "longitude": 80.9462,
                "country": "India",
                "admin1": "Uttar Pradesh",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Varanasi",
                "latitude": 25.3176,
                "longitude": 82.9739,
                "country": "India",
                "admin1": "Uttar Pradesh",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Kanpur",
                "latitude": 26.4499,
                "longitude": 80.3319,
                "country": "India",
                "admin1": "Uttar Pradesh",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Agra",
                "latitude": 27.1767,
                "longitude": 78.0081,
                "country": "India",
                "admin1": "Uttar Pradesh",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Prayagraj",
                "latitude": 25.4358,
                "longitude": 81.8463,
                "country": "India",
                "admin1": "Uttar Pradesh",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Jaipur",
                "latitude": 26.9124,
                "longitude": 75.7873,
                "country": "India",
                "admin1": "Rajasthan",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Udaipur",
                "latitude": 24.5854,
                "longitude": 73.7125,
                "country": "India",
                "admin1": "Rajasthan",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Jodhpur",
                "latitude": 26.2389,
                "longitude": 73.0243,
                "country": "India",
                "admin1": "Rajasthan",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Jaisalmer",
                "latitude": 26.9157,
                "longitude": 70.9083,
                "country": "India",
                "admin1": "Rajasthan",
                "timezone": "Asia/Kolkata",
            },
            # Western & Central India
            {
                "name": "Mumbai",
                "latitude": 19.0760,
                "longitude": 72.8777,
                "country": "India",
                "admin1": "Maharashtra",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Pune",
                "latitude": 18.5204,
                "longitude": 73.8567,
                "country": "India",
                "admin1": "Maharashtra",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Nagpur",
                "latitude": 21.1458,
                "longitude": 79.0882,
                "country": "India",
                "admin1": "Maharashtra",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Nashik",
                "latitude": 19.9975,
                "longitude": 73.7898,
                "country": "India",
                "admin1": "Maharashtra",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Ahmedabad",
                "latitude": 23.0225,
                "longitude": 72.5714,
                "country": "India",
                "admin1": "Gujarat",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Surat",
                "latitude": 21.1702,
                "longitude": 72.8311,
                "country": "India",
                "admin1": "Gujarat",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Vadodara",
                "latitude": 22.3072,
                "longitude": 73.1812,
                "country": "India",
                "admin1": "Gujarat",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Rajkot",
                "latitude": 22.3039,
                "longitude": 70.8022,
                "country": "India",
                "admin1": "Gujarat",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Bhopal",
                "latitude": 23.2599,
                "longitude": 77.4126,
                "country": "India",
                "admin1": "Madhya Pradesh",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Indore",
                "latitude": 22.7196,
                "longitude": 75.8577,
                "country": "India",
                "admin1": "Madhya Pradesh",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Gwalior",
                "latitude": 26.2183,
                "longitude": 78.1828,
                "country": "India",
                "admin1": "Madhya Pradesh",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Raipur",
                "latitude": 21.2514,
                "longitude": 81.6296,
                "country": "India",
                "admin1": "Chhattisgarh",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Goa (Panaji)",
                "latitude": 15.4909,
                "longitude": 73.8278,
                "country": "India",
                "admin1": "Goa",
                "timezone": "Asia/Kolkata",
            },
            # Southern India
            {
                "name": "Bengaluru",
                "latitude": 12.9716,
                "longitude": 77.5946,
                "country": "India",
                "admin1": "Karnataka",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Mysuru",
                "latitude": 12.2958,
                "longitude": 76.6394,
                "country": "India",
                "admin1": "Karnataka",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Mangaluru",
                "latitude": 12.9141,
                "longitude": 74.8560,
                "country": "India",
                "admin1": "Karnataka",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Hubballi",
                "latitude": 15.3647,
                "longitude": 75.1240,
                "country": "India",
                "admin1": "Karnataka",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Chennai",
                "latitude": 13.0827,
                "longitude": 80.2707,
                "country": "India",
                "admin1": "Tamil Nadu",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Coimbatore",
                "latitude": 11.0168,
                "longitude": 76.9558,
                "country": "India",
                "admin1": "Tamil Nadu",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Madurai",
                "latitude": 9.9252,
                "longitude": 78.1198,
                "country": "India",
                "admin1": "Tamil Nadu",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Kanyakumari",
                "latitude": 8.0883,
                "longitude": 77.5385,
                "country": "India",
                "admin1": "Tamil Nadu",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Hyderabad",
                "latitude": 17.3850,
                "longitude": 78.4867,
                "country": "India",
                "admin1": "Telangana",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Warangal",
                "latitude": 17.9689,
                "longitude": 79.5941,
                "country": "India",
                "admin1": "Telangana",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Visakhapatnam",
                "latitude": 17.6868,
                "longitude": 83.2185,
                "country": "India",
                "admin1": "Andhra Pradesh",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Vijayawada",
                "latitude": 16.5062,
                "longitude": 80.6480,
                "country": "India",
                "admin1": "Andhra Pradesh",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Tirupati",
                "latitude": 13.6288,
                "longitude": 79.4192,
                "country": "India",
                "admin1": "Andhra Pradesh",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Kochi",
                "latitude": 9.9312,
                "longitude": 76.2673,
                "country": "India",
                "admin1": "Kerala",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Thiruvananthapuram",
                "latitude": 8.5241,
                "longitude": 76.9366,
                "country": "India",
                "admin1": "Kerala",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Kozhikode",
                "latitude": 11.2588,
                "longitude": 75.7804,
                "country": "India",
                "admin1": "Kerala",
                "timezone": "Asia/Kolkata",
            },
            # Eastern & North-Eastern India
            {
                "name": "Kolkata",
                "latitude": 22.5726,
                "longitude": 88.3639,
                "country": "India",
                "admin1": "West Bengal",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Darjeeling",
                "latitude": 27.0410,
                "longitude": 88.2663,
                "country": "India",
                "admin1": "West Bengal",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Siliguri",
                "latitude": 26.7271,
                "longitude": 88.3953,
                "country": "India",
                "admin1": "West Bengal",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Bhubaneswar",
                "latitude": 20.2961,
                "longitude": 85.8245,
                "country": "India",
                "admin1": "Odisha",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Puri",
                "latitude": 19.8135,
                "longitude": 85.8312,
                "country": "India",
                "admin1": "Odisha",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Cuttack",
                "latitude": 20.4625,
                "longitude": 85.8828,
                "country": "India",
                "admin1": "Odisha",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Patna",
                "latitude": 25.5941,
                "longitude": 85.1376,
                "country": "India",
                "admin1": "Bihar",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Gaya",
                "latitude": 24.7914,
                "longitude": 85.0002,
                "country": "India",
                "admin1": "Bihar",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Ranchi",
                "latitude": 23.3441,
                "longitude": 85.3096,
                "country": "India",
                "admin1": "Jharkhand",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Jamshedpur",
                "latitude": 22.8046,
                "longitude": 86.2029,
                "country": "India",
                "admin1": "Jharkhand",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Guwahati",
                "latitude": 26.1445,
                "longitude": 91.7362,
                "country": "India",
                "admin1": "Assam",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Silchar",
                "latitude": 24.8333,
                "longitude": 92.7789,
                "country": "India",
                "admin1": "Assam",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Shillong",
                "latitude": 25.5788,
                "longitude": 91.8933,
                "country": "India",
                "admin1": "Meghalaya",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Cherrapunji (Sohra)",
                "latitude": 25.2986,
                "longitude": 91.7317,
                "country": "India",
                "admin1": "Meghalaya",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Gangtok",
                "latitude": 27.3389,
                "longitude": 88.6065,
                "country": "India",
                "admin1": "Sikkim",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Imphal",
                "latitude": 24.8170,
                "longitude": 93.9368,
                "country": "India",
                "admin1": "Manipur",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Aizawl",
                "latitude": 23.7271,
                "longitude": 92.7176,
                "country": "India",
                "admin1": "Mizoram",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Agartala",
                "latitude": 23.8315,
                "longitude": 91.2868,
                "country": "India",
                "admin1": "Tripura",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Kohima",
                "latitude": 25.6751,
                "longitude": 94.1086,
                "country": "India",
                "admin1": "Nagaland",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Itanagar",
                "latitude": 27.0844,
                "longitude": 93.6053,
                "country": "India",
                "admin1": "Arunachal Pradesh",
                "timezone": "Asia/Kolkata",
            },
            {
                "name": "Port Blair",
                "latitude": 11.6234,
                "longitude": 92.7265,
                "country": "India",
                "admin1": "Andaman and Nicobar Islands",
                "timezone": "Asia/Kolkata",
            },
        ]
        q_lower = query.lower()
        return [
            c
            for c in cities
            if q_lower in c["name"].lower() or q_lower in c.get("admin1", "").lower()
        ]

    def handle_weather(self, query):
        lat = query.get("lat", ["28.6139"])[0]
        lon = query.get("lon", ["77.2090"])[0]
        tz = query.get("tz", ["Asia/Kolkata"])[0]

        try:
            # 1. Fetch Forecast Weather (Current, Hourly, Daily, Soil Moisture, UV)
            forecast_params = urllib.parse.urlencode(
                {
                    "latitude": lat,
                    "longitude": lon,
                    "timezone": tz,
                    "current": "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m",
                    "hourly": "temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,visibility,wind_speed_10m,wind_gusts_10m,uv_index,soil_moisture_0_to_7cm,soil_moisture_7_to_28cm,soil_temperature_0_to_7cm",
                    "daily": "weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,rain_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max",
                    "forecast_days": 14,
                }
            )
            forecast_url = f"https://api.open-meteo.com/v1/forecast?{forecast_params}"

            # 2. Fetch Air Quality (AQI, PM2.5, PM10, Nitrogen Dioxide, Ozone, Pollen count if available)
            aq_params = urllib.parse.urlencode(
                {
                    "latitude": lat,
                    "longitude": lon,
                    "timezone": tz,
                    "current": "european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust,uv_index",
                    "hourly": "pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust,uv_index,grass_pollen,birch_pollen,ragweed_pollen",
                    "forecast_days": 5,
                }
            )
            aq_url = (
                f"https://air-quality-api.open-meteo.com/v1/air-quality?{aq_params}"
            )

            # 3. Fetch Marine Data (Wave height, period, direction, swell)
            marine_params = urllib.parse.urlencode(
                {
                    "latitude": lat,
                    "longitude": lon,
                    "timezone": tz,
                    "current": "wave_height,wave_direction,wave_period,wind_wave_height,wind_wave_direction,wind_wave_period,swell_wave_height,swell_wave_direction,swell_wave_period",
                    "hourly": "wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_period",
                    "forecast_days": 5,
                }
            )
            marine_url = f"https://marine-api.open-meteo.com/v1/marine?{marine_params}"

            # Fetch concurrently or sequentially
            req_weather = urllib.request.Request(
                forecast_url, headers={"User-Agent": "MausamApp/2.0"}
            )
            with urllib.request.urlopen(req_weather, timeout=6) as resp:
                weather_data = json.loads(resp.read().decode("utf-8"))

            aq_data = {}
            try:
                req_aq = urllib.request.Request(
                    aq_url, headers={"User-Agent": "MausamApp/2.0"}
                )
                with urllib.request.urlopen(req_aq, timeout=4) as resp_aq:
                    aq_data = json.loads(resp_aq.read().decode("utf-8"))
            except Exception:
                aq_data = {"error": "AQI service fallback"}

            marine_data = {}
            try:
                req_marine = urllib.request.Request(
                    marine_url, headers={"User-Agent": "MausamApp/2.0"}
                )
                with urllib.request.urlopen(req_marine, timeout=4) as resp_marine:
                    marine_data = json.loads(resp_marine.read().decode("utf-8"))
            except Exception:
                marine_data = {"error": "Inland location or marine offline"}

            combined = {
                "weather": weather_data,
                "air_quality": aq_data,
                "marine": marine_data,
                "timestamp": datetime.now().isoformat(),
                "provider": "India Meteorological Department (MoES) Gateway",
            }
            self.send_json_response(combined)
        except Exception as e:
            self.send_json_response({"error": str(e)}, status_code=500)


def main():
    print(f"================================================================")
    print(f"  MAUSAM 2.0 - Personalized Homepage Server (MoES / IMD)       ")
    print(f"  Problem Statement ID: 26076 (Smart Automation / Weather App)  ")
    print(f"================================================================")
    print(f"Serving static and API on http://127.0.0.1:{PORT}")

    os.makedirs(DIRECTORY, exist_ok=True)

    with socketserver.TCPServer(("", PORT), MausamRequestHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down Mausam server...")
            httpd.server_close()


if __name__ == "__main__":
    main()
