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
  Loader2,
  Zap,
  Activity,
  Target,
  Camera,
  Upload,
  Users,
  Hash,
  CheckCircle,
  AlertTriangle,
  Shield,
  Image as ImageIcon
} from 'lucide-react';
import Logo3D from './Logo3D';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center relative overflow-hidden">
        {/* 3D Loading Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-emerald-500/10 rounded-full animate-float blur-xl" />
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-emerald-400/10 rounded-lg rotate-45 animate-float blur-lg" />
        </div>
        
        <div className="text-center z-10">
          <Logo3D size={16} className="animate-pulse-glow mx-auto mb-6" />
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-slate-300 text-lg">Loading your SmartRoots dashboard...</p>
          <div className="mt-4 flex space-x-1 justify-center">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-500/5 rounded-full animate-float blur-xl" style={{ animationDelay: '0s' }} />
        <div className="absolute top-40 right-20 w-24 h-24 bg-emerald-400/5 rounded-lg rotate-45 animate-float blur-lg" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-emerald-600/5 rounded-full animate-float blur-lg" style={{ animationDelay: '4s' }} />
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-emerald-300/3 rounded-lg rotate-12 animate-float blur-xl" style={{ animationDelay: '1s' }} />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.3) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        {/* Gradient lines */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent" />
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-emerald-400/10 to-transparent" />
      </div>

      {/* Header */}
      <header className="relative z-10 glass-card border-b border-slate-700/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <Logo3D size={8} className="animate-pulse-glow" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                  SmartRoots
                </h1>
                <p className="text-xs text-slate-400">Agricultural Intelligence Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <Avatar className="ring-2 ring-emerald-500/20">
                  <AvatarFallback className="bg-slate-800 text-emerald-400 font-semibold border border-slate-700">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-200">{user?.name}</p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={logout}
                className="bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-red-900/20 hover:border-red-600/50 hover:text-red-400 transition-all duration-300 ripple"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-4xl font-bold text-slate-100 mb-2">
                Welcome back, <span className="text-emerald-400">{user?.name}</span>! 
              </h2>
              <p className="text-slate-400 text-lg">
                Here's your farm's latest insights and AI-powered recommendations
              </p>
            </div>
            <Button 
              onClick={handleRefreshData}
              disabled={loading.refresh}
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-medium ripple shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105"
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
            <Alert variant="destructive" className="mt-4 bg-red-900/50 border-red-700/50 text-red-200">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <Tabs defaultValue="dashboard" className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 lg:w-600 bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
            <TabsTrigger 
              value="dashboard" 
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400 transition-all duration-300"
            >
              <Activity className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="chat"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400 transition-all duration-300"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              AI Chat
            </TabsTrigger>
            <TabsTrigger 
              value="disease"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400 transition-all duration-300"
            >
              <Target className="h-4 w-4 mr-2" />
              Disease Detection
            </TabsTrigger>
            <TabsTrigger 
              value="community"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400 transition-all duration-300"
            >
              <Zap className="h-4 w-4 mr-2" />
              Community
            </TabsTrigger>
            <TabsTrigger 
              value="yield"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400 transition-all duration-300"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Yield Prediction
            </TabsTrigger>
            <TabsTrigger 
              value="market"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400 transition-all duration-300"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Market Info
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            {/* Current Conditions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="elevated-card glass-card border-slate-700/50 group hover:border-emerald-500/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 group-hover:from-orange-500/30 group-hover:to-red-500/30 transition-all duration-300">
                      <Thermometer className="h-6 w-6 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-400 mb-1">Temperature</p>
                      <p className="text-3xl font-bold text-slate-100">{sensorData?.temperature || 'N/A'}°C</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="elevated-card glass-card border-slate-700/50 group hover:border-emerald-500/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                      <Droplets className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-400 mb-1">Humidity</p>
                      <p className="text-3xl font-bold text-slate-100">{sensorData?.humidity || 'N/A'}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="elevated-card glass-card border-slate-700/50 group hover:border-emerald-500/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-300">
                      <Cloud className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-400 mb-1">pH Level</p>
                      <p className="text-3xl font-bold text-slate-100">{sensorData?.ph || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="elevated-card glass-card border-slate-700/50 group hover:border-emerald-500/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500/20 to-blue-500/20 group-hover:from-indigo-500/30 group-hover:to-blue-500/30 transition-all duration-300">
                      <Cloud className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-400 mb-1">Rainfall</p>
                      <p className="text-3xl font-bold text-slate-100">{sensorData?.rainfall || 'N/A'}mm</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* NPK Levels */}
            <Card className="elevated-card glass-card border-slate-700/50 hover:border-emerald-500/30 transition-all duration-300">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl text-slate-100 flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500/20 to-green-500/20">
                    <Zap className="h-6 w-6 text-emerald-400" />
                  </div>
                  <span>Soil Nutrients (NPK)</span>
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Current nitrogen, phosphorus, and potassium levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-8">
                  <div className="text-center p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
                    <p className="text-sm font-medium text-slate-400 mb-2">Nitrogen (N)</p>
                    <p className="text-4xl font-bold text-emerald-400 mb-3">{sensorData?.N || 'N/A'}</p>
                    <Badge 
                      variant={sensorData?.N > 80 ? 'default' : sensorData?.N > 50 ? 'secondary' : 'destructive'}
                      className="font-medium"
                    >
                      {sensorData?.N > 80 ? 'Good' : sensorData?.N > 50 ? 'Moderate' : 'Low'}
                    </Badge>
                  </div>
                  <div className="text-center p-6 rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20">
                    <p className="text-sm font-medium text-slate-400 mb-2">Phosphorus (P)</p>
                    <p className="text-4xl font-bold text-orange-400 mb-3">{sensorData?.P || 'N/A'}</p>
                    <Badge 
                      variant={sensorData?.P > 80 ? 'default' : sensorData?.P > 50 ? 'secondary' : 'destructive'}
                      className="font-medium"
                    >
                      {sensorData?.P > 80 ? 'Good' : sensorData?.P > 50 ? 'Moderate' : 'Low'}
                    </Badge>
                  </div>
                  <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                    <p className="text-sm font-medium text-slate-400 mb-2">Potassium (K)</p>
                    <p className="text-4xl font-bold text-blue-400 mb-3">{sensorData?.K || 'N/A'}</p>
                    <Badge 
                      variant={sensorData?.K > 80 ? 'default' : sensorData?.K > 50 ? 'secondary' : 'destructive'}
                      className="font-medium"
                    >
                      {sensorData?.K > 80 ? 'Good' : sensorData?.K > 50 ? 'Moderate' : 'Low'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="elevated-card glass-card border-slate-700/50 hover:border-emerald-500/30 transition-all duration-300 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-b border-emerald-500/20">
                  <CardTitle className="flex items-center space-x-3 text-slate-100">
                    <div className="p-2 rounded-lg bg-emerald-500/20">
                      <TrendingUp className="h-5 w-5 text-emerald-400" />
                    </div>
                    <span>AI Crop Recommendation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="text-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-green-400/20 rounded-full blur-xl" />
                      <p className="relative text-5xl font-bold text-emerald-400 capitalize mb-3">
                        {recommendedCrop || 'Loading...'}
                      </p>
                    </div>
                    <p className="text-slate-400 mb-6 text-lg">Best crop for current conditions</p>
                    <Badge className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-4 py-2 text-sm font-medium">
                      <Target className="h-4 w-4 mr-2" />
                      AI Recommended
                    </Badge>
                  </div>
                  <div className="space-y-3 mt-8">
                    <div className="flex items-center space-x-3 text-slate-300">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                      <p className="text-sm">Based on current NPK levels</p>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-300">
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      <p className="text-sm">Optimal soil moisture considered</p>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-300">
                      <div className="w-2 h-2 bg-orange-400 rounded-full" />
                      <p className="text-sm">Weather-optimized selection</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="elevated-card glass-card border-slate-700/50 hover:border-emerald-500/30 transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-b border-blue-500/20">
                  <CardTitle className="flex items-center space-x-3 text-slate-100">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <Cloud className="h-5 w-5 text-blue-400" />
                    </div>
                    <span>Weather Forecast</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-slate-400 mb-4">5-day forecast for Delhi</p>
                  <div className="space-y-3">
                    {weatherData.slice(0, 3).map((day, index) => (
                      <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                        <span className="text-sm text-slate-300 font-medium">{day.day}</span>
                        <span className="text-sm text-slate-200">{day.temp}°C, {day.description}</span>
                      </div>
                    ))}
                  </div>
                  {weatherRecommendations && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
                      <p className="text-xs font-medium text-blue-400 mb-2 flex items-center">
                        <Zap className="h-3 w-3 mr-1" />
                        AI Weather Insights:
                      </p>
                      <p className="text-xs text-slate-300 line-clamp-3">{weatherRecommendations.slice(0, 120)}...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="chat">
            <Card className="elevated-card glass-card border-slate-700/50 hover:border-emerald-500/30 transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-b border-emerald-500/20">
                <CardTitle className="flex items-center space-x-3 text-slate-100">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <MessageCircle className="h-5 w-5 text-emerald-400" />
                  </div>
                  <span>AI Chat Assistant</span>
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Ask questions about your crops ({recommendedCrop}) and get AI-powered recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-96 flex flex-col">
                  <ScrollArea className="flex-1 mb-4 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                    {chatMessages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-slate-500">
                        <div className="text-center">
                          <div className="mb-4">
                            <MessageCircle className="h-16 w-16 mx-auto text-slate-600 animate-pulse" />
                          </div>
                          <p className="text-lg font-medium text-slate-400">Start a conversation with AgriBot!</p>
                          <p className="text-sm text-slate-500 mt-2">Ask about fertilizers, irrigation, pests, or anything farming-related.</p>
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
                              className={`max-w-[80%] p-4 rounded-xl transition-all duration-300 ${
                                message.type === 'user'
                                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg'
                                  : 'bg-slate-800/50 border border-slate-700/50 text-slate-200'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                            </div>
                          </div>
                        ))}
                        {loading.chat && (
                          <div className="flex justify-start">
                            <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl">
                              <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>
                  
                  <form onSubmit={handleChatSubmit} className="flex space-x-3">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask AgriBot about your crops..."
                      disabled={loading.chat}
                      className="flex-1 bg-slate-800/50 border-slate-600/50 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                    />
                    <Button 
                      type="submit" 
                      disabled={loading.chat || !chatInput.trim()}
                      className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white ripple px-6"
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
            <Card className="elevated-card glass-card border-slate-700/50 hover:border-emerald-500/30 transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b border-green-500/20">
                <CardTitle className="flex items-center space-x-3 text-slate-100">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <BarChart3 className="h-5 w-5 text-green-400" />
                  </div>
                  <span>Yield Prediction</span>
                </CardTitle>
                <CardDescription className="text-slate-400">
                  ML-powered yield predictions based on your farm data
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {loading.yield ? (
                  <div className="min-h-[400px] flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mx-auto mb-4" />
                      <p className="text-slate-300 text-lg">Calculating yield predictions...</p>
                    </div>
                  </div>
                ) : yieldData ? (
                  <div className="space-y-8">
                    <div className="text-center p-8 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                      <h3 className="text-3xl font-bold text-green-400 mb-2">
                        Predicted Yield: {yieldData.predicted_yield} tons
                      </h3>
                      <p className="text-slate-400">Based on current farm conditions</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="glass-card border-slate-700/50">
                        <CardHeader>
                          <CardTitle className="text-lg text-slate-200">Farm Parameters</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {Object.entries(yieldData.farm_data).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center p-2 rounded-lg bg-slate-800/20">
                              <span className="text-sm text-slate-400">{key.replace(/[()]/g, '').replace(/_/g, ' ')}:</span>
                              <span className="text-sm font-medium text-slate-200">{value}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                      
                      <Card className="glass-card border-slate-700/50">
                        <CardHeader>
                          <CardTitle className="text-lg text-slate-200">Optimization Tips</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2" />
                            <p className="text-sm text-slate-300">Consider upgrading to sprinkler irrigation for better yield</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2" />
                            <p className="text-sm text-slate-300">Optimal fertilizer application can increase yield by 15-20%</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-orange-400 rounded-full mt-2" />
                            <p className="text-sm text-slate-300">Soil type and season significantly impact final yield</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2" />
                            <p className="text-sm text-slate-300">Regular monitoring helps maintain optimal conditions</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Button 
                      onClick={loadYieldData}
                      variant="outline"
                      className="w-full bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-emerald-900/20 hover:border-emerald-600/50 hover:text-emerald-400 transition-all duration-300"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Recalculate Prediction
                    </Button>
                  </div>
                ) : (
                  <div className="min-h-[400px] flex items-center justify-center">
                    <Button 
                      onClick={loadYieldData} 
                      className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white px-8 py-3 text-lg"
                    >
                      Load Yield Prediction
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="market" onFocus={() => recommendedCrop && !marketData.length && loadMarketData()}>
            <Card className="elevated-card glass-card border-slate-700/50 hover:border-emerald-500/30 transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-b border-orange-500/20">
                <CardTitle className="flex items-center space-x-3 text-slate-100">
                  <div className="p-2 rounded-lg bg-orange-500/20">
                    <MapPin className="h-5 w-5 text-orange-400" />
                  </div>
                  <span>Market Recommendations</span>
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Find the best markets for your {recommendedCrop} crop
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {loading.market ? (
                  <div className="min-h-[400px] flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
                      <p className="text-slate-300 text-lg">Finding best markets...</p>
                    </div>
                  </div>
                ) : marketData.length > 0 ? (
                  <div className="space-y-6">
                    <div className="text-center p-6 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20">
                      <h3 className="text-2xl font-bold text-orange-400 capitalize mb-2">
                        Top Markets for {recommendedCrop}
                      </h3>
                      <p className="text-slate-400">Sorted by average price per quintal</p>
                    </div>
                    
                    <div className="space-y-4">
                      {marketData.map((market, index) => (
                        <Card key={index} className="glass-card border-slate-700/50 hover:border-orange-500/30 transition-all duration-300 elevated-card">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-4">
                                <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/20">
                                  <MapPin className="h-6 w-6 text-orange-400" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-slate-200 text-lg">{market.Market}</h4>
                                  <p className="text-sm text-slate-400">Agricultural Market</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-green-400">₹{market.AvgPrice}/quintal</p>
                                <Badge variant="outline" className="mt-2 border-orange-500/50 text-orange-400">
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
                      className="w-full bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-orange-900/20 hover:border-orange-600/50 hover:text-orange-400 transition-all duration-300"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Market Data
                    </Button>
                  </div>
                ) : (
                  <div className="min-h-[400px] flex items-center justify-center">
                    <div className="text-center">
                      {recommendedCrop ? (
                        <Button 
                          onClick={loadMarketData} 
                          className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white px-8 py-3 text-lg"
                        >
                          Load Market Data for {recommendedCrop}
                        </Button>
                      ) : (
                        <p className="text-slate-400 text-lg">
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