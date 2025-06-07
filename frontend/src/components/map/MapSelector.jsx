import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const homeIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/25/25694.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

function MapClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onClick(lat, lng);
    },
    tileerror(err) {
      console.error('Tile loading error:', {
        error: err.message,
        url: err.tile?.src,
        timestamp: new Date().toISOString(),
      });
    },
  });
  return null;
}

export function MapSelector({ showMap, mapCenter, latitude, longitude, handleMapClick }) {
  return (
    <div
      className={`mt-4 overflow-hidden rounded-md border border-gray-200 shadow-sm transition-all duration-300 ${
        showMap ? 'max-h-[20rem] opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      {showMap && (
        <div className="h-64 sm:h-80">
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {latitude && !isNaN(parseFloat(latitude)) && longitude && !isNaN(parseFloat(longitude)) && (
              <Marker position={[parseFloat(latitude), parseFloat(longitude)]} icon={homeIcon} />
            )}
            <MapClickHandler onClick={handleMapClick} />
          </MapContainer>
        </div>
      )}
    </div>
  );
}