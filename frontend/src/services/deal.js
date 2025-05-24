import apiClient from './apiClient';

// Map backend error messages to user-friendly messages
const getFriendlyErrorMessage = (error) => {
  const message = error.response?.data?.message || error.message;
  switch (message) {
    case 'Property not found':
      return 'The property could not be found.';
    case 'Property is not available for deals':
    case /Property is not available for deals/.test(message):
      return 'This property is not available for deals.';
    case 'Another renter has an active deal for this property':
      return 'A deal is already in progress for this property.';
    case 'No pending deal found for this property, owner, and renter':
    case 'Deal not found':
      return 'No active deal found to sign.';
    case 'Not authorized to sign this deal':
      return 'You are not authorized to sign this deal.';
    case 'You have already signed this deal':
      return 'You have already signed this deal.';
    default:
      return 'An error occurred. Please try again.';
  }
};

export const fetchDealStatus = async (propertyId, token, userId) => {
  try {
    if (!propertyId || !token || !userId) {
      throw new Error('Property ID, user ID, or authentication token missing');
    }
    console.log('Fetching deal status:', { propertyId, userId, timestamp: new Date().toISOString() });
    const response = await apiClient.get('/deals', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const deals = response.data;
    const deal = deals.find(d => 
      (d.propertyId._id || d.propertyId).toString() === propertyId &&
      (d.ownerId._id || d.ownerId).toString() === (d.ownerId._id || d.ownerId).toString() &&
      (d.renterId._id || d.renterId).toString() === (d.renterId._id || d.renterId).toString()
    );
    if (!deal) {
      console.log('No deal found:', { propertyId, userId, dealsCount: deals.length });
      return {
        id: null,
        status: 'none',
        signatures: { owner: { signed: false }, renter: { signed: false } },
        renterId: null,
        ownerId: null,
      };
    }
    return {
      id: deal._id,
      status: deal.status,
      signatures: deal.signatures || { owner: { signed: false }, renter: { signed: false } },
      renterId: deal.renterId?._id || deal.renterId || null,
      ownerId: deal.ownerId?._id || deal.ownerId || null,
    };
  } catch (error) {
    console.error('Error fetching deal status:', {
      propertyId,
      userId,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      timestamp: new Date().toISOString(),
    });
    throw new Error(getFriendlyErrorMessage(error));
  }
};

export const createDeal = async (dealData, token, userId) => {
  try {
    if (!dealData.propertyId || !dealData.ownerId) {
      throw new Error('Missing required fields: propertyId or ownerId');
    }
    console.log('Creating deal:', {
      dealData,
      userId,
      timestamp: new Date().toISOString(),
    });
    const response = await apiClient.post('/deals', dealData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating deal:', {
      userId,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      timestamp: new Date().toISOString(),
    });
    throw new Error(getFriendlyErrorMessage(error));
  }
};

export const signDeal = async ({ propertyId, ownerId, renterId }, token, userId) => {
  try {
    if (!propertyId || !ownerId || !renterId) {
      throw new Error('Property ID, owner ID, or renter ID missing');
    }
    console.log('Signing deal:', {
      propertyId,
      ownerId,
      renterId,
      userId,
      timestamp: new Date().toISOString(),
    });
    const response = await apiClient.put('/deals/sign', { propertyId, ownerId, renterId }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error signing deal:', {
      propertyId,
      userId,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      timestamp: new Date().toISOString(),
    });
    throw new Error(getFriendlyErrorMessage(error));
  }
};