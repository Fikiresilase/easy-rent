import React from 'react';

export function GeneralInfo({ title, setTitle, price, setPrice, type, setType, floors, setFloors }) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-700 mb-3">General Information</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 after:content-['*'] after:text-red-600">
            Property Name
          </label>
          <input
            type="text"
            placeholder="Enter property name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 after:content-['*'] after:text-red-600">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select Type</option>
            <option value="villa">Villa</option>
            <option value="condo">Condo</option>
            <option value="apartment">Apartment</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 after:content-['*'] after:text-red-600">
              Price ($/month)
            </label>
            <input
              type="number"
              placeholder="e.g., 1500"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              required
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 after:content-['*'] after:text-red-600">
              Floors
            </label>
            <input
              type="number"
              placeholder="e.g., 2"
              value={floors}
              onChange={(e) => setFloors(e.target.value)}
              min="1"
              required
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}