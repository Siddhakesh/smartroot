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
                    <p className="text-4xl font-bold text-green-700 mb-2 capitalize">{recommendedCrop || 'Loading...'}</p>
                    <p className="text-gray-600 mb-4">Best crop for current conditions</p>
                    <Badge className="bg-green-100 text-green-800">AI Recommended</Badge>
                  </div>
                  <div className="space-y-2 mt-4">
                    <p className="text-sm text-gray-600">🌱 Based on current NPK levels</p>
                    <p className="text-sm text-gray-600">💧 Consider soil moisture</p>
                    <p className="text-sm text-gray-600">🌤️ Weather-optimized selection</p>
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
                    {weatherData.slice(0, 3).map((day, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{day.day}</span>
                        <span className="text-sm font-medium">{day.temp}°C, {day.description}</span>
                      </div>
                    ))}
                  </div>
                  {weatherRecommendations && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs font-medium text-blue-800 mb-1">AI Recommendations:</p>
                      <p className="text-xs text-blue-700 line-clamp-3">{weatherRecommendations.slice(0, 120)}...</p>
                    </div>
                  )}
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
                  Ask questions about your crops ({recommendedCrop}) and get AI-powered recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 flex flex-col">
                  <ScrollArea className="flex-1 mb-4 p-4 border rounded-lg bg-gray-50">
                    {chatMessages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                          <p>Start a conversation with AgriBot!</p>
                          <p className="text-sm">Ask about fertilizers, irrigation, pests, or anything farming-related.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {chatMessages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                message.type === 'user'
                                  ? 'bg-green-600 text-white'
                                  : 'bg-white border text-gray-800'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                            </div>
                          </div>
                        ))}
                        {loading.chat && (
                          <div className="flex justify-start">
                            <div className="bg-white border p-3 rounded-lg">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>
                  
                  <form onSubmit={handleChatSubmit} className="flex space-x-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask AgriBot about your crops..."
                      disabled={loading.chat}
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      disabled={loading.chat || !chatInput.trim()}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {loading.chat ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="yield" onFocus={() => !yieldData && loadYieldData()}>
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
              <CardContent>
                {loading.yield ? (
                  <div className="min-h-[400px] flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
                      <p className="text-gray-600">Calculating yield predictions...</p>
                    </div>
                  </div>
                ) : yieldData ? (
                  <div className="space-y-6">
                    <div className="text-center p-6 bg-green-50 rounded-lg">
                      <h3 className="text-2xl font-bold text-green-800 mb-2">
                        Predicted Yield: {yieldData.predicted_yield} tons
                      </h3>
                      <p className="text-gray-600">Based on current farm conditions</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Farm Parameters</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {Object.entries(yieldData.farm_data).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-sm text-gray-600">{key.replace(/[()]/g, '').replace(/_/g, ' ')}:</span>
                              <span className="text-sm font-medium">{value}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Optimization Tips</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm text-gray-600">• Consider upgrading to sprinkler irrigation for better yield</p>
                          <p className="text-sm text-gray-600">• Optimal fertilizer application can increase yield by 15-20%</p>
                          <p className="text-sm text-gray-600">• Soil type and season significantly impact final yield</p>
                          <p className="text-sm text-gray-600">• Regular monitoring helps maintain optimal conditions</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Button 
                      onClick={loadYieldData}
                      variant="outline"
                      className="w-full"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Recalculate Prediction
                    </Button>
                  </div>
                ) : (
                  <div className="min-h-[400px] flex items-center justify-center">
                    <Button onClick={loadYieldData} className="bg-green-600 hover:bg-green-700">
                      Load Yield Prediction
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="market" onFocus={() => recommendedCrop && !marketData.length && loadMarketData()}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  <span>Market Recommendations</span>
                </CardTitle>
                <CardDescription>
                  Find the best markets for your {recommendedCrop} crop
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading.market ? (
                  <div className="min-h-[400px] flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
                      <p className="text-gray-600">Finding best markets...</p>
                    </div>
                  </div>
                ) : marketData.length > 0 ? (
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <h3 className="text-xl font-bold text-orange-800 capitalize">
                        Top Markets for {recommendedCrop}
                      </h3>
                      <p className="text-gray-600">Sorted by average price per quintal</p>
                    </div>
                    
                    <div className="space-y-3">
                      {marketData.map((market, index) => (
                        <Card key={index} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-3">
                                <div className="bg-orange-100 p-2 rounded-full">
                                  <MapPin className="h-4 w-4 text-orange-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">{market.Market}</h4>
                                  <p className="text-sm text-gray-500">Agricultural Market</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-green-600">₹{market.AvgPrice}/quintal</p>
                                <Badge variant="outline" className="mt-1">
                                  Rank #{index + 1}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    <Button 
                      onClick={loadMarketData}
                      variant="outline"
                      className="w-full"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Market Data
                    </Button>
                  </div>
                ) : (
                  <div className="min-h-[400px] flex items-center justify-center">
                    <div className="text-center">
                      {recommendedCrop ? (
                        <Button onClick={loadMarketData} className="bg-orange-600 hover:bg-orange-700">
                          Load Market Data for {recommendedCrop}
                        </Button>
                      ) : (
                        <p className="text-gray-500">
                          Please wait for crop recommendation to load market data
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;