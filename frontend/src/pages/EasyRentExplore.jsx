import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { useAuthContext } from '../contexts/AuthContext';
import { usePropertySearch } from '../hooks/property/usePropertySearch';
import { useGeolocation } from '../hooks/map/useGeolocation';
import { useMapSearch } from '../hooks/map/useMapSearch';
import { useFilterPanel } from '../hooks/ui/useFilterPanel';
import { useDebounce } from '../hooks/ui/useDebounce';
import { SearchBar } from '../components/ui/SearchBar';
import { FilterPanel } from '../components/ui/FilterPanel';
import  PropertyMap  from '../components/map/PropertyMap';
import { PropertyCard } from '../components/property/PropertyCard';
import { Pagination } from '../components/ui/Pagination';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { EmptyState } from '../components/ui/EmptyState';
import 'leaflet/dist/leaflet.css';

// Ensure default marker icon is set
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function EasyRentExplore() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const {
    search,
    setSearch,
    category,
    setCategory,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    location,
    setLocation,
    floors,
    setFloors,
    properties,
    setProperties,
    filteredProperties,
    setFilteredProperties,
    loading,
    error,
    page,
    setPage,
    totalPages,
    fetchProps,
  } = usePropertySearch();
  const [searchRadius, setSearchRadius] = useState(10);
  const debouncedSearchRadius = useDebounce(searchRadius, 300);
  const {
    mapSearch,
    setMapSearch,
    showMap,
    setShowMap,
    handleMapPageSearch,
    handleSearchIconClick,
    handleShowMap,
  } = useMapSearch(setLocation, fetchProps, setPage, null);
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    console.log('Distance calculated:', {
      lat1,
      lon1,
      lat2,
      lon2,
      distance: distance.toFixed(2),
      timestamp: new Date().toISOString(),
    });
    return distance;
  }, []);
  const {
    userLocation,
    userPlaceName,
    mapCenter,
    setMapCenter,
    mapZoom,
    filteredProperties: geoFilteredProperties,
    totalPages: geoTotalPages,
  } = useGeolocation(properties, showMap, debouncedSearchRadius, calculateDistance);
  const { filterOpen, setFilterOpen, handleFilterChange } = useFilterPanel({
    setPage,
    fetchProps,
  });

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handlePropertyClick = (property) => {
    console.error(property)
    if (user && user.id === property.ownerId) {
      console.error(property)
      navigate(`/easyrent-editPost/${property._id}`);
    } else {
      
      navigate(`/easyrent-chat/${property._id}`);
      
    }
  };

  const displayProperties = showMap ? geoFilteredProperties : filteredProperties;
  const displayTotalPages = showMap ? geoTotalPages : totalPages;

  return (
    <div className="container mx-auto px-4 py-6 relative">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
        </div>
      )}
      <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Explore Properties</h1>
      {error && <ErrorMessage message={error} />}
      <div className="flex flex-col md:flex-row items-center justify-between gap-2 mb-8">
        <SearchBar
          search={search}
          setSearch={setSearch}
          onSearch={() => handleSearchIconClick(search, setMapCenter)}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={handleShowMap}
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-2 rounded-md shadow-md hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 hover:scale-105"
            title={mapSearch ? 'Update map location' : 'Search properties on map'}
          >
            {mapSearch ? 'Update Map' : 'Search on Map'}
          </button>
          <FilterPanel
            filterOpen={filterOpen}
            setFilterOpen={setFilterOpen}
            category={category}
            setCategory={setCategory}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            location={location}
            setLocation={setLocation}
            floors={floors}
            setFloors={setFloors}
            handleFilterChange={handleFilterChange}
          />
        </div>
      </div>
      <PropertyMap
        showMap={showMap}
        mapCenter={mapCenter}
        mapZoom={mapZoom}
        userLocation={userLocation}
        userPlaceName={userPlaceName}
        filteredProperties={geoFilteredProperties}
        mapSearch={mapSearch}
        setMapSearch={setMapSearch}
        handleMapPageSearch={(e) => handleMapPageSearch(e, setMapCenter)}
        setShowMap={setShowMap}
        handlePropertyClick={handlePropertyClick}
        user={user}
        baseUrl={baseUrl}
        searchRadius={searchRadius}
        setSearchRadius={setSearchRadius}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {loading ? (
          <LoadingSpinner message="Loading properties..." />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : displayProperties.length === 0 ? (
          <EmptyState
            message={
              showMap && userLocation && searchRadius > 0
                ? `No properties found within ${searchRadius} km. Try increasing the radius or adjusting filters.`
                : !search && !category && !minPrice && !maxPrice && !location && !floors
                ? 'No properties available. Check back later or add new properties.'
                : 'No properties found. Try adjusting your search or filters.'
            }
          />
        ) : (
          displayProperties.map((property) => (
            <PropertyCard
              key={property._id}
              post={property}
              user={user}
              onClick={handlePropertyClick}
              baseUrl={baseUrl}
            />
          ))
        )}
      </div>
      
        <Pagination page={page} totalPages={2} setPage={setPage} />
      
    </div>
  );
}