import React from 'react';

export function PropertyCard({ post, user, onClick, baseUrl, defaultImage, chatRequestCounts, type }) {
  const fallbackImage = defaultImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80';
  const chatCount = type === 'posted' && chatRequestCounts && post._id in chatRequestCounts ? chatRequestCounts[post._id] : 0;

  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col relative"
      onClick={() => onClick(post)}
    >
      {user && (
        <>
          {user.id === post.ownerId && (
            <span className="absolute top-2 right-2 bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-1 rounded-full">
              Owned
            </span>
          )}
          {user.id === post.renterId && (
            <span className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
              Rented
            </span>
          )}
        </>
      )}
      <img
        src={post.images?.[0]?.url ? `${baseUrl}/${post.images[0].url.replace(/\\/g, '/')}` : fallbackImage}
        alt={post.title || 'Property'}
        className="w-full h-48 object-cover"
        onError={(e) => { e.target.src = fallbackImage; }}
      />
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate" title={post.title || 'Untitled Property'}>
          {post.title || 'Untitled Property'}
        </h3>
        <p className="text-gray-600 text-sm mb-2 truncate" title={post.location?.address || 'No address provided'}>
          {post.location?.address || 'No address provided'}
        </p>
        <div className="mt-auto">
          <div className="flex items-center justify-between">
            <span className="text-indigo-600 font-bold text-base">
              ${post.price?.toLocaleString() || 'N/A'}/month
            </span>
            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
              <span>
                {post.specifications?.bedrooms || post.bedrooms || 'N/A'} Beds
              </span>
              <span className="text-gray-400">·</span>
              <span>
                {post.specifications?.bathrooms || post.bathrooms || 'N/A'} Baths
              </span>
            </div>
          </div>
          {type === 'posted' && chatCount > 0 && (
            <div className="flex items-center gap-1 text-sm text-gray-600 mt-2">
              <svg
                className="w-5 h-5 text-amber-500 animate-pulse"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="font-semibold">{chatCount} Inquirer{chatCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}