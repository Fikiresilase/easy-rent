import React from 'react';

export function FilterPanel({
  filterOpen,
  setFilterOpen,
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
  handleFilterChange,
}) {
  return (
    <div className="relative">
      <button
        className="flex items-center justify-between w-32 px-4 py-2.5 bg-white border border-gray-300 rounded-md text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium"
        onClick={() => setFilterOpen(!filterOpen)}
        title="Toggle filters"
      >
        Filter
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`absolute right-0 mt-2 w-full sm:w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-6 overflow-hidden transition-all duration-300 ${
          filterOpen ? 'max-h-[50rem] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Properties</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => handleFilterChange(setCategory, e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2.5 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All</option>
              <option value="villa">Villa</option>
              <option value="condo">Condo</option>
              <option value="apartment">Apartment</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => handleFilterChange(setMinPrice, e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2.5 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Min ($)"
                min="0"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => handleFilterChange(setMaxPrice, e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2.5 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Max ($)"
                min="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => handleFilterChange(setLocation, e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2.5 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter city or area"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Floors</label>
            <input
              type="number"
              value={floors}
              onChange={(e) => handleFilterChange(setFloors, e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2.5 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., 2"
              min="0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}