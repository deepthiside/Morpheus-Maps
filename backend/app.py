"""
Main Flask application entry point for Road Accident Hotspot Prediction.
Supports hybrid deployment (local, Docker, cloud).
"""
from flask import Flask, jsonify, send_from_directory, send_file
from flask_cors import CORS
import os
import sys
import logging
from logging.handlers import RotatingFileHandler

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import routes
from routes.risk import risk_bp
from routes.weather import weather_bp
from routes.user_reports import user_reports_bp
from routes.hotspots import hotspots_bp
from routes.auth import auth_bp

# Import configuration
from config import (
    DEBUG, HOST, PORT, DEPLOYMENT_ENV, 
    ALLOWED_ORIGINS, LOG_LEVEL, LOG_FILE, SECRET_KEY
)

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY

# Configure CORS based on deployment environment
if DEPLOYMENT_ENV == 'cloud':
    CORS(app, origins=ALLOWED_ORIGINS)
else:
    CORS(app)  # Allow all origins for local/docker development

# Configure logging
if not DEBUG:
    if not os.path.exists('logs'):
        os.mkdir('logs')
    file_handler = RotatingFileHandler(
        f'logs/{LOG_FILE}', maxBytes=10240000, backupCount=10
    )
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(getattr(logging, LOG_LEVEL))
    app.logger.addHandler(file_handler)
    app.logger.setLevel(getattr(logging, LOG_LEVEL))
    app.logger.info('Morpheus Maps application startup')

# Get the frontend directory path
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frontend')

# Ensure frontend directory exists
if not os.path.exists(FRONTEND_DIR):
    # For Render deployment, frontend might be in a different location
    RENDER_FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'frontend')
    if os.path.exists(RENDER_FRONTEND_DIR):
        FRONTEND_DIR = RENDER_FRONTEND_DIR

# Register blueprints
app.register_blueprint(risk_bp, url_prefix='/api')
app.register_blueprint(weather_bp, url_prefix='/api')
app.register_blueprint(user_reports_bp, url_prefix='/api')
app.register_blueprint(hotspots_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')

# Serve frontend files
@app.route('/')
def index():
    """Serve the main application page."""
    return send_file(os.path.join(FRONTEND_DIR, 'app.html'))

@app.route('/app.html')
def main_app():
    """Serve the main application page (alternative route)."""
    return send_file(os.path.join(FRONTEND_DIR, 'app.html'))

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static frontend files."""
    return send_from_directory(FRONTEND_DIR, filename)

# API status endpoint
@app.route('/api')
@app.route('/api/')
def api_status():
    """API status endpoint."""
    return jsonify({
        'status': 'success',
        'message': 'Road Accident Hotspot Prediction API is running',
        'environment': DEPLOYMENT_ENV,
        'version': '1.0.0',
        'endpoints': [
            '/api/predict_risk',
            '/api/weather',
            '/api/report_risk',
            '/api/top_hotspots',
            '/api/auth/login',
            '/api/auth/register'
        ]
    })

# Health check endpoint for load balancers
@app.route('/health')
def health_check():
    """Health check endpoint for monitoring."""
    return jsonify({
        'status': 'healthy',
        'environment': DEPLOYMENT_ENV,
        'timestamp': int(os.times().system)
    }), 200

# Render health check endpoint
@app.route('/render-health-check')
def render_health_check():
    """Health check endpoint for Render."""
    return jsonify({
        'status': 'healthy',
        'service': 'Morpheus Maps API',
        'environment': DEPLOYMENT_ENV
    }), 200

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'status': 'error',
        'message': 'Resource not found'
    }), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({
        'status': 'error',
        'message': 'Internal server error'
    }), 500

if __name__ == '__main__':
    # Create necessary directories
    os.makedirs('logs', exist_ok=True)
    os.makedirs('data', exist_ok=True)
    os.makedirs('models', exist_ok=True)
    
    print(f"🚗 Starting Morpheus Maps API...")
    print(f"Environment: {DEPLOYMENT_ENV}")
    print(f"Debug: {DEBUG}")
    print(f"Host: {HOST}")
    print(f"Port: {PORT}")
    
    app.run(host=HOST, port=PORT, debug=DEBUG)