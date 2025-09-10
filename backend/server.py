from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List
import uuid
from datetime import datetime, timedelta
from auth import (
    UserCreate, UserLogin, User, Token, create_access_token, 
    authenticate_user, create_user, get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from ml_service import (
    crop_model, yield_model, simulate_sensor_data, 
    simulate_farm_data, generate_market_data
)
from weather_service import weather_service
from ai_service import gemini_service


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Authentication endpoints
@api_router.post("/auth/signup", response_model=Token)
async def signup(user_data: UserCreate):
    try:
        user = await create_user(db, user_data)
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        return Token(
            access_token=access_token,
            token_type="bearer",
            user=user
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating user: {str(e)}"
        )

@api_router.post("/auth/login", response_model=Token)
async def login(user_credentials: UserLogin):
    user = await authenticate_user(db, user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    # Create User object without password
    user_obj = User(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        created_at=user["created_at"],
        is_active=user["is_active"]
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_obj
    )

@api_router.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

# AgriBot sensor data storage
user_sensor_data = {}

# AgriBot API endpoints
@api_router.get("/agribot/sensor-data")
async def get_sensor_data(current_user: User = Depends(get_current_user)):
    """Get current sensor data for the user"""
    user_id = current_user.id
    
    # Get or create sensor data for this user
    if user_id not in user_sensor_data:
        user_sensor_data[user_id] = simulate_sensor_data()
    else:
        # Simulate data drift from last reading
        user_sensor_data[user_id] = simulate_sensor_data(user_sensor_data[user_id])
    
    sensor_data = user_sensor_data[user_id]
    recommended_crop = crop_model.predict_crop(sensor_data)
    
    return {
        "sensor_data": sensor_data,
        "recommended_crop": recommended_crop,
        "timestamp": datetime.utcnow()
    }

@api_router.post("/agribot/refresh-data")
async def refresh_sensor_data(current_user: User = Depends(get_current_user)):
    """Force refresh of sensor data"""
    user_id = current_user.id
    
    # Update sensor data
    if user_id in user_sensor_data:
        user_sensor_data[user_id] = simulate_sensor_data(user_sensor_data[user_id])
    else:
        user_sensor_data[user_id] = simulate_sensor_data()
    
    sensor_data = user_sensor_data[user_id]
    recommended_crop = crop_model.predict_crop(sensor_data)
    
    return {
        "sensor_data": sensor_data,
        "recommended_crop": recommended_crop,
        "timestamp": datetime.utcnow()
    }

@api_router.get("/agribot/weather")
async def get_weather_forecast(city: str = "Delhi", current_user: User = Depends(get_current_user)):
    """Get weather forecast for a city"""
    forecast = weather_service.get_weather_forecast(city)
    return {"forecast": forecast, "city": city}

@api_router.post("/agribot/weather-recommendations")
async def get_weather_recommendations(
    request: dict,
    current_user: User = Depends(get_current_user)
):
    """Get AI recommendations based on weather and crop"""
    forecast = request.get("forecast", [])
    crop = request.get("crop", "rice")
    
    recommendations = gemini_service.get_weather_recommendations(forecast, crop)
    return {"recommendations": recommendations}

class ChatRequest(BaseModel):
    question: str
    crop: str = "rice"
    sensor_data: dict = {}

@api_router.post("/agribot/chat")
async def chat_with_agribot(
    request: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    """Chat with AgriBot AI assistant"""
    user_id = current_user.id
    
    # Use current sensor data if available
    if user_id in user_sensor_data:
        sensor_data = user_sensor_data[user_id]
    else:
        sensor_data = request.sensor_data or simulate_sensor_data()
    
    response = gemini_service.ask_agribot(request.question, request.crop, sensor_data)
    return {"response": response}

@api_router.get("/agribot/yield-prediction")
async def get_yield_prediction(current_user: User = Depends(get_current_user)):
    """Get yield prediction based on farm data"""
    farm_data = simulate_farm_data()
    predicted_yield = yield_model.predict_yield(farm_data)
    
    return {
        "farm_data": farm_data,
        "predicted_yield": predicted_yield,
        "timestamp": datetime.utcnow()
    }

@api_router.get("/agribot/market-recommendations")
async def get_market_recommendations(
    crop: str = "rice",
    current_user: User = Depends(get_current_user)
):
    """Get market recommendations for a crop"""
    markets = generate_market_data(crop)
    return {
        "crop": crop,
        "markets": markets,
        "timestamp": datetime.utcnow()
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
