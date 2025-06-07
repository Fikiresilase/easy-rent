import React from 'react';

export function SearchBar({ search, setSearch, onSearch }) {
  return (
    <div className="flex-1 flex items-center max-w-md w-full relative">
      <input
        type="text"
        placeholder="Search by keyword, address..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyPress={(e) => { if (e.key === 'Enter') onSearch(); }}
        className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-500"
      />
      <button
        onClick={onSearch}
        className="absolute right-2 text-indigo-600 hover:text-indigo-800 p-2"
        aria-label="Search properties"
        title="Search"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M18 18l-4-4" />
        </svg>
      </button>
    </div>
  );
}