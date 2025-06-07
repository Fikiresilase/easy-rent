import React from 'react';

export function ErrorMessage({ message }) {
  return (
    <div className="col-span-full text-center py-8 text-red-500">
      {message}
    </div>
  );
}