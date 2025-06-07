import React from 'react';

export function EmptyState({ message }) {
  return (
    <div className="col-span-full text-center py-8 text-gray-500">
      {message}
    </div>
  );
}