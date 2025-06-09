import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDeal, fetchDealStatus, signDeal } from '../../services/deal';

export function useDeal({ renterId, property, propertyId, userId, token, dealStatus, propertyFetched }) {
  const navigate = useNavigate();
  const [deal, setDeal] = useState({
    id: null,
    propertyId: null,
    status: 'none',
    signatures: { owner: { signed: false }, renter: { signed: false } },
    renterId: null,
    ownerId: null,
    documents: [],
    terms: '',
    updatedAt: null,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [selectedRenterId, setSelectedRenterId] = useState(null);
  const [loggedInUserStatus, setLoggedInUserStatus] = useState('No Deal');
  const [otherUserStatus, setOtherUserStatus] = useState('No Deal');

  // Sync deal status and isOwner
  useEffect(() => {
    if (propertyFetched && property) {
      setIsOwner(userId === (property.ownerId?._id || property.ownerId));
      setDeal(prev => ({
        ...prev,
        status: dealStatus,
        propertyId,
      }));
    }
  }, [propertyFetched, property, dealStatus, userId, propertyId]);

  // Fetch user statuses
  useEffect(() => {
    const getUserStatus = async (userId, setter) => {
      if (!userId || !propertyId || !token) {
        setter('No Deal');
        return;
      }
      try {
        console.warn(renterId)
        const dealData = await fetchDealStatus(renterId, property.ownerId, propertyId, token, userId);
        console.error(dealData);
        if (dealData.status === 'none') {
          setter('No Deal');
          return;
        }
        const isSigned = userId === (dealData.ownerId?._id || dealData.ownerId)
          ? dealData.signatures.owner.signed
          : userId === (dealData.renterId?._id || dealData.renterId)
          ? dealData.signatures.renter.signed
          : false;
        setter(isSigned ? 'Done' : 'Pending');
      } catch (err) {
        console.error('Error fetching user status:', {
          userId,
          propertyId,
          error: err.message,
          timestamp: new Date().toISOString(),
        });
        setter('No Deal');
      }
    };

    getUserStatus(userId, setLoggedInUserStatus);
    const otherUserId = isOwner ? deal.renterId : deal.ownerId;
    if (otherUserId) {
      getUserStatus(otherUserId, setOtherUserStatus);
    } else {
      setOtherUserStatus('No Deal');
    }
  }, [userId, isOwner, deal.renterId, deal.ownerId, propertyId, token, renterId, property?.ownerId]);

  // Handle deal creation/signing
  const handleMakeDeal = async () => {
    if (!userId || !propertyId || !token) {
      setDeal(prev => ({ ...prev, error: 'Authentication required' }));
      navigate('/login');
      return;
    }
    if (!['available', 'pending'].includes(property?.status)) {
      setDeal(prev => ({ ...prev, error: 'Property is not available for deals' }));
      setModalOpen(false);
      return;
    }
    if (!property?.ownerId) {
      setDeal(prev => ({ ...prev, error: 'Property owner information is missing' }));
      setModalOpen(false);
      return;
    }

    try {
      console.log('Handling deal:', { propertyId, userId, isOwner, dealId: deal.id || 'new', timestamp: new Date().toISOString() });
      let updatedDeal;
      
      if (deal.status === 'none' || !deal.id) {
        const renterId = isOwner ? selectedRenterId : userId;
        if (isOwner && !renterId) {
          setDeal(prev => ({ ...prev, error: 'Please select a renter for this deal' }));
          setModalOpen(false);
          return;
        }
        console.warn(selectedRenterId,renterId)
        const dealData = {
          userId,
          propertyId,
          renterId,
          ownerId: isOwner ? userId : (property.ownerId?._id || property.ownerId),
          startDate: new Date().toISOString(),
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
          monthlyRent: property?.price || 1000,
          securityDeposit: property?.price || 1000,
          terms: 'Standard lease agreement',
          timestamp: new Date().toISOString(),
        };
        updatedDeal = await createDeal(dealData, token);

        console.error(updatedDeal);
      }
      if (updatedDeal) {
        console.error('SELECTED ID', selectedRenterId);
        const ownerId = property.ownerId
        const dealData = {
          userId,
          propertyId: deal.propertyId || propertyId,
          ownerId: ownerId.toString() || deal.ownerId,
          renterId: renterId,
        };
        updatedDeal = await signDeal(updatedDeal._id, dealData, token);
      }

      setDeal({
        id: updatedDeal._id,
        propertyId: updatedDeal.propertyId?._id || updatedDeal.propertyId || propertyId,
        status: updatedDeal.status || 'pending',
        signatures: updatedDeal.signatures || { owner: { signed: false }, renter: { signed: false } },
        renterId: updatedDeal.renterId?._id || updatedDeal.renterId || null,
        ownerId: updatedDeal.ownerId?._id || updatedDeal.ownerId || null,
        documents: updatedDeal.documents || [],
        terms: updatedDeal.terms || '',
        updatedAt: updatedDeal.updatedAt || null,
      });
      setModalOpen(false);
      console.log('Deal updated:', {
        dealId: updatedDeal._id,
        propertyId: updatedDeal.propertyId,
        status: updatedDeal.status,
        renterId: updatedDeal.renterId,
        ownerId: updatedDeal.ownerId,
        updatedAt: updatedDeal.updatedAt,
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
      setDeal(prev => ({ ...prev, error: err.response?.data?.message || err.message }));
    }
  };

  // Calculate progress
  const progress = deal.status === 'completed' ? 100 :
    deal.signatures.owner.signed && deal.signatures.renter.signed ? 100 :
    deal.signatures.owner.signed || deal.signatures.renter.signed ? 50 : 0;

  return {
    deal,
    modalOpen,
    setModalOpen,
    isOwner,
    selectedRenterId,
    setSelectedRenterId,
    handleMakeDeal,
    loggedInUserStatus,
    otherUserStatus,
    canMakeDeal: propertyFetched && !deal.error &&
      ['available', 'pending'].includes(property?.status) &&
      (deal.status === 'none' || !deal.signatures[userId === (deal.ownerId?._id || deal.ownerId) ? 'owner' : 'renter'].signed),
    progress,
    dealError: deal.error,
  };
}