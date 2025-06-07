import React from 'react';

export function PropertySummary({ image, descriptionData }) {
  return (
    <div className="flex-1 flex flex-col min-w-[320px] max-w-md">
      {image ? (
        <img
          src={URL.createObjectURL(image)}
          alt="Property"
          className="rounded-lg w-full h-[50vh] object-cover mb-4"
        />
      ) : (
        <div className="w-full h-[50vh] bg-gray-200 rounded-lg mb-4 animate-pulse flex items-center justify-center">
          <span className="text-gray-500">No image selected</span>
        </div>
      )}
      <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Property Details</h3>
        <dl className="grid grid-cols-1 gap-y-3 text-sm">
          {descriptionData.map(({ label, value }) => (
            <div key={label} className="flex justify-between">
              <dt className="font-medium text-gray-600">{label}:</dt>
              <dd className="text-gray-900">
                {label === 'Price' || label === 'Area' ? (
                  <span className="font-semibold">{value}</span>
                ) : (
                  value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}