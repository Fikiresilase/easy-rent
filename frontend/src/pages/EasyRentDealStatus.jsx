import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { fetchProperties } from '../services/property';
import { fetchDealStatus, createDeal, signDeal } from '../services/deal';

export default function EasyRentDealStatus() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [property, setProperty] = useState(null);
  const [deal, setDeal] = useState({ id: null, status: 'none', signatures: { owner: { signed: false }, renter: { signed: false } }, renterId: null, ownerId: null });
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const baseUrl = 'http://localhost:5000';

  const userId = user?.id || user?._id;
  const renter = {
    name: user?.name || 'Abebech Kebedech',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  };
  const owner = {
    name: property?.ownerId?.name || 'Abebe Kebede',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
  };

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!propertyId || !token || !userId) {
        setError('Property ID or authentication missing');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching property:', { propertyId, userId, timestamp: new Date().toISOString() });
        const data = await fetchProperties({ id: propertyId });
        let propertyData = data;
        if (Array.isArray(data)) {
          console.log('Received array, converting to object:', { length: data.length, timestamp: new Date().toISOString() });
          propertyData = data.length > 0 ? data[0] : null;
        }
        if (!propertyData) {
          throw new Error('No property found');
        }
        setProperty(propertyData);
        setIsOwner(userId === (propertyData.ownerId?._id || propertyData.ownerId));
        console.log('Property fetched:', {
          propertyId,
          title: propertyData.title,
          status: propertyData.status,
          isOwner: userId === (propertyData.ownerId?._id || propertyData.ownerId),
          isArray: Array.isArray(data),
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Error fetching property:', {
          propertyId,
          userId: userId || 'unknown',
          error: err.message,
          status: err.response?.status,
          timestamp: new Date().toISOString(),
        });
        setError('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [propertyId, token, userId]);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!propertyId || !token || !userId) {
        console.log('Skipping deal status fetch:', {
          propertyId: !!propertyId,
          token: !!token,
          userId: !!userId,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      try {
        console.log('Fetching deal status:', { propertyId, userId, timestamp: new Date().toISOString() });
        const dealData = await fetchDealStatus(propertyId, token, userId);
        setDeal({
          id: dealData._id || null,
          status: dealData.status || 'none',
          signatures: dealData.signatures || { owner: { signed: false }, renter: { signed: false } },
          renterId: dealData.renterId?._id || dealData.renterId || null,
          ownerId: dealData.ownerId?._id || dealData.ownerId || null,
        });
        console.log('Deal status fetched:', {
          propertyId,
          dealId: dealData._id,
          status: dealData.status,
          signatures: dealData.signatures,
          renterId: dealData.renterId,
          ownerId: dealData.ownerId,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Failed to fetch deal status:', {
          propertyId,
          userId: userId || 'unknown',
          error: err.message,
          status: err.response?.status,
          timestamp: new Date().toISOString(),
        });
        setDeal({ id: null, status: 'none', signatures: { owner: { signed: false }, renter: { signed: false } }, renterId: null, ownerId: null });
      }
    };

    fetchStatus();
  }, [propertyId, token, userId]);

  const handleMakeDeal = async () => {
    if (!userId || !propertyId || !token) {
      setError('Authentication required');
      navigate('/login');
      return;
    }
    if (!['available', 'pending'].includes(property?.status)) {
      setError('Property is not available for deals');
      setModalOpen(false);
      return;
    }
    if (!property?.ownerId) {
      setError('Property owner information is missing');
      setModalOpen(false);
      return;
    }

    try {
      console.log('Handling deal:', { propertyId, userId, isOwner, dealId: deal.id || 'new', timestamp: new Date().toISOString() });
      let updatedDeal;
      if (deal.status === 'none') {
        const dealData = {
          propertyId,
          renterId: isOwner ? null : userId,
          ownerId: isOwner ? userId : (property.ownerId?._id || property.ownerId),
          startDate: new Date().toISOString(),
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
          monthlyRent: property?.price || 1000,
          securityDeposit: property?.price || 1000,
          terms: 'Standard lease agreement',
        };
        console.log('dealData:', dealData);
        if (!dealData.renterId && isOwner) {
          setError('Please select a renter for this deal');
          setModalOpen(false);
          return;
        }
        updatedDeal = await createDeal(dealData, token, userId);
      } else {
        if (!deal.id) {
          setError('Invalid deal ID');
          setModalOpen(false);
          return;
        }
        updatedDeal = await signDeal(deal.id, token, userId);
      }
      if (!updatedDeal._id) {
        throw new Error('Invalid deal response: missing ID');
      }

      setDeal({
        id: updatedDeal._id,
        status: updatedDeal.status || 'pending',
        signatures: updatedDeal.signatures || { owner: { signed: false }, renter: { signed: false } },
        renterId: updatedDeal.renterId?._id || updatedDeal.renterId || null,
        ownerId: updatedDeal.ownerId?._id || updatedDeal.ownerId || null,
      });
      setModalOpen(false);
      setError('');
      console.log('Deal updated:', {
        dealId: updatedDeal._id,
        status: updatedDeal.status,
        signatures: updatedDeal.signatures,
        renterId: updatedDeal.renterId,
        ownerId: updatedDeal.ownerId,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error handling deal:', {
        propertyId,
        dealId: deal.id || 'new',
        userId: userId || 'unknown',
        error: err.message,
        status: err.response?.status,
        message: err.response?.data?.message,
        timestamp: new Date().toISOString(),
      });
      setError(err.response?.data?.message || err.message);
    }
  };
  const getUserStatus = (userId) => {
    if (deal.status === 'none') return 'No Deal';
    const isSigned = userId === (deal.ownerId?._id || deal.ownerId)
      ? deal.signatures.owner.signed
      : userId === (deal.renterId?._id || deal.renterId)
      ? deal.signatures.renter.signed
      : false;
    return isSigned ? 'Done' : 'Pending';
  };

  const loggedInUserStatus = getUserStatus(userId);
  const otherUserId = isOwner ? deal.renterId : deal.ownerId;
  const otherUserStatus = getUserStatus(otherUserId);
  const canMakeDeal = !loading && !error &&
    ['available', 'pending'].includes(property?.status) &&
    (deal.status === 'none' || !deal.signatures[userId === (deal.ownerId?._id || deal.ownerId) ? 'owner' : 'renter'].signed);

  return (
    <div className="w-full flex flex-col items-center py-12">
      <div className="bg-white rounded-2xl shadow p-8 flex flex-col md:flex-row gap-8 w-full max-w-5xl mb-6">
        <div className="flex-1 flex flex-col items-center justify-center min-w-[320px]">
          <div className="flex items-center justify-center gap-12 w-full">
            <div className="flex flex-col items-center">
              <img
                src={isOwner ? owner.avatar : renter.avatar}
                alt={isOwner ? owner.name : renter.name}
                className="h-20 w-20 rounded-full object-cover mb-2"
              />
              <div className="font-semibold text-gray-900">{isOwner ? owner.name : renter.name}</div>
              {canMakeDeal ? (
                <button
                  onClick={() => setModalOpen(true)}
                  className="mt-2 px-4 py-2 bg-[#3B5ED6] text-white rounded hover:bg-[#2746a3] transition"
                >
                  Make Deal
                </button>
              ) : (
                <span
                  className={`mt-2 px-3 py-1 text-xs rounded-full font-medium ${
                    loggedInUserStatus === 'No Deal'
                      ? 'bg-gray-200 text-gray-700'
                      : loggedInUserStatus === 'Pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {loggedInUserStatus}
                </span>
              )}
            </div>
            <div className="flex flex-col items-center">
              <div className="w-1 h-16 bg-gray-200 rounded-full" />
            </div>
            <div className="flex flex-col items-center">
              <img
                src={isOwner ? renter.avatar : owner.avatar}
                alt={isOwner ? renter.name : owner.name}
                className="h-20 w-20 rounded-full object-cover mb-2"
              />
              <div className="font-semibold text-gray-900">{isOwner ? renter.name : owner.name}</div>
              <span
                className={`mt-2 px-3 py-1 text-xs rounded-full font-medium ${
                  otherUserStatus === 'No Deal'
                    ? 'bg-gray-200 text-gray-700'
                  : otherUserStatus === 'Pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {otherUserStatus}
              </span>
            </div>
          </div>
          {(deal.status === 'pending' || deal.status === 'done') && (
            <div className="flex flex-col items-center mt-6">
              <span className="text-gray-500 text-sm flex items-center gap-1">
                <svg className="w-5 h-5 inline text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l2 2" />
                </svg>
                Waiting for {isOwner && !deal.signatures.owner.signed ? 'owner' : 'renter'}
              </span>
            </div>
          )}
          {property?.status && !['available', 'pending'].includes(property.status) && !loading && !error && (
            <div className="flex flex-col items-center mt-6">
              <span className="text-red-500 text-sm flex items-center gap-1">
                <svg className="w-5 h-5 inline text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4m0 4h.01" />
                </svg>
                This property is not available for deals
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col items-center min-w-[320px]">
          {loading ? (
            <div className="w-full h-40 bg-gray-200 rounded-lg animate-pulse" />
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : (
            <>
              <img
                src={property?.images?.[0]?.url ? `${baseUrl}/${property.images[0].url}` : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'}
                alt={property?.title || 'Property'}
                className="rounded-lg w-full h-40 object-cover mb-4"
                onError={(e) => {
                  console.warn('Property image failed to load:', property?.images?.[0]?.url);
                  e.target.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80';
                }}
              />
              <div className="w-full space-y-2">
                <div className="font-semibold text-gray-900">{property?.title || 'Untitled Property'}</div>
                <p className="text-gray-600 text-sm">{property?.description || 'No description available'}</p>
              </div>
            </>
          )}
        </div>
      </div>
      {deal.status === 'completed' && !error && (
        <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-4 w-full max-w-3xl mb-6">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          <span className="text-lg text-gray-700">
            Your deal was successful
          </span>
        </div>
      )}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Confirm Deal</h2>
            <p className="text-gray-600 mb-6">
              This deal signature is non-repudiable and legally binding. Are you sure you want to proceed?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleMakeDeal}
                className="px-4 py-2 bg-[#3B5ED6] text-white rounded hover:bg-[#2746a3] transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}