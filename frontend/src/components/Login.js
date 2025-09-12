import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2 } from 'lucide-react';
import Logo3D from './Logo3D';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* 3D Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-emerald-500/10 rounded-full animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-40 right-20 w-16 h-16 bg-emerald-400/10 rounded-lg rotate-45 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-emerald-600/10 rounded-full animate-float" style={{ animationDelay: '4s' }} />
        <div className="absolute bottom-20 right-1/3 w-24 h-24 bg-emerald-300/5 rounded-lg rotate-12 animate-float" style={{ animationDelay: '1s' }} />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-6">
        <Card className="elevated-card glass-card border-slate-700/50 backdrop-blur-xl">
          <CardHeader className="space-y-4 text-center">
            {/* 3D Logo */}
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Logo3D size={10} className="animate-pulse-glow" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                SmartRoots
              </h1>
            </div>
            
            <CardTitle className="text-2xl text-slate-100 font-semibold">
              Welcome back
            </CardTitle>
            <CardDescription className="text-slate-400">
              Sign in to your AgriBot account
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive" className="bg-red-900/50 border-red-700/50 text-red-200">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-3">
                <Label htmlFor="email" className="text-slate-300 font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-slate-800/50 border-slate-600/50 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all duration-300"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="password" className="text-slate-300 font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-slate-800/50 border-slate-600/50 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all duration-300"
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-medium py-3 ripple transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/25"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
              
              <p className="text-sm text-center text-slate-400">
                Don't have an account?{' '}
                <Link 
                  to="/signup" 
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors duration-300 hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;