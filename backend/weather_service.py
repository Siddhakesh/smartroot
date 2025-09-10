import os
import requests
import json
from datetime import datetime
from typing import List, Dict, Optional

class WeatherService:
    def __init__(self):
        self.api_key = os.environ.get('WEATHER_API_KEY')
        self.base_url = "http://api.openweathermap.org/data/2.5"
    
    def get_weather_forecast(self, city: str = "Delhi") -> List[Dict]:
        """Get 5-day weather forecast for a city"""
        if not self.api_key:
            return self._get_mock_forecast()
            
        try:
            url = f"{self.base_url}/forecast?q={city}&appid={self.api_key}&units=metric"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            daily_forecasts = {}
            for forecast in data['list']:
                date = datetime.fromtimestamp(forecast['dt']).date()
                if date not in daily_forecasts:
                    daily_forecasts[date] = forecast
            
            processed_data = []
            for date, forecast in sorted(daily_forecasts.items())[:5]:
                processed_data.append({
                    "day": date.strftime("%A"),
                    "date": date.strftime("%Y-%m-%d"),
                    "temp": round(forecast['main']['temp'], 1),
                    "humidity": forecast['main']['humidity'],
                    "description": forecast['weather'][0]['description'].title(),
                    "icon": forecast['weather'][0]['icon']
                })
            return processed_data
            
        except requests.exceptions.HTTPError as http_err:
            if response.status_code == 401:
                print("Error: Invalid Weather API Key.")
            print(f"HTTP error occurred: {http_err}")
            return self._get_mock_forecast()
        except Exception as e:
            print(f"Error fetching weather: {e}")
            return self._get_mock_forecast()
    
    def _get_mock_forecast(self) -> List[Dict]:
        """Return mock weather data when API is unavailable"""
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        temps = [28.5, 26.2, 24.8, 29.1, 31.0]
        descriptions = ["Sunny", "Partly Cloudy", "Light Rain", "Sunny", "Hot"]
        
        mock_data = []
        for i, day in enumerate(days):
            mock_data.append({
                "day": day,
                "date": f"2024-01-{15+i:02d}",
                "temp": temps[i],
                "humidity": 65 + i * 5,
                "description": descriptions[i],
                "icon": "01d"
            })
        return mock_data

weather_service = WeatherService()