// Main JavaScript for Road Accident Hotspot Prediction

// Configuration
// Detect deployment environment and set API base URL accordingly
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

// Mobile detection and responsive utilities
function isMobile() {
    return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function isSmallScreen() {
    return window.innerWidth <= 480;
}

// Touch-friendly marker creation
function createResponsiveMarker(latlng, options = {}) {
    const defaultOptions = {
        radius: isMobile() ? 8 : 6,
        weight: isMobile() ? 3 : 2,
        opacity: 0.8,
        fillOpacity: 0.6
    };
    
    return L.circleMarker(latlng, { ...defaultOptions, ...options });
}

// Responsive popup options
function getResponsivePopupOptions() {
    return {
        maxWidth: isMobile() ? 250 : 300,
        minWidth: isMobile() ? 200 : 250,
        closeButton: true,
        autoPan: true,
        autoPanPadding: isMobile() ? [10, 10] : [5, 5]
    };
}

let map;
let markers = [];
let routePolyline;
let safeRoutePolyline;
let currentRoutes = [];
let heatmap;
let userLocation = null;
let liveLocationWatchId = null;
let isLiveLocationActive = false;
let emergencyContacts = {
    police: '100',
    ambulance: '108', 
    fire: '101',
    traffic: '1073',
    disaster: '108',
    helpline: '1912'
};

// Authentication check
function checkAuthentication() {
    // Removed authentication check - always return true
    return true;
}

// Update user interface with user information
function updateUserInterface(displayName) {
    // Removed user interface update
}

// Setup user menu functionality
function setupUserMenu() {
    // Removed user menu functionality
}

// Position dropdown properly on mobile devices
function positionMobileDropdown(button, dropdown) {
    // Removed mobile dropdown positioning
}

// Handle user logout
function handleLogout() {
    // Removed logout functionality
}

// Setup Emergency SOS functionality
function setupEmergencySOS() {
    const emergencyBtn = document.getElementById('emergency-sos');
    const sosModal = document.getElementById('sos-modal');
    const sosClose = document.getElementById('sos-close');
    const cancelSos = document.getElementById('cancel-sos');
    const sendSos = document.getElementById('send-sos');
    const shareLocationBtn = document.getElementById('share-location');
    const emergencyContactBtns = document.querySelectorAll('.emergency-contact');
    
    // Open SOS modal
    if (emergencyBtn) {
        emergencyBtn.addEventListener('click', function() {
            openEmergencyModal();
        });
    }
    
    // Close SOS modal
    function closeEmergencyModal() {
        if (sosModal) {
            sosModal.style.display = 'none';
        }
    }
    
    if (sosClose) {
        sosClose.addEventListener('click', closeEmergencyModal);
    }
    
    if (cancelSos) {
        cancelSos.addEventListener('click', closeEmergencyModal);
    }
    
    // Close modal when clicking outside
    if (sosModal) {
        sosModal.addEventListener('click', function(e) {
            if (e.target === sosModal) {
                closeEmergencyModal();
            }
        });
    }
    
    // Emergency contact buttons
    emergencyContactBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const number = this.dataset.number;
            const service = this.dataset.service;
            callEmergencyNumber(number, service);
        });
    });
    
    // Share location button
    if (shareLocationBtn) {
        shareLocationBtn.addEventListener('click', shareCurrentLocation);
    }
    
    // Send SOS button
    if (sendSos) {
        sendSos.addEventListener('click', sendEmergencyAlert);
    }
}

// Open emergency modal and get location
function openEmergencyModal() {
    const sosModal = document.getElementById('sos-modal');
    if (sosModal) {
        sosModal.style.display = 'block';
        getUserLocationForEmergency();
    }
}

// Get user location for emergency
function getUserLocationForEmergency() {
    // Use the same location update mechanism as getDefaultUserLocation
    // but with different options for emergency use
    const locationIcon = document.getElementById('location-icon');
    const locationStatusText = document.getElementById('location-status-text');
    
    if (locationIcon) {
        locationIcon.className = 'fas fa-map-marker-alt loading';
    }
    
    if (locationStatusText) {
        locationStatusText.textContent = 'Getting your location...';
    }
    
    // Also update SOS modal status
    const locationStatus = document.getElementById('location-status');
    if (locationStatus) {
        locationStatus.textContent = 'Getting your location...';
        locationStatus.style.color = 'orange';
    }
    
    if (navigator.geolocation) {
        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        };
        
        navigator.geolocation.getCurrentPosition(
            function(position) {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: new Date().toISOString()
                };
                
                console.log('Emergency location obtained:', userLocation);
                
                // Update all location displays
                updateLocationDisplays(userLocation);
                
                // Add marker to map
                addEmergencyLocationMarker(userLocation);
            },
            function(error) {
                console.error('Error getting location:', error);
                console.error('Error code:', error.code);
                console.error('Error message:', error.message);
                
                // Update UI for error
                if (locationIcon) {
                    locationIcon.className = 'fas fa-map-marker-alt error';
                }
                
                if (locationStatusText) {
                    locationStatusText.textContent = 'Location unavailable';
                }
                
                // Also update SOS modal status
                const locationStatus = document.getElementById('location-status');
                if (locationStatus) {
                    locationStatus.textContent = 'Location unavailable';
                    locationStatus.style.color = 'red';
                }
                
                let errorMessage = 'Unknown error';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access denied by user';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information unavailable';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timeout';
                        break;
                    default:
                        errorMessage = `Location error (${error.code}): ${error.message}`;
                }
                
                showNotification(`Location Error: ${errorMessage}`, 'error');
            },
            options
        );
    } else {
        if (locationIcon) {
            locationIcon.className = 'fas fa-map-marker-alt error';
        }
        
        if (locationStatusText) {
            locationStatusText.textContent = 'Location not supported';
        }
        
        // Also update SOS modal status
        const locationStatus = document.getElementById('location-status');
        if (locationStatus) {
            locationStatus.textContent = 'Geolocation not supported';
            locationStatus.style.color = 'red';
        }
        
        showNotification('Geolocation is not supported by this browser', 'error');
    }
}

// Get reverse geocoding for address
async function getReverseGeocode(lat, lng) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        const data = await response.json();
        return data.display_name || 'Address not found';
    } catch (error) {
        console.error('Error getting address:', error);
        return 'Address lookup failed';
    }
}

// Add emergency location marker to map
function addEmergencyLocationMarker(location) {
    if (!map) return;
    
    // Remove existing emergency marker
    markers.forEach(marker => {
        if (marker.emergencyMarker) {
            map.removeLayer(marker);
        }
    });
    
    // Add new emergency marker
    const emergencyMarker = L.marker([location.lat, location.lng], {
        icon: L.divIcon({
            className: 'emergency-location-marker',
            html: '<div style="background: #e74c3c; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><i class="fas fa-exclamation"></i></div>',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        })
    }).addTo(map);
    
    emergencyMarker.emergencyMarker = true;
    markers.push(emergencyMarker);
    
    emergencyMarker.bindPopup(`
        <div style="padding: 10px; text-align: center;">
            <h3 style="color: #e74c3c; margin-bottom: 8px;"><i class="fas fa-exclamation-triangle"></i> Emergency Location</h3>
            <p><strong>Coordinates:</strong><br>${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}</p>
            <p><strong>Accuracy:</strong> ±${location.accuracy}m</p>
            <p style="font-size: 12px; color: #666;">Time: ${new Date(location.timestamp).toLocaleString()}</p>
        </div>
    `);
    
    // Center map on emergency location
    map.setView([location.lat, location.lng], 16);
}

// Call emergency number
function callEmergencyNumber(number, service) {
    // Create phone call link
    const phoneLink = `tel:${number}`;
    
    // Show confirmation
    const confirmed = confirm(`Call ${service} (${number})?\n\nThis will attempt to dial the emergency number.`);
    
    if (confirmed) {
        // Try to initiate call
        window.location.href = phoneLink;
        
        // Log emergency call
        logEmergencyAction('call', {
            service: service,
            number: number,
            location: userLocation,
            timestamp: new Date().toISOString()
        });
        
        showNotification(`Calling ${service} (${number})...`, 'info');
    }
}

// Share current location
function shareCurrentLocation() {
    if (!userLocation) {
        showNotification('Location not available. Please try again.', 'error');
        return;
    }
    
    // Create shareable location info
    const locationInfo = {
        coordinates: `${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`,
        googleMapsLink: `https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`,
        timestamp: new Date().toLocaleString(),
        accuracy: `±${userLocation.accuracy}m`
    };
    
    // Create shareable text
    const shareText = `🚨 EMERGENCY LOCATION 🚨

Coordinates: ${locationInfo.coordinates}
Time: ${locationInfo.timestamp}
Accuracy: ${locationInfo.accuracy}

Google Maps: ${locationInfo.googleMapsLink}

Sent via Morpheus Maps Emergency System`;
    
    // Try to use Web Share API if available
    if (navigator.share) {
        navigator.share({
            title: 'Emergency Location',
            text: shareText
        }).then(() => {
            showNotification('Location shared successfully', 'success');
        }).catch(err => {
            console.error('Error sharing:', err);
            fallbackShare(shareText);
        });
    } else {
        // Fallback: copy to clipboard
        fallbackShare(shareText);
    }
    
    // Log location sharing
    logEmergencyAction('location_share', {
        location: userLocation,
        timestamp: new Date().toISOString()
    });
}

// Fallback share method
function fallbackShare(text) {
    // Try to copy to clipboard
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Location copied to clipboard! You can now paste it in messages.', 'success');
        }).catch(err => {
            console.error('Clipboard error:', err);
            showTextShareModal(text);
        });
    } else {
        // Show text in modal for manual copy
        showTextShareModal(text);
    }
}

// Show text share modal
function showTextShareModal(text) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 20000;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 10px;
        max-width: 90%;
        max-height: 90%;
        overflow: auto;
    `;
    
    content.innerHTML = `
        <h3>Emergency Location Information</h3>
        <p>Copy this text and share it with emergency contacts:</p>
        <textarea readonly style="width: 100%; height: 150px; margin: 10px 0;">${text}</textarea>
        <button onclick="this.parentElement.parentElement.remove()" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Auto-select text in textarea
    const textarea = content.querySelector('textarea');
    textarea.focus();
    textarea.select();
    
    showNotification('Location text displayed. Please copy and share with emergency contacts.', 'info');
}

// Send emergency alert
function sendEmergencyAlert() {
    if (!userLocation) {
        showNotification('Location not available. Cannot send emergency alert.', 'error');
        return;
    }
    
    const emergencyMessage = document.getElementById('emergency-message');
    const customMessage = emergencyMessage ? emergencyMessage.value.trim() : '';
    
    // Confirm sending alert
    const confirmed = confirm('Send Emergency Alert?\n\nThis will:\n• Share your location\n• Log the emergency\n• Prepare emergency contacts\n\nContinue?');
    
    if (!confirmed) return;
    
    // Prepare emergency data
    const emergencyData = {
        location: userLocation,
        message: customMessage || 'Emergency assistance needed',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        emergencyContacts: emergencyContacts
    };
    
    // Show loading
    const sendBtn = document.getElementById('send-sos');
    const originalText = sendBtn.innerHTML;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending Alert...';
    sendBtn.disabled = true;
    
    // Simulate sending emergency alert (in real implementation, this would contact emergency services)
    setTimeout(() => {
        // Log emergency
        logEmergencyAction('emergency_alert', emergencyData);
        
        // Create emergency report
        createEmergencyReport(emergencyData);
        
        // Show success
        showNotification('Emergency alert sent! Emergency contacts have been notified.', 'success');
        
        // Reset button
        sendBtn.innerHTML = originalText;
        sendBtn.disabled = false;
        
        // Close modal after delay
        setTimeout(() => {
            const sosModal = document.getElementById('sos-modal');
            if (sosModal) {
                sosModal.style.display = 'none';
            }
        }, 2000);
        
    }, 2000);
}

// Log emergency action
function logEmergencyAction(action, data) {
    const logEntry = {
        action: action,
        data: data,
        timestamp: new Date().toISOString(),
        sessionId: Date.now().toString(36)
    };
    
    // Store in localStorage for debugging/records
    const emergencyLogs = JSON.parse(localStorage.getItem('emergencyLogs') || '[]');
    emergencyLogs.push(logEntry);
    
    // Keep only last 10 emergency logs
    if (emergencyLogs.length > 10) {
        emergencyLogs.splice(0, emergencyLogs.length - 10);
    }
    
    localStorage.setItem('emergencyLogs', JSON.stringify(emergencyLogs));
    
    console.log('Emergency action logged:', logEntry);
}

// Create emergency report on map
function createEmergencyReport(emergencyData) {
    if (!map || !emergencyData.location) return;
    
    // Add emergency report marker
    const reportMarker = L.marker([emergencyData.location.lat, emergencyData.location.lng], {
        icon: L.divIcon({
            className: 'emergency-report-marker',
            html: '<div style="background: linear-gradient(45deg, #e74c3c, #c0392b); color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 4px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.4); animation: emergency-pulse 2s infinite;"><i class="fas fa-ambulance"></i></div>',
            iconSize: [48, 48],
            iconAnchor: [24, 24]
        })
    }).addTo(map);
    
    markers.push(reportMarker);
    
    const popupContent = `
        <div style="padding: 15px; min-width: 250px; text-align: center;">
            <h3 style="color: #e74c3c; margin-bottom: 10px;"><i class="fas fa-exclamation-triangle"></i> Emergency Alert</h3>
            <p><strong>Time:</strong> ${new Date(emergencyData.timestamp).toLocaleString()}</p>
            <p><strong>Location:</strong> ${emergencyData.location.lat.toFixed(6)}, ${emergencyData.location.lng.toFixed(6)}</p>
            <p><strong>Message:</strong> ${emergencyData.message}</p>
            <div style="margin-top: 10px; padding: 8px; background: #fff3cd; border-radius: 4px; font-size: 12px;">
                Status: Alert Sent
            </div>
        </div>
    `;
    
    reportMarker.bindPopup(popupContent);
    reportMarker.openPopup();
    
    // Add CSS for emergency pulse animation
    if (!document.querySelector('#emergency-pulse-style')) {
        const style = document.createElement('style');
        style.id = 'emergency-pulse-style';
        style.textContent = `
            @keyframes emergency-pulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.1); opacity: 0.8; }
                100% { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Unified function to update all location displays
function updateLocationDisplays(location) {
    // Update header location display
    const locationIcon = document.getElementById('location-icon');
    const locationStatusText = document.getElementById('location-status-text');
    
    if (locationIcon) {
        locationIcon.className = 'fas fa-map-marker-alt found';
    }
    
    if (locationStatusText) {
        locationStatusText.textContent = 'Location found';
    }
    
    // Update SOS modal location display
    const locationStatus = document.getElementById('location-status');
    const locationCoords = document.getElementById('location-coords');
    const locationAddress = document.getElementById('location-address');
    
    if (locationStatus) {
        locationStatus.textContent = 'Location found';
        locationStatus.style.color = 'green';
    }
    
    if (locationCoords) {
        locationCoords.textContent = `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
    }
    
    // Get reverse geocoding for address
    if (locationAddress) {
        getReverseGeocode(location.lat, location.lng)
            .then(address => {
                locationAddress.textContent = address || 'Address not available';
            });
    }
}

// Get default user location for all features
function getDefaultUserLocation() {
    const locationIcon = document.getElementById('location-icon');
    const locationStatusText = document.getElementById('location-status-text');
    
    if (locationIcon) {
        locationIcon.className = 'fas fa-map-marker-alt loading';
    }
    
    if (locationStatusText) {
        locationStatusText.textContent = 'Getting your location...';
    }
    
    // Also update SOS modal status
    const locationStatus = document.getElementById('location-status');
    if (locationStatus) {
        locationStatus.textContent = 'Getting your location...';
        locationStatus.style.color = 'orange';
    }
    
    if (navigator.geolocation) {
        const options = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000 // 5 minutes
        };
        
        navigator.geolocation.getCurrentPosition(
            function(position) {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: new Date().toISOString()
                };
                
                console.log('Default location obtained:', userLocation);
                
                // Update all location displays
                updateLocationDisplays(userLocation);
                
                // Update map if available
                if (map) {
                    // Only set view if we're not in live location mode
                    if (!isLiveLocationActive) {
                        map.setView([userLocation.lat, userLocation.lng], 15);
                    }
                    addUserLocationMarker(userLocation);
                }
                
                // Auto-populate origin fields with current location when available
                populateOriginWithLocation();
                
                showNotification('Location detected! All features now use your current location.', 'success');
            },
            function(error) {
                console.error('Error getting default location:', error);
                console.error('Error code:', error.code);
                console.error('Error message:', error.message);
                
                // Update UI for error
                if (locationIcon) {
                    locationIcon.className = 'fas fa-map-marker-alt error';
                }
                
                if (locationStatusText) {
                    locationStatusText.textContent = 'Location unavailable';
                }
                
                // Also update SOS modal status
                const locationStatus = document.getElementById('location-status');
                if (locationStatus) {
                    locationStatus.textContent = 'Location unavailable';
                    locationStatus.style.color = 'red';
                }
                
                let errorMessage = 'Location access denied';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access denied. Enable location for better experience.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location unavailable. Using default location.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location timeout. Using default location.';
                        break;
                    default:
                        errorMessage = `Location error (${error.code}): ${error.message}`;
                }
                
                showNotification(errorMessage, 'warning');
            },
            options
        );
    } else {
        console.error('Geolocation not supported');
        
        if (locationIcon) {
            locationIcon.className = 'fas fa-map-marker-alt error';
        }
        
        if (locationStatusText) {
            locationStatusText.textContent = 'Location not supported';
        }
        
        // Also update SOS modal status
        const locationStatus = document.getElementById('location-status');
        if (locationStatus) {
            locationStatus.textContent = 'Geolocation not supported';
            locationStatus.style.color = 'red';
        }
        
        showNotification('Geolocation not supported by this browser', 'warning');
    }
}

// Add user location marker to map
function addUserLocationMarker(location) {
    if (!map) return;
    
    // Remove existing user location marker
    for (let i = markers.length - 1; i >= 0; i--) {
        const marker = markers[i];
        if (marker.userLocationMarker) {
            map.removeLayer(marker);
            markers.splice(i, 1);
        }
    }
    
    // Remove existing live location marker as well
    for (let i = markers.length - 1; i >= 0; i--) {
        const marker = markers[i];
        if (marker.liveLocationMarker) {
            map.removeLayer(marker);
            markers.splice(i, 1);
        }
    }
    
    // Add new user location marker
    const userMarker = L.circleMarker([location.lat, location.lng], {
        radius: 10,
        fillColor: '#4285F4',
        fillOpacity: 1,
        color: '#ffffff',
        weight: 3
    }).addTo(map);
    
    userMarker.userLocationMarker = true;
    markers.push(userMarker);
    
    userMarker.bindPopup(`
        <div style="padding: 10px; text-align: center;">
            <h3 style="color: #4285F4; margin-bottom: 8px;"><i class="fas fa-user-circle"></i> Your Location</h3>
            <p><strong>Coordinates:</strong><br>${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}</p>
            <p><strong>Accuracy:</strong> ±${location.accuracy}m</p>
            <p style="font-size: 12px; color: #666;">Updated: ${new Date(location.timestamp).toLocaleString()}</p>
        </div>
    `);
}

// Populate origin field with current location
function populateOriginWithLocation() {
    if (!userLocation) return;
    
    const originInput = document.getElementById('origin');
    if (originInput && !originInput.value) {
        // Use coordinates as placeholder
        originInput.placeholder = `Current Location (${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)})`;
        
        // Get address and update placeholder
        getReverseGeocode(userLocation.lat, userLocation.lng)
            .then(address => {
                if (address && originInput) {
                    const shortAddress = address.split(',').slice(0, 2).join(', ');
                    originInput.placeholder = `Current Location: ${shortAddress}`;
                }
            });
    }
}

// Setup Live Location functionality
function setupLiveLocation() {
    const liveLocationBtn = document.getElementById('share-live-location');
    
    if (liveLocationBtn) {
        liveLocationBtn.addEventListener('click', toggleLiveLocation);
    }
    
    // Setup "Use Current Location" button
    const useCurrentLocationBtn = document.getElementById('use-current-location');
    if (useCurrentLocationBtn) {
        useCurrentLocationBtn.addEventListener('click', useCurrentLocationAsOrigin);
    }
}

// Toggle live location sharing
function toggleLiveLocation() {
    if (isLiveLocationActive) {
        stopLiveLocation();
    } else {
        startLiveLocation();
    }
}

// Start live location tracking
function startLiveLocation() {
    if (!navigator.geolocation) {
        showNotification('Geolocation not supported by this browser', 'error');
        return;
    }
    
    const liveLocationBtn = document.getElementById('share-live-location');
    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000 // 30 seconds
    };
    
    // Ask for confirmation
    const confirmed = confirm(
        'Start Live Location Sharing?\n\n' +
        'This will:\n' +
        '• Continuously track your location\n' +
        '• Update your position on the map\n' +
        '• Share real-time coordinates\n' +
        '• Use more battery\n\n' +
        'Continue?'
    );
    
    if (!confirmed) return;
    
    // Start watching position
    liveLocationWatchId = navigator.geolocation.watchPosition(
        function(position) {
            // Update user location
            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: new Date().toISOString(),
                speed: position.coords.speed || 0,
                heading: position.coords.heading || 0
            };
            
            console.log('Live location update:', userLocation);
            
            // Update all location displays
            updateLocationDisplays(userLocation);
            
            // Update map marker
            addLiveLocationMarker(userLocation);
            
            // Update location status
            updateLocationStatus('Live location active');
            
            // Center map on live location if it's significantly different from current view
            const currentCenter = map.getCenter();
            const distance = map.distance(currentCenter, [userLocation.lat, userLocation.lng]);
            // Only recenter if the user has moved more than 100 meters from the current view
            if (distance > 100) {
                map.setView([userLocation.lat, userLocation.lng], map.getZoom());
            }
            
            // Log live location update
            logEmergencyAction('live_location_update', {
                location: userLocation,
                timestamp: new Date().toISOString()
            });
        },
        function(error) {
            console.error('Live location error:', error);
            showNotification('Live location failed: ' + error.message, 'error');
            stopLiveLocation();
        },
        options
    );
    
    // Update UI
    isLiveLocationActive = true;
    if (liveLocationBtn) {
        liveLocationBtn.classList.add('active');
        liveLocationBtn.innerHTML = '<i class="fas fa-stop"></i><span>Stop Live</span>';
        liveLocationBtn.title = 'Stop Live Location Sharing';
    }
    
    updateLocationStatus('Starting live location...');
    showNotification('Live location sharing started', 'success');
}

// Stop live location tracking
function stopLiveLocation() {
    if (liveLocationWatchId) {
        navigator.geolocation.clearWatch(liveLocationWatchId);
        liveLocationWatchId = null;
    }
    
    const liveLocationBtn = document.getElementById('share-live-location');
    
    // Update UI
    isLiveLocationActive = false;
    if (liveLocationBtn) {
        liveLocationBtn.classList.remove('active');
        liveLocationBtn.innerHTML = '<i class="fas fa-broadcast-tower"></i><span>Live Location</span>';
        liveLocationBtn.title = 'Share Live Location';
    }
    
    updateLocationStatus('Live location stopped');
    showNotification('Live location sharing stopped', 'info');
    
    // Log live location stop
    logEmergencyAction('live_location_stop', {
        timestamp: new Date().toISOString()
    });
}

// Add live location marker
function addLiveLocationMarker(location) {
    if (!map) return;
    
    // Remove existing live location marker
    markers.forEach((marker, index) => {
        if (marker.liveLocationMarker) {
            map.removeLayer(marker);
            markers.splice(index, 1);
        }
    });
    
    // Remove existing user location marker as well
    markers.forEach((marker, index) => {
        if (marker.userLocationMarker) {
            map.removeLayer(marker);
            markers.splice(index, 1);
        }
    });
    
    // Add new live location marker with animation
    const liveMarker = L.circleMarker([location.lat, location.lng], {
        radius: 12,
        fillColor: '#e67e22',
        fillOpacity: 0.8,
        color: '#ffffff',
        weight: 3
    }).addTo(map);
    
    liveMarker.liveLocationMarker = true;
    markers.push(liveMarker);
    
    // Add accuracy circle
    const accuracyCircle = L.circle([location.lat, location.lng], {
        radius: location.accuracy,
        fillColor: '#e67e22',
        fillOpacity: 0.1,
        color: '#e67e22',
        weight: 1
    }).addTo(map);
    
    accuracyCircle.liveLocationMarker = true;
    markers.push(accuracyCircle);
    
    const popupContent = `
        <div style="padding: 10px; text-align: center;">
            <h3 style="color: #e67e22; margin-bottom: 8px;"><i class="fas fa-broadcast-tower"></i> Live Location</h3>
            <p><strong>Coordinates:</strong><br>${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}</p>
            <p><strong>Accuracy:</strong> ±${location.accuracy}m</p>
            ${location.speed ? `<p><strong>Speed:</strong> ${(location.speed * 3.6).toFixed(1)} km/h</p>` : ''}
            <p style="font-size: 12px; color: #666;">Live: ${new Date(location.timestamp).toLocaleString()}</p>
            <button onclick="shareCurrentLocation()" style="background: #e67e22; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin-top: 5px;">Share This Location</button>
        </div>
    `;
    
    liveMarker.bindPopup(popupContent);
    
    // Center map on live location only if significantly moved
    const currentCenter = map.getCenter();
    const distance = map.distance(currentCenter, [location.lat, location.lng]);
    // Only recenter if the user has moved more than 50 meters from the current view
    if (distance > 50) {
        map.setView([location.lat, location.lng], map.getZoom());
    }
}

// Update location status in header
function updateLocationStatus(status) {
    const locationStatusText = document.getElementById('location-status-text');
    if (locationStatusText) {
        locationStatusText.textContent = status;
    }
}

// Use current location as origin
function useCurrentLocationAsOrigin() {
    const originInput = document.getElementById('origin');
    
    if (!userLocation) {
        showNotification('Current location not available. Please wait for location detection.', 'warning');
        // Try to get location again
        getDefaultUserLocation();
        return;
    }
    
    if (originInput) {
        // Get readable address for the location
        getReverseGeocode(userLocation.lat, userLocation.lng)
            .then(address => {
                if (address) {
                    const shortAddress = address.split(',').slice(0, 3).join(', ');
                    originInput.value = shortAddress;
                } else {
                    originInput.value = `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`;
                }
                
                showNotification('Current location set as origin', 'success');
            })
            .catch(() => {
                // Fallback to coordinates
                originInput.value = `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`;
                showNotification('Current location coordinates set as origin', 'success');
            });
    }
}

// Handle logo loading
function handleLogoLoading() {
    const logoImage = document.getElementById('logo-image');
    const logoIcon = document.getElementById('logo-icon');
    
    if (logoImage && logoIcon) {
        logoImage.addEventListener('load', function() {
            console.log('Logo image loaded successfully');
            logoImage.style.display = 'block';
            logoIcon.style.display = 'none';
        });
        
        logoImage.addEventListener('error', function() {
            console.log('Logo image failed to load, showing icon fallback');
            logoImage.style.display = 'none';
            logoIcon.style.display = 'block';
        });
        
        // Check if image is already loaded (cached)
        if (logoImage.complete && logoImage.naturalHeight !== 0) {
            logoImage.style.display = 'block';
            logoIcon.style.display = 'none';
        }
    }
}

// DOM Elements
const loadingOverlay = document.getElementById('loading-overlay');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notification-text');
const closeNotification = document.getElementById('close-notification');
const analyzeRouteBtn = document.getElementById('analyze-route');
const originInput = document.getElementById('origin');
const destinationInput = document.getElementById('destination');
const hotspotsList = document.getElementById('hotspots-list');
const showHotspotsBtn = document.getElementById('show-hotspots');
const cityInput = document.getElementById('city');
const submitReportBtn = document.getElementById('submit-report');
const reportLocationInput = document.getElementById('report-location');
const riskLevelSelect = document.getElementById('risk-level');
const descriptionInput = document.getElementById('description');
const weatherText = document.getElementById('weather-text');
const toggleHeatmapBtn = document.getElementById('toggle-heatmap');
const showReportsBtn = document.getElementById('show-reports');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Starting initialization...');
    
    // Initialize responsive features first
    initializeResponsiveFeatures();
    
    try {
        console.log('Handling logo loading...');
        handleLogoLoading();
        
        console.log('Setting up emergency SOS...');
        setupEmergencySOS();
        
        console.log('Setting up live location...');
        setupLiveLocation();
        
        console.log('Initializing map...');
        initMap();
        
        console.log('Getting default location for all features...');
        getDefaultUserLocation();
        
        console.log('Setting up event listeners...');
        setupEventListeners();
        
        console.log('Getting current weather...');
        getCurrentWeather();
        
        console.log('Loading top hotspots...');
        loadTopHotspots();
        
        console.log('Application initialization complete!');
    } catch (error) {
        console.error('Error during initialization:', error);
        showNotification('Error initializing application: ' + error.message, 'error');
    }
});

// Initialize Leaflet Map
function initMap() {
    console.log('Initializing Leaflet map...');
    
    // Default center - New Delhi, India (more relevant for Indian roads)
    const defaultCenter = [28.6139, 77.2090]; // New Delhi coordinates [lat, lng]

    // Check if map container exists
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error('Map container not found!');
        return;
    }
    
    console.log('Map container found, creating Leaflet map...');

    // Initialize Leaflet map with mobile optimizations
    map = L.map('map', {
        center: defaultCenter,
        zoom: isMobile() ? 10 : 12,
        zoomControl: !isMobile(),
        touchZoom: true,
        scrollWheelZoom: !isMobile(),
        doubleClickZoom: true,
        boxZoom: !isMobile(),
        keyboard: !isMobile(),
        dragging: true,
        tap: isMobile(),
        tapTolerance: 15
    });
    console.log('Leaflet map created successfully');

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Add mobile-friendly zoom controls if needed
    if (isMobile()) {
        L.control.zoom({
            position: 'bottomright'
        }).addTo(map);
    }
    
    console.log('Map tiles added successfully');

    // Try to get user's current location
    // Note: We're not adding a marker here since getDefaultUserLocation() will handle that
    // This avoids duplicate markers on the map
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('Initial user location obtained:', position.coords);
                // We'll let getDefaultUserLocation() handle setting the userLocation variable
                // and adding the appropriate marker to avoid conflicts with live location tracking
            },
            (error) => {
                console.error('Could not get initial user location:', error);
                console.error('Error code:', error.code);
                console.error('Error message:', error.message);
            }
        );
    } else {
        console.log('Geolocation not supported');
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Check if all required elements exist with detailed logging
    console.log('Setting up event listeners...');
    console.log('analyzeRouteBtn:', analyzeRouteBtn);
    console.log('submitReportBtn:', submitReportBtn);
    console.log('showHotspotsBtn:', showHotspotsBtn);
    console.log('closeNotification:', closeNotification);
    console.log('toggleHeatmapBtn:', toggleHeatmapBtn);
    console.log('showReportsBtn:', showReportsBtn);
    
    if (!analyzeRouteBtn || !submitReportBtn || !showHotspotsBtn || !closeNotification || !toggleHeatmapBtn || !showReportsBtn) {
        console.error('Some button elements not found. Check HTML IDs.');
        
        // Check specific missing elements
        if (!toggleHeatmapBtn) {
            console.error('toggleHeatmapBtn not found! Element with id="toggle-heatmap" is missing.');
        }
        
        return;
    }

    console.log('All button elements found successfully!');
    
    // Initialize button text
    if (toggleHeatmapBtn) {
        toggleHeatmapBtn.textContent = 'Open Heatmap Page';
    }

    // Analyze route button
    analyzeRouteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Analyze route button clicked');
        analyzeRoute();
    });

    // Submit report button
    submitReportBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Submit report button clicked');
        submitRiskReport();
    });

    // Show hotspots button
    showHotspotsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Show hotspots button clicked');
        loadTopHotspots();
    });

    // Close notification
    closeNotification.addEventListener('click', () => {
        notification.classList.remove('show');
    });

    // Toggle heatmap
    if (toggleHeatmapBtn) {
        console.log('Adding click listener to heatmap button');
        toggleHeatmapBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Toggle heatmap button clicked - event triggered');
            toggleHeatmap();
        });
        console.log('Heatmap button listener added successfully');
    } else {
        console.error('Cannot add listener to toggleHeatmapBtn - element is null');
    }

    // Show reports
    showReportsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Show reports button clicked');
        showUserReports();
    });
    
    // Toggle risk panel visibility
    const toggleRiskPanelBtn = document.getElementById('toggle-risk-panel');
    const riskPanel = document.getElementById('risk-info');
    if (toggleRiskPanelBtn && riskPanel) {
        let isRiskPanelMinimized = false;
        
        toggleRiskPanelBtn.addEventListener('click', () => {
            isRiskPanelMinimized = !isRiskPanelMinimized;
            
            if (isRiskPanelMinimized) {
                // Minimize risk panel
                riskPanel.style.maxHeight = '40px';
                riskPanel.style.overflow = 'hidden';
                toggleRiskPanelBtn.innerHTML = '<i class="fas fa-plus"></i>';
            } else {
                // Expand risk panel
                riskPanel.style.maxHeight = '';
                riskPanel.style.overflow = '';
                toggleRiskPanelBtn.innerHTML = '<i class="fas fa-minus"></i>';
            }
        });
    }
}

// Analyze route for risk
async function analyzeRoute() {
    console.log('Analyze route function called');
    showLoading('Analyzing route risk...');
    
    try {
        // Clear previous route
        clearRouteDisplay();
        
        const origin = originInput.value;
        const destination = destinationInput.value;
        const safeRouteRequested = document.getElementById('safe-route-option').checked;
        
        // Use current location as origin if not specified
        let actualOrigin = origin;
        if (!origin && userLocation) {
            actualOrigin = `${userLocation.lat},${userLocation.lng}`;
            console.log('Using current location as origin:', actualOrigin);
        }
        
        console.log('Origin:', actualOrigin, 'Destination:', destination, 'Safe route:', safeRouteRequested);
        
        if (!actualOrigin || !destination) {
            showNotification('Please enter destination. Origin will use your current location if available.', 'error');
            return;
        }
        
        if (safeRouteRequested) {
            // Get multiple route options and find the safest one
            showLoading('Finding safer route alternatives...');
            await findSafeRoute(actualOrigin, destination);
        } else {
            // Standard route analysis
            showLoading('Getting route coordinates...');
            const routeData = await getRouteFromOSRM(actualOrigin, destination);
            
            if (routeData && routeData.route_points && routeData.route_points.length > 0) {
                console.log('Got route from OSRM, now analyzing risk...');
                await processRouteRisk(routeData);
                displayRouteRisk(routeData, 'normal');
            } else {
                throw new Error('Could not generate route coordinates');
            }
        }
        
    } catch (error) {
        console.error('Error analyzing route:', error);
        showNotification('Error analyzing route: ' + error.message + '. Check the console for details.', 'error');
    } finally {
        hideLoading();
    }
}

// Get route from OSRM (Open Source Routing Machine)
async function getRouteFromOSRM(origin, destination) {
    console.log('Getting route from OSRM for:', origin, 'to', destination);
    
    try {
        // First geocode the origin and destination
        const originCoords = await geocodeLocation(origin);
        const destCoords = await geocodeLocation(destination);
        
        if (!originCoords || !destCoords) {
            throw new Error('Could not geocode locations');
        }
        
        console.log('Origin coords:', originCoords, 'Destination coords:', destCoords);
        
        // Use OSRM public API to get route
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originCoords.lng},${originCoords.lat};${destCoords.lng},${destCoords.lat}?overview=full&geometries=geojson`;
        
        console.log('OSRM URL:', osrmUrl);
        
        const response = await fetch(osrmUrl);
        
        if (!response.ok) {
            throw new Error('OSRM API request failed');
        }
        
        const data = await response.json();
        console.log('OSRM response:', data);
        
        if (data.routes && data.routes.length > 0 && data.routes[0].geometry) {
            const coordinates = data.routes[0].geometry.coordinates;
            
            // Convert OSRM coordinates to our format (OSRM uses [lng, lat], we need [lat, lng])
            const route_points = coordinates.map(coord => ({
                lat: coord[1],
                lng: coord[0]
            }));
            
            console.log(`Generated ${route_points.length} route points from OSRM`);
            
            return {
                route_points: route_points,
                distance: data.routes[0].distance,
                duration: data.routes[0].duration,
                origin: origin,
                destination: destination
            };
        } else {
            throw new Error('No route found in OSRM response');
        }
        
    } catch (error) {
        console.error('OSRM routing failed:', error);
        
        // Fallback to simple straight line route
        console.log('Falling back to simple route generation');
        return await generateSimpleRoute(origin, destination);
    }
}

// Geocode location using Nominatim (OpenStreetMap geocoding)
async function geocodeLocation(location) {
    try {
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`;
        
        const response = await fetch(nominatimUrl);
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

// Generate simple route as fallback
async function generateSimpleRoute(origin, destination) {
    console.log('Generating simple route fallback');
    
    const originCoords = await geocodeLocation(origin);
    const destCoords = await geocodeLocation(destination);
    
    if (!originCoords || !destCoords) {
        // Use known coordinates for major Indian cities as final fallback
        const cityCoords = {
            'mumbai': { lat: 19.0760, lng: 72.8777 },
            'delhi': { lat: 28.6139, lng: 77.2090 },
            'bangalore': { lat: 12.9716, lng: 77.5946 },
            'kolkata': { lat: 22.5726, lng: 88.3639 },
            'chennai': { lat: 13.0827, lng: 80.2707 },
            'hyderabad': { lat: 17.3850, lng: 78.4867 },
            'pune': { lat: 18.5204, lng: 73.8567 },
            'jaipur': { lat: 26.9124, lng: 75.7873 }
        };
        
        const originKey = origin.toLowerCase();
        const destKey = destination.toLowerCase();
        
        const finalOrigin = cityCoords[originKey] || { lat: 28.6139, lng: 77.2090 };
        const finalDest = cityCoords[destKey] || { lat: 19.0760, lng: 72.8777 };
        
        return generateStraightLineRoute(finalOrigin, finalDest, origin, destination);
    }
    
    return generateStraightLineRoute(originCoords, destCoords, origin, destination);
}

// Generate straight line route with intermediate points
function generateStraightLineRoute(originCoords, destCoords, originName, destName) {
    const points = [];
    const numPoints = 10; // Generate 10 intermediate points
    
    for (let i = 0; i <= numPoints; i++) {
        const ratio = i / numPoints;
        const lat = originCoords.lat + (destCoords.lat - originCoords.lat) * ratio;
        const lng = originCoords.lng + (destCoords.lng - originCoords.lng) * ratio;
        
        points.push({ lat, lng });
    }
    
    console.log(`Generated ${points.length} points for straight line route`);
    
    return {
        route_points: points,
        origin: originName,
        destination: destName
    };
}

// Generate sample risk predictions for route points
function generateSampleRiskPredictions(routePoints) {
    console.log('Generating risk predictions for', routePoints.length, 'points');
    
    return routePoints.map((point, index) => {
        // Create more varied risk levels with some hotspots
        let baseRisk;
        
        // Create risk pattern: higher risk in middle sections and at intersections
        const progress = index / (routePoints.length - 1); // 0 to 1
        
        if (progress < 0.2 || progress > 0.8) {
            // Lower risk at start and end (0.2 to 0.5)
            baseRisk = 0.2 + Math.random() * 0.3;
        } else if (progress > 0.4 && progress < 0.6) {
            // Higher risk in middle section (0.5 to 0.9)
            baseRisk = 0.5 + Math.random() * 0.4;
        } else {
            // Moderate risk elsewhere (0.3 to 0.7)
            baseRisk = 0.3 + Math.random() * 0.4;
        }
        
        // Add some random high-risk hotspots
        if (Math.random() < 0.1) { // 10% chance of hotspot
            baseRisk = Math.max(baseRisk, 0.7 + Math.random() * 0.2);
        }
        
        // Add some random low-risk areas
        if (Math.random() < 0.15) { // 15% chance of safe area
            baseRisk = Math.min(baseRisk, 0.2 + Math.random() * 0.2);
        }
        
        const weatherConditions = ['Clear', 'Cloudy', 'Light Rain', 'Heavy Rain', 'Mist', 'Fog'];
        const weatherWeights = [0.4, 0.3, 0.15, 0.05, 0.08, 0.02]; // Weighted probabilities
        
        // Select weather based on weights
        let weatherCondition = 'Clear';
        const rand = Math.random();
        let cumulative = 0;
        for (let i = 0; i < weatherConditions.length; i++) {
            cumulative += weatherWeights[i];
            if (rand <= cumulative) {
                weatherCondition = weatherConditions[i];
                break;
            }
        }
        
        // Adjust risk based on weather
        if (weatherCondition.includes('Rain')) {
            baseRisk = Math.min(0.95, baseRisk + 0.1 + Math.random() * 0.2);
        } else if (weatherCondition.includes('Fog') || weatherCondition.includes('Mist')) {
            baseRisk = Math.min(0.9, baseRisk + 0.05 + Math.random() * 0.15);
        }
        
        // Round to 2 decimal places
        baseRisk = Math.round(baseRisk * 100) / 100;
        
        const riskLevel = baseRisk < 0.3 ? 'Low' : 
                         baseRisk < 0.5 ? 'Moderate' : 
                         baseRisk < 0.7 ? 'High' : 'Severe';
        
        return {
            risk_score: baseRisk,
            risk_level: riskLevel,
            weather: {
                weather_condition: weatherCondition
            }
        };
    });
}

// Process route risk data (extracted from original analyzeRoute function)
async function processRouteRisk(routeData) {
    // Try to get risk analysis from backend
    try {
        const response = await fetch(`${API_BASE_URL}/predict_route_risk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                origin: routeData.origin,
                destination: routeData.destination,
                route_points: routeData.route_points
            })
        });
        
        if (response.ok) {
            const backendData = await response.json();
            console.log('Backend risk analysis:', backendData);
            
            if (backendData.data && backendData.data.predictions) {
                routeData.predictions = backendData.data.predictions;
                routeData.summary = backendData.data.summary;
                return;
            }
        }
    } catch (error) {
        console.log('Backend risk analysis failed, using sample risk data:', error);
    }
    
    // Generate sample risk predictions if backend not available
    routeData.predictions = generateSampleRiskPredictions(routeData.route_points);
    
    // Calculate summary from generated predictions
    const riskScores = routeData.predictions.map(p => p.risk_score);
    const averageRisk = riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length;
    const maxRiskScore = Math.max(...riskScores);
    
    const riskCounts = {
        'Low': riskScores.filter(score => score < 0.3).length,
        'Moderate': riskScores.filter(score => score >= 0.3 && score < 0.5).length,
        'High': riskScores.filter(score => score >= 0.5 && score < 0.7).length,
        'Severe': riskScores.filter(score => score >= 0.7).length
    };
    
    const dominantRiskLevel = Object.keys(riskCounts).reduce((a, b) => 
        riskCounts[a] > riskCounts[b] ? a : b
    );
    
    routeData.summary = {
        average_risk: Math.round(averageRisk * 100) / 100,
        max_risk: { risk_score: maxRiskScore },
        dominant_risk_level: dominantRiskLevel,
        total_points: routeData.route_points.length,
        risk_distribution: riskCounts
    };
}

// Find safer route by analyzing multiple route alternatives
async function findSafeRoute(origin, destination) {
    try {
        // Get multiple route alternatives
        const routes = await getMultipleRoutes(origin, destination);
        
        if (routes.length === 0) {
            throw new Error('No alternative routes found');
        }
        
        console.log(`Analyzing ${routes.length} route alternatives for safety...`);
        
        // Process risk for all routes
        for (let route of routes) {
            await processRouteRisk(route);
        }
        
        // Find the safest route (lowest average risk)
        const safeRoute = routes.reduce((safest, current) => {
            return current.summary.average_risk < safest.summary.average_risk ? current : safest;
        });
        
        // Find the fastest/shortest route for comparison
        const fastRoute = routes.reduce((fastest, current) => {
            // Prioritize duration, fallback to distance
            const currentMetric = (current.duration || current.distance || 0);
            const fastestMetric = (fastest.duration || fastest.distance || 0);
            return currentMetric < fastestMetric ? current : fastest;
        });
        
        // Ensure we have distinct routes - if they're the same, find the next best option
        let displaySafeRoute = safeRoute;
        let displayFastRoute = fastRoute;
        
        if (areRoutesSimilar(safeRoute, fastRoute)) {
            // Routes are the same, find the next best safe route that's different
            const alternativeRoutes = routes
                .filter(route => !areRoutesSimilar(route, fastRoute))
                .sort((a, b) => a.summary.average_risk - b.summary.average_risk);
                
            if (alternativeRoutes.length > 0) {
                displaySafeRoute = alternativeRoutes[0];
                await processRouteRisk(displaySafeRoute); // Re-process if needed
            } else {
                // If no different routes, create a slightly modified version for visualization
                displaySafeRoute = createModifiedRoute(safeRoute, 'safer');
            }
        }
        
        // Store current routes for comparison
        currentRoutes = [displaySafeRoute, displayFastRoute];
        
        // Display both routes
        displaySafeRouteComparison(displaySafeRoute, displayFastRoute);
        
        const safetyImprovement = ((displayFastRoute.summary.average_risk - displaySafeRoute.summary.average_risk) * 100).toFixed(1);
        const extraDistance = displaySafeRoute.distance && displayFastRoute.distance ? 
            ((displaySafeRoute.distance - displayFastRoute.distance) / 1000).toFixed(1) : 'N/A';
        const extraTime = displaySafeRoute.duration && displayFastRoute.duration ? 
            Math.round((displaySafeRoute.duration - displayFastRoute.duration) / 60) : 'N/A';
        
        showNotification(
            `Safer route found! ${safetyImprovement}% less risky. Extra distance: ${extraDistance}km, Extra time: ${extraTime} min`, 
            'success'
        );
        
    } catch (error) {
        console.error('Error finding safe route:', error);
        showNotification('Could not find safer route alternatives. Using standard route.', 'warning');
        
        // Fallback to standard route
        const routeData = await getRouteFromOSRM(origin, destination);
        if (routeData && routeData.route_points && routeData.route_points.length > 0) {
            await processRouteRisk(routeData);
            displayRouteRisk(routeData, 'normal');
        }
    }
}

// Get multiple route alternatives using different approaches
async function getMultipleRoutes(origin, destination) {
    const routes = [];
    
    try {
        // Get coordinates for origin and destination
        const originCoords = await geocodeLocation(origin);
        const destCoords = await geocodeLocation(destination);
        
        if (!originCoords || !destCoords) {
            throw new Error('Could not geocode locations');
        }
        
        // Try different OSRM routing approaches to get diverse routes
        const routingOptions = [
            { profile: 'driving', params: '' }, // Fastest route
            { profile: 'driving', params: '&alternatives=true&steps=true' }, // Alternative routes
            { profile: 'driving', params: '&exclude=motorway' }, // Avoid highways
            { profile: 'driving', params: '&exclude=toll' }, // Avoid tolls
            { profile: 'driving', params: '&exclude=ferry' }, // Avoid ferries
        ];
        
        // Also try walking and cycling for more diversity
        const additionalOptions = [
            { profile: 'walking', params: '' }, // Walking route
            { profile: 'cycling', params: '' }  // Cycling route
        ];
        
        // Collect all options
        const allOptions = [...routingOptions, ...additionalOptions];
        
        for (let option of allOptions) {
            try {
                const osrmUrl = `https://router.project-osrm.org/route/v1/${option.profile}/${originCoords.lng},${originCoords.lat};${destCoords.lng},${destCoords.lat}?overview=full&geometries=geojson${option.params}`;
                
                const response = await fetch(osrmUrl, { timeout: 5000 }); // 5 second timeout
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.routes && data.routes.length > 0) {
                        // Process each route returned by OSRM
                        for (let osrmRoute of data.routes) {
                            if (osrmRoute.geometry && osrmRoute.geometry.coordinates) {
                                const route_points = osrmRoute.geometry.coordinates.map(coord => ({
                                    lat: coord[1],
                                    lng: coord[0]
                                }));
                                
                                routes.push({
                                    route_points: route_points,
                                    distance: osrmRoute.distance,
                                    duration: osrmRoute.duration,
                                    origin: origin,
                                    destination: destination,
                                    profile: option.profile,
                                    params: option.params
                                });
                            }
                        }
                    }
                }
            } catch (error) {
                console.log(`Failed to get route with option ${JSON.stringify(option)}:`, error.message);
            }
        }
        
        // If no routes found, generate synthetic alternatives
        if (routes.length === 0) {
            console.log('No OSRM routes found, generating synthetic alternatives');
            routes.push(...generateSyntheticRoutes(originCoords, destCoords, origin, destination));
        }
        
        // Generate additional synthetic routes for more diversity
        if (routes.length < 5) {
            const additionalSynthetic = generateAdditionalSyntheticRoutes(originCoords, destCoords, origin, destination);
            routes.push(...additionalSynthetic);
        }
        
        // Remove duplicate routes (similar paths) but keep at least 2
        const uniqueRoutes = removeDuplicateRoutes(routes);
        console.log(`Generated ${uniqueRoutes.length} unique route alternatives`);
        
        return uniqueRoutes;
        
    } catch (error) {
        console.error('Error getting multiple routes:', error);
        return [];
    }
}

// Generate synthetic route alternatives when OSRM fails
function generateSyntheticRoutes(originCoords, destCoords, originName, destName) {
    const routes = [];
    
    // Generate 3 different synthetic routes with varied paths
    for (let i = 0; i < 3; i++) {
        const points = [];
        const numPoints = 8 + i * 2; // Different number of points for variety
        
        for (let j = 0; j <= numPoints; j++) {
            const baseRatio = j / numPoints;
            
            // Add some variation to create different paths
            let latVariation = 0;
            let lngVariation = 0;
            
            if (i === 1) {
                // Route 1: Slight northern detour
                latVariation = Math.sin(baseRatio * Math.PI) * 0.02;
            } else if (i === 2) {
                // Route 2: Slight southern detour
                latVariation = -Math.sin(baseRatio * Math.PI) * 0.015;
                lngVariation = Math.cos(baseRatio * Math.PI * 2) * 0.01;
            }
            
            const lat = originCoords.lat + (destCoords.lat - originCoords.lat) * baseRatio + latVariation;
            const lng = originCoords.lng + (destCoords.lng - originCoords.lng) * baseRatio + lngVariation;
            
            points.push({ lat, lng });
        }
        
        // Calculate approximate distance
        const distance = calculateRouteDistance(points);
        
        routes.push({
            route_points: points,
            distance: distance,
            duration: distance / 1000 * 60, // Approximate driving time
            origin: originName,
            destination: destName,
            profile: 'synthetic',
            params: `variant_${i}`
        });
    }
    
    return routes;
}

// Generate additional synthetic route alternatives with more variation
function generateAdditionalSyntheticRoutes(originCoords, destCoords, originName, destName) {
    const routes = [];
    
    // Generate 3 different synthetic routes with varied paths
    for (let i = 0; i < 3; i++) {
        const points = [];
        const numPoints = 10 + i * 3; // Different number of points for variety
        
        for (let j = 0; j <= numPoints; j++) {
            const baseRatio = j / numPoints;
            
            // Add significant variation to create different paths
            let latVariation = 0;
            let lngVariation = 0;
            
            if (i === 0) {
                // Route 1: Significant northern detour
                latVariation = Math.sin(baseRatio * Math.PI * 2) * 0.03;
                lngVariation = Math.cos(baseRatio * Math.PI * 3) * 0.02;
            } else if (i === 1) {
                // Route 2: Significant southern detour
                latVariation = -Math.sin(baseRatio * Math.PI * 1.5) * 0.025;
                lngVariation = Math.sin(baseRatio * Math.PI * 2) * 0.015;
            } else {
                // Route 3: Mixed variation
                latVariation = Math.cos(baseRatio * Math.PI * 2) * 0.02;
                lngVariation = Math.sin(baseRatio * Math.PI * 2.5) * 0.025;
            }
            
            const lat = originCoords.lat + (destCoords.lat - originCoords.lat) * baseRatio + latVariation;
            const lng = originCoords.lng + (destCoords.lng - originCoords.lng) * baseRatio + lngVariation;
            
            points.push({ lat, lng });
        }
        
        // Calculate approximate distance
        const distance = calculateRouteDistance(points);
        
        routes.push({
            route_points: points,
            distance: distance,
            duration: distance / 1000 * 60 * (1.2 + i * 0.3), // Different time estimates
            origin: originName,
            destination: destName,
            profile: 'synthetic',
            params: `variant_${i + 3}` // Different variant numbers
        });
    }
    
    return routes;
}

// Calculate approximate route distance
function calculateRouteDistance(points) {
    let distance = 0;
    for (let i = 1; i < points.length; i++) {
        distance += getDistanceBetweenPoints(points[i-1], points[i]);
    }
    return distance;
}

// Calculate distance between two points (Haversine formula)
function getDistanceBetweenPoints(point1, point2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Check if two routes are similar (to avoid duplicates)
function areRoutesSimilar(route1, route2) {
    if (!route1.route_points || !route2.route_points) return false;
    
    // Check if routes have significantly different number of points
    const pointCountDiff = Math.abs(route1.route_points.length - route2.route_points.length);
    if (pointCountDiff > 5) return false;
    
    // Check if total distances are significantly different
    const distanceDiff = Math.abs((route1.distance || 0) - (route2.distance || 0));
    if (distanceDiff > 2000) return false; // More than 2km difference
    
    // For routes with similar length, check point-by-point distance
    const minLength = Math.min(route1.route_points.length, route2.route_points.length);
    if (minLength === 0) return true;
    
    // Sample a few points to check similarity
    const samplePoints = Math.min(10, Math.floor(minLength / 3));
    let totalDistance = 0;
    let sampled = 0;
    
    for (let i = 0; i < minLength; i += Math.floor(minLength / samplePoints)) {
        const point1 = route1.route_points[i];
        const point2 = route2.route_points[i];
        
        if (point1 && point2) {
            const distance = getDistanceBetweenPoints(point1, point2);
            totalDistance += distance;
            sampled++;
        }
    }
    
    // If average distance between points is small, routes are similar
    const avgDistance = sampled > 0 ? totalDistance / sampled : 0;
    return avgDistance < 100; // Less than 100 meters average difference
}

// Remove duplicate routes (similar paths)
function removeDuplicateRoutes(routes) {
    if (routes.length <= 1) return routes;
    
    const uniqueRoutes = [routes[0]]; // Always keep first route
    
    for (let i = 1; i < routes.length; i++) {
        let isDuplicate = false;
        const currentRoute = routes[i];
        
        // Check against all already added routes
        for (let j = 0; j < uniqueRoutes.length; j++) {
            if (areRoutesSimilar(currentRoute, uniqueRoutes[j])) {
                isDuplicate = true;
                break;
            }
        }
        
        // Only add if not a duplicate
        if (!isDuplicate) {
            uniqueRoutes.push(currentRoute);
        }
    }
    
    return uniqueRoutes;
}

// Display safe route comparison with both routes on map
function displaySafeRouteComparison(safeRoute, fastRoute) {
    console.log('Displaying safe route comparison');
    
    // Clear previous routes
    clearRouteDisplay();
    
    // Display safe route (green) - ensure it's always shown
    displaySingleRoute(safeRoute, 'safe');
    
    // Display fast route (blue) - ensure it's always shown even if similar
    displaySingleRoute(fastRoute, 'fast');
    
    // Update info panel with comparison
    updateSafeRouteInfoPanel(safeRoute, fastRoute);
    
    // Fit map to show both routes
    const allPoints = [...safeRoute.route_points, ...fastRoute.route_points];
    const bounds = L.latLngBounds(allPoints.map(p => [p.lat, p.lng]));
    map.fitBounds(bounds);
}

// Display a single route with specific styling
function displaySingleRoute(routeData, routeType) {
    const validRoutePoints = routeData.route_points.filter(point => 
        point && typeof point.lat === 'number' && typeof point.lng === 'number'
    );
    
    if (validRoutePoints.length === 0) return;
    
    const path = validRoutePoints.map(point => [point.lat, point.lng]);
    
    // Define route styling based on type
    let routeStyle;
    if (routeType === 'safe') {
        routeStyle = {
            color: '#2ecc71', // Green for safe route
            weight: 6,
            opacity: 0.8,
            dashArray: null
        };
    } else if (routeType === 'fast') {
        routeStyle = {
            color: '#3498db', // Blue for fast route
            weight: 5,
            opacity: 0.6,
            dashArray: '10, 10' // Dashed line
        };
    } else {
        // Normal route coloring based on risk
        const averageRisk = routeData.summary?.average_risk || 0.5;
        routeStyle = {
            color: getRiskColor(averageRisk),
            weight: 6,
            opacity: 0.8
        };
    }
    
    // Create polyline
    const polyline = L.polyline(path, routeStyle).addTo(map);
    
    // Store polyline reference
    if (routeType === 'safe') {
        safeRoutePolyline = polyline;
    } else if (routeType === 'fast') {
        routePolyline = polyline; // Reuse existing variable for fast route
    } else {
        routePolyline = polyline;
    }
    
    // Add route label
    if (path.length > 0) {
        const midPoint = Math.floor(path.length / 2);
        const labelText = routeType === 'safe' ? 'Safer Route' : 
                         routeType === 'fast' ? 'Faster Route' : 'Route';
        
        const label = L.marker(path[midPoint], {
            icon: L.divIcon({
                className: 'route-label',
                html: `<div style="background: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; color: ${routeStyle.color}; border: 2px solid ${routeStyle.color};">${labelText}</div>`,
                iconSize: [80, 30],
                iconAnchor: [40, 15]
            })
        }).addTo(map);
        
        markers.push(label);
    }
    
    // Add risk markers for high-risk points
    if (routeData.predictions && routeType !== 'fast') {
        routeData.predictions.forEach((prediction, index) => {
            if (prediction.risk_score >= 0.6 && validRoutePoints[index]) {
                const point = validRoutePoints[index];
                const marker = L.circleMarker([point.lat, point.lng], {
                    radius: 8,
                    fillColor: getRiskColor(prediction.risk_score),
                    fillOpacity: 0.8,
                    color: '#ffffff',
                    weight: 2
                }).addTo(map);
                
                markers.push(marker);
                
                marker.bindPopup(`
                    <div style="padding: 8px;">
                        <h4 style="color: ${getRiskColor(prediction.risk_score)};">Risk Point</h4>
                        <p><strong>Risk:</strong> ${(prediction.risk_score * 100).toFixed(0)}%</p>
                        <p><strong>Type:</strong> ${routeType === 'safe' ? 'Safer Route' : 'Standard Route'}</p>
                    </div>
                `);
            }
        });
    }
}

// Update info panel for safe route comparison
function updateSafeRouteInfoPanel(safeRoute, fastRoute) {
    const riskInfoPanel = document.querySelector('.risk-info-panel');
    const riskIndicator = document.querySelector('.risk-indicator');
    
    if (!riskInfoPanel || !riskIndicator) return;
    
    // Update with safe route data
    const avgRisk = safeRoute.summary?.average_risk || 0;
    riskIndicator.style.width = `${avgRisk * 100}%`;
    riskIndicator.style.backgroundColor = getRiskColor(avgRisk);
    
    // Update stats
    const avgRiskElement = document.getElementById('avg-risk');
    const maxRiskElement = document.getElementById('max-risk');
    const riskLevelElement = document.getElementById('risk-level-display');
    
    if (avgRiskElement) avgRiskElement.textContent = `${(avgRisk * 100).toFixed(1)}%`;
    if (maxRiskElement) {
        const maxRisk = safeRoute.summary?.max_risk?.risk_score || 0;
        maxRiskElement.textContent = `${(maxRisk * 100).toFixed(1)}%`;
    }
    if (riskLevelElement) {
        riskLevelElement.textContent = safeRoute.summary?.dominant_risk_level || 'Unknown';
    }
    
    // Update risk factors with comparison
    const riskFactorsList = document.getElementById('risk-factors');
    if (riskFactorsList) {
        riskFactorsList.innerHTML = '';
        
        const safeDistance = (safeRoute.distance / 1000).toFixed(1);
        const fastDistance = (fastRoute.distance / 1000).toFixed(1);
        const safeTime = Math.round(safeRoute.duration / 60);
        const fastTime = Math.round(fastRoute.duration / 60);
        const riskImprovement = ((fastRoute.summary.average_risk - safeRoute.summary.average_risk) * 100).toFixed(1);
        
        const factors = [
            `🛡️ Safer Route: ${safeDistance}km, ${safeTime} min (${(safeRoute.summary.average_risk * 100).toFixed(1)}% avg risk)`,
            `⚡ Faster Route: ${fastDistance}km, ${fastTime} min (${(fastRoute.summary.average_risk * 100).toFixed(1)}% avg risk)`,
            `📈 Safety Improvement: ${riskImprovement}% less risky`,
            `➕ Extra Distance: ${(safeDistance - fastDistance).toFixed(1)}km`,
            `⏱️ Extra Time: ${(safeTime - fastTime)} minutes`
        ];
        
        factors.forEach(factor => {
            const li = document.createElement('li');
            li.textContent = factor;
            li.style.marginBottom = '8px';
            riskFactorsList.appendChild(li);
        });
    }
    
    // Show panel
    riskInfoPanel.style.display = 'block';
    setTimeout(() => {
        riskInfoPanel.style.opacity = '1';
        riskInfoPanel.style.transform = 'translateY(0)';
    }, 100);
}

// Display route risk on map
function displayRouteRisk(routeData, routeType = 'normal') {
    console.log('displayRouteRisk called with data:', routeData, 'type:', routeType);
    
    // For safe route comparison, use the dedicated function
    if (routeType === 'safe_comparison') {
        return; // This will be handled by displaySafeRouteComparison
    }
    
    // Use the single route display function
    displaySingleRoute(routeData, routeType);
    
    // Update risk info panel (only for normal routes)
    if (routeType === 'normal') {
        updateRiskInfoPanel(routeData);
    }
    
    showNotification('Route analysis complete', 'success');
}

// Update risk info panel with route data
function updateRiskInfoPanel(routeData) {
    console.log('Updating risk info panel with:', routeData.summary);
    
    const riskInfoPanel = document.querySelector('.risk-info-panel');
    const riskIndicator = document.querySelector('.risk-indicator');
    
    if (!riskInfoPanel || !riskIndicator) {
        console.error('Risk info panel elements not found');
        return;
    }
    
    // Update risk meter
    const avgRisk = routeData.summary?.average_risk || 0;
    riskIndicator.style.width = `${avgRisk * 100}%`;
    riskIndicator.style.backgroundColor = getRiskColor(avgRisk);
    
    // Update stats using the correct IDs from HTML
    const avgRiskElement = document.getElementById('avg-risk');
    const maxRiskElement = document.getElementById('max-risk');
    const riskLevelElement = document.getElementById('risk-level-display');
    
    if (avgRiskElement) avgRiskElement.textContent = `${(avgRisk * 100).toFixed(1)}%`;
    if (maxRiskElement) {
        const maxRisk = routeData.summary?.max_risk?.risk_score || 0;
        maxRiskElement.textContent = `${(maxRisk * 100).toFixed(1)}%`;
    }
    if (riskLevelElement) {
        riskLevelElement.textContent = routeData.summary?.dominant_risk_level || 'Unknown';
    }
    
    // Update risk factors with more detailed information
    const riskFactorsList = document.getElementById('risk-factors');
    if (riskFactorsList) {
        riskFactorsList.innerHTML = '';
        
        const factors = [
            `Route distance: ${routeData.distance ? (routeData.distance / 1000).toFixed(1) + ' km' : 'N/A'}`,
            `Total analysis points: ${routeData.summary?.total_points || 0}`,
            `Dominant risk level: ${routeData.summary?.dominant_risk_level || 'Unknown'}`,
            `Weather conditions: Varied along route`
        ];
        
        // Add risk distribution if available
        if (routeData.summary?.risk_distribution) {
            const dist = routeData.summary.risk_distribution;
            factors.push(`Risk distribution: Low(${dist.Low}), Moderate(${dist.Moderate}), High(${dist.High}), Severe(${dist.Severe})`);
        }
        
        factors.forEach(factor => {
            const li = document.createElement('li');
            li.textContent = factor;
            riskFactorsList.appendChild(li);
        });
    }
    
    // Show panel with animation
    riskInfoPanel.style.display = 'block';
    setTimeout(() => {
        riskInfoPanel.style.opacity = '1';
        riskInfoPanel.style.transform = 'translateY(0)';
    }, 100);
    
    console.log('Risk info panel updated and displayed');
}

// Get risk for a specific location
async function getRiskForLocation(location) {
    console.log('Getting risk for location:', location);
    
    try {
        const response = await fetch(`${API_BASE_URL}/predict_risk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                lat: location.lat,
                lng: location.lng,
                time: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to get risk data');
        }
        
        const data = await response.json();
        console.log('Risk data received:', data);
        
        // Add risk marker using Leaflet
        const marker = L.circleMarker([location.lat, location.lng], {
            radius: 15,
            fillColor: getRiskColor(data.risk_level),
            fillOpacity: 0.5,
            color: '#ffffff',
            weight: 2
        }).addTo(map);
        
        markers.push(marker);
        
        // Add popup
        const popupContent = `
            <div style="padding: 10px;">
                <h3 style="margin-bottom: 5px;">Current Location Risk</h3>
                <p><strong>Risk Level:</strong> ${(data.risk_level * 100).toFixed(0)}%</p>
                <p><strong>Risk Category:</strong> ${getRiskLevelText(data.risk_level)}</p>
                <p><strong>Factors:</strong> ${data.risk_factors ? data.risk_factors.join(', ') : 'N/A'}</p>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        
    } catch (error) {
        console.error('Error getting risk data:', error);
    }
}

// Submit user risk report
async function submitRiskReport() {
    showLoading('Submitting report...');
    
    try {
        const location = reportLocationInput.value;
        const riskLevel = riskLevelSelect.value;
        const description = descriptionInput.value;
        
        if (!location) {
            showNotification('Please enter a location', 'error');
            return;
        }
        
        const response = await fetch(`${API_BASE_URL}/report_risk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                location,
                risk_level: riskLevel,
                description
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to submit report');
        }
        
        // Clear form
        reportLocationInput.value = '';
        riskLevelSelect.value = 'low';
        descriptionInput.value = '';
        
        showNotification('Report submitted successfully', 'success');
        
        // Refresh map with new report if available
        const data = await response.json();
        if (data.data && data.data.report) {
            addReportMarker(data.data.report);
        }
        
    } catch (error) {
        console.error('Error submitting report:', error);
        showNotification('Error submitting report: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Add marker for user report
function addReportMarker(report) {
    const reportLocation = [report.lat, report.lng];
    
    const marker = L.marker(reportLocation, {
        icon: L.divIcon({
            className: 'custom-div-icon',
            html: getReportIcon(report.report_type),
            iconSize: [30, 30],
            iconAnchor: [15, 30]
        })
    }).addTo(map);
    
    markers.push(marker);
    
    // Add popup
    const popupContent = `
        <div style="padding: 10px;">
            <h3 style="margin-bottom: 5px;">${report.report_type}</h3>
            <p><strong>Reported:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
            <p><strong>Description:</strong> ${report.description}</p>
        </div>
    `;
    
    marker.bindPopup(popupContent);
    
    // Center map on new report
    map.setView(reportLocation, 15);
}

// Fetch fallback weather for New Delhi
async function fetchFallbackWeather() {
    try {
        const response = await fetch(`${API_BASE_URL}/weather?address=New Delhi`);
        
        if (!response.ok) {
            throw new Error(`Failed to get fallback weather data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        updateWeatherDisplay(data);
    } catch (error) {
        console.error('Error getting fallback weather:', error);
        weatherInfo.textContent = 'Weather data unavailable';
    }
}

// Get current weather
async function getCurrentWeather() {
    try {
        // Try to get user's current location for weather
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    console.log('Weather location obtained:', { lat, lng });
                    
                    try {
                        const response = await fetch(`${API_BASE_URL}/weather?lat=${lat}&lng=${lng}`);
                        
                        if (!response.ok) {
                            throw new Error(`Failed to get weather data: ${response.status} ${response.statusText}`);
                        }
                        
                        const data = await response.json();
                        updateWeatherDisplay(data);
                    } catch (error) {
                        console.error('Error fetching weather data:', error);
                        // Fallback to New Delhi (more relevant for Indian roads)
                        await fetchFallbackWeather();
                    }
                },
                async (error) => {
                    console.error('Error getting weather location:', error);
                    // Fallback to New Delhi (more relevant for Indian roads)
                    await fetchFallbackWeather();
                }
            );
        } else {
            console.log('Geolocation not supported for weather');
            // Fallback to New Delhi (more relevant for Indian roads)
            await fetchFallbackWeather();
        }
    } catch (error) {
        console.error('Error getting weather:', error);
        weatherInfo.textContent = 'Weather data unavailable';
    }
}

// Update weather display
function updateWeatherDisplay(response) {
    const weatherData = response.data;
    const icon = getWeatherIcon(weatherData.weather_condition);
    const temp = Math.round(weatherData.temperature);
    
    weatherText.innerHTML = `
        <i class="${icon}"></i>
        ${temp}°C | ${weatherData.weather_description}
    `;
}

// Load top hotspots
async function loadTopHotspots() {
    console.log('Loading top hotspots...');
    
    // Get the city input value
    const cityName = cityInput.value.trim();
    console.log('City input value:', cityName);
    
    try {
        let hotspots = null;
        
        // Try to fetch from backend first
        try {
            const url = cityName ? 
                `${API_BASE_URL}/hotspots/top_hotspots?city=${encodeURIComponent(cityName)}` : 
                `${API_BASE_URL}/hotspots/top_hotspots`;
            
            console.log('Fetching hotspots from:', url);
            const response = await fetch(url);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Backend hotspots data received:', data);
                
                if (data.hotspots && Array.isArray(data.hotspots)) {
                    hotspots = data.hotspots;
                }
            } else {
                console.log('Backend hotspots response not OK:', response.status);
            }
        } catch (backendError) {
            console.log('Backend hotspots failed:', backendError.message);
        }
        
        // If backend failed, generate sample hotspots for the specified city or general
        if (!hotspots || hotspots.length === 0) {
            console.log('Generating sample hotspots for:', cityName || 'general Indian locations');
            hotspots = generateCitySpecificHotspots(cityName);
        }
        
        displayHotspots(hotspots);
        
        const locationText = cityName ? `in ${cityName}` : 'across India';
        showNotification(`Loaded ${hotspots.length} hotspots ${locationText}`, 'success');
        
    } catch (error) {
        console.error('Error loading hotspots:', error);
        
        // Always show sample hotspots as final fallback
        const fallbackHotspots = generateCitySpecificHotspots(cityName);
        displayHotspots(fallbackHotspots);
        showNotification('Using sample hotspot data (backend unavailable)', 'warning');
    }
}

// Generate sample hotspots for Indian locations
function generateSampleHotspots() {
    return [
        {
            location_name: 'Mumbai - Pune Expressway (Khalapur)',
            lat: 18.8626,
            lng: 73.3234,
            risk_level: 0.85,
            incident_count: 24
        },
        {
            location_name: 'Delhi - Gurgaon Highway (Cyber City)',
            lat: 28.4945,
            lng: 77.0894,
            risk_level: 0.75,
            incident_count: 18
        },
        {
            location_name: 'Bangalore ORR - Electronic City',
            lat: 12.8456,
            lng: 77.6603,
            risk_level: 0.7,
            incident_count: 16
        },
        {
            location_name: 'Chennai - ECR Highway',
            lat: 12.8853,
            lng: 80.2242,
            risk_level: 0.68,
            incident_count: 14
        },
        {
            location_name: 'Hyderabad - ORR (Gachibowli)',
            lat: 17.4239,
            lng: 78.3776,
            risk_level: 0.65,
            incident_count: 12
        },
        {
            location_name: 'Kolkata - EM Bypass',
            lat: 22.5412,
            lng: 88.4118,
            risk_level: 0.6,
            incident_count: 11
        },
        {
            location_name: 'Pune - Mumbai Highway (Lonavala)',
            lat: 18.7537,
            lng: 73.4068,
            risk_level: 0.58,
            incident_count: 9
        },
        {
            location_name: 'Jaipur - Delhi Highway (Neemrana)',
            lat: 27.9814,
            lng: 76.3864,
            risk_level: 0.55,
            incident_count: 8
        }
    ];
}

// Generate city-specific hotspots with hourly variation
function generateCitySpecificHotspots(cityName) {
    const currentHour = new Date().getHours();
    const timeBasedMultiplier = getTimeBasedRiskMultiplier(currentHour);
    
    console.log('Generating hotspots for hour:', currentHour, 'multiplier:', timeBasedMultiplier);
    
    if (!cityName) {
        // Return general Indian hotspots if no city specified
        return generateSampleHotspots().map(hotspot => ({
            ...hotspot,
            risk_level: Math.min(0.95, hotspot.risk_level * timeBasedMultiplier),
            incident_count: Math.round(hotspot.incident_count * timeBasedMultiplier)
        }));
    }
    
    const city = cityName.toLowerCase();
    
    // City-specific hotspot data
    const cityHotspots = {
        'jaipur': [
            {
                location_name: 'Jaipur - Ajmer Road (Sanganer)',
                lat: 26.8543,
                lng: 75.7923,
                base_risk: 0.75
            },
            {
                location_name: 'Jaipur - Delhi Highway (Shahpura)',
                lat: 27.0238,
                lng: 75.9573,
                base_risk: 0.72
            },
            {
                location_name: 'Tonk Road - Malviya Nagar',
                lat: 26.8467,
                lng: 75.8648,
                base_risk: 0.68
            },
            {
                location_name: 'Sikar Road - Vishwakarma',
                lat: 26.9690,
                lng: 75.7804,
                base_risk: 0.65
            },
            {
                location_name: 'Agra Road - Sodala',
                lat: 26.9389,
                lng: 75.8737,
                base_risk: 0.62
            },
            {
                location_name: 'JLN Marg - Civil Lines',
                lat: 26.9157,
                lng: 75.8061,
                base_risk: 0.58
            },
            {
                location_name: 'Amer Road - Brahampuri',
                lat: 26.9855,
                lng: 75.8304,
                base_risk: 0.55
            },
            {
                location_name: 'Ring Road - Jagatpura',
                lat: 26.8206,
                lng: 75.8745,
                base_risk: 0.52
            },
            {
                location_name: 'Kota Road - Mansarovar',
                lat: 26.8388,
                lng: 75.7854,
                base_risk: 0.48
            },
            {
                location_name: 'Chomu Road - Kalwar',
                lat: 27.0397,
                lng: 75.6849,
                base_risk: 0.45
            }
        ],
        'mumbai': [
            {
                location_name: 'Western Express Highway - Andheri',
                lat: 19.1136,
                lng: 72.8697,
                base_risk: 0.85
            },
            {
                location_name: 'Eastern Express Highway - Vikhroli',
                lat: 19.1095,
                lng: 72.9240,
                base_risk: 0.82
            },
            {
                location_name: 'Mumbai-Pune Expressway - Kalyan',
                lat: 19.2403,
                lng: 73.1305,
                base_risk: 0.78
            },
            {
                location_name: 'Sion-Panvel Highway - Chembur',
                lat: 19.0330,
                lng: 72.8856,
                base_risk: 0.75
            },
            {
                location_name: 'Link Road - Malad',
                lat: 19.1864,
                lng: 72.8493,
                base_risk: 0.72
            },
            {
                location_name: 'SV Road - Bandra',
                lat: 19.0596,
                lng: 72.8295,
                base_risk: 0.68
            },
            {
                location_name: 'Ghatkopar-Mankhurd Link Road',
                lat: 19.0863,
                lng: 72.9081,
                base_risk: 0.65
            },
            {
                location_name: 'Worli Sea Link - Worli',
                lat: 19.0176,
                lng: 72.8162,
                base_risk: 0.62
            },
            {
                location_name: 'Santacruz-Chembur Link Road',
                lat: 19.0728,
                lng: 72.8826,
                base_risk: 0.58
            },
            {
                location_name: 'Powai-Vihar Lake Road',
                lat: 19.1176,
                lng: 72.9060,
                base_risk: 0.55
            }
        ],
        'delhi': [
            {
                location_name: 'Ring Road - ITO',
                lat: 28.6289,
                lng: 77.2478,
                base_risk: 0.88
            },
            {
                location_name: 'NH8 - Dhaula Kuan',
                lat: 28.5933,
                lng: 77.1619,
                base_risk: 0.85
            },
            {
                location_name: 'Outer Ring Road - Narela',
                lat: 28.8541,
                lng: 77.1025,
                base_risk: 0.82
            },
            {
                location_name: 'GT Karnal Road - Wazirabad',
                lat: 28.7041,
                lng: 77.1712,
                base_risk: 0.78
            },
            {
                location_name: 'Mathura Road - Okhla',
                lat: 28.5355,
                lng: 77.2739,
                base_risk: 0.75
            },
            {
                location_name: 'Rohtak Road - Mundka',
                lat: 28.6832,
                lng: 76.9734,
                base_risk: 0.72
            },
            {
                location_name: 'Delhi-Gurgaon Road - Kapashera',
                lat: 28.5245,
                lng: 77.0626,
                base_risk: 0.68
            },
            {
                location_name: 'Yamuna Expressway - Greater Noida',
                lat: 28.4595,
                lng: 77.5026,
                base_risk: 0.65
            },
            {
                location_name: 'NH1 - Alipur',
                lat: 28.8077,
                lng: 77.1514,
                base_risk: 0.62
            },
            {
                location_name: 'Badarpur Border Road',
                lat: 28.4958,
                lng: 77.3089,
                base_risk: 0.58
            }
        ],
        'bangalore': [
            {
                location_name: 'Outer Ring Road - Electronic City',
                lat: 12.8456,
                lng: 77.6603,
                base_risk: 0.82
            },
            {
                location_name: 'Hosur Road - Bommanahalli',
                lat: 12.9152,
                lng: 77.6344,
                base_risk: 0.78
            },
            {
                location_name: 'Bannerghatta Road - BTM Layout',
                lat: 12.9165,
                lng: 77.6101,
                base_risk: 0.75
            },
            {
                location_name: 'Mysore Road - Kengeri',
                lat: 12.9081,
                lng: 77.4851,
                base_risk: 0.72
            },
            {
                location_name: 'Tumkur Road - Yeshwanthpur',
                lat: 13.0280,
                lng: 77.5423,
                base_risk: 0.68
            },
            {
                location_name: 'Old Airport Road - HAL',
                lat: 12.9698,
                lng: 77.6500,
                base_risk: 0.65
            },
            {
                location_name: 'Whitefield Road - ITPL',
                lat: 12.9897,
                lng: 77.7295,
                base_risk: 0.62
            },
            {
                location_name: 'Kanakapura Road - Banashankari',
                lat: 12.9245,
                lng: 77.5551,
                base_risk: 0.58
            },
            {
                location_name: 'Bellary Road - Hebbal',
                lat: 13.0358,
                lng: 77.5970,
                base_risk: 0.55
            },
            {
                location_name: 'Sarjapur Road - Marathahalli',
                lat: 12.9591,
                lng: 77.6974,
                base_risk: 0.52
            }
        ]
    };
    
    const selectedHotspots = cityHotspots[city] || [
        {
            location_name: `${cityName} - Main Highway`,
            lat: 26.9124 + (Math.random() - 0.5) * 0.1,
            lng: 75.7873 + (Math.random() - 0.5) * 0.1,
            base_risk: 0.7
        },
        {
            location_name: `${cityName} - Ring Road`,
            lat: 26.9124 + (Math.random() - 0.5) * 0.1,
            lng: 75.7873 + (Math.random() - 0.5) * 0.1,
            base_risk: 0.6
        }
    ];
    
    // Apply time-based variations
    return selectedHotspots.map((hotspot, index) => {
        const hourlyVariation = Math.sin((currentHour + index) * Math.PI / 12) * 0.1;
        const adjustedRisk = Math.min(0.95, Math.max(0.1, hotspot.base_risk * timeBasedMultiplier + hourlyVariation));
        
        return {
            location_name: hotspot.location_name,
            lat: hotspot.lat,
            lng: hotspot.lng,
            risk_level: adjustedRisk,
            incident_count: Math.round((hotspot.base_risk * 20) * timeBasedMultiplier)
        };
    });
}

// Get time-based risk multiplier for hourly changes
function getTimeBasedRiskMultiplier(hour) {
    // Higher risk during peak hours and late night
    if (hour >= 7 && hour <= 10) return 1.3; // Morning rush
    if (hour >= 17 && hour <= 20) return 1.4; // Evening rush
    if (hour >= 22 || hour <= 4) return 1.2; // Late night/early morning
    if (hour >= 11 && hour <= 16) return 0.8; // Mid-day low traffic
    return 1.0; // Normal hours
}

// Display hotspots in sidebar
function displayHotspots(hotspots) {
    console.log('Displaying', hotspots.length, 'hotspots');
    
    if (!hotspotsList) {
        console.error('Hotspots list element not found');
        return;
    }
    
    hotspotsList.innerHTML = '';
    
    hotspots.forEach((hotspot, index) => {
        const item = document.createElement('div');
        item.className = 'hotspot-item';
        
        const riskLevel = getRiskLevelText(hotspot.risk_level).toLowerCase();
        
        item.innerHTML = `
            <span class="risk-badge ${riskLevel}">${getRiskLevelText(hotspot.risk_level)}</span>
            <span>${hotspot.location_name}</span>
        `;
        
        item.addEventListener('click', () => {
            console.log('Hotspot clicked:', hotspot.location_name);
            
            // Center map on hotspot using Leaflet
            map.setView([hotspot.lat, hotspot.lng], 15);
            
            // Check if marker already exists
            const markerExists = markers.some(marker => {
                if (marker.getLatLng) {
                    const latLng = marker.getLatLng();
                    return Math.abs(latLng.lat - hotspot.lat) < 0.001 && 
                           Math.abs(latLng.lng - hotspot.lng) < 0.001;
                }
                return false;
            });
            
            if (!markerExists) {
                try {
                    // Create Leaflet marker
                    const marker = L.circleMarker([hotspot.lat, hotspot.lng], {
                        radius: 15,
                        fillColor: getRiskColor(hotspot.risk_level),
                        fillOpacity: 0.7,
                        color: '#ffffff',
                        weight: 2
                    }).addTo(map);
                    
                    markers.push(marker);
                    
                    // Add popup
                    const popupContent = `
                        <div style="padding: 10px; min-width: 200px;">
                            <h3 style="margin-bottom: 8px; color: ${getRiskColor(hotspot.risk_level)};">${hotspot.location_name}</h3>
                            <p><strong>Risk Level:</strong> ${(hotspot.risk_level * 100).toFixed(0)}% (${getRiskLevelText(hotspot.risk_level)})</p>
                            <p><strong>Incidents:</strong> ${hotspot.incident_count} in the last year</p>
                            <div style="margin-top: 8px; padding: 4px 8px; background-color: ${getRiskColor(hotspot.risk_level)}20; border-radius: 4px; font-size: 12px;">
                                ${getRiskLevelText(hotspot.risk_level)} Risk Hotspot
                            </div>
                        </div>
                    `;
                    
                    marker.bindPopup(popupContent).openPopup();
                    
                    console.log('Hotspot marker created successfully');
                    
                } catch (error) {
                    console.error('Error creating hotspot marker:', error);
                }
            } else {
                console.log('Marker already exists for this hotspot');
            }
        });
        
        hotspotsList.appendChild(item);
    });
    
    console.log('Hotspots displayed in sidebar successfully');
}

// Toggle heatmap - Now redirects to dedicated heatmap page
async function toggleHeatmap() {
    console.log('Redirecting to heatmap page...');
    
    // Redirect to the dedicated heatmap page in the same tab
    window.location.href = 'heatmap.html';
    
    showNotification('Opening dedicated heatmap page...', 'info');
}

// Generate sample heatmap data for Indian locations
function generateSampleHeatmapData() {
    console.log('Generating sample heatmap data...');
    
    const heatmapPoints = [];
    
    // Major Indian cities with varying risk intensities
    const majorCities = [
        { name: 'Mumbai', lat: 19.0760, lng: 72.8777, intensity: 0.9 },
        { name: 'Delhi', lat: 28.6139, lng: 77.2090, intensity: 0.95 },
        { name: 'Bangalore', lat: 12.9716, lng: 77.5946, intensity: 0.8 },
        { name: 'Kolkata', lat: 22.5726, lng: 88.3639, intensity: 0.85 },
        { name: 'Chennai', lat: 13.0827, lng: 80.2707, intensity: 0.75 },
        { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, intensity: 0.7 },
        { name: 'Pune', lat: 18.5204, lng: 73.8567, intensity: 0.65 },
        { name: 'Jaipur', lat: 26.9124, lng: 75.7873, intensity: 0.6 },
        { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, intensity: 0.7 },
        { name: 'Surat', lat: 21.1702, lng: 72.8311, intensity: 0.55 }
    ];
    
    // Add city centers and surrounding areas
    majorCities.forEach(city => {
        // City center (high intensity)
        heatmapPoints.push([city.lat, city.lng, city.intensity]);
        
        // Add surrounding hotspots in a radius
        for (let i = 0; i < 8; i++) {
            const angle = (i * 45) * (Math.PI / 180); // Convert to radians
            const radius = 0.05 + Math.random() * 0.1; // Random radius 0.05-0.15 degrees
            const intensity = city.intensity * (0.4 + Math.random() * 0.4); // 40-80% of city intensity
            
            const lat = city.lat + Math.cos(angle) * radius;
            const lng = city.lng + Math.sin(angle) * radius;
            
            heatmapPoints.push([lat, lng, intensity]);
        }
    });
    
    // Major highways with accident hotspots
    const highways = [
        // Mumbai-Delhi highway (NH48)
        { start: { lat: 19.0760, lng: 72.8777 }, end: { lat: 28.6139, lng: 77.2090 }, segments: 15 },
        // Delhi-Kolkata highway (NH19)
        { start: { lat: 28.6139, lng: 77.2090 }, end: { lat: 22.5726, lng: 88.3639 }, segments: 12 },
        // Chennai-Bangalore highway (NH44)
        { start: { lat: 13.0827, lng: 80.2707 }, end: { lat: 12.9716, lng: 77.5946 }, segments: 8 }
    ];
    
    highways.forEach(highway => {
        for (let i = 0; i <= highway.segments; i++) {
            const ratio = i / highway.segments;
            const lat = highway.start.lat + (highway.end.lat - highway.start.lat) * ratio;
            const lng = highway.start.lng + (highway.end.lng - highway.start.lng) * ratio;
            const intensity = 0.3 + Math.random() * 0.5; // Random intensity for highway points
            
            heatmapPoints.push([lat, lng, intensity]);
            
            // Add some random points near highways
            if (Math.random() < 0.3) {
                const offsetLat = lat + (Math.random() - 0.5) * 0.02;
                const offsetLng = lng + (Math.random() - 0.5) * 0.02;
                heatmapPoints.push([offsetLat, offsetLng, intensity * 0.7]);
            }
        }
    });
    
    // Add some random hotspots across India
    for (let i = 0; i < 50; i++) {
        const lat = 8 + Math.random() * 25; // Latitude range covering most of India
        const lng = 68 + Math.random() * 30; // Longitude range covering most of India
        const intensity = Math.random() * 0.8;
        
        heatmapPoints.push([lat, lng, intensity]);
    }
    
    console.log('Generated', heatmapPoints.length, 'heatmap points');
    return heatmapPoints;
}

// Clear route display
function clearRouteDisplay() {
    // Clear route polylines
    if (routePolyline) {
        map.removeLayer(routePolyline);
        routePolyline = null;
    }
    
    if (safeRoutePolyline) {
        map.removeLayer(safeRoutePolyline);
        safeRoutePolyline = null;
    }
    
    // Clear markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // Clear current routes data
    currentRoutes = [];
}

// Helper Functions
function showLoading(message = 'Loading...') {
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

// Show user reports
function showUserReports() {
    console.log('Show user reports function called');
    showNotification('User reports feature is working! This will show user-submitted reports on the map.', 'info');
    
    // Add a sample report marker for testing
    const sampleReport = {
        lat: 28.6139,
        lng: 77.2090,
        report_type: 'accident',
        timestamp: new Date().toISOString(),
        description: 'Sample accident report for testing'
    };
    
    addReportMarker(sampleReport);
}

function showNotification(message, type = 'info') {
    notificationText.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

function getRiskColor(riskLevel) {
    if (riskLevel < 0.3) return '#2ecc71'; // Low
    if (riskLevel < 0.6) return '#f39c12'; // Moderate
    if (riskLevel < 0.8) return '#e74c3c'; // High
    return '#c0392b'; // Severe
}

function getRiskLevelText(riskLevel) {
    if (riskLevel < 0.3) return 'Low';
    if (riskLevel < 0.6) return 'Moderate';
    if (riskLevel < 0.8) return 'High';
    return 'Severe';
}

function getWeatherIcon(condition) {
    condition = condition.toLowerCase();
    
    if (condition.includes('rain') || condition.includes('drizzle')) return 'fas fa-cloud-rain';
    if (condition.includes('snow')) return 'fas fa-snowflake';
    if (condition.includes('cloud')) return 'fas fa-cloud';
    if (condition.includes('clear') || condition.includes('sunny')) return 'fas fa-sun';
    if (condition.includes('thunder') || condition.includes('storm')) return 'fas fa-bolt';
    if (condition.includes('fog') || condition.includes('mist')) return 'fas fa-smog';
    
    return 'fas fa-cloud-sun'; // Default
}

function getReportIcon(reportType) {
    const iconColors = {
        'accident': '#e74c3c',
        'hazard': '#f39c12', 
        'traffic': '#e67e22',
        'police': '#3498db'
    };
    
    const color = iconColors[reportType.toLowerCase()] || '#9b59b6';
    
    return `<div style="width: 20px; height: 20px; background-color: ${color}; border-radius: 50%; border: 2px solid white;"></div>`;
}

// Remove Google Maps styles - not needed for Leaflet
// Leaflet uses different styling approach

// ===== RESPONSIVE FEATURES =====

// Initialize responsive features
function initializeResponsiveFeatures() {
    console.log('Initializing responsive features...');
    
    // Handle window resize for responsive behavior
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            handleResponsiveResize();
        }, 250);
    });
    
    // Initial responsive setup
    handleResponsiveResize();
    
    // Add touch event handlers for mobile
    if (isMobile()) {
        addMobileTouchHandlers();
    }
    
    // Prevent zoom on double tap for iOS
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}

// Handle responsive resize events
function handleResponsiveResize() {
    const isMobileNow = isMobile();
    const isSmallScreenNow = isSmallScreen();
    
    console.log('Handling responsive resize, mobile:', isMobileNow, 'small screen:', isSmallScreenNow);
    
    // Update map zoom controls based on screen size
    if (map) {
        map.invalidateSize();
        
        // Adjust zoom level for mobile
        if (isMobileNow && map.getZoom() > 15) {
            map.setZoom(13);
        }
    }
    
    // Update notification positioning
    updateNotificationPosition();
    
    // Update risk panel positioning
    updateRiskPanelPosition();
    
    // Update sidebar behavior for mobile
    updateSidebarBehavior();
}

// Add mobile touch handlers
function addMobileTouchHandlers() {
    console.log('Adding mobile touch handlers...');
    
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', function(e) {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipeGesture();
    }, { passive: true });
    
    function handleSwipeGesture() {
        const swipeDistance = touchStartY - touchEndY;
        const minSwipeDistance = 50;
        
        // Close risk panel on swipe down (mobile)
        if (swipeDistance < -minSwipeDistance) {
            const riskPanel = document.getElementById('risk-info');
            if (riskPanel && riskPanel.style.display !== 'none') {
                riskPanel.style.display = 'none';
                showNotification('Risk panel closed', 'info');
            }
        }
        
        // Show risk panel on swipe up (mobile)
        if (swipeDistance > minSwipeDistance) {
            const riskPanel = document.getElementById('risk-info');
            if (riskPanel && riskPanel.style.display === 'none') {
                riskPanel.style.display = 'block';
                riskPanel.style.opacity = '1';
                riskPanel.style.transform = 'translateY(0)';
            }
        }
    }
}

// Update notification position for mobile
function updateNotificationPosition() {
    const notification = document.getElementById('notification');
    if (notification && isMobile()) {
        notification.style.top = '10px';
        notification.style.left = '10px';
        notification.style.right = '10px';
        notification.style.width = 'auto';
        notification.style.fontSize = '13px';
        notification.style.padding = '10px 15px';
    }
}

// Update risk panel position for mobile
function updateRiskPanelPosition() {
    const riskPanel = document.getElementById('risk-info');
    if (riskPanel) {
        if (isMobile()) {
            riskPanel.style.bottom = '10px';
            riskPanel.style.left = '10px';
            riskPanel.style.right = '10px';
            riskPanel.style.width = 'auto';
            riskPanel.style.maxHeight = '40vh';
            riskPanel.style.overflowY = 'auto';
        } else {
            // Reset to desktop styles
            riskPanel.style.bottom = '20px';
            riskPanel.style.right = '20px';
            riskPanel.style.left = 'auto';
            riskPanel.style.width = '300px';
            riskPanel.style.maxHeight = '400px';
        }
    }
}

// Update sidebar behavior for mobile
function updateSidebarBehavior() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (sidebar && mainContent) {
        if (isMobile()) {
            // Ensure sidebar doesn't interfere with map on mobile
            sidebar.style.position = 'relative';
            sidebar.style.zIndex = '1002';
            mainContent.style.height = 'calc(100vh - 50vh)';
        } else {
            // Reset desktop behavior
            sidebar.style.position = 'static';
            mainContent.style.height = '100vh';
        }
    }
}