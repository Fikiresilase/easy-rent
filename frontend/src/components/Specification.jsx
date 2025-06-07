import React from 'react';

export function Specifications({
  bedrooms,
  setBedrooms,
  bathrooms,
  setBathrooms,
  area,
  setArea,
  parking,
  setParking,
  amenities,
  setAmenities,
  status,
  setStatus,
  availableAmenities,
  handleAmenityChange,
}) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-700 mb-3">Property Specifications</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 after:content-['*'] after:text-red-600">
              Bedrooms
            </label>
            <input
              type="number"
              placeholder="e.g., 3"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              min="0"
              required
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 after:content-['*'] after:text-red-600">
              Bathrooms
            </label>
            <input
              type="number"
              placeholder="e.g., 2"
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
              min="0"
              required
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 after:content-['*'] after:text-red-600">
              Area (sqft)
            </label>
            <input
              type="number"
              placeholder="e.g., 1200"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              min="0"
              required
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parking</label>
          <input
            type="checkbox"
            checked={parking}
            onChange={(e) => setParking(e.target.checked)}
            className="h-4 w-4 accent-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Available</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
          <div className="grid grid-cols-2 gap-2">
            {availableAmenities.map((amenity) => (
              <label key={amenity} className="flex items-center text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={amenities.includes(amenity)}
                  onChange={() => handleAmenityChange(amenity)}
                  className="h-4 w-4 accent-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2">{amenity}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 after:content-['*'] after:text-red-600">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="available">Available</option>
            <option value="rented">Rented</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>
    </div>
  );
}