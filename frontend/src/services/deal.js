import axios from 'axios';
import { signAndSendDeal } from './key';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const fetchDealStatus = async (renterId, ownerId, propertyId, token, userId) => {
  try {
    const response = await axios.get(`${baseUrl}/api/deals/status/${propertyId}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { userId, renterId, ownerId, propertyId },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching deal status:', {
      renterId,
      ownerId,
      propertyId,
      userId,
      error: error.message,
      status: error.response?.status,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
};

export const createDeal = async (dealData, token) => {
  console.warn(dealData)
  try {
    const { userId, propertyId, ownerId, renterId, terms, startDate, endDate, monthlyRent, securityDeposit } = dealData;
    if (!userId || !propertyId || !ownerId || !renterId || !terms || !startDate || !endDate || !monthlyRent || !securityDeposit) {
      throw new Error(`Missing required fields: ${[
        !userId && 'userId',
        !propertyId && 'propertyId',
        !ownerId && 'ownerId',
        !renterId && 'renterId',
        !terms && 'terms',
        !startDate && 'startDate',
        !endDate && 'endDate',
        !monthlyRent && 'monthlyRent',
        !securityDeposit && 'securityDeposit',
      ].filter(Boolean).join(', ')}`);
    } 

    // Use signAndSendDeal to sign and send the deal
    const response = await signAndSendDeal(userId, dealData, token, true);

    console.log('Deal created:', {
      dealId: response,
      propertyId,
      userId,
      timestamp: new Date().toISOString(),
    });

    return response;
  } catch (error) {
    console.error('Error creating deal:', {
      propertyId: dealData.propertyId,
      userId: dealData.userId,
      error: error.message,
      status: error.response?.status,
      message: error.response?.data?.message,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
};

export const signDeal = async (dealId, dealData, token) => {
  try {
    const { userId, propertyId, ownerId, renterId } = dealData;
    
    if (!dealId || !userId || !propertyId || !ownerId || !renterId) {
      throw new Error(`Missing required fields: ${[
        !dealId && 'dealId',
        !userId && 'userId',
        !propertyId && 'propertyId',
        !ownerId && 'ownerId',
        !renterId && 'renterId',
      ].filter(Boolean).join(', ')}`);
    }

    // Use signAndSendDeal to sign and send the deal signature
    const response = await signAndSendDeal(userId, { ...dealData, dealId }, token, false);

    console.log('Deal signed:', {
      dealId,
      propertyId,
      userId,
      timestamp: new Date().toISOString(),
    });

    return response;
  } catch (error) {
    console.error('Error signing deal:', {
      dealId,
      propertyId: dealData.propertyId,
      userId: dealData.userId,
      error: error.message,
      status: error.response?.status,
      message: error.response?.data?.message,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
};