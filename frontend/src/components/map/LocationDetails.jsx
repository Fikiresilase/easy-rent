import React from 'react';
import { MapSelector } from './MapSelector';

export function LocationDetails({
  locationAddress,
  setLocationAddress,
  locationCity,
  setLocationCity,
  locationState,
  setLocationState,
  showMap,
  setShowMap,
  mapCenter,
  latitude,
  longitude,
  setLatitude,
  setLongitude,
  handleMapClick,
}) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-700 mb-3">Location Details</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 after:content-['*'] after:text-red-600">
            Address
          </label>
          <input
            type="text"
            placeholder="Enter street address"
            value={locationAddress}
            onChange={(e) => setLocationAddress(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 after:content-['*'] after:text-red-600">
              City
            </label>
            <input
              type="text"
              placeholder="Enter city"
              value={locationCity}
              onChange={(e) => setLocationCity(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              placeholder="Enter state"
              value={locationState}
              onChange={(e) => setLocationState(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location Coordinates</label>
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-2 rounded-md shadow-md hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 hover:scale-105"
            title={showMap ? 'Hide map' : 'Select location on map'}
          >
            {showMap ? 'Hide Map' : 'Select Location on Map'}
          </button>
          <MapSelector
            showMap={showMap}
            mapCenter={mapCenter}
            latitude={latitude}
            longitude={longitude}
            handleMapClick={handleMapClick}
          />
          <p className="text-sm text-gray-500 mt-2">
            Selected: Lat {latitude || 'Not set'}, Lng {longitude || 'Not set'}
          </p>
        </div>
      </div>
    </div>
  );
}