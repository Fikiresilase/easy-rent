import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChatRequestCounts } from '../services/chat';
import { fetchProperties } from '../services/property';
import { useAuth } from '../hooks/useAuth';

export default function EasyRentHistory() {
  const [tab, setTab] = useState('Posts');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chatRequestCounts, setChatRequestCounts] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();

  const baseUrl=  'http://localhost:5000';
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Current user ID:', user.id);
        const propertiesData = await fetchProperties({ ownerId: user.id });
        console.log('Properties data:', {
          rawResponse: propertiesData,
          type: typeof propertiesData,
          isArray: Array.isArray(propertiesData),
          isObject: typeof propertiesData === 'object' && !Array.isArray(propertiesData) && propertiesData !== null,
          timestamp: new Date().toISOString(),
        });
        let normalizedPosts;
        if (Array.isArray(propertiesData)) {
          normalizedPosts = propertiesData;
        } else if (typeof propertiesData === 'object' && propertiesData !== null) {
          normalizedPosts = [propertiesData];
        } else {
          normalizedPosts = [];
        }

        console.log('Setting posts:', {
          postCount: normalizedPosts.length,
          posts: normalizedPosts.map((p) => ({ _id: p._id, title: p.title })),
          timestamp: new Date().toISOString(),
        });
        setPosts(normalizedPosts);
        const counts = await getChatRequestCounts();
        console.log('Chat request counts:', counts);
        setChatRequestCounts(counts);
      } catch (err) {
        console.error('Error fetching data:', {
          error: err.message,
          response: err.response?.data,
          status: err.response?.status,
          timestamp: new Date().toISOString(),
        });
        setError('Failed to load data');
        setPosts([]); 
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);
  const handlePropertyClick = (propertyId) => {
    console.log('Navigating to inquirers:', {
      propertyId,
      timestamp: new Date().toISOString(),
    });
    navigate(`/propertyInquirers/${propertyId}`);
  };

  return (
    <div className="w-full min-h-[70vh]">
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
      <div className="p-4">
        {tab === 'Posts' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B5ED6] mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading posts...</p>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-8 text-red-500">
                {error}
              </div>
            ) : !Array.isArray(posts) || posts.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                No posts found. Start by posting your first property!
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white rounded-xl shadow p-4 flex flex-col relative cursor-pointer hover:shadow-lg transition"
                  onClick={() => handlePropertyClick(post._id)}
                >
                  <div className="absolute top-4 right-4 flex items-center">
                    <div className="relative">
                      <svg
                        className="w-6 h-6 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                      {chatRequestCounts[post._id] > 0 && (
                        <span className="absolute -top-2 -right-2 bg-[#445EDF] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {chatRequestCounts[post._id]}
                        </span>
                      )}
                    </div>
                  </div>
                  <img
                    src={`${baseUrl}/${post.images[0].url}`}
                    alt={post.title}
                    className="rounded-lg w-full h-40 object-cover mb-4"
                  />
                  <div className="font-semibold text-gray-900 mb-1">{post.title}</div>
                  <div className="text-sm text-gray-500 mb-2">{post.location?.address}</div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[#3B5ED6] font-bold">${post.price}/month</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 text-sm">{post.specifications?.bedrooms} beds</span>
                      <span className="text-gray-500 text-sm">{post.specifications?.bathrooms} baths</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-4 mt-4">
            <div className="text-center text-gray-500 py-8">
              Recent chat messages will appear here
            </div>
          </div>
        )}
      </div>
    </div>
  );
}