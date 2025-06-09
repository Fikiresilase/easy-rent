import React from 'react';

export function Pagination({ page, totalPages, setPage }) {
  console.error(totalPages)
  

  return (
    <div className="flex justify-center items-center mb-12">
      <nav className="flex items-center gap-2 bg-white rounded-xl shadow-sm px-4 py-2">
        <button
          className="text-indigo-600 p-2 rounded-full hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          aria-label="Previous page"
          title="Previous page"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
              page === num
                ? 'bg-indigo-600 text-white'
                : 'text-indigo-600 hover:bg-indigo-50 hover:scale-105'
            }`}
            onClick={() => setPage(num)}
            title={`Go to page ${num}`}
          >
            {num}
          </button>
        ))}
        <button
          className="text-indigo-600 p-2 rounded-full hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          aria-label="Next page"
          title="Next page"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </nav>
    </div>
  );
}