import React from 'react';

export default function UserStatus({ user, status, isOwner, canMakeDeal, onSignDeal, selectedRenterId, setSelectedRenterId }) {
  return (
    <div className="flex flex-col items-center">
      <div className="h-16 sm:h-20 lg:h-24 w-16 sm:w-20 lg:w-24 flex items-center justify-center rounded-full bg-indigo-600 text-white text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 ring-2 ring-indigo-600 hover:scale-105 transition-transform">
        {user.avatar}
      </div>
      <div className="font-bold text-gray-900 text-sm sm:text-base lg:text-lg text-center">
        {user.name}
      </div>
      {canMakeDeal ? (
        <>
          {isOwner && (
            <select
              value={selectedRenterId || ''}
              onChange={(e) => setSelectedRenterId(e.target.value)}
              className="mt-2 p-1 sm:p-2 text-xs sm:text-sm border border-gray-300 rounded-lg bg-white w-32 sm:w-40 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            >
              <option value="">Select Renter</option>
              <option value="6821e418602f7791dbcd485a">fikiresilase</option>
            </select>
          )}
          <button
            onClick={onSignDeal}
            className="mt-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#3B5ED6] text-white text-xs sm:text-sm rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
            disabled={isOwner && !selectedRenterId}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Sign Deal
          </button>
        </>
      ) : (
        <span
          className={`mt-2 px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full font-medium flex items-center gap-2 ${
            status === 'No Deal' ? 'bg-gray-200 text-gray-700' :
            status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {status === 'Done' ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            ) : status === 'Pending' ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l2 2" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            )}
          </svg>
          {status}
        </span>
      )}
    </div>
  );
}