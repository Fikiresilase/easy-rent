import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePropertyDetails } from '../hooks/property/usePropertyDetails';
import { useDeal } from '../hooks/deal/useDeal';
import DealHeader from '../components/deal/DealHeader';
import UserStatus from '../components/deal/UserStatus';
import DealProgress from '../components/deal/DealProgress';
import { PropertyCard } from '../components/property/PropertyCard';
import DealConfirmModal from '../components/deal/DealConfirmModal';
import DealSuccessCard from '../components/deal/DealSuccessCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { getUser } from '../services/auth';

export default function EasyRentDealStatus() {
  const { propertyId,otherUserId } = useParams();
  const { user, token } = useAuth();
  const { property, propertyFetched, dealStatus, error, baseUrl, defaultImage,fetchedDeal } = usePropertyDetails(propertyId, token, user?.id || user?._id);
  const [imageSrc, setImageSrc] = useState(null);
  const [dealersInfo, setDealersInfo] = useState({ renterInfo: null, ownerInfo: null });
  const [isDealersLoading, setIsDealersLoading] = useState(true);
  const navigate = useNavigate();

  console.error(propertyId,otherUserId)

  const userId = useMemo(() => user?.id || user?._id, [user]);
  const stableToken = useMemo(() => token, [token]);

  const {
    deal,
    modalOpen,
    setModalOpen,
    isOwner,
    selectedRenterId,
    setSelectedRenterId,
    handleMakeDeal,
    loggedInUserStatus,
    otherUserStatus,
    canMakeDeal,
    progress,
    dealError,
  } = useDeal({renterId:otherUserId,property, propertyId, userId, token: stableToken, dealStatus, propertyFetched });

  const getDealersInfo = async () => {console.error(fetchedDeal)
    try {
      
      setIsDealersLoading(true);
      const renterInfo = await getUser(otherUserId ? otherUserId : user.id) 
      console.error(renterInfo,otherUserId)
      const ownerInfo = await getUser(property.ownerId);
      console.error(ownerInfo,property.ownerId)
      return { renterInfo, ownerInfo };
    } catch (err) {
      console.error('Error fetching dealers info:', err);
      return { renterInfo: null, ownerInfo: null };
    } finally {
      setIsDealersLoading(false);
    }
  };

  useEffect(() => {
    if (property?.renterId || property?.ownerId) {
      getDealersInfo().then((info) => {
        setDealersInfo(info);
      });
    } else {
      setIsDealersLoading(false); // No IDs to fetch, stop loading
    }
  }, [property?.renterId, property?.ownerId]);

  const renter = useMemo(
    () => ({
      name: dealersInfo.renterInfo?.name || 'Fikiresilase',
      avatar: (dealersInfo.renterInfo?.name || 'Fikiresilase')[0].toUpperCase(),
    }),
    [dealersInfo.renterInfo]
  );

  const owner = useMemo(
    () => ({
      name: dealersInfo.ownerInfo?.name || 'Fikiresilase',
      avatar: (dealersInfo.ownerInfo?.name || 'Fikiresilase')[0].toUpperCase(),
    }),
    [dealersInfo.ownerInfo]
  );
  

  useEffect(() => {
    console.log('Viewport:', { width: window.innerWidth, height: window.innerHeight, timestamp: new Date().toISOString() });
    const handleResize = () => {
      console.log('Resize:', { width: window.innerWidth, height: window.innerHeight, timestamp: new Date().toISOString() });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (property?.images?.[0]?.url) {
      const url = `${baseUrl}/${property.images[0].url.replace(/^uploads\//, '')}`;
      console.log('Setting image source:', { url });
      setImageSrc(url);
    } else {
      console.log('No valid image, using default:', { defaultImage });
      setImageSrc(defaultImage);
    }
  }, [property, baseUrl, defaultImage]);

  console.log('Rendering property status:', {
    propertyId,
    status: property?.status,
    isAvailableOrPending: ['available', 'pending'].includes(property?.status),
    propertyFetched,
    error,
    progress,
    timestamp: new Date().toISOString(),
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-2 sm:px-4 animate-fade-in">
      <DealHeader
        title={property?.title}
        dealStatus={deal.status}
        onBack={() => navigate(-1)}
      />
      <main className="flex flex-col items-center py-6 sm:py-8 lg:py-12 w-full max-w-5xl">
        <LoadingSpinner visible={!propertyFetched || isDealersLoading} />
        <ErrorMessage message={error || dealError} />
        {!isDealersLoading && (
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row gap-4 sm:gap-6 lg:gap-8 w-full bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300 mb-4 sm:mb-6">
            <div className="flex-1 flex flex-col items-center justify-center min-w-0 sm:min-w-[280px] lg:min-w-[320px]">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 lg:gap-12 w-full">
                <UserStatus
                  user={isOwner ? owner : renter}
                  status={loggedInUserStatus}
                  isOwner={isOwner}
                  canMakeDeal={canMakeDeal}
                  onSignDeal={() => setModalOpen(true)}
                  selectedRenterId={selectedRenterId}
                  setSelectedRenterId={setSelectedRenterId}
                />
                <DealProgress progress={progress} />
                <UserStatus
                  user={isOwner ? renter : owner}
                  status={otherUserStatus}
                  isOwner={false}
                  canMakeDeal={false}
                />
              </div>
              {(deal.status === 'pending') && (
                <div className="flex flex-col items-center mt-4 sm:mt-6">
                  <span className="text-gray-500 text-xs sm:text-sm flex items-center gap-2">
                    <svg className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v4l2 2" />
                    </svg>
                    Waiting for {isOwner && !deal.signatures.owner.signed ? 'owner' : 'renter'} to sign
                  </span>
                </div>
              )}
              {property && typeof property.status === 'string' && !['available', 'pending'].includes(property.status) && propertyFetched && !error && (
                <div className="flex flex-col items-center mt-4 sm:mt-6">
                  <span className="text-red-600 text-xs sm:text-sm flex items-center gap-2">
                    <svg className="w-4 sm:w-5 h-4 sm:h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v4m0 4h.01" />
                    </svg>
                    Property not available for deals
                  </span>
                </div>
              )}
            </div>
            <PropertyCard
              post={property}
              user={user}
              baseUrl={baseUrl}
              defaultImage={defaultImage}
            />
          </div>
        )}
        <DealSuccessCard visible={deal.status === 'completed' && !error && !dealError} />
        <DealConfirmModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={handleMakeDeal}
        />
      </main>
    </div>
  );
}