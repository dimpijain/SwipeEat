require('dotenv').config();
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Make io accessible to your routes
app.set('socketio', io);

// Socket.io only needs to manage rooms now
io.on('connection', (socket) => {
  console.log('✅ A user connected:', socket.id);

  socket.on('joinGroup', (groupId) => {
    socket.join(groupId);
    console.log(`User ${socket.id} joined group room: ${groupId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});
// ... (Your existing server setup: express, http, cors, etc.)

// ✅ ADDED: In-memory storage for live vote counts for the async model
const groupVotes = {}; 

io.on('connection', (socket) => {
  console.log('✅ A user connected:', socket.id);

  socket.on('joinGroup', (groupId) => {
    socket.join(groupId);
    console.log(`User ${socket.id} joined group room: ${groupId}`);
    // When a new user joins, send them the current vote counts
    socket.emit('voteUpdate', groupVotes[groupId] || {});
  });

  // ✅ ADDED: Handler for right swipes
  socket.on('userSwipedRight', ({ groupId, restaurantId }) => {
    if (!groupVotes[groupId]) groupVotes[groupId] = {};
    groupVotes[groupId][restaurantId] = (groupVotes[groupId][restaurantId] || 0) + 1;
    // Broadcast the new vote counts to everyone in the group
    io.in(groupId).emit('voteUpdate', groupVotes[groupId]);
  });
  
  // ✅ ADDED: Handler for chat messages
  socket.on('sendMessage', (messageData) => {
    // Broadcast the message to everyone else in the group room
    // The 'sender' will be overwritten by the server with the user's actual name if you have that data
    socket.to(messageData.groupId).emit('receiveMessage', messageData);
  });

  socket.on('disconnect', () => { /* ... */ });
});

// ... (Rest of your server.js: routes, server.listen)
// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/group', require('./routes/group'));
app.use('/api/swipes', require('./routes/swipes'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});