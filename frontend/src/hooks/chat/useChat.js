import { useState, useEffect, useMemo } from 'react';
import * as chatService from '../../services/chat';

const timeoutPromise = (ms, message) =>
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error(message)), ms)
  );

export function useChat(user, token, property, propertyId, receiverIdFromState, propertyFetched) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userId = useMemo(() => user?.id || user?._id, [user]);
  useEffect(() => {
    if (!token) {
      setError('Authentication required. Please log in.');
      setLoading(false);
      console.log('Error: No token', { timestamp: new Date().toISOString() });
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
  }, [token]);

  useEffect(() => {
    let receiverId;
    if (userId !== property?.ownerId && propertyFetched) {
      receiverId = property?.ownerId;
      console.log('Receiver ID from property:', { receiverId, timestamp: new Date().toISOString() });
    } else {
      receiverId = receiverIdFromState;
      console.log('Receiver ID from state:', { receiverId, timestamp: new Date().toISOString() });
    }

    if (!userId || !propertyFetched || !receiverId) {
      console.log('Skipping chat history fetch:', {
        userId: !!userId,
        propertyFetched,
        receiverId: !!receiverId,
        timestamp: new Date().toISOString(),
      });
      setLoading(false);
      return;
    }

    const fetchChatHistory = async () => {
      try {
        console.log('Fetching chat history:', {
          propertyId,
          userId,
          receiverId,
          timestamp: new Date().toISOString(),
        });

        const fetchedMessages = await Promise.race([
          chatService.getChatHistory(propertyId, userId, receiverId),
          timeoutPromise(10000, 'Chat history request timed out'),
        ]);

        if (!Array.isArray(fetchedMessages)) {
          console.warn('Invalid chat history:', {
            response: fetchedMessages,
            timestamp: new Date().toISOString(),
          });
          setError('Invalid chat history data received');
          return;
        }

        setMessages(fetchedMessages);
        setLoading(false);
        console.log('Chat history fetched:', {
          messageCount: fetchedMessages.length,
          propertyId,
          userId,
          receiverId,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Chat history fetch failed:', {
          error: err.message,
          response: err.response?.data,
          status: err.response?.status,
          timestamp: new Date().toISOString(),
        });
        setError(`Failed to load chat history: ${err.message}`);
        setLoading(false);
      }
    };

    fetchChatHistory();
  }, [userId, property, receiverIdFromState, propertyFetched, propertyId]);

  useEffect(() => {
    if (!token || error) {
      console.error('Skipping Socket.IO:', {
        token: !!token,
        error,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    console.log('Initializing Socket.IO:', { timestamp: new Date().toISOString() });
    let socket;
    chatService.initializeSocket(token).then((result) => {
      socket = result;
      if (!socket) {
        setError('Failed to connect to chat server.');
        console.error('Socket.IO connection failed:', { timestamp: new Date().toISOString() });
        return;
      }

      chatService.onMessage((data) => {
        console.log('Socket.IO message:', {
          type: data.type,
          messageId: data.message?._id,
          senderId: data.message?.senderId,
          content: data.message?.content?.substring(0, 50) + '...',
          timestamp: new Date().toISOString(),
        });
        if (data.type === 'chat' || data.type === 'chat_sent') {
          setMessages((prev) => {
            if (prev.some((msg) => msg._id === data.message._id)) {
              return prev;
            }
            return [...prev, data.message];
          });
        } else if (data.type === 'error') {
          setError(data.message);
          console.error('Socket.IO error:', {
            message: data.message,
            timestamp: new Date().toISOString(),
          });
        }
      });
    }).catch((err) => {
      setError('Failed to initialize chat connection');
      console.error('Socket.IO init failed:', {
        error: err.message,
        timestamp: new Date().toISOString(),
      });
    });

    return () => {
      console.log('Cleaning up Socket.IO:', { timestamp: new Date().toISOString() });
      chatService.closeSocket();
    };
  }, [token, error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId || !propertyFetched || !property) {
      setError('Cannot send message: Missing data or user not authenticated');
      console.warn('Message send blocked:', {
        newMessage: !!newMessage.trim(),
        userId: !!userId,
        propertyFetched,
        property: !!property,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    try {
      let recipientId = receiverIdFromState;
      let recipientSource = 'navigation state';

      if (!recipientId) {
        const ownerId = property.ownerId?._id || property.ownerId;
        if (!ownerId) {
          setError('Property owner information not available');
          console.warn('No owner ID:', { timestamp: new Date().toISOString() });
          return;
        }
        if (userId === ownerId) {
          const firstRenterMessage = messages.find((msg) => (msg.senderId?._id || msg.senderId) !== userId);
          if (!firstRenterMessage || !firstRenterMessage.senderId) {
            setError('No renter message found. Wait for renter to initiate chat.');
            console.warn('No renter message:', { timestamp: new Date().toISOString() });
            return;
          }
          recipientId = firstRenterMessage.senderId?._id || firstRenterMessage.senderId;
          recipientSource = 'first renter message';
        } else {
          recipientId = ownerId;
          recipientSource = 'property ownerId';
        }
      }

      console.log('Sending message:', {
        senderId: userId,
        recipientId,
        recipientSource,
        propertyId,
        content: newMessage.substring(0, 50) + '...',
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
      setError('Failed to send message');
      console.error('Message send failed:', {
        error: err.message,
        timestamp: new Date().toISOString(),
      });
    }
  };

  return {
    messages,
    newMessage,
    setNewMessage,
    loading,
    error,
    setError,
    handleSubmit,
    userId,
  };
}