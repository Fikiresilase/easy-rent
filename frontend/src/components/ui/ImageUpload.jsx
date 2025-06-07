import React from 'react';

export function ImageUpload({ image, handleImageChange }) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-700 mb-3">Property Image</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        {image && (
          <span className="text-xs text-gray-500 mt-1 block">
            {image.name} ({(image.size / 1024 / 1024).toFixed(2)} MB)
          </span>
        )}
      </div>
    </div>
  );
}