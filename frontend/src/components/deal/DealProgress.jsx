import React from 'react';

export default function DealProgress({ progress }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-1 h-12 sm:h-16 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="bg-indigo-600 h-full transition-all duration-500"
          style={{ height: `${progress}%` }}
        />
      </div>
    </div>
  );
}