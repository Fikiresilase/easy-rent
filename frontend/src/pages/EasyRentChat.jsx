import React, { useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { useChat } from '../hooks/chat/useChat';
import { usePropertyDetails } from '../hooks/property/usePropertyDetails';
import { ChatContainer } from '../components/chat/ChatContainer';
import { PropertyCard } from '../components/property/PropertyCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';

export default function EasyRentChat() {
  const { propertyId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuthContext();

  const { property, propertyFetched, dealStatus, error: propertyError, baseUrl, defaultImage } = usePropertyDetails(
    propertyId,
    token,
    user?.id || user?._id
  );

  const { messages, newMessage, setNewMessage, loading, error: chatError, setError, handleSubmit, userId } = useChat(
    user,
    token,
    property,
    propertyId,
    state?.receiverId,
    propertyFetched
  );

  const handleDealClick = () => {
    console.log('Navigating to deal status:', { propertyId, timestamp: new Date().toISOString() });
    navigate(`/easyrent-deal-status/${propertyId}`);
  };

  useEffect(() => {
    console.log('Viewport:', { width: window.innerWidth, height: window.innerHeight, timestamp: new Date().toISOString() });
    const handleResize = () => {
      console.log('Resize:', { width: window.innerWidth, height: window.innerHeight, timestamp: new Date().toISOString() });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  console.log('PropertyCard props:', {
    post: property,
    user,
    baseUrl,
    defaultImage,
    propertyFetched,
    timestamp: new Date().toISOString(),
  });

  return (
    <div className="min-h-screen bg-gray-50 px-2 sm:px-4 py-6 flex flex-col sm:flex-row gap-4 sm:gap-6 relative animate-fade-in max-w-full">
      {(loading || !propertyFetched) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/70 z-20">
          <LoadingSpinner />
        </div>
      )}
      {(chatError || propertyError) && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <ErrorMessage message={chatError || propertyError} />
        </div>
      )}
      <div className="flex-grow w-full sm:w-auto order-1 sm:order-none">
        <ChatContainer
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          userId={userId}
          loading={loading}
          error={chatError}
          handleSubmit={handleSubmit}
          dealStatus={dealStatus}
          handleDealClick={handleDealClick}
          propertyFetched={propertyFetched}
          propertyTitle={property?.title || 'Property Chat'}
        />
      </div>
      {propertyFetched && property && (
        <div className="w-full sm:w-80 lg:w-96 order-2 sm:order-none animate-fade-in-up">
          <PropertyCard
            post={property}
            user={user}
            baseUrl={baseUrl}
            defaultImage={defaultImage}
          />
        </div>
      )}
    </div>
  );
}