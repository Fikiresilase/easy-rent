import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getChatRequesters } from '../services/chat';


const timeoutPromise = (ms, message) =>
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error(message)), ms)
  );

export default function PropertyInquirers() {
  const { propertyId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requesters, setRequesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequesters = async () => {
      try {
        setLoading(true);
        if (!user?.id) {
          throw new Error('User ID is missing');
        }
        if (!propertyId) {
          throw new Error('Property ID is missing');
        }

        console.log('Starting fetch requesters:', {
          propertyId,
          userId: user.id,
          timestamp: new Date().toISOString(),
        });
        const data = await Promise.race([
          getChatRequesters(propertyId, user.id),
          timeoutPromise(10000, 'Request timed out')
        ]);

        if (!Array.isArray(data)) {
          console.warn('Requesters data is not an array:', {
            data,
            propertyId,
            userId: user.id,
            timestamp: new Date().toISOString(),
          });
          setError('Invalid requesters data received');
          setRequesters([]);
        } else {
          console.log('Requesters fetched successfully:', {
            propertyId,
            userId: user._id,
            requesterCount: data.length,
            requesters: data.map(r => ({ _id: r._id, name: r.name })),
            timestamp: new Date().toISOString(),
          });
          setRequesters(data);
        }
      } catch (err) {
        console.error('Error fetching requesters:', {
          error: err.message,
          response: err.response?.data,
          status: err.response?.status,
          propertyId,
          userId: user?._id,
          timestamp: new Date().toISOString(),
        });
        setError(`Failed to load requesters: ${err.message}`);
        setRequesters([]);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.id && propertyId) {
      
      fetchRequesters();
    } else {console.error(user,propertyId)
      console.warn('Skipping fetch due to missing data:', {
        hasUser: !!user,
        hasUserId: !!user?._id,
        hasPropertyId: !!propertyId,
        timestamp: new Date().toISOString(),
      });
      setError('Missing user or property data');
      setLoading(false);
    }
  }, [user, propertyId]);

  const handleRequesterClick = (receiverId) => {
    console.log('Navigating to chat:', {
      propertyId,
      userId: user._id,
      receiverId,
      timestamp: new Date().toISOString(),
    });
    navigate(`/easyrent-chat/${propertyId}`, { state: { receiverId } });
  };

  return (
    <div className="w-full min-h-[70vh] p-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Chat Requesters</h2>
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B5ED6] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading requesters...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : requesters.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No chat requests for this property.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requesters.map((requester) => (
            <div
              key={requester._id}
              className="bg-white rounded-xl shadow p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition"
              onClick={() => handleRequesterClick(requester._id)}
            >
              <img
                src={requester.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                alt={requester.name}
                className="h-24 w-24 rounded-full object-cover mb-4"
              />
              <div className="font-semibold text-gray-900">{requester.name}</div>
              <div className="text-sm text-gray-500 mt-1">Requested to chat</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}