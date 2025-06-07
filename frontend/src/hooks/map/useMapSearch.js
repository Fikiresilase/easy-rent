import { useState } from 'react';

export function useMapSearch(setLocation, fetchProps, setPage, setMapCenter) {
  const [mapSearch, setMapSearchState] = useState('');
  const [showMap, setShowMap] = useState(false);

  const geocodeSearchTerm = async (term) => {
    if (!term || !term.trim()) {
      throw new Error('Search term is empty.');
    }
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(term)}&format=json&limit=1`
      );
      if (!response.ok) throw new Error(`Nominatim API error: ${response.statusText}`);
      const data = await response.json();
      if (data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      } else {
        throw new Error(`Location "${term}" not found.`);
      }
    } catch (err) {
      console.error('Error geocoding search term:', term, err);
      throw err;
    }
  };

  const handleMapPageSearch = async (e, mapCenterSetter = setMapCenter) => {
    e.preventDefault();
    if (!mapSearch.trim()) {
      alert('Please enter a location to search on the map.');
      return;
    }
    try {
      const coords = await geocodeSearchTerm(mapSearch);
      if (mapCenterSetter) mapCenterSetter(coords);
      setLocation(mapSearch);
      console.log('Map search successful:', {
        coords,
        searchTerm: mapSearch,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Map search failed:', {
        error: err.message,
        searchTerm: mapSearch,
        timestamp: new Date().toISOString(),
      });
      alert(`Failed to find location: ${err.message}. Please try a different search term.`);
    }
  };

  const handleSearchIconClick = async (search, mapCenterSetter = setMapCenter) => {
    if (!search.trim()) {
      return;
    }

    setPage(1);

    if (showMap) {
      try {
        console.log('Main search icon clicked with map shown, geocoding:', {
          term: search,
          timestamp: new Date().toISOString(),
        });
        const coords = await geocodeSearchTerm(search);
        if (mapCenterSetter) mapCenterSetter(coords);
        setLocation(search);
        setMapSearchState(search);
        console.log('Map search successful:', {
          coords,
          searchTerm: search,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Main search failed:', {
          error: err.message,
          searchTerm: search,
          timestamp: new Date().toISOString(),
        });
        alert(`Failed to find location: ${err.message}. Please try a different term.`);
      }
    } else {
      console.log('Main search triggered (map hidden):', {
        term: search,
        timestamp: new Date().toISOString(),
      });
      fetchProps();
    }
  };

  const handleShowMap = () => {
    setShowMap(true);
  };

  return {
    mapSearch,
    setMapSearch: setMapSearchState,
    showMap,
    setShowMap,
    handleMapPageSearch,
    handleSearchIconClick,
    handleShowMap,
  };
}