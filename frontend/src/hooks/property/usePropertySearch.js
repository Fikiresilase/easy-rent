import { useState, useEffect, useCallback } from 'react';
import { fetchProperties } from '../../services/property';

export function usePropertySearch() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [location, setLocation] = useState('');
  const [floors, setFloors] = useState('');
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProps = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: page,
        limit: 9,
      };
      if (category) params.type = category.toLowerCase(); // Normalize to lowercase
      if (minPrice) params.minPrice = parseFloat(minPrice);
      if (maxPrice) params.maxPrice = parseFloat(maxPrice);
      if (location) params.location = location;
      if (floors) params.floors = parseInt(floors);
      if (search) params.q = search;

      console.log('Fetching properties with params:', {
        params,
        activeFilters: { category, minPrice, maxPrice, location, floors, search },
        timestamp: new Date().toISOString(),
      });

      const data = await fetchProperties(params);

      console.log('Received properties data:', {
        data,
        isArray: Array.isArray(data),
        hasPropertiesField: !!data.properties,
        propertiesCount: data.properties ? data.properties.length : (Array.isArray(data) ? data.length : 0),
        total: data.total || 0,
        timestamp: new Date().toISOString(),
      });

      let fetchedProperties = [];
      let total = 0;

      if (Array.isArray(data)) {
        fetchedProperties = data;
        total = data.length;
      } else if (data.properties && Array.isArray(data.properties)) {
        fetchedProperties = data.properties;
        total = data.total || data.properties.length;
      } else {
        console.warn('Unexpected response format:', data);
        fetchedProperties = [data];
        total = 0;
      }

      console.log('Processed properties:', {
        fetchedPropertiesCount: fetchedProperties.length,
        total,
        sampleProperties: fetchedProperties.slice(0, 2), // Log first two properties for debugging
        timestamp: new Date().toISOString(),
      });

      if (fetchedProperties.length === 0 && page === 1) {
        setError(
          category || minPrice || maxPrice || location || floors || search
            ? 'No properties match your filters.'
            : 'No properties available in the database.'
        );
      } else {
        setError('');
      }

      setProperties(fetchedProperties);
      setFilteredProperties(fetchedProperties);
      setTotalPages(Math.ceil(total / 9) || 1);
    } catch (err) {
      console.error('Error fetching properties:', {
        error: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
      });
      setError('Failed to load properties. Please check your connection or try again later.');
      setProperties([]);
      setFilteredProperties([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [category, minPrice, maxPrice, location, floors, search, page]);

  useEffect(() => {
    fetchProps();
  }, [fetchProps]);

  return {
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
  };
}