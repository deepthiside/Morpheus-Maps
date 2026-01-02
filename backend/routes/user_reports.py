"""
User reports API endpoints.
"""
from flask import Blueprint, request, jsonify
import sys
import os

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.user_reports import user_report_service
from services.maps_service import maps_service

user_reports_bp = Blueprint('user_reports', __name__)

@user_reports_bp.route('/report_risk', methods=['POST'])
def report_risk():
    """Submit a user risk report."""
    data = request.get_json()
    
    if not data:
        return jsonify({'status': 'error', 'message': 'No data provided'}), 400
    
    # Validate required fields
    required_fields = ['location', 'risk_level', 'description']
    for field in required_fields:
        if field not in data:
            return jsonify({'status': 'error', 'message': f'{field} is required'}), 400
    
    # If location is an address, geocode it
    if isinstance(data['location'], str):
        geocoded = maps_service.geocode(data['location'])
        if not geocoded:
            return jsonify({'status': 'error', 'message': 'Could not geocode address'}), 400
        data['location'] = geocoded
    
    # Validate risk level
    valid_risk_levels = ['low', 'moderate', 'high', 'severe']
    if data['risk_level'] not in valid_risk_levels:
        return jsonify({'status': 'error', 'message': f'Invalid risk level. Must be one of {valid_risk_levels}'}), 400
    
    # Add report
    report = user_report_service.add_report(data)
    
    return jsonify({
        'status': 'success',
        'data': report
    })

@user_reports_bp.route('/reports', methods=['GET'])
def get_reports():
    """Get user reports."""
    limit = request.args.get('limit', 100, type=int)
    offset = request.args.get('offset', 0, type=int)
    
    reports = user_report_service.get_reports(limit, offset)
    
    return jsonify({
        'status': 'success',
        'data': reports,
        'meta': {
            'total': len(reports),
            'limit': limit,
            'offset': offset
        }
    })

@user_reports_bp.route('/reports/nearby', methods=['GET'])
def get_nearby_reports():
    """Get user reports near a location."""
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    address = request.args.get('address')
    radius = request.args.get('radius', 5, type=float)
    
    if not (lat and lon) and not address:
        return jsonify({'status': 'error', 'message': 'Either lat/lon or address is required'}), 400
    
    # If address is provided, geocode it
    if address:
        geocoded = maps_service.geocode(address)
        if not geocoded:
            return jsonify({'status': 'error', 'message': 'Could not geocode address'}), 400
        lat = geocoded['lat']
        lon = geocoded['lon']
    
    location = {'lat': float(lat), 'lon': float(lon)}
    
    # Get nearby reports
    reports = user_report_service.get_reports_near_location(location, radius)
    
    return jsonify({
        'status': 'success',
        'data': reports,
        'meta': {
            'total': len(reports),
            'radius_km': radius
        }
    })