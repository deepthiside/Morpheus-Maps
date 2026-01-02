"""
Weather API endpoints.
"""
from flask import Blueprint, request, jsonify
import sys
import os

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.weather_service import weather_service

weather_bp = Blueprint('weather', __name__)

@weather_bp.route('/current/<float:lat>/<float:lon>', methods=['GET'])
def get_current_weather(lat, lon):
    """Get current weather for a location."""
    try:
        weather_data = weather_service.get_current_weather(lat, lon)
        return jsonify({
            'status': 'success',
            'data': weather_data
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@weather_bp.route('/current', methods=['POST'])
def get_weather_by_location():
    """Get current weather for a location from POST data."""
    data = request.get_json()

    if not data or 'lat' not in data or 'lon' not in data:
        return jsonify({
            'status': 'error',
            'message': 'Latitude and longitude are required'
        }), 400

    try:
        lat = float(data['lat'])
        lon = float(data['lon'])
        weather_data = weather_service.get_current_weather(lat, lon)
        return jsonify({
            'status': 'success',
            'data': weather_data
        })
    except ValueError:
        return jsonify({
            'status': 'error',
            'message': 'Invalid latitude or longitude'
        }), 400
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500