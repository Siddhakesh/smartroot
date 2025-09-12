import React from 'react';

const Logo3D = ({ size = 8, className = "" }) => {
  return (
    <div className={`logo-3d ${className}`} style={{ width: `${size * 0.25}rem`, height: `${size * 0.25}rem` }}>
      <div className="relative perspective-1000">
        {/* Main 3D Cube Structure */}
        <div className="transform-3d animate-rotate-3d">
          {/* Front Face */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg opacity-90 shadow-lg">
            <div className="w-full h-full flex items-center justify-center">
              {/* Agricultural Symbol - Stylized Plant */}
              <svg 
                viewBox="0 0 24 24" 
                className="w-3/4 h-3/4 text-white drop-shadow-lg"
                fill="currentColor"
              >
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
                <path d="M12 16C12 16 8 18 8 22H16C16 18 12 16 12 16Z" opacity="0.7" />
                <circle cx="12" cy="19" r="1" />
                <path d="M9 12C9 12 11 10 15 12" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.8" />
                <path d="M15 12C15 12 13 10 9 12" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.8" />
              </svg>
            </div>
          </div>
          
          {/* Top Face */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg opacity-70"
            style={{ transform: 'rotateX(90deg) translateZ(1rem)' }}
          />
          
          {/* Right Face */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-lg opacity-60"
            style={{ transform: 'rotateY(90deg) translateZ(1rem)' }}
          />
        </div>
        
        {/* Floating particles */}
        <div className="absolute top-0 left-0 w-1 h-1 bg-emerald-400 rounded-full animate-float opacity-60" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1 right-0 w-0.5 h-0.5 bg-emerald-300 rounded-full animate-float opacity-80" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-2 w-0.5 h-0.5 bg-emerald-500 rounded-full animate-float opacity-70" style={{ animationDelay: '2s' }} />
      </div>
    </div>
  );
};

export default Logo3D;