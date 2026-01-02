"""
Configuration settings for the Road Accident Hotspot Prediction application.
Contains API keys, constants, and other configuration parameters.
Supports hybrid deployment (local, Docker, cloud).
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Deployment environment
DEPLOYMENT_ENV = os.getenv('DEPLOYMENT_ENV', 'local')  # local, docker, cloud
FLASK_ENV = os.getenv('FLASK_ENV', 'development')

# API Keys
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY', 'your_openweather_api_key_here')
GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY', 'your_google_maps_api_key_here')

# Security
SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///accident_hotspots.db')

# Redis configuration (for caching)
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
REDIS_PASSWORD = os.getenv('REDIS_PASSWORD', None)

# File paths (adjusted for different deployment environments)
base_dir = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(base_dir, 'data')
RAW_DATA_DIR = os.path.join(DATA_DIR, 'raw')
PROCESSED_DATA_DIR = os.path.join(DATA_DIR, 'processed')
MODEL_DIR = os.path.join(base_dir, 'models')
WEATHER_CACHE_PATH = os.path.join(DATA_DIR, 'weather_cache.json')

# Model settings
MODEL_PATH = os.path.join(MODEL_DIR, 'enhanced_model.pkl')
ENHANCED_MODEL_METADATA = os.path.join(MODEL_DIR, 'model_metadata.json')
FEATURE_COLUMNS = [
    'weather', 'hrmn', 'lum', 'vehicle_type', 'engine_size', 
    'driver_age', 'car_age', 'casualty_severity', 'casualty_age', 'Severity'
]

# Weather API settings
WEATHER_CACHE_EXPIRY = 3600  # seconds (1 hour)
WEATHER_API_BASE_URL = 'https://api.openweathermap.org/data/2.5'

# Risk levels
RISK_LEVELS = {
    'low': (0, 0.3),
    'moderate': (0.3, 0.6),
    'high': (0.6, 0.8),
    'severe': (0.8, 1.0)
}

# Server settings (environment-specific)
if DEPLOYMENT_ENV == 'cloud':
    DEBUG = False
    HOST = '0.0.0.0'
    PORT = int(os.getenv('PORT', 10000))  # Render sets PORT environment variable
    ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', '*').split(',')
elif DEPLOYMENT_ENV == 'docker':
    DEBUG = os.getenv('DEBUG', 'False').lower() in ('true', '1', 't')
    HOST = '0.0.0.0'
    PORT = int(os.getenv('PORT', 5000))
    ALLOWED_ORIGINS = ['http://localhost:8080', 'http://localhost:3000']
else:  # local
    DEBUG = os.getenv('DEBUG', 'True').lower() in ('true', '1', 't')
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 5000))
    ALLOWED_ORIGINS = ['http://localhost:8000', 'http://localhost:3000']

# Logging configuration
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO' if not DEBUG else 'DEBUG')
LOG_FILE = os.getenv('LOG_FILE', 'app.log')