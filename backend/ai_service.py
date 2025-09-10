import os
import requests
import json
from typing import Dict, Optional

class GeminiAIService:
    def __init__(self):
        self.api_key = os.environ.get('GEMINI_API_KEY')
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"
    
    def ask_agribot(self, question: str, crop: str, sensor_data: Dict) -> str:
        """Ask AgriBot a question about farming based on current conditions"""
        if not self.api_key:
            return self._get_mock_response(question, crop)
            
        prompt = (
            f"You are AgriBot, an expert agricultural assistant. Answer only based on the crop '{crop}' and these current readings:\n"
            f"N: {sensor_data.get('N', 'N/A')}, P: {sensor_data.get('P', 'N/A')}, K: {sensor_data.get('K', 'N/A')},\n"
            f"Temperature: {sensor_data.get('temperature', 'N/A')}°C, Humidity: {sensor_data.get('humidity', 'N/A')}%,\n"
            f"pH: {sensor_data.get('ph', 'N/A')}, Rainfall: {sensor_data.get('rainfall', 'N/A')} mm.\n\n"
            f"User question: {question}\n\n"
            f"Provide practical, actionable advice specific to these conditions and the {crop} crop. Keep your response concise and helpful."
        )
        
        url = f"{self.base_url}/gemini-1.5-flash-latest:generateContent?key={self.api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}]
        }
        
        try:
            response = requests.post(url, headers=headers, data=json.dumps(payload), timeout=30)
            response.raise_for_status()
            data = response.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]
        except requests.exceptions.RequestException as e:
            print(f"Gemini API Error: {e}")
            return self._get_mock_response(question, crop)
        except (KeyError, IndexError) as e:
            print(f"Gemini Response Parse Error: {e}")
            return self._get_mock_response(question, crop)
    
    def get_weather_recommendations(self, forecast_data: list, crop_name: str) -> str:
        """Get AI recommendations based on weather forecast"""
        if not self.api_key or not forecast_data:
            return self._get_mock_weather_recommendations(crop_name)
            
        forecast_string = ""
        for item in forecast_data:
            forecast_string += f"- {item['day']}: {item['temp']}°C, {item['description']}\n"

        prompt = (
            f"You are an expert agronomist named AgriBot. A farmer in India is growing '{crop_name}'. "
            f"Based on the following 5-day weather forecast, provide a short, bulleted list of actionable advice. "
            f"Focus on practical tasks like irrigation scheduling, pest/disease alerts, and field activities. "
            f"Keep the language simple and direct.\n\n"
            f"WEATHER FORECAST:\n{forecast_string}\n"
            f"RECOMMENDATIONS:"
        )
        
        url = f"{self.base_url}/gemini-1.5-flash-latest:generateContent?key={self.api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}]
        }
        
        try:
            response = requests.post(url, headers=headers, data=json.dumps(payload), timeout=30)
            response.raise_for_status()
            data = response.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as e:
            print(f"Gemini Weather Recommendations Error: {e}")
            return self._get_mock_weather_recommendations(crop_name)
    
    def _get_mock_response(self, question: str, crop: str) -> str:
        """Mock response when Gemini API is unavailable"""
        mock_responses = {
            "fertilizer": f"For {crop}, consider applying balanced NPK fertilizer based on your soil test results. Current levels suggest moderate fertilization.",
            "irrigation": f"Based on current humidity and temperature, {crop} needs moderate irrigation. Water early morning or evening to reduce evaporation.",
            "pest": f"Monitor {crop} for common pests during this season. Use integrated pest management practices and organic solutions when possible.",
            "harvest": f"For {crop}, harvest timing depends on visual cues and moisture content. Check with local agricultural extension for specific guidance.",
            "weather": f"Current weather conditions are suitable for {crop}. Monitor temperature and humidity levels for optimal growth."
        }
        
        # Simple keyword matching for mock responses
        question_lower = question.lower()
        for key, response in mock_responses.items():
            if key in question_lower:
                return response
        
        return f"Based on your current conditions, {crop} appears to be in good growing conditions. For specific advice about '{question}', I recommend consulting with local agricultural experts or extension services."
    
    def _get_mock_weather_recommendations(self, crop_name: str) -> str:
        """Mock weather recommendations"""
        return f"""Based on the weather forecast for {crop_name}:

• Monitor soil moisture levels closely
• Adjust irrigation schedule based on expected rainfall
• Prepare for temperature fluctuations
• Watch for pest activity during humid conditions
• Ensure proper drainage to prevent waterlogging
• Consider protective measures if extreme weather is expected"""

# Initialize the AI service
gemini_service = GeminiAIService()