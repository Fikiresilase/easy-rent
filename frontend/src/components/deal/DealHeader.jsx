import React from 'react';

export default function DealHeader({ title, dealStatus, onBack }) {
  return (
    <header className="sticky top-0 bg-gray-50 border-b border-gray-200 w-full py-4 sm:py-6 z-10">
      <div className="max-w-5xl mx-auto px-2 sm:px-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-200 transition"
          aria-label="Go back"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate max-w-[60%] sm:max-w-[70%]">
          {title || 'Deal Status'}
        </h1>
        <span className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full font-medium ${
          dealStatus === 'completed' ? 'bg-green-100 text-green-700' :
          dealStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
          'bg-gray-200 text-gray-700'
        }`}>
          {dealStatus.charAt(0).toUpperCase() + dealStatus.slice(1)}
        </span>
      </div>
    </header>
  );
}