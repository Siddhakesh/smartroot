import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const agribotApi = {
  // Sensor data endpoints
  getSensorData: async () => {
    const response = await axios.get(`${API}/agribot/sensor-data`);
    return response.data;
  },

  refreshSensorData: async () => {
    const response = await axios.post(`${API}/agribot/refresh-data`);
    return response.data;
  },

  // Weather endpoints
  getWeatherForecast: async (city = 'Delhi') => {
    const response = await axios.get(`${API}/agribot/weather?city=${city}`);
    return response.data;
  },

  getWeatherRecommendations: async (forecast, crop) => {
    const response = await axios.post(`${API}/agribot/weather-recommendations`, {
      forecast,
      crop
    });
    return response.data;
  },

  // Chat endpoint
  chatWithAgriBot: async (question, crop, sensorData) => {
    const response = await axios.post(`${API}/agribot/chat`, {
      question,
      crop,
      sensor_data: sensorData
    });
    return response.data;
  },

  // Yield prediction endpoint
  getYieldPrediction: async () => {
    const response = await axios.get(`${API}/agribot/yield-prediction`);
    return response.data;
  },

  // Market recommendations endpoint
  getMarketRecommendations: async (crop) => {
    const response = await axios.get(`${API}/agribot/market-recommendations?crop=${crop}`);
    return response.data;
  }
};