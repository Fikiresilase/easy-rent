import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export function MapViewUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] !== 0 && center[1] !== 0) {
      map.setView(center, zoom, { animate: true });
      console.log('Map view updated:', {
        center,
        zoom,
        timestamp: new Date().toISOString(),
      });
    }
  }, [map, center, zoom]);
  return null;
}