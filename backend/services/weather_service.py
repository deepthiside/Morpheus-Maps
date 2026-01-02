"""
Weather service for fetching current weather data.
Uses OpenWeatherMap API to get weather conditions for risk prediction.
"""
import requests
import json
import os
import time
from datetime import datetime, timedelta
from config import OPENWEATHER_API_KEY, WEATHER_CACHE_PATH, WEATHER_CACHE_EXPIRY, WEATHER_API_BASE_URL

class WeatherService:
    def __init__(self):
        self.api_key = OPENWEATHER_API_KEY
        self.base_url = WEATHER_API_BASE_URL
        self.cache = self._load_cache()
        self.cache_expiry = WEATHER_CACHE_EXPIRY

    def _load_cache(self):
        """Load weather cache from file."""
        if os.path.exists(WEATHER_CACHE_PATH):
            try:
                with open(WEATHER_CACHE_PATH, 'r') as f:
                    return json.load(f)
            except Exception as e:
                print(f"Warning: Could not load weather cache: {e}")
        return {}

    def _save_cache(self):
        """Save weather cache to file."""
        try:
            os.makedirs(os.path.dirname(WEATHER_CACHE_PATH), exist_ok=True)
            with open(WEATHER_CACHE_PATH, 'w') as f:
                json.dump(self.cache, f, indent=2)
        except Exception as e:
            print(f"Warning: Could not save weather cache: {e}")

    def _get_cache_key(self, lat, lon):
        """Generate cache key for location."""
        return f"{round(float(lat), 2)}_{round(float(lon), 2)}"

    def _is_cache_valid(self, cache_entry):
        """Check if cache entry is still valid."""
        if not cache_entry or 'timestamp' not in cache_entry:
            return False
        cache_time = datetime.fromisoformat(cache_entry['timestamp'])
        return datetime.now() - cache_time < timedelta(seconds=self.cache_expiry)

    def get_current_weather(self, lat, lon):
        """
        Get current weather data for a location.

        Args:
            lat (float): Latitude
            lon (float): Longitude

        Returns:
            dict: Weather data with weather_condition, temperature, humidity, etc.
        """
        cache_key = self._get_cache_key(lat, lon)

        # Check cache first
        if cache_key in self.cache and self._is_cache_valid(self.cache[cache_key]):
            print(f"📡 Using cached weather data for {lat}, {lon}")
            return self.cache[cache_key]['data']

        # Fetch from API
        try:
            url = f"{self.base_url}/weather"
            params = {
                'lat': lat,
                'lon': lon,
                'appid': self.api_key,
                'units': 'metric'
            }

            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()

            # Extract relevant weather information
            weather_info = {
                'weather_condition': data['weather'][0]['main'] if data.get('weather') else 'Clear',
                'temperature': data.get('main', {}).get('temp', 25),
                'humidity': data.get('main', {}).get('humidity', 50),
                'pressure': data.get('main', {}).get('pressure', 1013),
                'wind_speed': data.get('wind', {}).get('speed', 0),
                'visibility': data.get('visibility', 10000),
                'description': data['weather'][0]['description'] if data.get('weather') else 'clear sky',
                'timestamp': datetime.now().isoformat()
            }

            # Cache the result
            self.cache[cache_key] = {
                'data': weather_info,
                'timestamp': datetime.now().isoformat()
            }
            self._save_cache()

            print(f"🌤️ Fetched weather data for {lat}, {lon}: {weather_info['weather_condition']}")
            return weather_info

        except requests.exceptions.RequestException as e:
            print(f"❌ Error fetching weather data: {e}")
            # Return default weather data
            return self._get_default_weather()
        except Exception as e:
            print(f"❌ Unexpected error in weather service: {e}")
            return self._get_default_weather()

    def _get_default_weather(self):
        """Return default weather data when API fails."""
        return {
            'weather_condition': 'Clear',
            'temperature': 25,
            'humidity': 50,
            'pressure': 1013,
            'wind_speed': 0,
            'visibility': 10000,
            'description': 'clear sky',
            'timestamp': datetime.now().isoformat()
        }

# Create singleton instance
weather_service = WeatherService()