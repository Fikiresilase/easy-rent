import React from 'react';

export function LoadingSpinner({ message = 'Loading...', visible }) {
  console.warn()
  return (
    <div className={` ${!visible ? 'hidden':'col-span-full text-center py-8'}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B5ED6] mx-auto"></div>
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
}