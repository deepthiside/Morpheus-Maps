// Heatmap Page JavaScript

// API Configuration for hybrid deployment
function getApiBaseUrl() {
    // Check for Netlify environment variable
    if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
    }
    
    // Check if we're on Netlify (you'll need to update this with your actual Netlify subdomain)
    if (window.location.hostname.includes('netlify.app')) {
        // TODO: Replace with your actual backend URL when deployed
        // Example: 'https://your-backend.onrender.com' or 'https://your-backend.herokuapp.com'
        console.warn('Netlify deployment detected. Please update the API URL in the code or environment variables.');
        return 'https://your-backend-url.com'; // <-- UPDATE THIS WITH YOUR ACTUAL BACKEND URL
    }
    
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;
    
    // Production/Cloud environment (HTTPS or custom domain)
    if (protocol === 'https:' || hostname !== 'localhost') {
        return `${protocol}//${hostname}${port && port !== '443' && port !== '80' ? ':' + port : ''}`;
    }
    
    // Docker environment (port 8080 for frontend)
    if (port === '8080') {
        return `${protocol}//${hostname}:5000`;
    }
    
    // Local development (port 8000 for frontend)
    return `${protocol}//${hostname}:5000`;
}

const API_BASE_URL = getApiBaseUrl();

let map;
let heatmapLayer;
let gridMarkers = [];
let selectedRadius = 5; // Default 5km
let selectedGridSize = 2; // Default 2km intervals

// DOM Elements
const locationInput = document.getElementById('location-input');
const generateBtn = document.getElementById('generate-heatmap');
const gridSizeSelect = document.getElementById('grid-size');
const statusDisplay = document.getElementById('status-display');
const loadingOverlay = document.getElementById('loading-overlay');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notification-text');
const closeNotification = document.getElementById('close-notification');

// Initialize the heatmap page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Heatmap page loaded');
    initMap();
    setupEventListeners();
});

// Initialize Leaflet Map
function initMap() {
    console.log('Initializing heatmap map...');
    
    // Default center - Jaipur, India
    const defaultCenter = [26.9124, 75.7873];

    // Initialize Leaflet map
    map = L.map('heatmap-map').setView(defaultCenter, 12);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    console.log('Heatmap map initialized successfully');
}

// Setup Event Listeners
function setupEventListeners() {
    // Radius buttons
    document.querySelectorAll('.radius-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active class from all buttons
            document.querySelectorAll('.radius-btn').forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            e.target.classList.add('active');
            selectedRadius = parseInt(e.target.dataset.radius);
            console.log('Selected radius:', selectedRadius, 'km');
            updateStatus(`Radius set to ${selectedRadius} km`);
        });
    });

    // Grid size selection
    gridSizeSelect.addEventListener('change', (e) => {
        selectedGridSize = parseInt(e.target.value);
        console.log('Selected grid size:', selectedGridSize, 'km');
        updateStatus(`Grid resolution set to ${selectedGridSize} km intervals`);
    });

    // Generate heatmap button
    generateBtn.addEventListener('click', generateHeatmap);

    // Close notification
    closeNotification.addEventListener('click', () => {
        notification.classList.remove('show');
    });
}

// Generate heatmap for the specified location
async function generateHeatmap() {
    const location = locationInput.value.trim();
    
    if (!location) {
        showNotification('Please enter a location', 'error');
        return;
    }
    
    console.log(`Generating heatmap for ${location} with ${selectedRadius}km radius and ${selectedGridSize}km grid`);
    
    showLoading('Generating heatmap data...');
    updateStatus('Geocoding location...');
    
    try {
        // Step 1: Geocode the location
        const centerCoords = await geocodeLocation(location);
        if (!centerCoords) {
            throw new Error('Could not find the specified location');
        }
        
        console.log('Location found:', centerCoords);
        updateStatus('Generating risk grid...');
        
        // Step 2: Generate grid points around the location
        const gridPoints = generateGridPoints(centerCoords, selectedRadius, selectedGridSize);
        console.log(`Generated ${gridPoints.length} grid points`);
        
        updateStatus('Calculating risk levels...');
        
        // Step 3: Generate risk data for each grid point
        const riskData = generateRiskData(gridPoints, location);
        
        updateStatus('Creating visualization...');
        
        // Step 4: Clear existing layers
        clearExistingLayers();
        
        // Step 5: Create heatmap
        createLocationHeatmap(riskData);
        
        // Step 6: Create grid markers with popups
        createGridMarkers(riskData);
        
        // Step 7: Center map on location
        map.setView([centerCoords.lat, centerCoords.lng], 12);
        
        updateStatus(`Heatmap generated for ${location} (${riskData.length} points)`);
        showNotification(`Heatmap created for ${location} with ${riskData.length} data points`, 'success');
        
    } catch (error) {
        console.error('Error generating heatmap:', error);
        showNotification('Error generating heatmap: ' + error.message, 'error');
        updateStatus('Error occurred');
    } finally {
        hideLoading();
    }
}

// Geocode location using Nominatim
async function geocodeLocation(location) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
        }
        
        return null;
    } catch (error) {
        console.error('Geocoding failed:', error);
        return null;
    }
}

// Generate grid points around the center location
function generateGridPoints(center, radiusKm, gridSizeKm) {
    const points = [];
    
    // Convert km to degrees (rough approximation)
    const kmToDegrees = 1 / 111; // 1 degree ≈ 111 km
    const radiusDeg = radiusKm * kmToDegrees;
    const gridSizeDeg = gridSizeKm * kmToDegrees;
    
    // Generate grid points in a square pattern
    for (let lat = center.lat - radiusDeg; lat <= center.lat + radiusDeg; lat += gridSizeDeg) {
        for (let lng = center.lng - radiusDeg; lng <= center.lng + radiusDeg; lng += gridSizeDeg) {
            // Check if point is within the circular radius
            const distance = calculateDistance(center.lat, center.lng, lat, lng);
            if (distance <= radiusKm) {
                points.push({ lat, lng, distance });
            }
        }
    }
    
    return points;
}

// Calculate distance between two points in km
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Generate risk data for grid points
function generateRiskData(gridPoints, location) {
    const currentHour = new Date().getHours();
    const timeMultiplier = getTimeBasedRiskMultiplier(currentHour);
    
    return gridPoints.map(point => {
        // Base risk calculation based on various factors
        let baseRisk = 0.3; // Base risk level
        
        // Distance from center affects risk (closer = higher risk for urban areas)
        const distanceFromCenter = point.distance;
        if (distanceFromCenter < 2) {
            baseRisk += 0.3; // City center
        } else if (distanceFromCenter < 5) {
            baseRisk += 0.2; // Inner city
        } else if (distanceFromCenter < 10) {
            baseRisk += 0.1; // Outer city
        }
        
        // Add some randomization for realistic variation
        const randomVariation = (Math.random() - 0.5) * 0.3;
        baseRisk += randomVariation;
        
        // Apply time-based multiplier
        baseRisk *= timeMultiplier;
        
        // Add location-specific patterns
        baseRisk = addLocationSpecificRisk(baseRisk, point, location);
        
        // Ensure risk is within bounds
        const finalRisk = Math.max(0.05, Math.min(0.95, baseRisk));
        
        return {
            lat: point.lat,
            lng: point.lng,
            distance: point.distance,
            risk: finalRisk,
            riskLevel: getRiskLevelText(finalRisk),
            riskPercentage: Math.round(finalRisk * 100)
        };
    });
}

// Add location-specific risk patterns
function addLocationSpecificRisk(baseRisk, point, location) {
    const city = location.toLowerCase();
    
    // Create hotspots based on typical urban patterns
    const lat = point.lat;
    const lng = point.lng;
    
    // Simulate major roads/highways (higher risk)
    const roadPattern1 = Math.sin(lat * 100) * Math.cos(lng * 100);
    const roadPattern2 = Math.cos(lat * 80) * Math.sin(lng * 80);
    
    if (Math.abs(roadPattern1) > 0.8 || Math.abs(roadPattern2) > 0.8) {
        baseRisk += 0.15; // Major road/highway
    }
    
    // Simulate intersections (very high risk)
    if (Math.abs(roadPattern1) > 0.9 && Math.abs(roadPattern2) > 0.9) {
        baseRisk += 0.25; // Major intersection
    }
    
    // City-specific adjustments
    if (city.includes('jaipur')) {
        // Simulate Jaipur's traffic patterns
        if (point.distance < 3) {
            baseRisk += 0.1; // Dense old city area
        }
    } else if (city.includes('mumbai')) {
        // Mumbai has generally higher risk
        baseRisk += 0.15;
    } else if (city.includes('delhi')) {
        // Delhi has very high risk
        baseRisk += 0.2;
    }
    
    return baseRisk;
}

// Get time-based risk multiplier
function getTimeBasedRiskMultiplier(hour) {
    if (hour >= 7 && hour <= 10) return 1.4; // Morning rush
    if (hour >= 17 && hour <= 20) return 1.5; // Evening rush
    if (hour >= 22 || hour <= 4) return 1.2; // Late night
    if (hour >= 11 && hour <= 16) return 0.8; // Mid-day
    return 1.0; // Normal hours
}

// Create heatmap layer
function createLocationHeatmap(riskData) {
    console.log('Creating heatmap with', riskData.length, 'points');
    
    // Prepare heatmap data
    const heatmapPoints = riskData.map(point => [
        point.lat,
        point.lng,
        point.risk
    ]);
    
    // Create heatmap layer
    heatmapLayer = L.heatLayer(heatmapPoints, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        max: 1.0,
        minOpacity: 0.4,
        gradient: {
            0.0: 'navy',
            0.2: 'blue',
            0.4: 'cyan',
            0.6: 'lime',
            0.8: 'yellow',
            1.0: 'red'
        }
    }).addTo(map);
    
    console.log('Heatmap layer created and added');
}

// Create grid markers with popups
function createGridMarkers(riskData) {
    console.log('Creating grid markers...');
    
    // Only show markers for high-risk areas to avoid clutter
    const highRiskPoints = riskData.filter(point => point.risk >= 0.6);
    
    highRiskPoints.forEach(point => {
        const marker = L.circleMarker([point.lat, point.lng], {
            radius: 8,
            fillColor: getRiskColor(point.risk),
            fillOpacity: 0.8,
            color: '#ffffff',
            weight: 2
        }).addTo(map);
        
        // Create detailed popup
        const popupContent = `
            <div style="padding: 10px; min-width: 200px;">
                <h4 style="margin: 0 0 10px 0; color: ${getRiskColor(point.risk)};">
                    <i class="fas fa-exclamation-triangle"></i> Risk Alert
                </h4>
                <div style="margin-bottom: 8px;">
                    <strong>Risk Level:</strong> 
                    <span style="color: ${getRiskColor(point.risk)}; font-weight: bold;">
                        ${point.riskPercentage}% (${point.riskLevel})
                    </span>
                </div>
                <div style="margin-bottom: 8px;">
                    <strong>Location:</strong> ${point.distance.toFixed(1)} km from center
                </div>
                <div style="margin-bottom: 8px;">
                    <strong>Coordinates:</strong> ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}
                </div>
                <div style="margin-bottom: 8px;">
                    <strong>Time:</strong> ${new Date().toLocaleTimeString()}
                </div>
                <div style="padding: 8px; background-color: ${getRiskColor(point.risk)}20; border-radius: 4px; margin-top: 10px;">
                    <small><strong>Recommendation:</strong> ${getRiskRecommendation(point.risk)}</small>
                </div>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        gridMarkers.push(marker);
    });
    
    console.log(`Created ${highRiskPoints.length} grid markers`);
}

// Clear existing layers
function clearExistingLayers() {
    if (heatmapLayer) {
        map.removeLayer(heatmapLayer);
        heatmapLayer = null;
    }
    
    gridMarkers.forEach(marker => {
        map.removeLayer(marker);
    });
    gridMarkers = [];
}

// Helper Functions
function getRiskColor(riskLevel) {
    if (riskLevel < 0.2) return 'navy';      // Very Low
    if (riskLevel < 0.4) return 'blue';      // Low
    if (riskLevel < 0.6) return 'cyan';      // Moderate
    if (riskLevel < 0.8) return 'lime';      // High
    if (riskLevel < 0.9) return 'yellow';    // Very High
    return 'red';                            // Severe
}

function getRiskLevelText(riskLevel) {
    if (riskLevel < 0.2) return 'Very Low';
    if (riskLevel < 0.4) return 'Low';
    if (riskLevel < 0.6) return 'Moderate';
    if (riskLevel < 0.8) return 'High';
    if (riskLevel < 0.9) return 'Very High';
    return 'Severe';
}

function getRiskRecommendation(riskLevel) {
    if (riskLevel < 0.3) return 'Safe to travel. Normal precautions advised.';
    if (riskLevel < 0.5) return 'Exercise caution. Avoid peak hours if possible.';
    if (riskLevel < 0.7) return 'High caution advised. Consider alternate routes.';
    if (riskLevel < 0.8) return 'Travel not recommended. High accident risk.';
    return 'Extreme caution required. Avoid this area if possible.';
}

function showLoading(message = 'Loading...') {
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

function updateStatus(message) {
    statusDisplay.textContent = message;
}

function showNotification(message, type = 'info') {
    notificationText.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// Don't auto-generate heatmap on page load
// Users will manually enter location and click generate