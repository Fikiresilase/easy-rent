import React, { useRef, useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import * as chatService from '../services/chat';
import { fetchDealStatus } from '../services/deal';

const timeoutPromise = (ms, message) =>
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error(message)), ms)
  );

export default function EasyRentChat() {
  const { propertyId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [property, setProperty] = useState(null);
  const [propertyFetched, setPropertyFetched] = useState(false);
  const [dealStatus, setDealStatus] = useState('none'); // New state for deal status
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const baseUrl = 'http://localhost:5000';

  const owner = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  };

  useEffect(() => {
    console.log('Auth State:', {
      isAuthenticated: !!user,
      userId: user?.id,
      token: token ? `${token.substring(0, 10)}...` : 'No token',
      propertyId,
      receiverId: state?.receiverId,
      timestamp: new Date().toISOString(),
    });
    if (!token) {
      setError('Authentication required. Please log in.');
      setLoading(false);
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token validation:', {
        userId: payload.userId,
        exp: new Date(payload.exp * 1000).toISOString(),
        isExpired: payload.exp * 1000 < Date.now(),
        timestamp: new Date().toISOString(),
      });
      if (payload.exp * 1000 < Date.now()) {
        setError('Session expired. Please log in again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Invalid token:', {
        error: err.message,
        timestamp: new Date().toISOString(),
      });
      setError('Invalid authentication token');
      setLoading(false);
    }
  }, [user, token, propertyId, state?.receiverId]);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!propertyId || !token) {
        console.error('Missing required data', {
          propertyId,
          token: token ? 'present' : 'missing',
          timestamp: new Date().toISOString(),
        });
        setError('Invalid property ID or authentication');
        setLoading(false);
        setPropertyFetched(false);
        return;
      }

      try {
        console.log('Fetching property details:', {
          propertyId,
          token: token ? `${token.substring(0, 10)}...` : 'No token',
          timestamp: new Date().toISOString(),
        });

        const response = await chatService.getPropertyDetails(propertyId);

        console.log('Raw property API response:', {
          status: response?.status,
          data: response?.data,
          timestamp: new Date().toISOString(),
        });

        const data = response?.data?.data || response?.data || response;

        if (!data || typeof data !== 'object' || !data._id) {
          console.error('Invalid property data received', {
            propertyId,
            response,
            data,
            timestamp: new Date().toISOString(),
          });
          setError('No valid property data received');
          setLoading(false);
          setPropertyFetched(false);
          return;
        }

        setProperty(data);
        setPropertyFetched(true);
        console.log('Property set successfully:', {
          property,
          ownerId: data.ownerId?._id || data.ownerId,
          title: data.title,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Error fetching property details:', {
          error: err.message,
          response: err.response?.data,
          status: err.response?.status,
          headers: err.response?.headers,
          propertyId,
          timestamp: new Date().toISOString(),
        });
        setError(err.response?.data?.message || 'Failed to load property details');
        setPropertyFetched(false);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [propertyId, token]);

  useEffect(() => {
    const fetchDeal = async () => {
      if (!propertyId || !token || !user?.id) {
        console.log('Skipping deal status fetch due to missing data:', {
          propertyId: !!propertyId,
          token: !!token,
          userId: !!user?.id,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      try {
        console.log('Fetching deal status:', {
          propertyId,
          userId: user.id,
          timestamp: new Date().toISOString(),
        });
        const { status } = await fetchDealStatus(propertyId, token);
        setDealStatus(status || 'none');
        console.log('Deal status fetched:', {
          propertyId,
          status: status || 'none',
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Failed to fetch deal status:', {
          propertyId,
          error: err.message,
          status: err.response?.status,
          timestamp: new Date().toISOString(),
        });
        setDealStatus('none');
      }
    };

    fetchDeal();
  }, [propertyId, token, user?.id]);

  useEffect(() => {
    let receiverId;
    if (user.id !== property?.ownerId?._id && propertyFetched) {
      receiverId = property?.ownerId?._id;
    } else {
      receiverId = state?.receiverId;
    }

    if (!user?.id || !propertyFetched) {
      console.log('Skipping chat history fetch due to missing data:', {
        userId: !!user?.id,
        propertyFetched,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    console.log('Preparing to fetch chat history:', {
      userId: user.id,
      receiverId,
      propertyId,
      timestamp: new Date().toISOString(),
    });

    const fetchChatHistory = async () => {
      try {
        if (!user.id || !receiverId || !propertyId) {
          throw new Error('Missing required parameters: ' + JSON.stringify({
            userId: !!user.id,
            receiverId: !!receiverId,
            propertyId: !!propertyId,
          }));
        }

        console.log('Sending chat history request:', {
          propertyId,
          userId: user.id,
          receiverId,
          timestamp: new Date().toISOString(),
        });

        const fetchedMessages = await Promise.race([
          chatService.getChatHistory(propertyId, user.id, receiverId),
          timeoutPromise(10000, 'Chat history request timed out'),
        ]);

        if (!Array.isArray(fetchedMessages)) {
          console.warn('Chat history is not an array:', {
            response: fetchedMessages,
            propertyId,
            userId: user.id,
            receiverId,
            timestamp: new Date().toISOString(),
          });
          setError('Invalid chat history data received');
          return;
        }

        setMessages((prev) => {
          const newMessages = fetchedMessages.filter(
            (msg) => !prev.some((existing) => existing._id === msg._id)
          );
          console.log('Updating messages state:', {
            newMessageCount: newMessages.length,
            totalMessages: prev.length + newMessages.length,
            messages: newMessages.map((m) => ({
              _id: m._id,
              senderId: m.senderId?._id || m.senderId,
              receiverId: m.receiverId?._id || m.receiverId,
              content: m.content?.substring(0, 50) + '...',
            })),
            timestamp: new Date().toISOString(),
          });
          return [...newMessages, ...prev];
        });

        console.log('Chat history fetched:', {
          messageCount: fetchedMessages.length,
          propertyId,
          userId: user.id,
          receiverId,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Failed to fetch chat history:', {
          error: err.message,
          response: err.response?.data,
          status: err.response?.status,
          propertyId,
          userId: user.id,
          receiverId,
          timestamp: new Date().toISOString(),
        });
        setError(`Failed to load chat history: ${err.message}`);
      }
    };

    fetchChatHistory();
  }, [user?.id, property, state?.receiverId, propertyFetched]);
  useEffect(() => {
    if (!token || error) {
      console.error('Skipping Socket.IO initialization due to missing token or error', {
        token: token ? 'present' : 'missing',
        error,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    console.log('Initializing Socket.IO', {
      token: token.substring(0, 10) + '...',
      timestamp: new Date().toISOString(),
    });

    let socket;
    chatService.initializeSocket(token).then((result) => {
      socket = result;
      if (!socket) {
        setError('Failed to connect to chat server. Please try again.');
        return;
      }

      chatService.onMessage((data) => {
        console.log('Received Socket.IO message:', {
          type: data.type,
          messageId: data.message?._id,
          senderId: data.message?.senderId,
          receiverId: data.message?.receiverId,
          content: data.message?.content?.substring(0, 50) + '...',
          timestamp: new Date().toISOString(),
        });
        if (data.type === 'chat' || data.type === 'chat_sent') {
          setMessages((prev) => {
            console.log('Updating messages state from socket:', {
              messageId: data.message._id,
              senderId: data.message.senderId,
              receiverId: data.message.receiverId,
              isDuplicate: prev.some((msg) => msg._id === data.message._id),
              timestamp: new Date().toISOString(),
            });
            if (prev.some((msg) => msg._id === data.message._id)) {
              return prev;
            }
            return [...prev, data.message];
          });
        } else if (data.type === 'error') {
          console.error('Socket.IO error received:', {
            message: data.message,
            timestamp: new Date().toISOString(),
          });
          setError(data.message);
        }
      });
    }).catch((err) => {
      console.error('Socket.IO initialization failed:', {
        error: err.message,
        timestamp: new Date().toISOString(),
      });
      setError('Failed to initialize chat connection');
    });

    return () => {
      console.log('Cleaning up Socket.IO', { timestamp: new Date().toISOString() });
      chatService.closeSocket();
    };
  }, [token, error]);

  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesContainerRef.current) {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
        }
        const container = messagesContainerRef.current;
        container.scrollTop = container.scrollHeight;
      }
    };
    const timer = setTimeout(scrollToBottom, 0);
    return () => clearTimeout(timer);
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.id || !propertyFetched || !property) {
      setError('Cannot send message: Property data not loaded or user not authenticated');
      return;
    }

    try {
      let recipientId = state?.receiverId;
      let recipientSource = 'navigation state';

      if (!recipientId) {
        const ownerId = property.ownerId?._id || property.ownerId;
        if (!ownerId) {
          setError('Property owner information not available');
          return;
        }
        if (user.id === ownerId) {
          const firstRenterMessage = messages.find((msg) => msg.senderId._id !== user.id);
          if (!firstRenterMessage || !firstRenterMessage.senderId) {
            setError('No renter message found. Please wait for the renter to initiate the chat.');
            return;
          }
          recipientId = firstRenterMessage.senderId._id;
          recipientSource = 'first renter message';
        } else {
          recipientId = ownerId;
          recipientSource = 'property ownerId';
        }
      }

      console.log('Preparing to send message:', {
        senderId: user.id,
        recipientId,
        recipientSource,
        propertyId,
        content: newMessage.substring(0, 50) + '...',
        isOwner: user.id === (property.ownerId?._id || property.ownerId),
        messageCount: messages.length,
        timestamp: new Date().toISOString(),
      });

      const socketMessage = {
        to: recipientId,
        propertyId,
        content: newMessage,
      };
      await chatService.sendSocketMessage(socketMessage);

      setNewMessage('');
    } catch (err) {
      console.error('Error in handleSubmit:', {
        error: err.message,
        propertyId,
        recipientId,
        timestamp: new Date().toISOString(),
      });
      setError('Failed to send message');
    }
  };

  const handleDealClick = () => {
    navigate(`/easyrent-deal-status/${propertyId}`);
  };

  const formatLocation = (location) => {
    if (!location) return 'Loading...';
    if (typeof location === 'string') return location;
    return `${location.address || ''}, ${location.city || ''}, ${location.state || ''}`.trim();
  };

  return (
    <div className="flex flex-row gap-4 h-screen bg-gray-100">
      <div className="flex flex-col flex-1 min-h-screen">
        <div className="bg-white shadow-sm p-4 border-b flex items-center gap-4">
          <img
            src={owner?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg'}
            alt={owner?.firstName || 'Owner'}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="font-semibold text-gray-900 text-lg">
              {owner?.firstName + ' ' + owner?.lastName || 'Loading...'}
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              Owner, <span className="text-green-600 font-semibold">Verified</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-medium ${
                dealStatus === 'active'
                  ? 'text-green-600'
                  : dealStatus === 'pending'
                  ? 'text-yellow-600'
                  : dealStatus === 'completed'
                  ? 'text-blue-600'
                  : dealStatus === 'cancelled'
                  ? 'text-red-600'
                  : 'text-gray-500'
              }`}
            >
              {dealStatus.charAt(0).toUpperCase() + dealStatus.slice(1)}
            </span>
            <button
              onClick={handleDealClick}
              className="bg-[#3B5ED6] text-white text-sm px-3 py-1 rounded-md hover:bg-[#2746a3] transition"
            >
              Deal
            </button>
          </div>
        </div>
        <div ref={messagesContainerRef} className="flex-1 p-6 overflow-y-auto bg-gray-50">
          {loading ? (
            <div className="text-center text-gray-500">Loading chat...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500">
              No messages yet. Start the conversation or check if messages exist for this property.
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isUser = msg.senderId._id === user.id;
              return (
                <div key={msg._id || idx} className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`relative max-w-md px-4 py-2 rounded-lg shadow-sm ${
                      isUser
                        ? 'bg-gray-200 text-gray-900 rounded-br-none'
                        : 'bg-blue-600 text-white rounded-bl-none'
                    }`}
                  >
                    {msg.content}
                    <div
                      className={`absolute bottom-0 w-3 h-3 ${
                        isUser
                          ? 'right-[-6px] bg-gray-200 transform rotate-45'
                          : 'left-[-6px] bg-blue-600 transform rotate-45'
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="bg-white p-4 flex items-center gap-3 border-t shadow-sm">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition disabled:opacity-50"
            disabled={!newMessage.trim() || !propertyFetched}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9-7-9-7m9 7H3" />
            </svg>
          </button>
        </form>
      </div>
      <div className="w-80 bg-white shadow-md p-6 h-screen overflow-y-auto border-l border-gray-200">
        <img
          src={property?.images?.[0]?.url ? `${baseUrl}/${property.images[0].url}` : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'}
          alt={property?.title || 'Property'}
          className="rounded-lg w-full h-56 object-cover mb-4"
          onError={(e) => {
            console.warn('Property image failed to load:', property?.images?.[0]?.url);
            e.target.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80';
          }}
        />
        <div className="space-y-3">
          <div className="font-bold text-gray-900 text-xl">{property?.title || 'Loading...'}</div>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.243l-4.243-4.243m0 0L9.172 7.757M13.414 12h6.586M4 12h6.586m2.828 0v6.586m0-13.172V4" />
            </svg>
            {formatLocation(property?.location)}
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0c-2.761 0-5 2.239-5 5s2.239 5 5 5 5-2.239 5-5-2.239-5-5-5zm0 0V4m0 16v-4" />
            </svg>
            ${property?.price?.toLocaleString() || '0'}/month
          </div>
        </div>
      </div>
    </div>
  );
}