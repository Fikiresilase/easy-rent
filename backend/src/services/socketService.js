const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');

const JWT_SECRET = process.env.JWT_SECRET || 'your_default_jwt_secret_key_123';

// Store connected clients at module scope
const clients = new Map();

const initializeWebSocket = (server) => {
  console.log('Initializing WebSocket server...');
  
  const wss = new WebSocket.Server({ server });

  wss.on('connection', async (ws, req) => {
    console.log('New WebSocket connection attempt:', {
      url: req.url,
      headers: req.headers,
      timestamp: new Date().toISOString()
    });

    try {
      // Extract token from URL
      const url = new URL(req.url, 'ws://localhost');
      const token = url.searchParams.get('token');
      
      console.log('Token received:', {
        hasToken: !!token,
        tokenLength: token?.length,
        timestamp: new Date().toISOString()
      });

      if (!token) {
        console.error('No token provided in WebSocket connection');
        ws.close(1008, 'Authentication required');
        return;
      }

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Token verified:', {
        userId: decoded.userId,
        timestamp: new Date().toISOString()
      });

      // Get user details
      const user = await User.findById(decoded.userId);
      if (!user) {
        console.error('User not found for WebSocket connection:', {
          userId: decoded.userId,
          timestamp: new Date().toISOString()
        });
        ws.close(1008, 'User not found');
        return;
      }

      console.log('User authenticated for WebSocket:', {
        userId: user._id,
        email: user.email,
        timestamp: new Date().toISOString()
      });

      // Store client connection
      clients.set(user._id.toString(), ws);
      console.log('Client connected:', {
        userId: user._id,
        totalConnections: clients.size,
        timestamp: new Date().toISOString()
      });

      // Handle messages
      ws.on('message', (message) => {
        console.log('Received WebSocket message:', {
          from: user._id,
          message: message.toString(),
          timestamp: new Date().toISOString()
        });

        try {
          const data = JSON.parse(message);
          // Handle different message types
          switch (data.type) {
            case 'chat':
              handleChatMessage(data, user);
              break;
            default:
              console.warn('Unknown message type:', {
                type: data.type,
                timestamp: new Date().toISOString()
              });
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', {
            error: error.message,
            message: message.toString(),
            timestamp: new Date().toISOString()
          });
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        console.log('Client disconnected:', {
          userId: user._id,
          timestamp: new Date().toISOString()
        });
        clients.delete(user._id.toString());
        console.log('Remaining connections:', {
          count: clients.size,
          timestamp: new Date().toISOString()
        });
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', {
          userId: user._id,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      });

    } catch (error) {
      console.error('WebSocket connection error:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      ws.close(1011, 'Internal server error');
    }
  });

  return {
    broadcast: (message) => {
      console.log('Broadcasting message to all clients:', {
        message,
        clientCount: clients.size,
        timestamp: new Date().toISOString()
      });
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    },
    sendToUser: (userId, message) => {
      console.log('Sending message to specific user:', {
        userId,
        message,
        timestamp: new Date().toISOString()
      });
      const client = clients.get(userId);
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      } else {
        console.warn('User not connected or connection not open:', {
          userId,
          hasClient: !!client,
          readyState: client?.readyState,
          timestamp: new Date().toISOString()
        });
      }
    }
  };
};

const handleChatMessage = async (data, sender) => {
  console.log('Processing chat message:', {
    from: sender._id,
    to: data.to,
    propertyId: data.propertyId,
    content: data.content,
    timestamp: new Date().toISOString()
  });

  try {
    // Create new message in database
    const message = new Message({
      senderId: sender._id,
      receiverId: data.to,
      propertyId: data.propertyId,
      content: data.content,
      read: false
    });

    await message.save();
    console.log('Message saved to database:', {
      messageId: message._id,
      timestamp: new Date().toISOString()
    });

    // Populate sender and receiver details
    await message.populate('senderId', 'email profile');
    await message.populate('receiverId', 'email profile');

    // Send message to recipient if they're connected
    const recipientWs = clients.get(data.to);
    if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
      recipientWs.send(JSON.stringify({
        type: 'chat',
        message: message
      }));
      console.log('Message sent to recipient:', {
        recipientId: data.to,
        messageId: message._id,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('Recipient not connected:', {
        recipientId: data.to,
        messageId: message._id,
        timestamp: new Date().toISOString()
      });
    }

    // Send confirmation to sender
    const senderWs = clients.get(sender._id.toString());
    if (senderWs && senderWs.readyState === WebSocket.OPEN) {
      senderWs.send(JSON.stringify({
        type: 'chat_sent',
        message: message
      }));
      console.log('Confirmation sent to sender:', {
        senderId: sender._id,
        messageId: message._id,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Error processing chat message:', {
      error: error.message,
      data,
      timestamp: new Date().toISOString()
    });

    // Notify sender of error
    const senderWs = clients.get(sender._id.toString());
    if (senderWs && senderWs.readyState === WebSocket.OPEN) {
      senderWs.send(JSON.stringify({
        type: 'error',
        message: 'Failed to send message',
        error: error.message
      }));
    }
  }
};

module.exports = initializeWebSocket; 