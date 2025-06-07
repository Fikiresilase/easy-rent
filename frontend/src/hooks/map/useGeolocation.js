import { useState, useEffect, useCallback } from 'react';

export function useGeolocation(properties, showMap, searchRadius, calculateDistance) {
  const [userLocation, setUserLocation] = useState(null);
  const [userPlaceName, setUserPlaceName] = useState('Current Location');
  const [mapCenter, setMapCenter] = useState([0, 0]);
  const [mapZoom, setMapZoom] = useState(14);
  const [filteredProperties, setFilteredProperties] = useState(properties);
  const [totalPages, setTotalPages] = useState(1);

  const getZoomLevel = (radius) => {
    if (radius <= 5) return 15;
    if (radius <= 10) return 14;
    if (radius <= 20) return 13;
    if (radius <= 30) return 12;
    if (radius <= 40) return 11;
    return 10;
  };

  const attemptGeolocation = useCallback((context = 'initial', retries = 3, timeout = 15000) => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const msg = 'Geolocation not supported by your browser.';
        console.warn(msg, { context, timestamp: new Date().toISOString() });
        reject(new Error(msg));
        return;
      }

      const tryPosition = (attempt) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            console.log('Geolocation success:', {
              latitude,
              longitude,
              accuracy,
              attempt,
              context,
              timestamp: new Date().toISOString(),
            });
            resolve([latitude, longitude]);
          },
          (err) => {
            console.error('Geolocation error:', {
              message: err.message,
              code: err.code,
              attempt,
              context,
              timestamp: new Date().toISOString(),
            });
            if (attempt < retries && err.code !== 1) {
              setTimeout(() => tryPosition(attempt + 1), 1000);
            } else {
              reject(err);
            }
          },
          { enableHighAccuracy: true, timeout, maximumAge: 0 }
        );
      };
      tryPosition(1);
    });
  }, []);

  const reverseGeocode = useCallback(async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`
      );
      if (!response.ok) throw new Error(`Nominatim reverse geocoding error: ${response.statusText}`);
      const data = await response.json();
      const placeName = data.display_name || 'Current Location';
      console.log('Reverse geocoding success:', {
        latitude,
        longitude,
        placeName,
        timestamp: new Date().toISOString(),
      });
      return placeName;
    } catch (err) {
      console.error('Reverse geocoding failed:', {
        error: err.message,
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
      });
      return 'Current Location';
    }
  }, []);

  useEffect(() => {
    const tryGeolocation = async () => {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
        console.log('Geolocation permission state:', {
          state: permissionStatus.state,
          context: showMap ? 'map-toggle' : 'initial',
          timestamp: new Date().toISOString(),
        });

        if (permissionStatus.state === 'denied') {
          console.warn('Geolocation permission denied', {
            context: showMap ? 'map-toggle' : 'initial',
            timestamp: new Date().toISOString(),
          });
          alert('Location access denied. Please enable it in browser settings to show your current place.');
          return;
        }

        const [latitude, longitude] = await attemptGeolocation(showMap ? 'map-toggle' : 'initial');
        setUserLocation([latitude, longitude]);
        setMapCenter([latitude, longitude]);
        const placeName = await reverseGeocode(latitude, longitude);
        setUserPlaceName(placeName);
        console.log('Geolocation and reverse geocoding set:', {
          latitude,
          longitude,
          placeName,
          context: showMap ? 'map-toggle' : 'initial',
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        let errorMessage = 'Unable to access your location. Please check your device location settings or search manually.';
        if (err.code === 1) {
          errorMessage = 'Location access denied. Please allow location access to show your current place.';
        } else if (err.code === 2) {
          errorMessage = 'Location information unavailable. Ensure location services are enabled.';
        } else if (err.code === 3) {
          errorMessage = 'Location request timed out. Please try again or search manually.';
        } else if (err.message.includes('not supported')) {
          errorMessage = 'Geolocation is not supported by your browser. Please search manually.';
        }

        console.warn('Geolocation failed:', {
          error: err.message,
          context: showMap ? 'map-toggle' : 'initial',
          timestamp: new Date().toISOString(),
        });
        alert(errorMessage);
      }
    };

    tryGeolocation();
  }, [showMap, attemptGeolocation, reverseGeocode]);

  useEffect(() => {
    if (!userLocation && properties.length > 0 && properties[0].location?.coordinates?.latitude && properties[0].location?.coordinates?.longitude) {
      console.log('Setting map center to first property (fallback):', {
        latitude: properties[0].location.coordinates.latitude,
        longitude: properties[0].location.coordinates.longitude,
        timestamp: new Date().toISOString(),
      });
      setMapCenter([properties[0].location.coordinates.latitude, properties[0].location.coordinates.longitude]);
    }

    const newZoom = getZoomLevel(searchRadius);
    setMapZoom(newZoom);

    if (showMap && userLocation && searchRadius > 0) {
      const radiusKm = searchRadius;
      const filtered = properties.filter((property) => {
        if (!property.location?.coordinates?.latitude || !property.location?.coordinates?.longitude) return false;
        const distance = calculateDistance(
          userLocation[0],
          userLocation[1],
          property.location.coordinates.latitude,
          property.location.coordinates.longitude
        );
        return distance <= radiusKm;
      });
      setFilteredProperties(filtered);
      setTotalPages(Math.ceil(filtered.length / 9));
      console.log('Properties filtered by radius:', {
        radius: radiusKm,
        filteredCount: filtered.length,
        totalProperties: properties.length,
        zoom: newZoom,
        showMap,
        timestamp: new Date().toISOString(),
      });
    } else {
      setFilteredProperties(properties);
      setTotalPages(Math.ceil(properties.length / 9));
      console.log('No radius filter applied:', {
        searchRadius,
        userLocation: !!userLocation,
        filteredCount: properties.length,
        zoom: newZoom,
        showMap,
        timestamp: new Date().toISOString(),
      });
    }
  }, [properties, userLocation, searchRadius, showMap, calculateDistance]);

  return {
    userLocation,
    userPlaceName,
    mapCenter,
    setMapCenter,
    mapZoom,
    filteredProperties,
    totalPages,
    attemptGeolocation,
    reverseGeocode,
  };
}