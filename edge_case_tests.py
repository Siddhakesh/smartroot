#!/usr/bin/env python3
"""
Edge Case and Error Handling Tests for AgriBot API
"""

import requests
import json
from datetime import datetime

BASE_URL = "https://crophelper-3.preview.emergentagent.com/api"

def test_invalid_login():
    """Test login with invalid credentials"""
    url = f"{BASE_URL}/auth/login"
    payload = {
        "email": "nonexistent@test.com",
        "password": "wrongpassword"
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        if response.status_code == 401:
            print("✅ Invalid login correctly returns 401")
            return True
        else:
            print(f"❌ Invalid login returned {response.status_code}, expected 401")
            return False
    except Exception as e:
        print(f"❌ Exception during invalid login test: {e}")
        return False

def test_invalid_signup():
    """Test signup with invalid data"""
    url = f"{BASE_URL}/auth/signup"
    
    # Test with invalid email
    payload = {
        "name": "Test User",
        "email": "invalid-email",
        "password": "password123"
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        if response.status_code == 422:  # Validation error
            print("✅ Invalid email correctly returns validation error")
            return True
        else:
            print(f"❌ Invalid email returned {response.status_code}, expected 422")
            return False
    except Exception as e:
        print(f"❌ Exception during invalid signup test: {e}")
        return False

def test_weather_with_invalid_city():
    """Test weather endpoint with potentially invalid city"""
    # First get a valid token
    login_url = f"{BASE_URL}/auth/login"
    login_payload = {
        "email": "farmer.john@agribot.com",
        "password": "SecurePass123!"
    }
    
    try:
        login_response = requests.post(login_url, json=login_payload, timeout=10)
        if login_response.status_code != 200:
            print("❌ Could not login for weather test")
            return False
            
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test with unusual city name
        weather_url = f"{BASE_URL}/agribot/weather?city=NonExistentCity12345"
        response = requests.get(weather_url, headers=headers, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            if "forecast" in data:
                print("✅ Weather API handles invalid city gracefully (returns mock data)")
                return True
            else:
                print("❌ Weather API response missing forecast data")
                return False
        else:
            print(f"❌ Weather API returned {response.status_code} for invalid city")
            return False
            
    except Exception as e:
        print(f"❌ Exception during weather test: {e}")
        return False

def test_chat_with_empty_question():
    """Test chat endpoint with empty question"""
    # First get a valid token
    login_url = f"{BASE_URL}/auth/login"
    login_payload = {
        "email": "farmer.john@agribot.com",
        "password": "SecurePass123!"
    }
    
    try:
        login_response = requests.post(login_url, json=login_payload, timeout=10)
        if login_response.status_code != 200:
            print("❌ Could not login for chat test")
            return False
            
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test with empty question
        chat_url = f"{BASE_URL}/agribot/chat"
        payload = {
            "question": "",
            "crop": "rice"
        }
        
        response = requests.post(chat_url, json=payload, headers=headers, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            if "response" in data:
                print("✅ Chat API handles empty question gracefully")
                return True
            else:
                print("❌ Chat API response missing response field")
                return False
        else:
            print(f"❌ Chat API returned {response.status_code} for empty question")
            return False
            
    except Exception as e:
        print(f"❌ Exception during chat test: {e}")
        return False

def test_market_recommendations_various_crops():
    """Test market recommendations with different crops"""
    # First get a valid token
    login_url = f"{BASE_URL}/auth/login"
    login_payload = {
        "email": "farmer.john@agribot.com",
        "password": "SecurePass123!"
    }
    
    try:
        login_response = requests.post(login_url, json=login_payload, timeout=10)
        if login_response.status_code != 200:
            print("❌ Could not login for market test")
            return False
            
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test with different crops
        crops = ["wheat", "maize", "cotton", "banana"]
        success_count = 0
        
        for crop in crops:
            market_url = f"{BASE_URL}/agribot/market-recommendations?crop={crop}"
            response = requests.get(market_url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "markets" in data and len(data["markets"]) > 0:
                    success_count += 1
                    print(f"✅ Market data retrieved for {crop}")
                else:
                    print(f"❌ No market data for {crop}")
            else:
                print(f"❌ Market API failed for {crop}: {response.status_code}")
        
        if success_count == len(crops):
            print("✅ All crop market recommendations working")
            return True
        else:
            print(f"❌ Only {success_count}/{len(crops)} crop market tests passed")
            return False
            
    except Exception as e:
        print(f"❌ Exception during market test: {e}")
        return False

def run_edge_case_tests():
    """Run all edge case tests"""
    print("🧪 Running Edge Case and Error Handling Tests")
    print("=" * 50)
    
    tests = [
        ("Invalid Login Credentials", test_invalid_login),
        ("Invalid Signup Data", test_invalid_signup),
        ("Weather with Invalid City", test_weather_with_invalid_city),
        ("Chat with Empty Question", test_chat_with_empty_question),
        ("Market Recommendations for Various Crops", test_market_recommendations_various_crops)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Testing: {test_name}")
        if test_func():
            passed += 1
    
    print("\n" + "=" * 50)
    print(f"📊 Edge Case Test Summary: {passed}/{total} passed ({(passed/total)*100:.1f}%)")
    print("=" * 50)

if __name__ == "__main__":
    run_edge_case_tests()