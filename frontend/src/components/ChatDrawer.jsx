import React, { useState, useEffect, useRef } from 'react';
import socket from '../socket';
import {
  Drawer, Box, Typography, List, ListItem, ListItemText, TextField, IconButton
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const ChatDrawer = ({ groupId, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Listen for incoming messages from the server
    const handleReceiveMessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };
    socket.on('receiveMessage', handleReceiveMessage);

    // Clean up the listener when the component is not in use
    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const messageData = {
        groupId,
        text: newMessage,
        sender: 'Me', 
      };
      // Send the message to the server
      socket.emit('sendMessage', messageData);
      // Optimistically add the message to our own screen
      setMessages((prevMessages) => [...prevMessages, messageData]);
      setNewMessage('');
    }
  };

  return (
    <Drawer anchor="right" open={isOpen} onClose={onClose}>
      <Box sx={{ width: 320, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider', textAlign: 'center' }}>
          Group Chat
        </Typography>
        <List sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}>
          {messages.map((msg, index) => (
            <ListItem key={index} sx={{ justifyContent: msg.sender === 'Me' ? 'flex-end' : 'flex-start' }}>
              <ListItemText 
                primary={msg.text} 
                secondary={msg.sender}
                sx={{ flex: 'none' }}
                primaryTypographyProps={{ sx: { 
                  bgcolor: msg.sender === 'Me' ? 'primary.main' : 'grey.200',
                  color: msg.sender === 'Me' ? 'white' : 'black',
                  p: 1.5, 
                  borderRadius: 3,
                }}}
                secondaryTypographyProps={{ sx: { textAlign: msg.sender === 'Me' ? 'right' : 'left', pr: 1, pt: 0.5 } }}
              />
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
        <Box 
          component="form" 
          onSubmit={handleSendMessage}
          sx={{ p: 1, display: 'flex', borderTop: 1, borderColor: 'divider' }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            autoComplete="off"
          />
          <IconButton type="submit" color="primary">
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ChatDrawer;