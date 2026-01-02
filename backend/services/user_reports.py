"""
Service for storing and retrieving user-reported risk inputs.
"""
import os
import json
import time
import sys

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import DATA_DIR

class UserReportService:
    def __init__(self):
        self.reports_file = os.path.join(DATA_DIR, 'user_reports.json')
        self.reports = self._load_reports()
    
    def _load_reports(self):
        """Load user reports from file."""
        if os.path.exists(self.reports_file):
            try:
                with open(self.reports_file, 'r') as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError):
                return []
        else:
            return []
    
    def _save_reports(self):
        """Save user reports to file."""
        os.makedirs(os.path.dirname(self.reports_file), exist_ok=True)
        with open(self.reports_file, 'w') as f:
            json.dump(self.reports, f)
    
    def add_report(self, report):
        """
        Add a new user report.
        
        Args:
            report (dict): User report with location, risk_level, and description
            
        Returns:
            dict: Added report with ID
        """
        # Add timestamp and ID
        report['timestamp'] = int(time.time())
        report['id'] = str(len(self.reports) + 1)
        
        # Add to reports
        self.reports.append(report)
        self._save_reports()
        
        return report
    
    def get_reports(self, limit=100, offset=0):
        """
        Get user reports.
        
        Args:
            limit (int, optional): Maximum number of reports to return. Defaults to 100.
            offset (int, optional): Offset for pagination. Defaults to 0.
            
        Returns:
            list: User reports
        """
        return self.reports[offset:offset+limit]
    
    def get_reports_near_location(self, location, radius_km=5):
        """
        Get user reports near a location.
        
        Args:
            location (dict): Location with lat and lon
            radius_km (float, optional): Radius in kilometers. Defaults to 5.
            
        Returns:
            list: User reports near the location
        """
        from geopy.distance import geodesic
        
        nearby_reports = []
        
        for report in self.reports:
            report_location = (report['location']['lat'], report['location']['lon'])
            user_location = (location['lat'], location['lon'])
            
            distance = geodesic(report_location, user_location).kilometers
            
            if distance <= radius_km:
                report_copy = report.copy()
                report_copy['distance_km'] = round(distance, 2)
                nearby_reports.append(report_copy)
        
        # Sort by distance
        nearby_reports.sort(key=lambda x: x['distance_km'])
        
        return nearby_reports

# Singleton instance
user_report_service = UserReportService()