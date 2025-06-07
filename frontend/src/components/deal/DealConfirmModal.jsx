import React from 'react';

export default function DealConfirmModal({ isOpen, onClose, onConfirm }) {
  return (
    isOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 animate-slide-in">
        <div className="bg-white rounded-lg p-4 sm:p-6 w-full sm:max-w-md max-h-[80vh] overflow-y-auto shadow-xl">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-4">Confirm Deal Signature</h2>
          <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6">
            This digital signature is legally binding. Are you sure you want to sign this deal?
          </p>
          <div className="flex justify-end gap-2 sm:gap-4">
            <button
              onClick={onClose}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 text-gray-700 text-xs sm:text-sm rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#3B5ED6] text-white text-xs sm:text-sm rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Sign Deal
            </button>
          </div>
        </div>
      </div>
    )
  );
}