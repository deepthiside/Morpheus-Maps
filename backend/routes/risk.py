"""
Risk prediction API endpoints.
"""
from flask import Blueprint, request, jsonify
import sys
import os

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.risk_service import risk_service
from services.maps_service import maps_service

risk_bp = Blueprint('risk', __name__)

@risk_bp.route('/predict_risk', methods=['POST'])
def predict_risk():
    """Predict risk for a single location."""
    data = request.get_json()
    
    if not data:
        return jsonify({'status': 'error', 'message': 'No data provided'}), 400
    
    # Check if location is provided
    if 'location' not in data:
        return jsonify({'status': 'error', 'message': 'Location is required'}), 400
    
    location = data['location']
    
    # If location is an address, geocode it
    if isinstance(location, str):
        geocoded = maps_service.geocode(location)
        if not geocoded:
            return jsonify({'status': 'error', 'message': 'Could not geocode address'}), 400
        location = geocoded
    
    # Make prediction
    prediction = risk_service.predict_risk(location)
    
    return jsonify({
        'status': 'success',
        'data': prediction
    })

@risk_bp.route('/predict_route_risk', methods=['POST'])
def predict_route_risk():
    """Predict risk for a route between two points."""
    data = request.get_json()
    
    if not data:
        return jsonify({'status': 'error', 'message': 'No data provided'}), 400
    
    # Check if origin and destination are provided
    if 'origin' not in data or 'destination' not in data:
        return jsonify({'status': 'error', 'message': 'Origin and destination are required'}), 400
    
    origin = data['origin']
    destination = data['destination']
    
    # If origin or destination is an address, geocode it
    if isinstance(origin, str):
        geocoded = maps_service.geocode(origin)
        if not geocoded:
            return jsonify({'status': 'error', 'message': 'Could not geocode origin address'}), 400
        origin = geocoded
    
    if isinstance(destination, str):
        geocoded = maps_service.geocode(destination)
        if not geocoded:
            return jsonify({'status': 'error', 'message': 'Could not geocode destination address'}), 400
        destination = geocoded
    
    # Get route points
    route_points = maps_service.get_route(origin, destination)
    
    if not route_points:
        return jsonify({'status': 'error', 'message': 'Could not find route'}), 400
    
    # Predict risk for each point
    predictions = risk_service.predict_route_risk(route_points)
    
    # Calculate overall route risk
    if predictions:
        avg_risk = sum(p['risk_score'] for p in predictions) / len(predictions)
        max_risk = max(predictions, key=lambda p: p['risk_score'])
        
        # Determine overall risk level
        risk_levels = {
            'low': 0,
            'moderate': 0,
            'high': 0,
            'severe': 0
        }
        
        for p in predictions:
            risk_levels[p['risk_level']] += 1
        
        dominant_risk = max(risk_levels.items(), key=lambda x: x[1])[0]
    else:
        avg_risk = 0
        max_risk = None
        dominant_risk = 'unknown'
    
    return jsonify({
        'status': 'success',
        'data': {
            'route_points': route_points,
            'predictions': predictions,
            'summary': {
                'average_risk': avg_risk,
                'max_risk': max_risk,
                'dominant_risk_level': dominant_risk,
                'total_points': len(predictions)
            }
        }
    })