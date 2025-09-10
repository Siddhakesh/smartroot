import random
import pandas as pd
import numpy as np
from typing import Dict, List
import json

class CropRecommendationModel:
    """Simulated crop recommendation model"""
    
    def __init__(self):
        # List of crops similar to your original model
        self.crops = [
            'rice', 'maize', 'chickpea', 'kidneybeans', 'pigeonpeas',
            'mothbeans', 'mungbean', 'blackgram', 'lentil', 'pomegranate',
            'banana', 'mango', 'grapes', 'watermelon', 'muskmelon',
            'apple', 'orange', 'papaya', 'coconut', 'cotton',
            'jute', 'coffee'
        ]
        
    def predict_crop(self, sensor_data: Dict) -> str:
        """Predict crop based on sensor data using rules similar to ML model"""
        N = sensor_data.get('N', 0)
        P = sensor_data.get('P', 0)
        K = sensor_data.get('K', 0)
        temperature = sensor_data.get('temperature', 0)
        humidity = sensor_data.get('humidity', 0)
        ph = sensor_data.get('ph', 0)
        rainfall = sensor_data.get('rainfall', 0)
        
        # Simple rule-based prediction (mimicking ML model behavior)
        if temperature > 30 and humidity > 80 and rainfall > 200:
            return random.choice(['rice', 'jute', 'coconut'])
        elif temperature < 20 and rainfall < 100:
            return random.choice(['apple', 'grapes', 'pomegranate'])
        elif ph > 7 and N > 80:
            return random.choice(['maize', 'cotton', 'banana'])
        elif humidity < 50 and temperature > 25:
            return random.choice(['mango', 'orange', 'watermelon'])
        else:
            return random.choice(self.crops)

class YieldPredictionModel:
    """Simulated yield prediction model"""
    
    def predict_yield(self, farm_data: Dict) -> float:
        """Predict yield based on farm data"""
        area = farm_data.get('Farm_Area(acres)', 100)
        irrigation = farm_data.get('Irrigation_Type', 'Manual')
        fertilizer = farm_data.get('Fertilizer_Used(tons)', 5)
        soil_type = farm_data.get('Soil_Type', 'Loamy')
        season = farm_data.get('Season', 'Kharif')
        
        # Base yield calculation
        base_yield = area * 2.5  # tons per acre base
        
        # Irrigation multiplier
        irrigation_multipliers = {
            'Sprinkler': 1.3,
            'Flood': 1.2,
            'Manual': 1.0,
            'Rain-fed': 0.8
        }
        
        # Soil type multiplier
        soil_multipliers = {
            'Loamy': 1.2,
            'Clay': 1.0,
            'Silty': 1.1,
            'Peaty': 0.9
        }
        
        # Season multiplier
        season_multipliers = {
            'Kharif': 1.1,
            'Rabi': 1.0,
            'Zaid': 0.9
        }
        
        yield_prediction = (
            base_yield * 
            irrigation_multipliers.get(irrigation, 1.0) *
            soil_multipliers.get(soil_type, 1.0) *
            season_multipliers.get(season, 1.0) *
            (1 + fertilizer / 20)  # Fertilizer impact
        )
        
        # Add some randomness to make it realistic
        yield_prediction *= random.uniform(0.85, 1.15)
        
        return round(yield_prediction, 2)

def simulate_sensor_data(last_data: Dict = None) -> Dict:
    """
    Simulates sensor data. If it's the first run, data is fully random.
    Otherwise, it drifts slightly from the last known values.
    """
    # Define bounds and deltas for realistic drifting
    params = {
        "N": {"bounds": (0, 140), "delta": 3},
        "P": {"bounds": (5, 145), "delta": 3},
        "K": {"bounds": (5, 205), "delta": 4},
        "temperature": {"bounds": (10, 40), "delta": 0.5},
        "humidity": {"bounds": (30, 98), "delta": 2},
        "ph": {"bounds": (4, 9), "delta": 0.1},
        "rainfall": {"bounds": (20, 300), "delta": 5}
    }

    if not last_data:  # First run, generate purely random data
        return {
            key: round(random.uniform(val["bounds"][0], val["bounds"][1]), 2)
            for key, val in params.items()
        }
    else:  # Subsequent runs, drift the data
        new_data = {}
        for key, p in params.items():
            change = random.uniform(-p["delta"], p["delta"])
            new_value = last_data[key] + change
            # Clamp the value within the defined bounds
            new_value = max(p["bounds"][0], min(p["bounds"][1], new_value))
            new_data[key] = round(new_value, 2)
        return new_data

def simulate_farm_data() -> Dict:
    """Generate simulated farm data"""
    irrigation_types = ["Manual", "Sprinkler", "Flood", "Rain-fed"]
    soil_types = ["Loamy", "Clay", "Silty", "Peaty"]
    seasons = ["Kharif", "Rabi", "Zaid"]

    return {
        "Farm_Area(acres)": round(random.uniform(10, 500), 2),
        "Irrigation_Type": random.choice(irrigation_types),
        "Fertilizer_Used(tons)": round(random.uniform(1, 10), 2),
        "Pesticide_Used(kg)": round(random.uniform(0.5, 10), 2),
        "Soil_Type": random.choice(soil_types),
        "Season": random.choice(seasons),
        "Water_Usage(cubic meters)": round(random.uniform(20000, 100000), 2)
    }

# Generate simulated market data
def generate_market_data(crop_name: str) -> List[Dict]:
    """Generate simulated market price data for a crop"""
    markets = [
        "Delhi Azadpur Market", "Mumbai APMC", "Bangalore Market",
        "Chennai Koyambedu", "Hyderabad Market", "Pune Market",
        "Kolkata Market", "Ahmedabad Market", "Jaipur Market", "Lucknow Market"
    ]
    
    # Base price varies by crop
    crop_base_prices = {
        'rice': 2500, 'wheat': 2200, 'maize': 1800, 'cotton': 5500,
        'sugarcane': 300, 'banana': 1200, 'mango': 2800, 'apple': 8000,
        'grapes': 4500, 'pomegranate': 6000, 'chickpea': 4800, 'lentil': 5200
    }
    
    base_price = crop_base_prices.get(crop_name.lower(), 3000)
    
    market_data = []
    for market in markets:
        # Add price variation for each market
        price_variation = random.uniform(0.8, 1.2)
        price = round(base_price * price_variation, 2)
        
        market_data.append({
            "Market": market,
            "AvgPrice": price,
            "Score": random.uniform(0.6, 1.0)
        })
    
    # Sort by price (descending) and return top 5
    market_data.sort(key=lambda x: x["AvgPrice"], reverse=True)
    return market_data[:5]

# Initialize models
crop_model = CropRecommendationModel()
yield_model = YieldPredictionModel()