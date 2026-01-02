"""
Maps service for geocoding addresses.
Uses Google Maps API to convert addresses to coordinates.
"""
import requests
import json
import os
from config import GOOGLE_MAPS_API_KEY

class MapsService:
    def __init__(self):
        self.api_key = GOOGLE_MAPS_API_KEY
        self.base_url = 'https://maps.googleapis.com/maps/api/geocode/json'

    def geocode(self, address):
        """
        Geocode an address to latitude and longitude.

        Args:
            address (str): Address to geocode

        Returns:
            dict: {'lat': float, 'lon': float} or None if failed
        """
        if not self.api_key or self.api_key == 'your_google_maps_api_key_here':
            print("⚠️ Google Maps API key not configured, using dummy geocoding")
            return self._dummy_geocode(address)

        try:
            params = {
                'address': address,
                'key': self.api_key
            }

            response = requests.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()

            if data['status'] == 'OK' and data['results']:
                location = data['results'][0]['geometry']['location']
                return {
                    'lat': location['lat'],
                    'lon': location['lng']
                }
            else:
                print(f"❌ Geocoding failed for '{address}': {data.get('status', 'Unknown error')}")
                return None

        except requests.exceptions.RequestException as e:
            print(f"❌ Error geocoding address '{address}': {e}")
            return self._dummy_geocode(address)
        except Exception as e:
            print(f"❌ Unexpected error in geocoding: {e}")
            return self._dummy_geocode(address)

    def _dummy_geocode(self, address):
        """Return dummy coordinates for testing when API is not available."""
        # Return coordinates for a default location (e.g., center of India)
        print(f"📍 Using dummy coordinates for '{address}'")
        return {
            'lat': 20.5937,  # Center of India
            'lon': 78.9629
        }

    def reverse_geocode(self, lat, lon):
        """
        Reverse geocode coordinates to address.

        Args:
            lat (float): Latitude
            lon (float): Longitude

        Returns:
            str: Address or None if failed
        """
        if not self.api_key or self.api_key == 'your_google_maps_api_key_here':
            return f"Location at {lat}, {lon}"

        try:
            url = 'https://maps.googleapis.com/maps/api/geocode/json'
            params = {
                'latlng': f"{lat},{lon}",
                'key': self.api_key
            }

            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()

            if data['status'] == 'OK' and data['results']:
                return data['results'][0]['formatted_address']
            else:
                return f"Location at {lat}, {lon}"

        except Exception as e:
            print(f"❌ Error reverse geocoding {lat}, {lon}: {e}")
            return f"Location at {lat}, {lon}"

# Create singleton instance
maps_service = MapsService()