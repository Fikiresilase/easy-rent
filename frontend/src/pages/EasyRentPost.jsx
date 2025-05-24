import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { createProperty } from '../services/property';

export default function EasyRentPost() {
  const { user, token } = useAuth();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [floors, setFloors] = useState('');
  const [area, setArea] = useState('');
  const [parking, setParking] = useState(false);
  const [type, setType] = useState('');
  const [amenities, setAmenities] = useState([]);
  const [locationAddress, setLocationAddress] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [locationState, setLocationState] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [status, setStatus] = useState('available');
  const [image, setImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const availableAmenities = ['WiFi', 'Pool', 'Gym', 'Parking', 'Air Conditioning', 'Heating'];

  // Structured description data
  const descriptionData = [
    { label: 'Title', value: title || 'N/A' },
    { label: 'Type', value: type || 'N/A' },
    { label: 'Price', value: price ? `$${Number(price).toLocaleString()}` : 'N/A' },
    { label: 'Bedrooms', value: bedrooms || 'N/A' },
    { label: 'Bathrooms', value: bathrooms || 'N/A' },
    { label: 'Floors', value: floors || 'N/A' },
    { label: 'Area', value: area ? `${Number(area).toLocaleString()} sqft` : 'N/A' },
    { label: 'Parking', value: parking ? 'Yes' : 'No' },
    {
      label: 'Amenities',
      value: amenities.length ? amenities.join(', ') : 'N/A',
    },
    {
      label: 'Location',
      value:
        locationAddress || locationCity || locationState
          ? `${locationAddress || 'N/A'}, ${locationCity || 'N/A'}, ${locationState || 'N/A'}`
          : 'N/A',
    },
    { label: 'Status', value: status || 'N/A' },
  ];

  const description = descriptionData
    .map(({ label, value }) => `${label}: ${value}`)
    .join(' | ');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!user?.id) {
      setError('You must be logged in to post a property');
      setLoading(false);
      return;
    }

    try {
      const data = {
        ownerId: user.id,
        title,
        description,
        type,
        price: Number(price),
        floors: Number(floors),
        parking,
        specifications: {
          bedrooms: Number(bedrooms),
          bathrooms: Number(bathrooms),
          area: Number(area),
          parking,
        },
        location: {
          address: locationAddress,
          city: locationCity,
          state: locationState,
          coordinates: {
            latitude: latitude ? Number(latitude) : undefined,
            longitude: longitude ? Number(longitude) : undefined,
          },
        },
        amenities,
        status,
      };

      const formData = new FormData();
      formData.append('data', JSON.stringify(data));
      if (image) formData.append('images', image);

      await createProperty(formData, token);

      setSuccess(`Property "${title}" posted successfully!`);
      setTitle('');
      setPrice('');
      setBedrooms('');
      setBathrooms('');
      setFloors('');
      setArea('');
      setParking(false);
      setType('');
      setAmenities([]);
      setLocationAddress('');
      setLocationCity('');
      setLocationState('');
      setLatitude('');
      setLongitude('');
      setStatus('available');
      setImage(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center items-center py-12">
      <div className="bg-white rounded-2xl shadow p-8 flex flex-col md:flex-row gap-8 w-full max-w-5xl">
        <form className="flex-1 space-y-4 min-w-[320px]" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold mb-6">Describe Your Property</h2>
          {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
          {success && <div className="text-green-600 text-sm mb-2">{success}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Name *</label>
            <input
              type="text"
              placeholder="Enter Property Name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B5ED6]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B5ED6]"
            >
              <option value="">Select Type</option>
              <option value="villa">Villa</option>
              <option value="condo">Condo</option>
              <option value="apartment">Apartment</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price ($/month) *</label>
            <input
              type="number"
              placeholder="Price for the home"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B5ED6]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms *</label>
            <input
              type="number"
              placeholder="Number of Bedrooms"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              min="0"
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B5ED6]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms *</label>
            <input
              type="number"
              placeholder="Number of Bathrooms"
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
              min="0"
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B5ED6]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Floors *</label>
            <input
              type="number"
              placeholder="Number of Floors"
              value={floors}
              onChange={(e) => setFloors(e.target.value)}
              min="1"
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B5ED6]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Area (sqft) *</label>
            <input
              type="number"
              placeholder="Area in square feet"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              min="0"
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B5ED6]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parking</label>
            <input
              type="checkbox"
              checked={parking}
              onChange={(e) => setParking(e.target.checked)}
              className="h-4 w-4 text-[#3B5ED6] focus:ring-[#3B5ED6] border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Available</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
            <select
              multiple
              value={amenities}
              onChange={(e) => setAmenities(Array.from(e.target.selectedOptions, (option) => option.value))}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B5ED6]"
            >
              {availableAmenities.map((amenity) => (
                <option key={amenity} value={amenity}>
                  {amenity}
                </option>
              ))}
            </select>
            {amenities.length > 0 && (
              <span className="text-xs text-gray-500 mt-1 block">Selected: {amenities.join(', ')}</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <input
              type="text"
              placeholder="Enter Address"
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B5ED6]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input
              type="text"
              placeholder="Enter City"
              value={locationCity}
              onChange={(e) => setLocationCity(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B5ED6]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              placeholder="Enter State"
              value={locationState}
              onChange={(e) => setLocationState(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B5ED6]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
            <input
              type="number"
              placeholder="Enter Latitude (optional)"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              step="any"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B5ED6]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
            <input
              type="number"
              placeholder="Enter Longitude (optional)"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              step="any"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B5ED6]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B5ED6]"
            >
              <option value="available">Available</option>
              <option value="rented">Rented</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full"
            />
            {image && (
              <span className="text-xs text-gray-500 mt-1 block">
                {image.name} ({(image.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3B5ED6] text-white text-xl rounded-md py-2 mt-2 hover:bg-[#2746a3] transition disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : null}
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </form>

        <div className="flex-1 flex flex-col items-center min-w-[320px]">
          {image ? (
            <img
              src={URL.createObjectURL(image)}
              alt="Property"
              className="rounded-lg w-full h-[50vh] object-cover mb-4"
            />
          ) : (
            <div className="w-full h-[50vh] bg-gray-200 rounded-lg mb-4 animate-pulse flex items-center justify-center">
              <span className="text-gray-500">No image selected</span>
            </div>
          )}
          <div className="w-full mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Property Summary</h3>
              <dl className="grid grid-cols-1 gap-y-2 text-sm">
                {descriptionData.map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <dt className="font-medium text-gray-600">{label}:</dt>
                    <dd className="text-gray-800">
                      {label === 'Price' || label === 'Area' ? (
                        <span className="font-semibold">{value}</span>
                      ) : (
                        value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}