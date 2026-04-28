import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';

export default function AdminHeader({ onLogout }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState('Detecting location...');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Get user's location using Geolocation API
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          console.log('[AdminHeader] Got coordinates:', latitude, longitude);
          
          try {
            // Reverse geocode using OpenStreetMap Nominatim API
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=16&addressdetails=1`,
              {
                headers: {
                  'User-Agent': 'SmartCart-Admin-Panel'
                }
              }
            );
            
            if (response.ok) {
              const data = await response.json();
              console.log('[AdminHeader] Geocoding response:', data);
              
              const address = data.address || {};
              
              // Get clean area name - prioritize neighbourhood and suburb
              const area = address.neighbourhood || 
                          address.suburb || 
                          address.village || 
                          address.hamlet ||
                          address.quarter;
              
              // Get city - prefer city/town, fallback to state_district
              const city = address.city || 
                          address.town || 
                          address.state_district;
              
              console.log('[AdminHeader] Extracted - Area:', area, 'City:', city);
              
              // Format as "Area, City" (e.g., "Vadapalani, Chennai")
              if (area && city) {
                setLocation(`${area}, ${city}`);
              } else if (city) {
                setLocation(city);
              } else if (area) {
                setLocation(area);
              } else {
                // Fallback: try to extract meaningful location from display_name
                // Skip technical names like "CMWSSB Division"
                const displayParts = data.display_name.split(',').map(p => p.trim());
                const meaningfulParts = displayParts.filter(part => 
                  !part.match(/division|ward|zone|block|sector/i) && 
                  part.length > 2
                ).slice(0, 2);
                
                if (meaningfulParts.length > 0) {
                  setLocation(meaningfulParts.join(', '));
                } else {
                  setLocation('SmartCart Store');
                }
              }
            } else {
              console.warn('[AdminHeader] Geocoding API error:', response.status);
              setLocation('SmartCart Store');
            }
          } catch (error) {
            console.error('[AdminHeader] Geocoding failed:', error);
            setLocation('SmartCart Store');
          }
        },
        (error) => {
          console.warn('[AdminHeader] Geolocation error:', error.code, error.message);
          setLocation('SmartCart Store');
        },
        {
          enableHighAccuracy: true, // Request high accuracy GPS
          timeout: 10000,
          maximumAge: 300000 // Cache for 5 minutes
        }
      );
    } else {
      console.warn('[AdminHeader] Geolocation not supported');
      setLocation('SmartCart Store');
    }
  }, []);

  const formatDateTime = (date) => {
    return date.toLocaleString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">SmartCart AI</h1>
          </div>

          {/* Store Name */}
          <div className="hidden md:block text-center">
            <h2 className="text-lg font-semibold text-gray-800">
              SmartCart Store — {location}
            </h2>
          </div>

          {/* Time and Logout */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {formatDateTime(currentTime)}
              </p>
              <p className="text-xs text-gray-500">IST</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}