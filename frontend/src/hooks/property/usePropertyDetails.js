import { useState, useEffect } from 'react';
import { fetchPropertyById } from '../../services/property';
import { fetchDealStatus } from '../../services/deal';

export function usePropertyDetails(propertyId, token, userId) {
  const [fetchedDeal,setFetchedDeal]=useState(null)
  const [property, setProperty] = useState(1);
  const renterId = property.renterId
  const ownerId= property.ownerId
  const [propertyFetched, setPropertyFetched] = useState(false);
  const [dealStatus, setDealStatus] = useState('none');
  const [error, setError] = useState('');
  const baseUrl = 'http://localhost:5000';
  const defaultImage = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80';

  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId || !token) {
        console.error('Missing data for property fetch:', {
          propertyId,
          token: !!token,
          userId,
          timestamp: new Date().toISOString(),
        });
        setError('Missing property ID or authentication token');
        setPropertyFetched(false);
        return;
      }

      try {
        console.log('Fetching property:', {
          propertyId,
          userId,
          timestamp: new Date().toISOString(),
        });
        const propertyData = await fetchPropertyById(propertyId);
        if (!propertyData || !propertyData._id) {
          console.error('Invalid property data:', {
            data: propertyData,
            timestamp: new Date().toISOString(),
          });
          setError('Invalid property data received');
          setPropertyFetched(false);
          return;
        }

        console.log('Property data:', {
          propertyId,
          title: propertyData.title,
          location: propertyData.location,
          price: propertyData.price,
          specifications: propertyData.specifications,
          timestamp: new Date().toISOString(),
        });

        setProperty(propertyData);
        setPropertyFetched(true);
        console.log('Property fetched:', {
          propertyId,
          title: propertyData.title,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Property fetch failed:', {
          error: err.message,
          status: err.response?.status,
          data: err.response?.data,
          timestamp: new Date().toISOString(),
        });
        setError(`Failed to fetch property: ${err.message}`);
        setPropertyFetched(false);
      }
    };

    fetchProperty();
  }, [propertyId, token, userId]);

  useEffect(() => {
    const fetchDeal = async () => {
      if (!propertyId || !token || !userId) {
        console.log('Skipping deal fetch:', {
          propertyId: !!propertyId,
          token: !!token,
          userId: !!userId,
          timestamp: new Date().toISOString(),
        });
        setError('Missing data for deal status');
        return;
      }

      try {
        console.log('Fetching deal status:', {
          propertyId,
          userId,
          token: token.substring(0, 20) + '...',
          timestamp: new Date().toISOString(),
        });
        const response = await fetchDealStatus(renterId, ownerId, propertyId, token, userId);
        setFetchedDeal(response)
        const status = response?.status || 'none';
        setDealStatus(status);
        console.log('Deal status set:', {
          status,
          response: response,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Deal fetch failed:', {
          error: err.message,
          status: err.response?.status,
          data: err.response?.data,
          timestamp: new Date().toISOString(),
        });
        setError(`Failed to fetch deal status: ${err.message}`);
        setDealStatus('none');
      }
    };

    fetchDeal();
  }, [propertyId, token, userId]);

  return {
    fetchedDeal,
    property,
    propertyFetched,
    dealStatus,
    error,
    baseUrl,
    defaultImage,
  };
}