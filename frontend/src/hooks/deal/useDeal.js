import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDeal, signDeal } from '../../services/deal';

export function useDeal({ property, propertyId, userId, token, dealStatus, propertyFetched }) {
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
        console.warn(dealData)
        updatedDeal = await createDeal(dealData, token);
        if (!updatedDeal?._id) {
          throw new Error('Invalid deal response: missing ID');
        }
      } else {
        const dealData = {
          userId,
          propertyId: deal.propertyId || propertyId,
          ownerId: deal.ownerId?._id?.toString() || deal.ownerId,
          renterId: deal.renterId?._id?.toString() || deal.renterId || selectedRenterId,
        };
        updatedDeal = await signDeal(deal.id, dealData, token);
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

  // Get user status
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
  const canMakeDeal = propertyFetched && !deal.error &&
    ['available', 'pending'].includes(property?.status) &&
    (deal.status === 'none' || !deal.signatures[userId === (deal.ownerId?._id || deal.ownerId) ? 'owner' : 'renter'].signed);

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
    canMakeDeal,
    progress,
    dealError: deal.error,
  };
}