#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for AgriBot Web Application
Tests all authentication and AgriBot endpoints with realistic data
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, Optional

# Configuration
BASE_URL = "https://black-modern-app.preview.emergentagent.com/api"
TEST_USER_EMAIL = "farmer.john@agribot.com"
TEST_USER_PASSWORD = "SecurePass123!"
TEST_USER_NAME = "John Farmer"

class AgribotAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.auth_token = None
        self.test_results = []
        self.session = requests.Session()
        
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Dict = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        
    def test_auth_signup(self) -> bool:
        """Test user registration endpoint"""
        url = f"{self.base_url}/auth/signup"
        payload = {
            "name": TEST_USER_NAME,
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        }
        
        try:
            response = self.session.post(url, json=payload, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "user" in data:
                    self.auth_token = data["access_token"]
                    self.log_test("User Signup", True, f"User created successfully with token", data)
                    return True
                else:
                    self.log_test("User Signup", False, "Missing token or user in response", data)
                    return False
            elif response.status_code == 400:
                # User might already exist, try login instead
                self.log_test("User Signup", True, "User already exists (expected)", response.json())
                return self.test_auth_login()
            else:
                self.log_test("User Signup", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("User Signup", False, f"Exception: {str(e)}")
            return False
    
    def test_auth_login(self) -> bool:
        """Test user login endpoint"""
        url = f"{self.base_url}/auth/login"
        payload = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        }
        
        try:
            response = self.session.post(url, json=payload, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "user" in data:
                    self.auth_token = data["access_token"]
                    self.log_test("User Login", True, f"Login successful with token", data)
                    return True
                else:
                    self.log_test("User Login", False, "Missing token or user in response", data)
                    return False
            else:
                self.log_test("User Login", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("User Login", False, f"Exception: {str(e)}")
            return False
    
    def test_auth_me(self) -> bool:
        """Test get current user info endpoint"""
        if not self.auth_token:
            self.log_test("Get Current User", False, "No auth token available")
            return False
            
        url = f"{self.base_url}/auth/me"
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            response = self.session.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "email" in data and data["email"] == TEST_USER_EMAIL:
                    self.log_test("Get Current User", True, f"User info retrieved successfully", data)
                    return True
                else:
                    self.log_test("Get Current User", False, "Invalid user data returned", data)
                    return False
            else:
                self.log_test("Get Current User", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Get Current User", False, f"Exception: {str(e)}")
            return False
    
    def test_sensor_data(self) -> bool:
        """Test sensor data endpoint"""
        if not self.auth_token:
            self.log_test("Sensor Data", False, "No auth token available")
            return False
            
        url = f"{self.base_url}/agribot/sensor-data"
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            response = self.session.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["sensor_data", "recommended_crop", "timestamp"]
                sensor_fields = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
                
                if all(field in data for field in required_fields):
                    sensor_data = data["sensor_data"]
                    if all(field in sensor_data for field in sensor_fields):
                        self.log_test("Sensor Data", True, f"Sensor data retrieved with crop: {data['recommended_crop']}", data)
                        return True
                    else:
                        self.log_test("Sensor Data", False, "Missing sensor data fields", data)
                        return False
                else:
                    self.log_test("Sensor Data", False, "Missing required response fields", data)
                    return False
            else:
                self.log_test("Sensor Data", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Sensor Data", False, f"Exception: {str(e)}")
            return False
    
    def test_refresh_data(self) -> bool:
        """Test refresh sensor data endpoint"""
        if not self.auth_token:
            self.log_test("Refresh Data", False, "No auth token available")
            return False
            
        url = f"{self.base_url}/agribot/refresh-data"
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            response = self.session.post(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["sensor_data", "recommended_crop", "timestamp"]
                
                if all(field in data for field in required_fields):
                    self.log_test("Refresh Data", True, f"Data refreshed with crop: {data['recommended_crop']}", data)
                    return True
                else:
                    self.log_test("Refresh Data", False, "Missing required response fields", data)
                    return False
            else:
                self.log_test("Refresh Data", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Refresh Data", False, f"Exception: {str(e)}")
            return False
    
    def test_weather_forecast(self) -> bool:
        """Test weather forecast endpoint"""
        if not self.auth_token:
            self.log_test("Weather Forecast", False, "No auth token available")
            return False
            
        url = f"{self.base_url}/agribot/weather?city=Delhi"
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            response = self.session.get(url, headers=headers, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if "forecast" in data and "city" in data:
                    forecast = data["forecast"]
                    if isinstance(forecast, list) and len(forecast) > 0:
                        # Check if forecast has required fields
                        first_day = forecast[0]
                        required_fields = ["day", "temp", "humidity", "description"]
                        if all(field in first_day for field in required_fields):
                            self.log_test("Weather Forecast", True, f"Weather forecast retrieved for {data['city']}", data)
                            return True
                        else:
                            self.log_test("Weather Forecast", False, "Missing forecast fields", data)
                            return False
                    else:
                        self.log_test("Weather Forecast", False, "Empty or invalid forecast data", data)
                        return False
                else:
                    self.log_test("Weather Forecast", False, "Missing forecast or city in response", data)
                    return False
            else:
                self.log_test("Weather Forecast", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Weather Forecast", False, f"Exception: {str(e)}")
            return False
    
    def test_weather_recommendations(self) -> bool:
        """Test weather recommendations endpoint"""
        if not self.auth_token:
            self.log_test("Weather Recommendations", False, "No auth token available")
            return False
            
        url = f"{self.base_url}/agribot/weather-recommendations"
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Sample forecast data
        payload = {
            "forecast": [
                {"day": "Monday", "temp": 28.5, "humidity": 65, "description": "Sunny"},
                {"day": "Tuesday", "temp": 26.2, "humidity": 70, "description": "Partly Cloudy"}
            ],
            "crop": "rice"
        }
        
        try:
            response = self.session.post(url, json=payload, headers=headers, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if "recommendations" in data and isinstance(data["recommendations"], str):
                    self.log_test("Weather Recommendations", True, f"AI recommendations received", data)
                    return True
                else:
                    self.log_test("Weather Recommendations", False, "Missing or invalid recommendations", data)
                    return False
            else:
                self.log_test("Weather Recommendations", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Weather Recommendations", False, f"Exception: {str(e)}")
            return False
    
    def test_chat(self) -> bool:
        """Test chat with AgriBot endpoint"""
        if not self.auth_token:
            self.log_test("AgriBot Chat", False, "No auth token available")
            return False
            
        url = f"{self.base_url}/agribot/chat"
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        payload = {
            "question": "What fertilizer should I use for my rice crop?",
            "crop": "rice",
            "sensor_data": {
                "N": 85, "P": 42, "K": 38, "temperature": 28.5,
                "humidity": 75, "ph": 6.8, "rainfall": 180
            }
        }
        
        try:
            response = self.session.post(url, json=payload, headers=headers, timeout=20)
            
            if response.status_code == 200:
                data = response.json()
                if "response" in data and isinstance(data["response"], str) and len(data["response"]) > 10:
                    self.log_test("AgriBot Chat", True, f"AI response received", data)
                    return True
                else:
                    self.log_test("AgriBot Chat", False, "Missing or invalid AI response", data)
                    return False
            else:
                self.log_test("AgriBot Chat", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("AgriBot Chat", False, f"Exception: {str(e)}")
            return False
    
    def test_yield_prediction(self) -> bool:
        """Test yield prediction endpoint"""
        if not self.auth_token:
            self.log_test("Yield Prediction", False, "No auth token available")
            return False
            
        url = f"{self.base_url}/agribot/yield-prediction"
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            response = self.session.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["farm_data", "predicted_yield", "timestamp"]
                
                if all(field in data for field in required_fields):
                    if isinstance(data["predicted_yield"], (int, float)) and data["predicted_yield"] > 0:
                        self.log_test("Yield Prediction", True, f"Yield prediction: {data['predicted_yield']} tons", data)
                        return True
                    else:
                        self.log_test("Yield Prediction", False, "Invalid yield prediction value", data)
                        return False
                else:
                    self.log_test("Yield Prediction", False, "Missing required response fields", data)
                    return False
            else:
                self.log_test("Yield Prediction", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Yield Prediction", False, f"Exception: {str(e)}")
            return False
    
    def test_market_recommendations(self) -> bool:
        """Test market recommendations endpoint"""
        if not self.auth_token:
            self.log_test("Market Recommendations", False, "No auth token available")
            return False
            
        url = f"{self.base_url}/agribot/market-recommendations?crop=rice"
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            response = self.session.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["crop", "markets", "timestamp"]
                
                if all(field in data for field in required_fields):
                    markets = data["markets"]
                    if isinstance(markets, list) and len(markets) > 0:
                        # Check market data structure
                        first_market = markets[0]
                        market_fields = ["Market", "AvgPrice", "Score"]
                        if all(field in first_market for field in market_fields):
                            self.log_test("Market Recommendations", True, f"Market data for {data['crop']}: {len(markets)} markets", data)
                            return True
                        else:
                            self.log_test("Market Recommendations", False, "Missing market data fields", data)
                            return False
                    else:
                        self.log_test("Market Recommendations", False, "Empty or invalid markets data", data)
                        return False
                else:
                    self.log_test("Market Recommendations", False, "Missing required response fields", data)
                    return False
            else:
                self.log_test("Market Recommendations", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Market Recommendations", False, f"Exception: {str(e)}")
            return False
    
    def test_unauthorized_access(self) -> bool:
        """Test that protected endpoints require authentication"""
        url = f"{self.base_url}/agribot/sensor-data"
        
        try:
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 401:
                self.log_test("Unauthorized Access Protection", True, "Protected endpoint correctly requires authentication")
                return True
            else:
                self.log_test("Unauthorized Access Protection", False, f"Expected 401, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Unauthorized Access Protection", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting AgriBot Backend API Tests")
        print("=" * 50)
        
        # Test authentication flow
        print("\n📋 AUTHENTICATION TESTS")
        print("-" * 30)
        self.test_unauthorized_access()
        auth_success = self.test_auth_signup()
        if not auth_success:
            auth_success = self.test_auth_login()
        
        if auth_success:
            self.test_auth_me()
        
        # Test AgriBot endpoints (only if authenticated)
        if self.auth_token:
            print("\n🌾 AGRIBOT API TESTS")
            print("-" * 30)
            self.test_sensor_data()
            self.test_refresh_data()
            self.test_weather_forecast()
            self.test_weather_recommendations()
            self.test_chat()
            self.test_yield_prediction()
            self.test_market_recommendations()
        else:
            print("\n❌ Skipping AgriBot tests - Authentication failed")
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  • {result['test']}: {result['details']}")
        
        print("\n" + "=" * 50)

if __name__ == "__main__":
    tester = AgribotAPITester()
    tester.run_all_tests()