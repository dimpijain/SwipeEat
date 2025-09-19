import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Pass the auth token when connecting
const socket = io(SERVER_URL, {
  autoConnect: false,
  auth: {
    token: localStorage.getItem('token')
  }
});

// ✅ ADD: A function to update the token if the user logs in/out
export const updateSocketToken = () => {
    socket.auth.token = localStorage.getItem('token');
};

export default socket;