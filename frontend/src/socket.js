import { io } from 'socket.io-client';

// Define the URL of your backend server
const SERVER_URL = 'http://localhost:5000';

// Create the socket instance
const socket = io(SERVER_URL, {
  autoConnect: false // We will connect manually when the user enters the swipe screen
});

export default socket;