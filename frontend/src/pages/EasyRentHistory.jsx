import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { usePropertyHistory } from '../hooks/property/usePropertyHistory';
import { useTabs } from '../hooks/ui/useTabs';
import { Tabs } from '../components/ui/Tabs';
import { PropertyCard } from '../components/property/PropertyCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { EmptyState } from '../components/ui/EmptyState';

export default function EasyRentHistory() {
  const { user, token } = useAuthContext();
  const { tab, setTab } = useTabs('Posts');
  const { posts, completedProperties, loading, error, chatRequestCounts } = usePropertyHistory(user, token);
  const navigate = useNavigate();
  const baseUrl = 'http://localhost:5000';
  const defaultImage = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80';

  const handlePropertyClick = (property, type) => {
    if (type === 'posted') {
      console.log('Navigating to inquirers:', {
        propertyId: property._id,
        type,
        timestamp: new Date().toISOString(),
      });
      navigate(`/propertyInquirers/${property._id}`);
    } else if (type === 'rented') {
      console.log('Navigating to property details:', {
        propertyId: property._id,
        type,
        timestamp: new Date().toISOString(),
      });
      navigate(`/easyrent-editPost/${property._id}`);
    }
  };
  

  // Sort posts by chat request count (descending)
  const sortedPosts = [...posts].sort((a, b) => {
    const countA = chatRequestCounts && a._id in chatRequestCounts ? chatRequestCounts[a._id] : 0;
    const countB = chatRequestCounts && b._id in chatRequestCounts ? chatRequestCounts[b._id] : 0;
    return countB - countA;
  });

  console.log('Sorted posts:', {
    postCount: sortedPosts.length,
    posts: sortedPosts.map(p => ({
      _id: p._id,
      title: p.title,
      chatCount: chatRequestCounts && p._id in chatRequestCounts ? chatRequestCounts[p._id] : 0,
    })),
    timestamp: new Date().toISOString(),
  });

  return (
    <div className="w-full min-h-[70vh]">
      <Tabs tab={tab} setTab={setTab} />
      <div className="p-4">
        {tab === 'Posts' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <LoadingSpinner message="Loading posts..." />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : !Array.isArray(sortedPosts) || sortedPosts.length === 0 ? (
              <EmptyState message="No posts found. Start by posting your first property!" />
            ) : (
              sortedPosts.map((post) => (
                <PropertyCard
                  key={post._id}
                  post={post}
                  user={user}
                  onClick={() => handlePropertyClick(post, 'posted')}
                  baseUrl={baseUrl}
                  defaultImage={defaultImage}
                  chatRequestCounts={chatRequestCounts}
                  type="posted"
                />
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <LoadingSpinner message="Loading completed properties..." />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : !Array.isArray(completedProperties) || completedProperties.length === 0 ? (
              <EmptyState message="No completed properties found. Complete a deal to see it here!" />
            ) : (
              completedProperties.map((property) => (
                <PropertyCard
                  key={property._id}
                  post={property}
                  user={user}
                  onClick={() => handlePropertyClick(property, 'rented')}
                  baseUrl={baseUrl}
                  defaultImage={defaultImage}
                  type="rented"
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}