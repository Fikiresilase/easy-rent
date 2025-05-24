import React, { useState, useEffect } from 'react';
import { fetchProperties } from '../services/property';
import { Link, useNavigate } from 'react-router-dom';

export default function EasyRentExplore() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [location, setLocation] = useState('');
  const [floors, setFloors] = useState('');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    priceRange: [0, 10000],
    propertyType: 'all',
    bedrooms: 'all',
    bathrooms: 'all',
    amenities: [],
  });

  useEffect(() => {
    fetchProps();
  }, [category, minPrice, maxPrice, location, floors, search, page]);

  const fetchProps = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (category) params.type = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (location) params.location = location;
      if (floors) params.floors = floors;
      if (search) params.q = search;
      params.page = page;
      params.limit = 9;

      console.log('Fetching properties with params:', {
        params,
        timestamp: new Date().toISOString(),
      });

      const data = await fetchProperties(params);

      console.log('Received properties data:', {
        dataType: typeof data,
        properties: Array.isArray(data?.properties)
          ? data.properties.map(p => ({
              _id: p._id,
              title: p.title,
              images: p.images,
            }))
          : data,
        totalPages: data?.totalPages,
        timestamp: new Date().toISOString(),
      });

      if (Array.isArray(data?.properties)) {
        setProperties(data.properties);
        setTotalPages(data.totalPages || 1);
      } else if (Array.isArray(data)) {
        setProperties(data);
        setTotalPages(1);
      } else if (typeof data === 'object' && data !== null && data._id) {
        setProperties([data]);
        setTotalPages(1);
      } else {
        setProperties([]);
        setTotalPages(1);
        console.warn('Invalid properties data received:', {
          data,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Error fetching properties:', {
        error: err.message,
        response: err.response?.data,
        status: err.response?.status,
        timestamp: new Date().toISOString(),
      });
      setError('Failed to load properties');
      setProperties([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyClick = (propertyId) => {
    navigate(`/easyrent-chat/${propertyId}`);
  };

  
  const defaultImage = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb';
  const baseUrl = 'http://localhost:5000';

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-6 mt-4 px-2">
        <div className="flex-1 flex items-center max-w-md w-full">
          <input
            type="text"
            placeholder="Search for homes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B5ED6] bg-white text-gray-900 placeholder-gray-500"
          />
          <button className="-ml-10 z-10 text-[#3B5ED6] hover:text-[#2746a3]">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>
        </div>
        <div className="relative w-full md:w-auto">
          <button
            className="flex items-center justify-between w-full md:w-36 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm font-medium focus:outline-none hover:bg-gray-50 transition"
            onClick={() => setFilterOpen((f) => !f)}
          >
            Filter
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {filterOpen && (
            <div className="absolute right-0 mt-1 w-60 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-3">
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#3B5ED6]"
                >
                  <option value="">All</option>
                  <option value="villa">Villa</option>
                  <option value="condo">Condo</option>
                  <option value="apartment">Apartment</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="mb-2 flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Price
                  </label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#3B5ED6]"
                    placeholder="Min"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Price
                  </label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#3B5ED6]"
                    placeholder="Max"
                  />
                </div>
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#3B5ED6]"
                  placeholder="Enter location"
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Floors
                </label>
                <input
                  type="number"
                  value={floors}
                  onChange={(e) => setFloors(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#3B5ED6]"
                  placeholder="e.g. 2"
                />
              </div>
              <button
                className="w-full mt-1 bg-[#3B5ED6] text-white rounded-md py-1.5 hover:bg-[#2746a3] transition font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  setFilterOpen(false);
                  fetchProps();
                }}
              >
                Apply Filters
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-8">
        {loading ? (
          <div className="col-span-full text-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B5ED6] mx-auto"></div>
            <p className="mt-2 text-gray-600 text-sm">Loading properties...</p>
          </div>
        ) : error ? (
          <div className="col-span-full text-center py-6 text-red-500 text-sm">{error}</div>
        ) : properties.length === 0 ? (
          <div className="col-span-full text-center py-6 text-gray-500 text-sm">
            No properties found matching your criteria
          </div>
        ) : (
          properties.map((property) => (
            <div
              key={property._id}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
              onClick={() => handlePropertyClick(property._id)}
            >
              <img
                src={property.images?.[0]?.url ? `${baseUrl}/${property.images[0].url}` : defaultImage}
                alt={property.title || 'Property'}
                className="w-full h-40 object-cover"
              />
              <div className="p-3">
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  {property.title || 'Untitled Property'}
                </h3>
                <p className="text-gray-600 text-xs mb-1.5">
                  {property.location?.address || 'No address provided'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[#3B5ED6] font-bold text-sm">
                    ${property.price?.toLocaleString() || 'N/A'}/month
                  </span>
                  <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                    <span>
                      {property.specifications?.bedrooms || property.bedrooms || 'N/A'} Beds
                    </span>
                    <span className="text-gray-400">•</span>
                    <span>
                      {property.specifications?.bathrooms || property.bathrooms || 'N/A'} Bath
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="flex justify-center items-center mb-10">
        <nav className="flex items-center gap-1.5 bg-white rounded-lg shadow-sm px-5 py-2.5">
          <button
            className="text-[#3B5ED6] p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                page === num
                  ? 'bg-[#3B5ED6] text-white'
                  : 'text-[#3B5ED6] hover:bg-gray-100'
              }`}
              onClick={() => setPage(num)}
            >
              {num}
            </button>
          ))}
          <button
            className="text-[#3B5ED6] p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  );
}