import React from 'react';

export default function DealSuccessCard({ visible }) {
  return (
    visible && (
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 flex items-center gap-2 sm:gap-4 w-full max-w-3xl mb-4 sm:mb-6 bg-gradient-to-br from-white to-gray-50 animate-fade-in-up">
        <svg className="w-6 sm:w-8 h-6 sm:h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M9 12l2 2 4-4" />
        </svg>
        <span className="text-sm sm:text-lg font-semibold text-gray-700">
          Your deal was successful
        </span>
      </div>
    )
  );
}