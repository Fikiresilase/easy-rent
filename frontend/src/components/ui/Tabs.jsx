import React from 'react';

export function Tabs({ tab, setTab }) {
  return (
    <div className="flex gap-6 border-b border-gray-200 bg-white px-4 pt-6">
      <button
        className={`py-2 px-2 text-sm font-semibold border-b-2 ${tab === 'Posts' ? 'border-[#3B5ED6] text-[#3B5ED6]' : 'border-transparent text-gray-700'}`}
        onClick={() => setTab('Posts')}
      >
        Posts
      </button>
      <button
        className={`py-2 px-2 text-sm font-semibold border-b-2 ${tab === 'Recents' ? 'border-[#3B5ED6] text-[#3B5ED6]' : 'border-transparent text-gray-700'}`}
        onClick={() => setTab('Recents')}
      >
        Recents
      </button>
    </div>
  );
}