import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, List, ListItem, ListItemAvatar,
  Avatar, ListItemText, IconButton, Typography, Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PeopleIcon from '@mui/icons-material/People';

const FriendsListModal = ({ open, onClose, friends }) => {
  // Helper to get initials from a name
  const getInitials = (name) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PeopleIcon />
        Your Friends
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {friends.length > 0 ? (
          <List>
            {friends.map(friend => (
              <ListItem key={friend.id}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>{getInitials(friend.name)}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={friend.name} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No friends yet. Create or join groups to connect with others!
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FriendsListModal;