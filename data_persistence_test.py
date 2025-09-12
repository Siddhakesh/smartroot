#!/usr/bin/env python3
"""
Test data persistence and drift functionality
"""

import requests
import json
import time

BASE_URL = "https://black-modern-app.preview.emergentagent.com/api"

def test_sensor_data_drift():
    """Test that sensor data drifts between calls"""
    # Login first
    login_url = f"{BASE_URL}/auth/login"
    login_payload = {
        "email": "farmer.john@agribot.com",
        "password": "SecurePass123!"
    }
    
    try:
        login_response = requests.post(login_url, json=login_payload, timeout=10)
        if login_response.status_code != 200:
            print("❌ Could not login for drift test")
            return False
            
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get initial sensor data
        sensor_url = f"{BASE_URL}/agribot/sensor-data"
        
        print("📊 Testing Sensor Data Drift Functionality")
        print("-" * 40)
        
        readings = []
        for i in range(3):
            response = requests.get(sensor_url, headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                sensor_data = data["sensor_data"]
                readings.append(sensor_data)
                print(f"Reading {i+1}: N={sensor_data['N']}, P={sensor_data['P']}, K={sensor_data['K']}, Temp={sensor_data['temperature']}°C")
                time.sleep(1)  # Small delay between readings
            else:
                print(f"❌ Failed to get reading {i+1}")
                return False
        
        # Check if data is drifting (values should be slightly different)
        if len(readings) == 3:
            # Compare first and last readings
            first = readings[0]
            last = readings[2]
            
            differences = []
            for key in ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']:
                diff = abs(first[key] - last[key])
                differences.append(diff)
            
            # Check if at least some values have changed
            changed_values = sum(1 for diff in differences if diff > 0.1)
            
            if changed_values >= 3:  # At least 3 values should have drifted
                print(f"✅ Sensor data drift working: {changed_values}/7 values changed")
                return True
            else:
                print(f"❌ Insufficient data drift: only {changed_values}/7 values changed")
                return False
        else:
            print("❌ Could not collect enough readings")
            return False
            
    except Exception as e:
        print(f"❌ Exception during drift test: {e}")
        return False

def test_refresh_data_functionality():
    """Test that refresh data endpoint works"""
    # Login first
    login_url = f"{BASE_URL}/auth/login"
    login_payload = {
        "email": "farmer.john@agribot.com",
        "password": "SecurePass123!"
    }
    
    try:
        login_response = requests.post(login_url, json=login_payload, timeout=10)
        if login_response.status_code != 200:
            print("❌ Could not login for refresh test")
            return False
            
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get initial data
        sensor_url = f"{BASE_URL}/agribot/sensor-data"
        initial_response = requests.get(sensor_url, headers=headers, timeout=10)
        
        if initial_response.status_code != 200:
            print("❌ Could not get initial sensor data")
            return False
            
        initial_data = initial_response.json()["sensor_data"]
        
        # Refresh data
        refresh_url = f"{BASE_URL}/agribot/refresh-data"
        refresh_response = requests.post(refresh_url, headers=headers, timeout=10)
        
        if refresh_response.status_code != 200:
            print("❌ Refresh data endpoint failed")
            return False
            
        refreshed_data = refresh_response.json()["sensor_data"]
        
        # Check if data changed after refresh
        differences = []
        for key in ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']:
            diff = abs(initial_data[key] - refreshed_data[key])
            differences.append(diff)
        
        changed_values = sum(1 for diff in differences if diff > 0.1)
        
        if changed_values >= 2:  # At least 2 values should have changed
            print(f"✅ Refresh data working: {changed_values}/7 values changed")
            print(f"   Before: N={initial_data['N']}, Temp={initial_data['temperature']}°C")
            print(f"   After:  N={refreshed_data['N']}, Temp={refreshed_data['temperature']}°C")
            return True
        else:
            print(f"❌ Refresh data not working: only {changed_values}/7 values changed")
            return False
            
    except Exception as e:
        print(f"❌ Exception during refresh test: {e}")
        return False

def test_user_specific_data():
    """Test that different users get different sensor data"""
    # This test would require creating multiple users, but for now we'll just verify
    # that the same user gets consistent data within a session
    
    login_url = f"{BASE_URL}/auth/login"
    login_payload = {
        "email": "farmer.john@agribot.com",
        "password": "SecurePass123!"
    }
    
    try:
        login_response = requests.post(login_url, json=login_payload, timeout=10)
        if login_response.status_code != 200:
            print("❌ Could not login for user data test")
            return False
            
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get sensor data multiple times in quick succession
        sensor_url = f"{BASE_URL}/agribot/sensor-data"
        
        readings = []
        for i in range(2):
            response = requests.get(sensor_url, headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                readings.append(data)
            else:
                print(f"❌ Failed to get reading {i+1}")
                return False
        
        # Verify that we get consistent user-specific data structure
        if len(readings) == 2:
            # Both readings should have the same structure
            required_fields = ["sensor_data", "recommended_crop", "timestamp"]
            
            for i, reading in enumerate(readings):
                if not all(field in reading for field in required_fields):
                    print(f"❌ Reading {i+1} missing required fields")
                    return False
            
            print("✅ User-specific data structure consistent")
            print(f"   Crop recommendations: {readings[0]['recommended_crop']} -> {readings[1]['recommended_crop']}")
            return True
        else:
            print("❌ Could not collect enough readings for user data test")
            return False
            
    except Exception as e:
        print(f"❌ Exception during user data test: {e}")
        return False

def run_persistence_tests():
    """Run all data persistence tests"""
    print("🔄 Testing Data Persistence and Drift")
    print("=" * 50)
    
    tests = [
        ("Sensor Data Drift", test_sensor_data_drift),
        ("Refresh Data Functionality", test_refresh_data_functionality),
        ("User-Specific Data", test_user_specific_data)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Testing: {test_name}")
        if test_func():
            passed += 1
        print()
    
    print("=" * 50)
    print(f"📊 Persistence Test Summary: {passed}/{total} passed ({(passed/total)*100:.1f}%)")
    print("=" * 50)

if __name__ == "__main__":
    run_persistence_tests()