import { io } from 'socket.io-client';
import apiClient from './apiClient';

// Socket.IO connection
let socket = null;
let messageCallback = null;
let currentToken = null;

// Store pending messages for offline users
const pendingMessages = new Map();

// Attempt to refresh token
const refreshToken = async () => {
  try {
    console.log('Attempting to refresh token', { timestamp: new Date().toISOString() });
    const res = await apiClient.post('/auth/refresh');
    const newToken = res.data.token;
    console.log('Token refreshed successfully', {
      token: newToken.substring(0, 20) + '...',
      timestamp: new Date().toISOString(),
    });
    return newToken;
  } catch (error) {
    console.error('Failed to refresh token', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
      timestamp: new Date().toISOString(),
    });
    return null;
  }
};

// Socket.IO initialization
export const initializeSocket = async (token) => {
  if (!token) {
    console.error('No token provided for Socket.IO connection', {
      timestamp: new Date().toISOString(),
    });
    return null;
  }

  const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
  currentToken = cleanToken;

  // Validate token
  let tokenPayload = null;
  try {
    tokenPayload = JSON.parse(atob(cleanToken.split('.')[1]));
    console.log('Token payload:', {
      userId: tokenPayload.userId,
      exp: new Date(tokenPayload.exp * 1000).toISOString(),
      isExpired: tokenPayload.exp * 1000 < Date.now(),
      timestamp: new Date().toISOString(),
    });
    if (tokenPayload.exp * 1000 < Date.now()) {
      console.warn('Token is expired, attempting to refresh', {
        userId: tokenPayload.userId,
        timestamp: new Date().toISOString(),
      });
      const newToken = await refreshToken();
      if (!newToken) {
        console.error('Unable to refresh token', { timestamp: new Date().toISOString() });
        return null;
      }
      currentToken = newToken;
      tokenPayload = JSON.parse(atob(newToken.split('.')[1]));
    }
  } catch (error) {
    console.error('Invalid token format', {
      error: error.message,
      token: cleanToken.substring(0, 20) + '...',
      timestamp: new Date().toISOString(),
    });
    return null;
  }

  const socketUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';
  console.log('Initializing Socket.IO connection:', {
    socketUrl,
    userId: tokenPayload.userId,
    timestamp: new Date().toISOString(),
  });

  try {
    if (socket && socket.connected) {
      console.log('Closing existing Socket.IO connection', {
        socketId: socket.id,
        timestamp: new Date().toISOString(),
      });
      socket.disconnect();
    }

    socket = io(socketUrl, {
      query: { token: currentToken },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Socket.IO connection established', {
        socketId: socket.id,
        userId: tokenPayload.userId,
        timestamp: new Date().toISOString(),
      });
      sendPendingMessages();
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', {
        error: error.message,
        socketId: socket.id,
        userId: tokenPayload.userId,
        timestamp: new Date().toISOString(),
      });
      if (error.message === 'Invalid token' || error.message === 'User not found') {
        refreshToken().then((newToken) => {
          if (newToken) {
            console.log('Retrying Socket.IO connection with new token', {
              timestamp: new Date().toISOString(),
            });
            initializeSocket(newToken);
          } else {
            console.error('Failed to refresh token, cannot reconnect', {
              timestamp: new Date().toISOString(),
            });
          }
        });
      }
    });

    socket.on('chat', (data) => {
      console.log('Received Socket.IO chat message:', {
        type: data.type,
        messageId: data.message?._id,
        senderId: data.message?.senderId,
        receiverId: data.message?.receiverId,
        timestamp: new Date().toISOString(),
      });
      messageCallback?.(data);
    });

    socket.on('chat_sent', (data) => {
      console.log('Socket.IO chat message sent confirmation:', {
        type: data.type,
        messageId: data.message?._id,
        senderId: data.message?.senderId,
        timestamp: new Date().toISOString(),
      });
      messageCallback?.(data);
    });

    socket.on('error', (data) => {
      console.error('Socket.IO server error:', {
        message: data.message,
        socketId: socket.id,
        timestamp: new Date().toISOString(),
      });
      messageCallback?.({ type: 'error', message: data.message });
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', {
        reason,
        socketId: socket.id,
        userId: tokenPayload.userId,
        timestamp: new Date().toISOString(),
      });
    });

    return socket;
  } catch (error) {
    console.error('Error initializing Socket.IO connection:', {
      error: error.message,
      userId: tokenPayload?.userId,
      timestamp: new Date().toISOString(),
    });
    return null;
  }
};

// Store message for offline user
const storeOfflineMessage = (message) => {
  const { to } = message;
  if (!pendingMessages.has(to)) {
    pendingMessages.set(to, []);
  }
  pendingMessages.get(to).push(message);
  console.log('Stored offline message:', {
    to,
    messageId: message.message?._id,
    timestamp: new Date().toISOString(),
  });
};

// Send pending messages when user comes online
const sendPendingMessages = () => {
  if (socket?.connected) {
    pendingMessages.forEach((messages, userId) => {
      messages.forEach((message) => {
        socket.emit('chat', message);
        console.log('Sending pending message:', {
          userId,
          messageId: message.message?._id,
          timestamp: new Date().toISOString(),
        });
      });
    });
    pendingMessages.clear();
    console.log('Cleared pending messages', {
      timestamp: new Date().toISOString(),
    });
  } else {
    console.warn('Cannot send pending messages: Socket.IO not connected', {
      connected: socket?.connected,
      timestamp: new Date().toISOString(),
    });
  }
};

// Close the Socket.IO connection
export const closeSocket = () => {
  if (socket) {
    console.log('Closing Socket.IO connection', {
      socketId: socket.id,
      connected: socket.connected,
      timestamp: new Date().toISOString(),
    });
    socket.disconnect();
    socket = null;
    messageCallback = null;
    currentToken = null;
  }
};

export const getChatHistory = async (propertyId, userId, receiverId) => {
  try {
    if (!userId) throw new Error('User ID is required');
    if (!receiverId) throw new Error('Receiver ID is required');
    console.log('Fetching chat history:', {
      propertyId,
      userId,
      receiverId,
      timestamp: new Date().toISOString(),
    });
    const res = await apiClient.get(`/chat/${propertyId}/${userId}/${receiverId}`);
    console.log('Chat history fetched:', {
      messageCount: res.data.length,
      propertyId,
      userId,
      receiverId,
      timestamp: new Date().toISOString(),
    });
    return res.data;
  } catch (error) {
    console.error('Get chat history error:', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
      propertyId,
      userId,
      receiverId,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
};

export const getConversations = async () => {
  try {
    console.log('Fetching conversations', {
      timestamp: new Date().toISOString(),
    });
    const res = await apiClient.get('/chat/conversations');
    console.log('Conversations fetched:', {
      conversationCount: res.data.length,
      timestamp: new Date().toISOString(),
    });
    return res.data;
  } catch (error) {
    console.error('Get conversations error:', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
};

export const markAsRead = async (propertyId, userId) => {
  try {
    if (!userId) throw new Error('User ID is required');
    console.log('Marking messages as read:', {
      propertyId,
      userId,
      timestamp: new Date().toISOString(),
    });
    const res = await apiClient.put(`/chat/${propertyId}/${userId}/read`);
    console.log('Messages marked as read:', {
      propertyId,
      userId,
      timestamp: new Date().toISOString(),
    });
    return res.data;
  } catch (error) {
    console.error('Mark as read error:', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
      propertyId,
      userId,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
};

// Socket.IO message handlers
export const onMessage = (callback) => {
  messageCallback = callback;
  console.log('Message handler registered', {
    timestamp: new Date().toISOString(),
  });
};

export const sendSocketMessage = async (message) => {
  if (!socket || !socket.connected) {
    console.warn('Socket.IO not connected, attempting to reconnect...', {
      connected: socket?.connected,
      socketId: socket?.id,
      timestamp: new Date().toISOString(),
    });
    if (currentToken) {
      await initializeSocket(currentToken);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  if (!socket || !socket.connected) {
    console.error('Cannot send message: Socket.IO not connected', {
      message: { ...message, content: message.content?.substring(0, 50) + '...' },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  try {
    socket.emit('chat', { type: 'chat', ...message, timestamp: new Date().toISOString() });
    console.log('Sending Socket.IO chat message:', {
      type: 'chat',
      to: message.to,
      propertyId: message.propertyId,
      content: message.content?.substring(0, 50) + '...',
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error sending Socket.IO message:', {
      error: error.message,
      message: { ...message, content: message.content?.substring(0, 50) + '...' },
      socketId: socket?.id,
      timestamp: new Date().toISOString(),
    });
  }
};

export const getPropertyDetails = async (propertyId) => {
  try {
    console.log('Fetching property details:', {
      propertyId,
      timestamp: new Date().toISOString(),
    });
    const res = await apiClient.get(`/properties/${propertyId}`);
    console.log('Property details fetched:', {
      propertyId,
      ownerId: res.data.ownerId,
      title: res.data.title,
      timestamp: new Date().toISOString(),
    });
    return res.data;
  } catch (error) {
    console.error('Get property details error:', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
      propertyId,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
};

export const getUserDetails = async (userId) => {
  try {
    console.log('Fetching user details:', {
      userId,
      timestamp: new Date().toISOString(),
    });
    const res = await apiClient.get(`/users/${userId}`);
    console.log('User details fetched:', {
      userId,
      email: res.data.email,
      timestamp: new Date().toISOString(),
    });
    return res.data;
  } catch (error) {
    console.error('Get user details error:', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
      userId,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
};

export const getChatRequestCounts = async () => {
  try {
    console.log('Fetching chat request counts', {
      timestamp: new Date().toISOString(),
    });
    const response = await apiClient.get('/chat/request-counts');
    console.log('Chat request counts fetched:', {
      counts: response.data,
      timestamp: new Date().toISOString(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching chat request counts:', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
};

export const createMessage = async (message) => {
  try {
    console.log('Creating message:', {
      senderId: message.senderId,
      receiverId: message.receiverId,
      propertyId: message.propertyId,
      content: message.content?.substring(0, 50) + '...',
      read: message.read || false,
      timestamp: new Date().toISOString(),
    });
    const res = await apiClient.post('/chat', {
      senderId: message.senderId,
      receiverId: message.receiverId,
      propertyId: message.propertyId,
      content: message.content,
      read: message.read || false, // Default to false as per schema
    });
    const savedMessage = res.data;
    console.log('Message created successfully:', {
      messageId: savedMessage._id,
      senderId: savedMessage.senderId,
      receiverId: savedMessage.receiverId,
      read: savedMessage.read,
      createdAt: savedMessage.createdAt,
      timestamp: new Date().toISOString(),
    });
    return savedMessage;
  } catch (error) {
    console.error('Error creating message:', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
      message: { ...message, content: message.content?.substring(0, 50) + '...' },
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
};

export const getChatRequesters = async (propertyId, userId) => {
  try {
    if (!propertyId) throw new Error('Property ID is required');
    if (!userId) throw new Error('User ID is required');
    console.log('Fetching chat requesters:', {
      propertyId,
      userId,
      timestamp: new Date().toISOString(),
    });
    const res = await apiClient.get(`/chat/requesters/${propertyId}`, {
      params: { userId }
    });
    console.log('Chat requesters fetched:', {
      requesterCount: res.data.length,
      requesters: res.data.map((r) => ({ _id: r._id, name: r.name })),
      propertyId,
      userId,
      timestamp: new Date().toISOString(),
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching chat requesters:', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
      propertyId,
      userId,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
};