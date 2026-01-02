"""
Hotspots API endpoints.
"""
from flask import Blueprint, request, jsonify
import sys
import os
import pandas as pd

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import PROCESSED_DATA_DIR

hotspots_bp = Blueprint('hotspots', __name__)

@hotspots_bp.route('/data', methods=['GET'])
def get_hotspots_data():
    """Get processed hotspots data."""
    try:
        # Load comprehensive features data
        features_path = os.path.join(PROCESSED_DATA_DIR, 'comprehensive_features.csv')
        if os.path.exists(features_path):
            df = pd.read_csv(features_path)
            # Convert to dict for JSON response
            data = df.to_dict('records')
            return jsonify({
                'status': 'success',
                'data': data,
                'count': len(data)
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Hotspots data file not found'
            }), 404
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@hotspots_bp.route('/summary', methods=['GET'])
def get_hotspots_summary():
    """Get summary statistics of hotspots data."""
    try:
        features_path = os.path.join(PROCESSED_DATA_DIR, 'comprehensive_features.csv')
        if os.path.exists(features_path):
            df = pd.read_csv(features_path)

            summary = {
                'total_records': len(df),
                'columns': list(df.columns),
                'data_types': df.dtypes.astype(str).to_dict(),
                'numeric_summary': df.describe().to_dict() if len(df) > 0 else {}
            }

            return jsonify({
                'status': 'success',
                'data': summary
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Hotspots data file not found'
            }), 404
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500