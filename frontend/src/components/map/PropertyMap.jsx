import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapViewUpdater } from './MapViewUpdater';

const homeIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/25/25694.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

export default function PropertyMap({
  showMap,
  mapCenter,
  mapZoom,
  userLocation,
  userPlaceName,
  filteredProperties,
  mapSearch,
  setMapSearch,
  handleMapPageSearch,
  setShowMap,
  handlePropertyClick,
  user,
  baseUrl,
  defaultImage,
  searchRadius,
  setSearchRadius,
})

{
  return (
    <div
      className={`mb-0 bg-white border border-gray-200 rounded-xl shadow-lg p-6 transition-all duration-300 ${
        showMap ? 'max-h-[32rem] opacity-100' : 'hidden '
      }`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
        <div className="flex flex-col w-full sm:flex-row sm:items-center gap-4 flex-grow">
          <form onSubmit={handleMapPageSearch} className="flex items-center gap-3 w-full sm:w-auto max-w-md">
            <input
              type="text"
              placeholder="Search location on map..."
              value={mapSearch}
              onChange={(e) => setMapSearch(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-500"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-2.5 rounded-md shadow-md hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 hover:scale-105"
              title="Search map location"
            >
              Search
            </button>
          </form>
          <div className="flex flex-col gap-2 w-full sm:w-64">
            <label className="text-sm font-medium text-gray-700">
              Search Radius: {searchRadius} km
            </label>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={searchRadius}
              onChange={(e) => setSearchRadius(parseInt(e.target.value))}
              disabled={!userLocation}
              title={!userLocation ? 'Enable location to use radius filter' : `Adjust search radius (${searchRadius} km)`}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>
        <button
          onClick={() => setShowMap(false)}
          className="bg-red-500 text-white px-6 py-2.5 rounded-md shadow-md hover:bg-red-600 transition-all duration-200 hover:scale-105"
          title="Close map"
        >
          Close Map
        </button>
      </div>
      <div className="h-80 sm:h-96 rounded-lg overflow-hidden">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
          key={mapCenter.join(',')}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapViewUpdater center={mapCenter} zoom={mapZoom} />
          {userLocation && (
            <Marker
              position={userLocation}
              icon={L.icon({
                iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
                shadowSize: [41, 41],
              })}
            >
              <Popup>{userPlaceName}</Popup>
            </Marker>
          )}
          {filteredProperties.map((property) => (
            property.location?.coordinates?.latitude && property.location?.coordinates?.longitude && (
              <Marker
                key={property._id}
                position={[property.location.coordinates.latitude, property.location.coordinates.longitude]}
                icon={homeIcon}
              >
                <Popup>
                  <div className="text-sm w-56">
                    {property.images?.[0]?.url && (
                      <img
                        src={`${baseUrl}/${property.images[0].url.replace(/\\/g, '/')}`}
                        alt={property.title || 'Property'}
                        className="w-full h-32 object-cover rounded-t-md mb-2"
                        onError={(e) => { e.target.src = defaultImage; }}
                      />
                    )}
                    <h3 className="font-semibold text-lg mb-0.5 truncate" title={property.title}>
                      {property.title || 'Property Details'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-0.5 truncate" title={property.location.address}>
                      {property.location.address || 'Address not specified'}
                    </p>
                    <p className="text-base font-bold text-indigo-600 mb-1.5">
                      ${property.price?.toLocaleString() || 'N/A'}/month
                    </p>
                    <button
                      className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-1.5 px-3 rounded-md shadow-sm hover:from-indigo-600 hover:to-indigo-700 transition-all text-sm"
                      onClick={() => handlePropertyClick(property)}
                      title={user && user.id === property.ownerId ? 'Edit this property' : 'Chat about this property'}
                    >
                      {user && user.id === property.ownerId ? 'Edit Property' : 'Chat'}
                    </button>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      </div>
    </div>
  );
}