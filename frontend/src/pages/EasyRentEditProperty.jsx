import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { fetchPropertyById, updateProperty } from '../services/property';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom home icon for property marker
const homeIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/25/25694.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

export default function EasyRentEditProperty() {
  const { user } = useAuthContext();
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    price: '',
    floors: '',
    location: {
      address: '',
      city: '',
      lat: '',
      lng: '',
    },
    specifications: {
      bedrooms: '',
      bathrooms: '',
      area: '',
    },
    images: [],
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState([9.03, 38.74]); // Fallback: Addis Ababa

  useEffect(() => {
    // Get user's location
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

    // Fetch property
    const fetchProperty = async () => {
      try {
        const property = await fetchPropertyById(propertyId);
        if (!user || user.id !== property.ownerId.toString()) {
          console.warn('Unauthorized access attempt:', {
            userId: user?.id,
            ownerId: property.ownerId,
            propertyId,
            timestamp: new Date().toISOString(),
          });
          alert('You are not authorized to edit this property.');
          navigate('/easyrent-explore');
          return;
        }
        setFormData({
          title: property.title || '',
          description: property.description || '',
          type: property.type || '',
          price: property.price || '',
          floors: property.floors || '',
          location: {
            address: property.location?.address || '',
            city: property.location?.city || '',
            lat: property.location?.lat || '',
            lng: property.location?.lng || '',
          },
          specifications: {
            bedrooms: property.specifications?.bedrooms || '',
            bathrooms: property.specifications?.bathrooms || '',
            area: property.specifications?.area || '',
          },
          images: property.images || [],
        });
        if (property.location?.lat && property.location?.lng) {
          setMapCenter([parseFloat(property.location.lat), parseFloat(property.location.lng)]);
        }
        console.log('Property fetched for editing:', {
          propertyId,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Error fetching property:', {
          error: err.message,
          propertyId,
          timestamp: new Date().toISOString(),
        });
        setError('Failed to load property details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [propertyId, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('location.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, [field]: value },
      }));
    } else if (name.includes('specifications.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        specifications: { ...prev.specifications, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...e.target.files],
    }));
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleMapClick = (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, lat, lng },
    }));
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        handleMapClick(lat, lng);
        console.log('Map clicked:', { lat, lng, timestamp: new Date().toISOString() });
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (!formData.location.lat || !formData.location.lng) {
        throw new Error('Please select a location on the map.');
      }
      await updateProperty(propertyId, formData);
      console.log('Property updated successfully:', {
        propertyId,
        timestamp: new Date().toISOString(),
      });
      alert('Property updated successfully!');
      navigate('/easyrent-explore');
    } catch (err) {
      console.error('Error updating property:', {
        error: err.message,
        propertyId,
        timestamp: new Date().toISOString(),
      });
      setError(err.message || 'Failed to update property. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 text-lg">Loading property details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {submitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
        </div>
      )}
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Edit Property</h1>
      {error && (
        <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md max-w-3xl mx-auto">
          {error}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg max-w-3xl mx-auto space-y-8"
      >
        {/* General Information */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">General Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 after:content-['*'] after:text-red-500">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md py-2.5 px-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter property title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 after:content-['*'] after:text-red-500">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md py-2.5 px-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows="5"
                placeholder="Describe your property"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 after:content-['*'] after:text-red-500">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md py-2.5 px-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select Property Type</option>
                <option value="villa">Villa</option>
                <option value="condo">Condo</option>
                <option value="apartment">Apartment</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 after:content-['*'] after:text-red-500">
                  Price ($/month)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2.5 px-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., 1500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 after:content-['*'] after:text-red-500">
                  Number of Floors
                </label>
                <input
                  type="number"
                  name="floors"
                  value={formData.floors}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2.5 px-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., 2"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location Details */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Location Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 after:content-['*'] after:text-red-500">
                Address
              </label>
              <input
                type="text"
                name="location.address"
                value={formData.location.address}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md py-2.5 px-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter street address"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 after:content-['*'] after:text-red-500">
                City
              </label>
              <input
                type="text"
                name="location.city"
                value={formData.location.city}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md py-2.5 px-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter city"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 after:content-['*'] after:text-red-500">
                Location Coordinates
              </label>
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-2.5 rounded-md shadow-md hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 hover:scale-105"
                title={showMap ? 'Hide map' : 'Select location on map'}
              >
                {showMap ? 'Hide Map' : 'Select Location on Map'}
              </button>
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
                      {formData.location.lat &&
                        !isNaN(parseFloat(formData.location.lat)) &&
                        formData.location.lng &&
                        !isNaN(parseFloat(formData.location.lng)) && (
                          <Marker
                            position={[parseFloat(formData.location.lat), parseFloat(formData.location.lng)]}
                            icon={homeIcon}
                          />
                        )}
                      <MapClickHandler />
                    </MapContainer>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Selected: Lat {formData.location.lat || 'Not set'}, Lng {formData.location.lng || 'Not set'}
              </p>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Property Specifications</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 after:content-['*'] after:text-red-500">
                Bedrooms
              </label>
              <input
                type="number"
                name="specifications.bedrooms"
                value={formData.specifications.bedrooms}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md py-2.5 px-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., 3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 after:content-['*'] after:text-red-500">
                Bathrooms
              </label>
              <input
                type="number"
                name="specifications.bathrooms"
                value={formData.specifications.bathrooms}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md py-2.5 px-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., 2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 after:content-['*'] after:text-red-500">
                Area (sq ft)
              </label>
              <input
                type="number"
                name="specifications.area"
                value={formData.specifications.area}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md py-2.5 px-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., 1200"
                required
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Property Images</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border border-gray-300 rounded-md py-2.5 px-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {formData.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={
                        img instanceof File
                          ? URL.createObjectURL(img)
                          : img.url
                          ? `${import.meta.env.VITE_API_URL}/${img.url.replace(/\\/g, '/')}`
                          : `${import.meta.env.VITE_API_URL}/${img.replace(/\\/g, '/')}`
                      }
                      alt="Property"
                      className="w-full h-32 object-cover rounded-md shadow-sm group-hover:opacity-80 transition-opacity"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title="Remove image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/easyrent-explore')}
            className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-md shadow-md hover:bg-gray-300 transition-all duration-200 hover:scale-105"
            title="Cancel and return to explore"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-2.5 rounded-md shadow-md hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 hover:scale-105 ${
              submitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}