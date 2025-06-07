import { useState, useEffect } from 'react';

export function useMapInteraction(setLatitude, setLongitude) {
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState([9.03, 38.74]); // Fallback: Addis Ababa

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
          console.log('User location:', { latitude, longitude, timestamp: new Date().toISOString() });
        },
        (err) => {
          console.warn('Geolocation error:', {
            error: err.message,
            timestamp: new Date().toISOString(),
          });
        }
      );
    } else {
      console.warn('Geolocation not supported:', { timestamp: new Date().toISOString() });
    }
  }, []);

  const handleMapClick = (lat, lng) => {
    setLatitude(lat);
    setLongitude(lng);
    console.log('Map clicked:', { lat, lng, timestamp: new Date().toISOString() });
  };

  return {
    showMap,
    setShowMap,
    mapCenter,
    setMapCenter,
    handleMapClick,
  };
}