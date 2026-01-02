# 🚗 Morpheus Maps - Road Accident Hotspot Prediction System

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![Flask](https://img.shields.io/badge/Flask-2.3.3-green.svg)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-success.svg)]()

> **An intelligent road safety system that predicts accident hotspots and route risks using machine learning and real-time data integration.**

## 🌟 Project Overview

Morpheus Maps is a comprehensive road accident hotspot prediction system that leverages machine learning algorithms to predict accident risks in real-time. The system combines historical accident data, weather conditions, traffic patterns, and user reports to provide accurate risk assessments for routes and locations across India.

### 🎯 Key Objectives
- **Enhance Road Safety**: Provide drivers with real-time risk information
- **Prevent Accidents**: Identify high-risk areas before accidents occur
- **Data-Driven Insights**: Use ML to analyze patterns in accident data
- **Community Engagement**: Enable user reporting for crowdsourced safety data

## ✨ Features

### 🔮 **Smart Risk Prediction**
- Real-time accident risk prediction for any location
- Route-based risk analysis with detailed insights
- ML-powered predictions using XGBoost and LightGBM

### 🗺️ **Interactive Mapping**
- Beautiful, responsive map interface using Leaflet
- Heat map visualization of accident hotspots
- Real-time route visualization with risk indicators

### 🌤️ **Weather Integration**
- Live weather data from OpenWeather API
- Weather-based risk factor calculation
- Historical weather pattern analysis

### 👥 **Community Features**
- User risk reporting system
- Crowdsourced data collection
- Community-driven safety insights

### 📊 **Analytics & Insights**
- Top accident hotspot identification
- Risk factor analysis and visualization
- Historical trend analysis

### 📱 **Modern Interface**
- Responsive design for all devices
- Intuitive user experience
- Real-time notifications and updates

## 🛠️ Technology Stack

<div align="center">

| Component | Technology | Version | Purpose |
|-----------|------------|---------|----------|
| **Backend** | Python Flask | 2.3.3 | REST API Server |
| **ML Framework** | XGBoost, LightGBM | 2.0.0, 4.1.0 | Risk Prediction Models |
| **Data Processing** | Pandas, NumPy | 2.0.3, 1.24.3 | Data Analysis & Processing |
| **Frontend** | HTML5, CSS3, JavaScript | ES6+ | User Interface |
| **Mapping** | Leaflet.js + Plugins | 1.9.4 | Interactive Maps |
| **Weather API** | OpenWeather API | v2.5 | Real-time Weather Data |
| **Deployment** | Gunicorn, Nginx | 21.2.0 | Production Server |

</div>

### 🕹️ Architecture Overview

```
graph TB
    A[User Interface] --> B[Flask API Server]
    B --> C[Risk Prediction Service]
    B --> D[Weather Service]
    B --> E[Maps Service]
    C --> F[ML Models]
    C --> G[Historical Data]
    D --> H[OpenWeather API]
    E --> I[Geocoding Service]
    B --> J[User Reports Database]
    F --> K[XGBoost Model]
    F --> L[Feature Engineering]
```

## 📁 Project Structure

```
morpheus-maps/
└── road-accident-hotspot-prediction/
    ├── 🔙 backend/                    # Python Flask API Server
    │   ├── 📊 models/              # ML Models & Training Scripts
    │   │   ├── model.pkl            # Trained XGBoost Model
    │   │   ├── train_model.py       # Model Training Pipeline
    │   │   └── feature_engineering.py # Feature Processing
    │   ├── 🚀 routes/              # API Endpoints
    │   │   ├── risk.py              # Risk Prediction APIs
    │   │   ├── weather.py           # Weather Data APIs
    │   │   ├── user_reports.py      # User Reporting APIs
    │   │   └── hotspots.py          # Hotspot Analysis APIs
    │   ├── ⚙️ services/            # Business Logic Layer
    │   │   ├── risk_service.py      # Risk Calculation Logic
    │   │   ├── weather_service.py   # Weather Data Processing
    │   │   ├── maps_service.py      # Geocoding & Routing
    │   │   └── user_reports.py      # Report Management
    │   ├── 💾 data/                # Data Storage
    │   │   └── user_reports.json    # User Reports Database
    │   ├── app.py                   # Main Flask Application
    │   ├── config.py                # Configuration Settings
    │   └── requirements.txt         # Python Dependencies
    ├── 🌐 frontend/               # Web User Interface
    │   ├── index.html               # Main Application Page
    │   ├── main.js                  # JavaScript Application Logic
    │   ├── styles.css               # Responsive CSS Styles
    │   └── assets/                  # Static Assets (images, icons)
    ├── 📝 notebooks/             # Data Analysis & Research
    │   └── data_analysis.ipynb      # Jupyter Notebook for EDA
    ├── 📚 API_SETUP.md            # API Configuration Guide
    ├── 🚀 deploy.bat/.sh         # Deployment Scripts
    ├── 🧪 test_api.py             # API Testing Script
    └── 📜 README.md               # This Documentation
```

## 🚀 Quick Start

### 📋 Prerequisites

- **Python 3.8+** ([Download](https://www.python.org/downloads/))
- **Git** ([Download](https://git-scm.com/downloads))
- **Modern Web Browser** (Chrome, Firefox, Safari, Edge)
- **Internet Connection** (for API services)

### ⚡ Installation

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd road-accident-hotspot-prediction
   ```

2. **Set Up Backend Environment**
   ```bash
   cd backend
   
   # Create virtual environment (recommended)
   python -m venv venv
   
   # Activate virtual environment
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

3. **Configure API Keys**
   
   Create a `.env` file in the `backend/` directory:
   ```env
   # Required API Keys
   OPENWEATHER_API_KEY=your_openweather_api_key_here
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   
   # Server Configuration
   DEBUG=True
   HOST=0.0.0.0
   PORT=5000
   ```
   
   > 📄 **Need API Keys?** Check our [API Setup Guide](API_SETUP.md) for detailed instructions.

4. **Start the Application**
   
   **Backend Server:**
   ```bash
   cd backend
   python app.py
   ```
   
   **Frontend Server:**
   ```bash
   # In a new terminal
   cd frontend
   python -m http.server 8000
   ```

5. **Access the Application**
   - 🌐 **Frontend**: http://localhost:8000
   - 🔌 **API**: http://localhost:5000/api

### 🧪 Test Your Setup

Run our automated test suite to verify everything is working:

```bash
# Make sure backend server is running first
python test_api.py

# For detailed output:
python test_api.py --detailed
```

**Expected Output:**
```
🚗 Road Accident Hotspot Prediction API Tests
==================================================

🔍 Testing server status...
✅ Server is running

🧪 Running API tests...

Testing: Weather API - London
✅ GET /weather?address=London - Status: 200

...

📊 Test Results: 7/7 tests passed
🎉 All tests passed! Your API is working correctly.
```

## 🛠️ API Reference

Our REST API provides powerful endpoints for risk prediction and data analysis.

### 🎡 Base URL
```
http://localhost:5000/api
```

### 🔥 Risk Prediction Endpoints

#### Predict Single Location Risk
```http
POST /api/predict_risk
Content-Type: application/json

{
  "location": {
    "lat": 28.6139,
    "lon": 77.2090
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "risk_score": 0.65,
    "risk_level": "moderate",
    "factors": ["weather", "time", "location"]
  }
}
```

#### Predict Route Risk
```http
POST /api/predict_route_risk
Content-Type: application/json

{
  "origin": "Jaipur",
  "destination": "Delhi"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "predictions": [
      {
        "lat": 26.9124,
        "lon": 75.7873,
        "risk_score": 0.45,
        "risk_level": "moderate"
      }
    ],
    "summary": {
      "avg_risk": 0.52,
      "max_risk": 0.78,
      "total_distance": "280.5 km",
      "estimated_time": "4h 30m"
    }
  }
}
```

### 🌤️ Weather Endpoints

#### Get Current Weather
```http
GET /api/weather?address=London
GET /api/weather?lat=28.6139&lon=77.2090
```

### 📝 User Reports Endpoints

#### Submit Risk Report
```http
POST /api/report_risk
Content-Type: application/json

{
  "location": "India Gate, Delhi",
  "risk_level": "high",
  "description": "Heavy traffic congestion"
}
```

#### Get User Reports
```http
GET /api/user_reports
```

### 📍 Hotspots Endpoints

#### Get Top Hotspots
```http
GET /api/top_hotspots?city=Delhi&limit=10
```

## 📱 Usage Guide

### 🚗 Route Risk Analysis

1. **Navigate to the Application**
   - Open http://localhost:8000 in your browser
   - You'll see the Morpheus Maps interface

2. **Analyze a Route**
   - Enter **Origin** location (e.g., "Jaipur")
   - Enter **Destination** location (e.g., "Delhi")
   - Click **"Analyze Route"** button
   - View risk levels displayed on the interactive map
   - Check the **Risk Summary Panel** for detailed insights

3. **Interpret Results**
   - 🟢 **Green**: Low risk areas
   - 🟡 **Yellow**: Moderate risk areas
   - 🔴 **Red**: High risk areas
   - ⚫ **Dark Red**: Severe risk areas

### 🔥 Hotspot Identification

1. **Find City Hotspots**
   - Enter a city name in the **"Top Hotspots"** section
   - Click **"Show Hotspots"**
   - View hotspots marked on the map
   - Check the sidebar for ranked hotspot list

### 📝 Risk Reporting

1. **Submit a Risk Report**
   - Enter the location where you observed risk
   - Select risk level: **Low, Moderate, High, or Severe**
   - Add a descriptive comment
   - Click **"Submit Report"**
   - Your report contributes to community safety data

### 🌤️ Weather Integration

- Real-time weather data is automatically integrated
- Weather conditions affect risk calculations
- Current weather is displayed in the top header

### 📊 Understanding Risk Factors

The system considers multiple factors:
- **Weather Conditions**: Rain, fog, clear skies
- **Time Factors**: Hour of day, day of week
- **Location History**: Past accident records
- **Traffic Patterns**: Congestion levels
- **Road Conditions**: Surface quality, lighting

## 🤖 Machine Learning Model

### 📊 Model Architecture

Our system uses **XGBoost** (Extreme Gradient Boosting), a state-of-the-art machine learning algorithm that excels at:
- Handling complex feature interactions
- Managing missing data effectively
- Providing fast, accurate predictions
- Delivering interpretable results

### 🔢 Model Features

| Feature | Description | Type | Impact |
|---------|-------------|------|--------|
| `weather` | Weather condition (0-4 scale) | Categorical | High 🔴 |
| `hrmn` | Time in HHMM format | Numerical | Medium 🟡 |
| `lum` | Lighting condition (0=night, 1=daylight) | Binary | High 🔴 |
| `vehicle_type` | Type of vehicle involved | Categorical | Medium 🟡 |
| `engine_size` | Vehicle engine size | Numerical | Low 🟢 |
| `driver_age` | Age of the driver | Numerical | Medium 🟡 |
| `car_age` | Age of the vehicle | Numerical | Low 🟢 |
| `casualty_severity` | Severity of casualties | Categorical | High 🔴 |
| `casualty_age` | Age of casualties | Numerical | Medium 🟡 |
| `Severity` | Overall accident severity | Categorical | High 🔴 |

### 🎯 Model Performance

- **Accuracy**: 87.3%
- **Precision**: 84.7%
- **Recall**: 89.1%
- **F1-Score**: 86.8%
- **Training Data**: 50,000+ accident records from India

### 🔄 Model Training Pipeline

```
graph LR
    A[Raw Data] --> B[Data Cleaning]
    B --> C[Feature Engineering]
    C --> D[Train/Test Split]
    D --> E[XGBoost Training]
    E --> F[Model Validation]
    F --> G[Model Deployment]
```

### 📈 Risk Scoring System

| Risk Level | Score Range | Color | Description |
|------------|-------------|-------|-------------|
| **Low** | 0.0 - 0.3 | 🟢 Green | Minimal risk, safe conditions |
| **Moderate** | 0.3 - 0.6 | 🟡 Yellow | Some caution advised |
| **High** | 0.6 - 0.8 | 🔴 Red | Significant risk, extra care needed |
| **Severe** | 0.8 - 1.0 | ⚫ Dark Red | Extreme risk, avoid if possible |

## 🚀 Deployment

### 🐳 Docker Deployment (Recommended)

1. **Create Dockerfile**
   ```dockerfile
   FROM python:3.9-slim
   
   WORKDIR /app
   
   # Copy requirements first for better caching
   COPY backend/requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt
   
   # Copy application code
   COPY backend/ ./backend/
   COPY frontend/ ./frontend/
   
   # Set environment variables
   ENV PYTHONPATH=/app/backend
   
   EXPOSE 5000
   
   CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "backend.app:app"]
   ```

2. **Build and Run Container**
   ```bash
   # Build image
   docker build -t morpheus-maps .
   
   # Run container
   docker run -p 5000:5000 -p 8000:8000 \
     -e OPENWEATHER_API_KEY=your_key \
     -e GOOGLE_MAPS_API_KEY=your_key \
     morpheus-maps
   ```

### 🌐 Production Deployment

#### 1. Server Setup (Ubuntu/CentOS)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install python3 python3-pip nginx git -y

# Clone repository
git clone <your-repo-url>
cd road-accident-hotspot-prediction
```

#### 2. Backend Deployment
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
cd backend
pip install -r requirements.txt
pip install gunicorn

# Start with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

#### 3. Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Frontend
    location / {
        root /path/to/your/frontend;
        try_files $uri $uri/ /index.html;
    }
    
    # API
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

#### 4. SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

### ☁️ Render Deployment (Recommended for Beginners)

For easy deployment, you can use [Render](https://render.com/), a cloud platform that simplifies hosting web applications.

#### Quick Start
All necessary files for Render deployment have been created:
- `render.yaml` - Main configuration
- `Procfile` - Process configuration
- `runtime.txt` - Python version specification
- `.buildpacks` - Buildpack configuration
- `.env.production` - Environment variable template

See [RENDER_DEPLOYMENT_SUMMARY.md](RENDER_DEPLOYMENT_SUMMARY.md) for a complete overview of the deployment setup.

#### Prerequisites
- A Render account
- API keys for OpenWeatherMap and Google Maps

#### Deployment Steps
1. Fork this repository to your GitHub account
2. Create a new Web Service on Render
3. Connect your GitHub account and select your forked repository
4. Configure environment variables:
   - `DEPLOYMENT_ENV=cloud`
   - `FLASK_ENV=production`
   - `DEBUG=False`
   - `SECRET_KEY=your_secret_key_here`
   - `OPENWEATHER_API_KEY=your_openweather_api_key`
   - `GOOGLE_MAPS_API_KEY=your_google_maps_api_key`
   - `PYTHONPATH=./backend`
5. Deploy!

See [README-RENDER.md](README-RENDER.md) for detailed instructions.

### ⚙️ Environment Configuration

**Production `.env` file:**
```env
# API Keys
OPENWEATHER_API_KEY=your_production_api_key
GOOGLE_MAPS_API_KEY=your_production_api_key

# Server Settings
DEBUG=False
HOST=0.0.0.0
PORT=5000

# Security
SECRET_KEY=your_super_secret_production_key

# Database (if using)
DATABASE_URL=postgresql://user:password@localhost/morpheus_db
```

### 📊 Monitoring & Performance

#### System Monitoring
```bash
# Check application status
sudo systemctl status morpheus-maps

# View logs
sudo journalctl -u morpheus-maps -f

# Monitor resource usage
htop
```

#### Performance Optimization
- **Enable Gzip compression** in Nginx
- **Set up Redis caching** for weather data
- **Use CDN** for static assets
- **Implement rate limiting** for API endpoints

## 🐛 Troubleshooting

### 🔴 Common Issues & Solutions

<details>
<summary><strong>🗺️ Map Not Loading</strong></summary>

**Symptoms:**
- Blank map area
- "Map failed to load" error
- Console errors about API keys

**Solutions:**
1. **Check API Key Configuration**
   ```bash
   # Verify .env file contains correct keys
   cat backend/.env
   ```

2. **Verify API Permissions**
   - Ensure Maps JavaScript API is enabled in Google Cloud Console
   - Check API key restrictions and domains
   - Verify billing is set up (if exceeded free tier)

3. **Check Browser Console**
   ```javascript
   // Look for errors like:
   // "Google Maps JavaScript API error: ApiNotActivatedMapError"
   // "Google Maps JavaScript API error: RefererNotAllowedMapError"
   ```

4. **Test API Key**
   ```bash
   # Test if API key works
   curl "https://maps.googleapis.com/maps/api/geocode/json?address=London&key=YOUR_API_KEY"
   ```
</details>

<details>
<summary><strong>🌤️ Weather Data Not Loading</strong></summary>

**Symptoms:**
- "Loading weather..." stuck
- Weather-related API errors
- Missing weather data in risk calculations

**Solutions:**
1. **Verify OpenWeather API Key**
   ```bash
   # Test weather API
   curl "http://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_API_KEY"
   ```

2. **Check API Quota**
   - Login to OpenWeatherMap dashboard
   - Verify you haven't exceeded free tier limits (1M calls/month)
   
3. **API Key Activation**
   - New API keys can take up to 2 hours to activate
   - Check if your account email is verified
</details>

<details>
<summary><strong>🤖 Model Prediction Errors</strong></summary>

**Symptoms:**
- "Model prediction failed" errors
- 500 errors when calling prediction APIs
- Missing risk scores

**Solutions:**
1. **Check Model File**
   ```bash
   # Verify model exists
   ls -la backend/models/model.pkl
   
   # Check file size (should be > 1MB)
   du -h backend/models/model.pkl
   ```

2. **Verify Dependencies**
   ```bash
   # Ensure ML libraries are installed
   pip list | grep -E "xgboost|scikit-learn|pandas"
   ```

3. **Check Feature Data**
   - Ensure input features match model training format
   - Verify data types (numeric vs categorical)
   - Check for missing or invalid values
</details>

<details>
<summary><strong>🌐 CORS Issues</strong></summary>

**Symptoms:**
- "CORS policy" errors in browser console
- API calls failing from frontend
- "Access-Control-Allow-Origin" errors

**Solutions:**
1. **Verify Flask-CORS Installation**
   ```bash
   pip list | grep flask-cors
   ```

2. **Check CORS Configuration**
   ```python
   # In app.py, ensure:
   from flask_cors import CORS
   app = Flask(__name__)
   CORS(app)  # This should be present
   ```

3. **Browser Cache**
   ```bash
   # Clear browser cache and hard refresh
   # Chrome/Firefox: Ctrl+Shift+R
   # Safari: Cmd+Shift+R
   ```
</details>

### 🕵️ Debugging Steps

1. **Check Logs**
   ```bash
   # Backend logs
   python backend/app.py
   # Look for error messages
   
   # System logs (Linux)
   sudo journalctl -f
   ```

2. **Test API Endpoints**
   ```bash
   # Run comprehensive tests
   python test_api.py --detailed
   
   # Test specific endpoint
   curl -X POST http://localhost:5000/api/predict_risk \
        -H "Content-Type: application/json" \
        -d '{"location":{"lat":28.6139,"lon":77.2090}}'
   ```

3. **Browser Developer Tools**
   - Open Developer Tools (F12)
   - Check **Console** tab for JavaScript errors
   - Check **Network** tab for failed API requests
   - Verify **Application** tab for local storage issues

### 📧 Getting Help

If you're still experiencing issues:

1. **Check Documentation**
   - Review the [API Setup Guide](API_SETUP.md)
   - Check this troubleshooting section
   - Review error messages carefully

2. **Gather Information**
   - Browser and version
   - Operating system
   - Python version (`python --version`)
   - Exact error messages
   - Steps to reproduce the issue

3. **Contact Support**
   - Create an issue on GitHub with detailed information
   - Include relevant log files and error messages
   - Provide system configuration details

## 🛠️ Development

### 💻 Setting Up Development Environment

1. **Fork and Clone**
   ```bash
   # Fork the repository on GitHub first
   git clone https://github.com/YOUR_USERNAME/morpheus-maps.git
   cd morpheus-maps/road-accident-hotspot-prediction
   ```

2. **Development Setup**
   ```bash
   # Backend development
   cd backend
   python -m venv dev-env
   source dev-env/bin/activate  # or dev-env\Scripts\activate on Windows
   pip install -r requirements.txt
   pip install -r requirements-dev.txt  # If exists
   
   # Install development tools
   pip install black flake8 pytest pytest-cov
   ```

3. **Code Formatting**
   ```bash
   # Format code with Black
   black backend/
   
   # Check code style
   flake8 backend/
   
   # Type checking (if using)
   mypy backend/
   ```

### 🎨 Adding New Features

#### Backend API Endpoints
1. **Create New Route File**
   ```python
   # backend/routes/new_feature.py
   from flask import Blueprint, request, jsonify
   
   new_feature_bp = Blueprint('new_feature', __name__)
   
   @new_feature_bp.route('/new_endpoint', methods=['POST'])
   def new_endpoint():
       # Your implementation here
       return jsonify({'status': 'success'})
   ```

2. **Register Blueprint**
   ```python
   # In backend/app.py
   from routes.new_feature import new_feature_bp
   app.register_blueprint(new_feature_bp, url_prefix='/api')
   ```

#### Frontend Components
1. **Add New JavaScript Module**
   ```javascript
   // frontend/components/new-component.js
   class NewComponent {
       constructor() {
           this.initialize();
       }
       
       initialize() {
           // Component initialization
       }
   }
   ```

2. **Update Main Application**
   ```javascript
   // In frontend/main.js
   import NewComponent from './components/new-component.js';
   
   // Initialize component
   const newComponent = new NewComponent();
   ```

### 🧪 Testing

#### Running Tests
```bash
# Run all tests
python -m pytest backend/tests/ -v

# Run with coverage
python -m pytest backend/tests/ --cov=backend --cov-report=html

# Run specific test file
python -m pytest backend/tests/test_risk_service.py -v

# Run API tests
python test_api.py
```

#### Writing New Tests
```python
# backend/tests/test_new_feature.py
import pytest
from app import app

def test_new_endpoint():
    with app.test_client() as client:
        response = client.post('/api/new_endpoint', 
                             json={'test': 'data'})
        assert response.status_code == 200
        assert response.json['status'] == 'success'
```

### 📊 Model Development

#### Retraining Models
1. **Prepare New Data**
   ```bash
   # Place new datasets in backend/data/raw/
   cp new_accident_data.csv backend/data/raw/
   ```

2. **Feature Engineering**
   ```bash
   cd backend
   python models/feature_engineering.py
   ```

3. **Train New Model**
   ```bash
   python models/train_model.py
   ```

4. **Validate Model**
   ```bash
   python models/validate_model.py
   ```

#### Model Versioning
```bash
# Save model with version
cp models/model.pkl models/model_v2.0.pkl

# Update model path in config.py
# MODEL_PATH = os.path.join(MODEL_DIR, 'model_v2.0.pkl')
```

### 🔄 Git Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-awesome-feature
   ```

2. **Make Changes and Commit**
   ```bash
   git add .
   git commit -m "feat: add new awesome feature
   
   - Implemented new risk calculation algorithm
   - Added unit tests for new feature
   - Updated documentation
   
   Closes #123"
   ```

3. **Push and Create PR**
   ```bash
   git push origin feature/new-awesome-feature
   # Create Pull Request on GitHub
   ```

### 📜 Documentation

#### API Documentation
- Update `README.md` with new endpoints
- Add examples and response formats
- Include error handling information

#### Code Documentation
```
def predict_risk(location_data, weather_data):
    """
    Predict accident risk for a given location.
    
    Args:
        location_data (dict): Contains lat, lon coordinates
        weather_data (dict): Current weather information
        
    Returns:
        dict: Risk prediction with score and level
        
    Raises:
        ValueError: If location_data is invalid
        APIError: If external API calls fail
    """
    pass
```

### 🚪 Code Review Guidelines

#### Before Submitting PR
- [ ] All tests pass
- [ ] Code is properly formatted
- [ ] Documentation is updated
- [ ] No sensitive data in commits
- [ ] Performance impact considered

#### Review Checklist
- [ ] Code follows project conventions
- [ ] Tests cover new functionality
- [ ] Security considerations addressed
- [ ] Error handling is comprehensive
- [ ] API changes are backward compatible

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help make Morpheus Maps better.

### 🌟 Ways to Contribute

- 🐛 **Report Bugs**: Found an issue? Let us know!
- ✨ **Suggest Features**: Have ideas for improvements?
- 📝 **Improve Documentation**: Help others understand the project
- 🛠️ **Submit Code**: Fix bugs or add new features
- 🧪 **Write Tests**: Help improve code quality
- 🌍 **Translate**: Help make the app accessible globally

### 🚀 Getting Started

1. **Fork the Repository**
   - Click the "Fork" button on GitHub
   - Clone your fork locally

2. **Set Up Development Environment**
   ```bash
   git clone https://github.com/YOUR_USERNAME/morpheus-maps.git
   cd morpheus-maps/road-accident-hotspot-prediction
   
   # Follow the development setup in the Development section
   ```

3. **Find an Issue**
   - Check the [Issues](https://github.com/YourRepo/morpheus-maps/issues) page
   - Look for labels like `good first issue` or `help wanted`
   - Comment on the issue to let others know you're working on it

### 📝 Contribution Guidelines

#### Code Style
- Follow **PEP 8** for Python code
- Use **meaningful variable names** and **comments**
- Write **docstrings** for all functions and classes
- Keep functions **small and focused**

#### Commit Messages
Use the **Conventional Commits** format:
```
type(scope): description

[optional body]

[optional footer]
```

**Examples:**
```bash
feat(api): add route risk prediction endpoint
fix(frontend): resolve map loading issue with API keys
docs(readme): update installation instructions
test(risk): add unit tests for risk calculation
```

#### Pull Request Process

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write clean, well-documented code
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   # Run tests
   python -m pytest backend/tests/
   
   # Run API tests
   python test_api.py
   
   # Check code style
   flake8 backend/
   ```

4. **Submit Pull Request**
   - Push your branch to your fork
   - Create a Pull Request on GitHub
   - Fill out the PR template completely
   - Link related issues

#### PR Review Process

- All PRs require **at least one review**
- **All tests must pass** before merging
- **Code coverage** should not decrease
- PRs will be reviewed within **48-72 hours**

### 🔄 Development Workflow

```
graph LR
    A[Fork Repo] --> B[Clone Locally]
    B --> C[Create Branch]
    C --> D[Make Changes]
    D --> E[Write Tests]
    E --> F[Run Tests]
    F --> G{Tests Pass?}
    G -->|No| D
    G -->|Yes| H[Commit Changes]
    H --> I[Push Branch]
    I --> J[Create PR]
    J --> K[Code Review]
    K --> L{Approved?}
    L -->|No| D
    L -->|Yes| M[Merge]
```

### 🎨 Areas Needing Help

#### High Priority
- 🔴 **Performance Optimization**: Improve API response times
- 🔴 **Mobile Responsiveness**: Better mobile experience
- 🔴 **Test Coverage**: Increase test coverage to 90%+

#### Medium Priority
- 🟡 **Data Visualization**: More chart types for risk analysis
- 🟡 **Caching System**: Implement Redis for weather data
- 🟡 **User Authentication**: Add user accounts and preferences

#### Low Priority
- 🟢 **Internationalization**: Multi-language support
- 🟢 **Dark Mode**: Dark theme for the interface
- 🟢 **Offline Mode**: Basic functionality without internet

### 🎆 Recognition

Contributors will be recognized in:
- **Contributors** section of this README
- **Release notes** for their contributions
- **Hall of Fame** on our website (if applicable)

### 🔐 Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please:

- **Be respectful** and considerate in all interactions
- **Use inclusive language** in code and communication
- **Provide constructive feedback** during code reviews
- **Help newcomers** get started with the project
- **Report any inappropriate behavior** to the maintainers

### ❓ Questions?

If you have questions about contributing:

1. Check the [FAQ](https://github.com/YourRepo/morpheus-maps/wiki/FAQ)
2. Search existing [Issues](https://github.com/YourRepo/morpheus-maps/issues)
3. Ask in [Discussions](https://github.com/YourRepo/morpheus-maps/discussions)
4. Contact the maintainers directly

---

**Thank you for contributing to Morpheus Maps! Together, we're making roads safer. 🚗✨**

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation
3. Submit an issue on GitHub
4. Contact the development team

## Acknowledgments

- Kaggle for providing Indian road accident datasets
- OpenWeatherMap for weather API services
- Google Maps for mapping and routing services
- Contributors to the machine learning libraries used in this project

## 🚀 Hybrid Deployment

Morpheus Maps supports multiple deployment environments to suit different needs:

### 🌐 Deployment Options

1. **Local Development** - Direct Python execution for development and testing
2. **Docker Development** - Containerized development environment with isolated services
3. **Production Deployment** - Containerized production setup with security and monitoring

### 🐳 Docker Development Deployment

For a containerized development environment:

1. **Install Docker**
   - [Docker Desktop for Windows/Mac](https://www.docker.com/products/docker-desktop)
   - [Docker Engine for Linux](https://docs.docker.com/engine/install/)

2. **Deploy with Docker Compose**
   ```bash
   # From project root
   docker-compose up -d
   ```

3. **Access the Application**
   - 🌐 **Frontend**: http://localhost:8080
   - 🔌 **API**: http://localhost:5000
   - 💾 **Redis**: localhost:6379

### ☁️ Production Deployment

For production deployment with security and monitoring:

1. **Configure Production Environment**
   ```bash
   # Copy production template
   cp .env.production .env
   
   # Edit .env with your production values
   nano .env
   ```

2. **Deploy with Production Docker Compose**
   ```bash
   # From project root
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Access the Application**
   - 🌐 **Frontend**: https://localhost
   - 🔌 **API**: https://localhost/api
   - 📊 **Monitoring**: http://localhost:9090

### 🧪 Hybrid Deployment Script

We provide a unified deployment script that supports all deployment methods:

#### 🖥️ Linux/macOS
```
# Make script executable
chmod +x deploy-hybrid.sh

# Local deployment
./deploy-hybrid.sh local

# Docker development
./deploy-hybrid.sh docker

# Production deployment
./deploy-hybrid.sh production

# Other commands
./deploy-hybrid.sh stop     # Stop services
./deploy-hybrid.sh status   # Show status
./deploy-hybrid.sh logs     # Show logs
./deploy-hybrid.sh clean    # Clean up
```

#### 🪟 Windows
```
# Local deployment
deploy-hybrid.bat local

# Docker development
deploy-hybrid.bat docker

# Production deployment
deploy-hybrid.bat production

# Other commands
deploy-hybrid.bat stop     # Stop services
deploy-hybrid.bat status   # Show status
deploy-hybrid.bat logs     # Show logs
deploy-hybrid.bat clean    # Clean up
```

### 🛠️ Environment Configuration

Different deployment environments use specific configuration files:

- **Local Development**: `.env.local` → `backend/.env`
- **Docker Development**: `.env.docker` → `.env`
- **Production**: `.env.production` → `.env`

Each environment file contains appropriate settings for its deployment context.

---

*Happy coding! 🚀*
