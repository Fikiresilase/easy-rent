const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Message = require('./models/Message');
const chatRoutes = require('./routes/chat');
const propertyRoutes = require('./routes/property');
const authRoutes = require('./routes/auth');

// Load environment variables
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// WebSocket server setup
const wss = new WebSocket.Server({ server });
const clients = new Map();

wss.on('connection', async (ws, req) => {
  console.log('New WebSocket connection attempt');

  try {
    // Extract token from URL
    const url = new URL(req.url, 'ws://localhost');
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(1008, 'Authentication required');
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      ws.close(1008, 'User not found');
      return;
    }

    // Store client connection
    clients.set(user._id.toString(), ws);
    console.log(`User connected: ${user._id}`);

    // Handle messages
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'chat') {
          // Create new message
          const newMessage = new Message({
            senderId: user._id,
            receiverId: data.to,
            propertyId: data.propertyId,
            content: data.content,
            read: false
          });

          await newMessage.save();
          
          // Populate sender and receiver details
          await newMessage.populate('senderId', 'email profile');
          await newMessage.populate('receiverId', 'email profile');

          // Send to recipient if connected
          const recipientWs = clients.get(data.to);
          if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
            recipientWs.send(JSON.stringify({
              type: 'chat',
              message: newMessage
            }));
          }

          // Send confirmation to sender
          ws.send(JSON.stringify({
            type: 'chat_sent',
            message: newMessage
          }));
        }
      } catch (error) {
        console.error('Error processing message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Failed to process message'
        }));
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      clients.delete(user._id.toString());
      console.log(`User disconnected: ${user._id}`);
    });

  } catch (error) {
    console.error('WebSocket error:', error);
    ws.close(1011, 'Internal server error');
  }
});

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gebeya-home-rental')
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Start server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`WebSocket server running on ws://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Don't crash the server, just log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Give time for logging before exiting
  setTimeout(() => {
    process.exit(1);
  }, 1000);
}); 