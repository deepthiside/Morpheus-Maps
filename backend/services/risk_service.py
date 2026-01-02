"""
Risk prediction service using trained ML model.
"""
import os
import sys
import joblib
import json
import pandas as pd
import numpy as np
from datetime import datetime

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import MODEL_PATH, ENHANCED_MODEL_METADATA, RISK_LEVELS
from services.weather_service import weather_service

class RiskService:
    def __init__(self):
        self.model_data = self._load_enhanced_model()
        self.model = self.model_data.get('model')
        self.scaler = self.model_data.get('scaler')
        self.feature_names = self.model_data.get('feature_names', [])
        self.model_metadata = self._load_model_metadata()
        self.risk_levels = RISK_LEVELS
    
    def _load_enhanced_model(self):
        """Load the enhanced ML model with all components."""
        if os.path.exists(MODEL_PATH):
            try:
                model_data = joblib.load(MODEL_PATH)
                print(f"✅ Enhanced model loaded successfully from {MODEL_PATH}")
                print(f"📊 Model type: {model_data.get('model_type', 'Unknown')}")
                print(f"🔧 Features: {len(model_data.get('feature_names', []))}")
                return model_data
            except Exception as e:
                print(f"❌ Error loading enhanced model: {e}")
                return self._create_dummy_model()
        else:
            print(f"❌ Enhanced model file not found at {MODEL_PATH}")
            return self._create_dummy_model()
    
    def _load_model_metadata(self):
        """Load model metadata."""
        if os.path.exists(ENHANCED_MODEL_METADATA):
            try:
                with open(ENHANCED_MODEL_METADATA, 'r') as f:
                    return json.load(f)
            except Exception as e:
                print(f"Warning: Could not load model metadata: {e}")
        return {}
    
    def _create_dummy_model(self):
        """Create a dummy model for testing when real model is not available."""
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.preprocessing import StandardScaler
        
        # Create dummy model and scaler
        model = RandomForestClassifier(n_estimators=10, random_state=42)
        scaler = StandardScaler()
        
        # Train with dummy data (70 features to match our enhanced model)
        X = np.random.rand(100, 70)
        y = np.random.randint(0, 2, 100)  # Binary classification
        
        scaler.fit(X)
        model.fit(scaler.transform(X), y)
        
        print("⚠️ Using dummy model - predictions will not be accurate")
        
        return {
            'model': model,
            'scaler': scaler,
            'feature_names': [f'feature_{i}' for i in range(70)],
            'model_type': 'Dummy Model'
        }
    
    def predict_risk(self, location, time=None):
        """
        Predict accident risk using the enhanced model.
        
        Args:
            location (dict): Location with lat and lon
            time (datetime, optional): Time for prediction. Defaults to current time.
            
        Returns:
            dict: Risk prediction with score and level
        """
        if time is None:
            time = datetime.now()
        
        # Get weather data for the location
        weather_data = weather_service.get_current_weather(location['lat'], location['lon'])
        
        # Create feature vector based on our enhanced model's expected features
        features = self._create_feature_vector(location, weather_data, time)
        
        # Make prediction using enhanced model
        try:
            if self.model and self.scaler:
                # Scale features
                X_scaled = self.scaler.transform([features])
                
                # Get prediction (binary classification: 0=low risk, 1=high risk)
                prediction = self.model.predict(X_scaled)[0]
                
                # Get prediction probability for risk score
                if hasattr(self.model, 'predict_proba'):
                    proba = self.model.predict_proba(X_scaled)[0]
                    # Use probability of high risk class as base risk score
                    base_risk_score = float(proba[1]) if len(proba) > 1 else float(prediction)
                else:
                    base_risk_score = float(prediction)
                
                # Apply realistic risk scaling (15-85% range instead of 0-100%)
                # Real-world accident risk should be meaningful
                risk_score = 0.15 + (base_risk_score * 0.70)  # Scale to 15-85% range
                
                # Apply additional risk factors for realism
                risk_multiplier = self._calculate_risk_multipliers(weather_data, time)
                risk_score = min(0.95, risk_score * risk_multiplier)  # Cap at 95%
                
                print(f"📈 Enhanced model prediction: {prediction}, base: {base_risk_score:.3f}, final: {risk_score:.3f}")
            else:
                # Fallback calculation
                risk_score = self._calculate_fallback_risk(weather_data, time)
                print(f"⚠️ Using fallback risk calculation: {risk_score:.3f}")
        except Exception as e:
            print(f"❌ Prediction error: {e}")
            # Fallback to simple risk calculation
            risk_score = self._calculate_fallback_risk(weather_data, time)
        
        # Ensure risk score is between 0.15 and 0.95 (15-95% realistic range)
        risk_score = max(0.15, min(0.95, risk_score))
        
        # Determine risk level based on realistic thresholds
        if risk_score >= 0.70:  # 70%+ = high risk
            risk_level = 'high'
        elif risk_score >= 0.45:  # 45-70% = moderate risk
            risk_level = 'moderate'
        else:  # 15-45% = low risk
            risk_level = 'low'
        
        return {
            'risk_score': risk_score,
            'risk_level': risk_level,
            'weather': weather_data,
            'location': location,
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
            'model_info': {
                'model_type': self.model_data.get('model_type', 'Unknown'),
                'features_used': len(self.feature_names)
            }
        }
    
    def predict_route_risk(self, route_points):
        """
        Predict risk for a route (sequence of points).
        
        Args:
            route_points (list): List of location points with lat and lon
            
        Returns:
            list: Risk predictions for each point
        """
        predictions = []
        for point in route_points:
            risk = self.predict_risk(point)
            predictions.append(risk)
        
    def _create_feature_vector(self, location, weather_data, time):
        """
        Create feature vector based on enhanced model's expected features.
        Returns a list of 70 feature values to match our trained model.
        """
        # Extract basic features
        hour = time.hour
        month = time.month
        day_of_week = time.weekday()
        
        # Weather mapping
        weather_map = {
            'Clear': 0, 'Clouds': 1, 'Rain': 2, 'Drizzle': 2, 
            'Mist': 3, 'Fog': 3, 'Snow': 4, 'Storm': 4, 'Thunderstorm': 4
        }
        weather_encoded = weather_map.get(weather_data.get('weather_condition', 'Clear'), 0)
        
        # Create feature vector with 70 features (matching our enhanced model)
        features = [
            # Basic encoded features
            hash(str(location.get('lat', 0))[:5]) % 100,  # state_encoded (simplified)
            hash(str(location.get('lon', 0))[:5]) % 50,   # city_encoded (simplified)
            2023,  # year
            month,  # month
            1,     # vehicles_involved (default)
            0,     # casualties (default)
            0,     # fatalities (default)
            weather_encoded,  # weather_encoded
            1,     # road_type_encoded (default urban)
            1,     # road_condition_encoded (default good)
            1 if 6 <= hour <= 18 else 0,  # lighting_encoded (daylight)
            50,    # speed_limit (default)
            35,    # driver_age (default)
            1,     # driver_gender_encoded (default)
            hour,  # hour
            1,     # vehicle_type_encoded (default car)
            1500,  # engine_size (default)
            5,     # car_age (default)
            35,    # casualty_age (default)
            weather_data.get('precipitation', 0),  # total_rainfall
            # Additional weather features (indices 20-29)
            weather_data.get('precipitation', 0),  # avg_daily_rainfall
            weather_data.get('precipitation', 0),  # max_daily_rainfall
            0,     # drought_risk (default)
            1 if weather_data.get('precipitation', 0) > 10 else 0,  # flood_risk
            weather_data.get('precipitation', 0) * 30,  # normal_rainfall (estimated)
            weather_data.get('precipitation', 0) * 365,  # annual_rainfall (estimated)
            weather_data.get('precipitation', 0) * 120,  # monsoon_rainfall (estimated)
            0,     # rainy_days_count
            weather_data.get('precipitation', 0) / 10,  # rainfall_intensity
            month,  # season (simplified)
            # Temporal features (indices 30-39)
            1 if 22 <= hour or hour <= 5 else 0,  # is_night
            1 if 18 <= hour <= 21 else 0,         # is_evening
            1 if 6 <= hour <= 9 else 0,           # is_morning
            1 if 10 <= hour <= 17 else 0,         # is_afternoon
            1 if 7 <= hour <= 9 else 0,           # is_morning_rush
            1 if 17 <= hour <= 19 else 0,         # is_evening_rush
            1 if (7 <= hour <= 9) or (17 <= hour <= 19) else 0,  # is_rush_hour
            day_of_week,  # day_of_week_num
            1 if day_of_week >= 5 else 0,         # is_weekend
            1 if day_of_week < 5 else 0,          # is_weekday
            # Cyclical encoding and scores (indices 40-49)
            np.sin(2 * np.pi * hour / 24),        # hour_sin
            np.cos(2 * np.pi * hour / 24),        # hour_cos
            np.sin(2 * np.pi * month / 12),       # month_sin
            np.cos(2 * np.pi * month / 12),       # month_cos
            np.sin(2 * np.pi * day_of_week / 7),  # day_sin
            np.cos(2 * np.pi * day_of_week / 7),  # day_cos
            weather_encoded * 0.2,                # weather_severity_score
            0.5,   # vehicle_risk_score (default)
            1.0,   # speed_risk_score (default)
            0.3,   # combined_risk_score (default)
            # Additional binary features (indices 50-69)
            1 if weather_encoded >= 2 else 0,     # weather_rainy
            1 if weather_encoded >= 3 else 0,     # weather_foggy
            1 if 6 <= hour <= 18 else 0,          # lighting_daylight
            1 if hour < 6 or hour > 18 else 0,    # lighting_dark
            0,     # alcohol_risk (default)
            0.5,   # road_risk_score (default)
            (1 if hour < 6 or hour > 18 else 0) * (1 if weather_encoded >= 2 else 0),  # night_rain_risk
            0,     # rush_fog_risk
            0,     # speed_rain_risk
            0,     # young_night_risk
            0,     # elderly_dark_risk
            0,     # high_speed
            0,     # low_speed
            0,     # young_driver
            0,     # elderly_driver
            0,     # inexperienced_driver
            0,     # multi_vehicle
            0,     # major_city
            1,     # urban_area (default)
            0,     # high_risk_state (default)
            0.5,   # state_risk_score (default)
        ]
        
        # Ensure we have exactly 70 features
        if len(features) < 70:
            features.extend([0] * (70 - len(features)))
        elif len(features) > 70:
            features = features[:70]
            
        return features
    
    def _calculate_risk_multipliers(self, weather_data, time):
        """
        Calculate realistic risk multipliers based on weather and time conditions.
        Returns multiplier between 0.8 and 2.5 for realistic risk scaling.
        """
        multiplier = 1.0
        
        # Weather impact on risk (based on memory: weather should increase risk)
        weather_condition = weather_data.get('weather_condition', 'Clear')
        weather_multipliers = {
            'Clear': 0.9,        # Slightly lower risk in clear weather
            'Clouds': 1.0,       # Normal risk
            'Rain': 1.6,         # Significantly higher risk in rain
            'Drizzle': 1.3,      # Moderate increase in drizzle
            'Mist': 1.4,         # Higher risk due to visibility
            'Fog': 1.8,          # Very high risk due to poor visibility
            'Snow': 2.0,         # Very high risk
            'Storm': 2.2,        # Extremely high risk
            'Thunderstorm': 2.2  # Extremely high risk
        }
        multiplier *= weather_multipliers.get(weather_condition, 1.0)
        
        # Precipitation impact
        precipitation = weather_data.get('precipitation', 0)
        if precipitation > 0:
            multiplier *= (1.0 + min(0.5, precipitation / 20))  # Up to 50% increase
        
        # Time-based risk factors
        hour = time.hour
        
        # Night time risk (10 PM - 6 AM)
        if hour >= 22 or hour <= 6:
            multiplier *= 1.4  # 40% higher risk at night
        
        # Rush hour risk (7-9 AM, 5-7 PM)
        elif (7 <= hour <= 9) or (17 <= hour <= 19):
            multiplier *= 1.2  # 20% higher risk during rush hours
        
        # Weekend night risk (Friday/Saturday night)
        if time.weekday() >= 4 and (hour >= 20 or hour <= 3):
            multiplier *= 1.3  # Additional 30% for weekend nights
        
        # Visibility impact
        visibility = weather_data.get('visibility', 1.0)
        if visibility < 0.5:  # Poor visibility
            multiplier *= 1.5
        elif visibility < 0.8:  # Moderate visibility
            multiplier *= 1.2
        
        # Wind speed impact
        wind_speed = weather_data.get('wind_speed', 0)
        if wind_speed > 15:  # High wind
            multiplier *= 1.3
        elif wind_speed > 25:  # Very high wind
            multiplier *= 1.6
        
        # Cap the multiplier to reasonable bounds
        return max(0.8, min(2.5, multiplier))
    
    def _calculate_fallback_risk(self, weather_data, time):
        """
        Calculate realistic fallback risk when model is not available.
        Returns risk score in 20-80% range for realistic accident probability.
        """
        base_risk = 0.25  # Base 25% risk
        
        # Weather factor (significant impact)
        weather_condition = weather_data.get('weather_condition', 'Clear')
        weather_risk = {
            'Clear': 0.20,        # 20% base risk in clear weather
            'Clouds': 0.25,       # 25% in cloudy weather
            'Rain': 0.50,         # 50% in rain (major increase)
            'Drizzle': 0.35,      # 35% in drizzle
            'Mist': 0.40,         # 40% in mist
            'Fog': 0.60,          # 60% in fog (very dangerous)
            'Snow': 0.70,         # 70% in snow
            'Storm': 0.75,        # 75% in storms
            'Thunderstorm': 0.75  # 75% in thunderstorms
        }
        weather_factor = weather_risk.get(weather_condition, 0.25)
        
        # Time factor (realistic impact)
        hour = time.hour
        if hour < 6 or hour > 20:  # Night time (high risk)
            time_factor = 0.15  # Add 15%
        elif 7 <= hour <= 9 or 17 <= hour <= 19:  # Rush hours
            time_factor = 0.10  # Add 10%
        else:
            time_factor = 0.0
        
        # Day factor
        if time.weekday() >= 5:  # Weekend (higher risk)
            day_factor = 0.08  # Add 8%
        else:
            day_factor = 0.0
        
        # Combine factors
        total_risk = weather_factor + time_factor + day_factor
        
        # Ensure realistic range (20-80%)
        return max(0.20, min(0.80, total_risk))
    
    def predict_route_risk(self, route_points):
        """
        Predict risk for a route (sequence of points).
        
        Args:
            route_points (list): List of location points with lat and lon
            
        Returns:
            list: Risk predictions for each point
        """
        predictions = []
        for point in route_points:
            risk = self.predict_risk(point)
            predictions.append(risk)
        
        return predictions

# Singleton instance
risk_service = RiskService()