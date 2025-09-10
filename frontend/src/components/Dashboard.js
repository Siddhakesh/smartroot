import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { agribotApi } from '../services/agribotApi';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Leaf, 
  LogOut, 
  Thermometer, 
  Droplets, 
  Cloud, 
  TrendingUp,
  MessageCircle,
  MapPin,
  BarChart3,
  RefreshCw,
  Send,
  Loader2
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  
  // State management
  const [sensorData, setSensorData] = useState(null);
  const [recommendedCrop, setRecommendedCrop] = useState("");
  const [weatherData, setWeatherData] = useState([]);
  const [weatherRecommendations, setWeatherRecommendations] = useState("");
  const [yieldData, setYieldData] = useState(null);
  const [marketData, setMarketData] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState({
    dashboard: true,
    weather: false,
    chat: false,
    yield: false,
    market: false,
    refresh: false
  });
  const [error, setError] = useState("");

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(prev => ({ ...prev, dashboard: true }));
      
      // Load sensor data and crop recommendation
      const sensorResponse = await agribotApi.getSensorData();
      setSensorData(sensorResponse.sensor_data);
      setRecommendedCrop(sensorResponse.recommended_crop);
      
      // Load weather data
      const weatherResponse = await agribotApi.getWeatherForecast();
      setWeatherData(weatherResponse.forecast);
      
      // Get weather recommendations
      if (weatherResponse.forecast.length > 0) {
        const recResponse = await agribotApi.getWeatherRecommendations(
          weatherResponse.forecast, 
          sensorResponse.recommended_crop
        );
        setWeatherRecommendations(recResponse.recommendations);
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, dashboard: false }));
    }
  };

  const handleRefreshData = async () => {
    try {
      setLoading(prev => ({ ...prev, refresh: true }));
      const response = await agribotApi.refreshSensorData();
      setSensorData(response.sensor_data);
      setRecommendedCrop(response.recommended_crop);
      
      // Refresh weather recommendations with new crop
      if (weatherData.length > 0) {
        const recResponse = await agribotApi.getWeatherRecommendations(
          weatherData, 
          response.recommended_crop
        );
        setWeatherRecommendations(recResponse.recommendations);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError('Failed to refresh data. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, refresh: false }));
    }
  };

  const loadYieldData = async () => {
    try {
      setLoading(prev => ({ ...prev, yield: true }));
      const response = await agribotApi.getYieldPrediction();
      setYieldData(response);
    } catch (error) {
      console.error('Error loading yield data:', error);
    } finally {
      setLoading(prev => ({ ...prev, yield: false }));
    }
  };

  const loadMarketData = async () => {
    try {
      setLoading(prev => ({ ...prev, market: true }));
      const response = await agribotApi.getMarketRecommendations(recommendedCrop);
      setMarketData(response.markets);
    } catch (error) {
      console.error('Error loading market data:', error);
    } finally {
      setLoading(prev => ({ ...prev, market: false }));
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = { type: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    
    try {
      setLoading(prev => ({ ...prev, chat: true }));
      const response = await agribotApi.chatWithAgriBot(
        chatInput, 
        recommendedCrop, 
        sensorData
      );
      
      const botMessage = { type: 'bot', text: response.response };
      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error with chat:', error);
      const errorMessage = { type: 'bot', text: 'Sorry, I encountered an error. Please try again.' };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(prev => ({ ...prev, chat: false }));
      setChatInput("");
    }
  };

  if (loading.dashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your AgriBot dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-green-600" />
              <h1 className="text-2xl font-bold text-green-800">AgriBot</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarFallback className="bg-green-100 text-green-800">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={logout}
                className="hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.name}! 🌱
              </h2>
              <p className="text-gray-600">
                Here's your farm's latest insights and recommendations
              </p>
            </div>
            <Button 
              onClick={handleRefreshData}
              disabled={loading.refresh}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading.refresh ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh Data
            </Button>
          </div>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-400">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="chat">AI Chat</TabsTrigger>
            <TabsTrigger value="yield">Yield Prediction</TabsTrigger>
            <TabsTrigger value="market">Market Info</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Current Conditions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Temperature</p>
                      <p className="text-2xl font-bold">{sensorData?.temperature || 'N/A'}°C</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Droplets className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Humidity</p>
                      <p className="text-2xl font-bold">{sensorData?.humidity || 'N/A'}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Cloud className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">pH Level</p>
                      <p className="text-2xl font-bold">{sensorData?.ph || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Cloud className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Rainfall</p>
                      <p className="text-2xl font-bold">{sensorData?.rainfall || 'N/A'}mm</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* NPK Levels */}
            <Card>
              <CardHeader>
                <CardTitle>Soil Nutrients (NPK)</CardTitle>
                <CardDescription>Current nitrogen, phosphorus, and potassium levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 mb-1">Nitrogen (N)</p>
                    <p className="text-3xl font-bold text-green-600">{sensorData?.N || 'N/A'}</p>
                    <Badge variant="secondary" className="mt-1">
                      {sensorData?.N > 80 ? 'Good' : sensorData?.N > 50 ? 'Moderate' : 'Low'}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 mb-1">Phosphorus (P)</p>
                    <p className="text-3xl font-bold text-orange-600">{sensorData?.P || 'N/A'}</p>
                    <Badge variant="outline" className="mt-1">
                      {sensorData?.P > 80 ? 'Good' : sensorData?.P > 50 ? 'Moderate' : 'Low'}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 mb-1">Potassium (K)</p>
                    <p className="text-3xl font-bold text-blue-600">{sensorData?.K || 'N/A'}</p>
                    <Badge variant="secondary" className="mt-1">
                      {sensorData?.K > 80 ? 'Good' : sensorData?.K > 50 ? 'Moderate' : 'Low'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span>Crop Recommendation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <p className="text-4xl font-bold text-green-700 mb-2">{recommendedCrop}</p>
                    <p className="text-gray-600 mb-4">Best crop for current conditions</p>
                    <Badge className="bg-green-100 text-green-800">92% Match</Badge>
                  </div>
                  <div className="space-y-2 mt-4">
                    <p className="text-sm text-gray-600">🌱 Apply 35kg DAP fertilizer</p>
                    <p className="text-sm text-gray-600">💧 Irrigate in 24 hours</p>
                    <p className="text-sm text-gray-600">🌤️ Monitor weather conditions</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Cloud className="h-5 w-5 text-blue-600" />
                    <span>Weather Forecast</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">5-day forecast for Delhi</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Today</span>
                      <span className="text-sm font-medium">28°C, Sunny</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tomorrow</span>
                      <span className="text-sm font-medium">26°C, Cloudy</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Day 3</span>
                      <span className="text-sm font-medium">24°C, Rain</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View Detailed Forecast
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  <span>AI Chat Assistant</span>
                </CardTitle>
                <CardDescription>
                  Ask questions about your crops and get AI-powered recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="min-h-[400px] flex items-center justify-center">
                <p className="text-gray-500">Chat interface will be implemented here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="yield">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  <span>Yield Prediction</span>
                </CardTitle>
                <CardDescription>
                  ML-powered yield predictions based on your farm data
                </CardDescription>
              </CardHeader>
              <CardContent className="min-h-[400px] flex items-center justify-center">
                <p className="text-gray-500">Yield prediction interface will be implemented here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="market">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  <span>Market Recommendations</span>
                </CardTitle>
                <CardDescription>
                  Find the best markets for your crops
                </CardDescription>
              </CardHeader>
              <CardContent className="min-h-[400px] flex items-center justify-center">
                <p className="text-gray-500">Market recommendations will be implemented here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;