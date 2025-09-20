require('dotenv').config();
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Use the environment variable for CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));

// Use the environment variable for Socket.IO CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.set('socketio', io);

const groupVotes = {}; 

io.on('connection', (socket) => {
  console.log('✅ A user connected:', socket.id);

  socket.on('joinGroup', (groupId) => {
    socket.join(groupId);
    console.log(`User ${socket.id} joined group room: ${groupId}`);
    socket.emit('voteUpdate', groupVotes[groupId] || {});
  });

  socket.on('userSwipedRight', ({ groupId, restaurantId }) => {
    if (!groupVotes[groupId]) groupVotes[groupId] = {};
    groupVotes[groupId][restaurantId] = (groupVotes[groupId][restaurantId] || 0) + 1;
    io.in(groupId).emit('voteUpdate', groupVotes[groupId]);
  });
  
  socket.on('sendMessage', (messageData) => {
    socket.to(messageData.groupId).emit('receiveMessage', messageData);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/group', require('./routes/group'));
app.use('/api/swipes', require('./routes/swipes'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});