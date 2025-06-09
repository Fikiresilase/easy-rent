import React from 'react';
import { useNavigate } from 'react-router-dom';

export function ChatHeader({ propertyTitle, dealStatus, handleDealClick, propertyFetched }) {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between rounded-t-xl z-10">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-200 transition"
          aria-label="Go back"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-900 truncate max-w-[60%] sm:max-w-[70%]">
          {propertyFetched ? propertyTitle : 'Loading...'}
        </h2>
      </div>
      
    </div>
  );
}