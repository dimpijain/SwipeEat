import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Grid, Paper, Button, Card, CardContent, CardActions, TextField, CircularProgress, IconButton, Divider, Tabs,
  Tab, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Slide, List, ListItem, ListItemText, Chip,
} from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
//import 'react-toastify/dist/React-toastify.css';
import CreateGroup from '../components/CreateGroup';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import CloseIcon from '@mui/icons-material/Close'; // For modal close button
import GroupIcon from '@mui/icons-material/Group';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star'; // For matched restaurant rating
import EventIcon from '@mui/icons-material/Event'; // For Events/Calendar section

// Calendar imports
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers';
import moment from 'moment';

// NEW: Import the Google API service
import { getRestaurantDetails } from '../services/googleApiService';


const COLORS = {
  primary: '#FF7F7F',
  secondary: '#FFD6B0',
  background: '#FFF9FA',
  textPrimary: '#575761',
  cardBackground: '#FFF5F8',
  sidebarBackground: '#FFEDE7',
  accent: '#B5EAD7'
};

axios.defaults.baseURL = 'http://localhost:5000';

const useGroups = (token) => {
  const [createdGroups, setCreatedGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/group/my', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setCreatedGroups(res.data.createdGroups || []);
        setJoinedGroups(res.data.joinedGroups || []);
      } else {
        throw new Error(res.data.message || 'Failed to load groups');
      }
    } catch (err) {
      setError(err.message);
      console.error('Fetch groups error:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
      if (token) {
          fetchGroups();
      }
  }, [token, fetchGroups]);

  return { createdGroups, joinedGroups, loading, error, refetch: fetchGroups };
};

// --- Animated Sidebar Component ---
const Sidebar = ({ username, onLogout, open, onClose }) => (
  <Slide direction="right" in={open} mountOnEnter unmountOnExit>
    <Box
      sx={{
        width: 300,
        bgcolor: COLORS.sidebarBackground,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        px: 4,
        py: 6,
        borderRight: `2px solid ${COLORS.cardBackground}`,
        position: 'fixed',
        height: '100vh',
        zIndex: 1000,
        boxShadow: 6,
        left: 0,
      }}
    >
      <Box>
        <IconButton
            onClick={onClose}
            sx={{ position: 'absolute', top: 16, right: 16, color: COLORS.textPrimary }}
        >
            <CloseIcon />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, mt: 4 }}>
          <FastfoodIcon sx={{ color: COLORS.primary, fontSize: 36, mr: 1 }} />
          <Typography
            variant="h4"
            fontWeight={800}
            color={COLORS.primary}
            sx={{ fontFamily: "'Pacifico', cursive" }}
          >
            SwipeEat
          </Typography>
          <RestaurantIcon sx={{ color: COLORS.primary, fontSize: 36, ml: 1 }} />
        </Box>
        <Typography variant="h6" fontWeight={600} color={COLORS.textPrimary}>
          Welcome,
        </Typography>
        <Typography variant="h5" fontWeight={700} color={COLORS.primary}>
          {username || 'User'}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          variant="contained"
          color="error"
          fullWidth
          onClick={onLogout}
          sx={{
            fontWeight: 700,
            py: 1.5,
            borderRadius: 3,
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  </Slide>
);

const GroupCard = ({ group, isOwner, onDelete, onLeave, onClick }) => (
  <Paper
    elevation={3}
    onClick={onClick}
    sx={{
      bgcolor: COLORS.cardBackground,
      p: 3,
      borderRadius: 3,
      height: '100%',
      position: 'relative',
      transition: 'transform 0.2s',
      cursor: 'pointer',
      '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: `0 4px 8px rgba(0,0,0,0.1)`
      }
    }}
  >
    <Typography variant="h6" fontWeight={700} color={COLORS.primary}>
      {group.name}
    </Typography>
    {isOwner && (
      <Typography variant="body2" color={COLORS.textPrimary} mt={1}>
        Invite Code: <strong>{group.joinCode}</strong>
      </Typography>
    )}
    <Typography variant="body2" color={COLORS.textPrimary} mt={1}>
      {group.members?.length || 0} members
    </Typography>
    <Typography variant="caption" color={COLORS.textPrimary} mt={2} display="block">
      {isOwner
        ? `Created: ${new Date(group.createdAt).toLocaleDateString()}`
        : `Joined: ${new Date(group.joinDate).toLocaleDateString()}`}
    </Typography>

    <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
      {isOwner ? (
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onDelete(group._id);
          }}
          color="error"
          size="small"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      ) : (
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onLeave(group._id);
          }}
          sx={{ py: 0.5, fontSize: '0.75rem' }}
        >
          Leave Group
        </Button>
      )}
    </Box>
  </Paper>
);

const JoinGroupForm = ({ token, onGroupChange }) => {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) {
      toast.error('Please enter an invite code');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        '/api/group/join',
        { code: inviteCode.toUpperCase() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success(`Joined group: ${response.data.group.name}`);
        onGroupChange();
        setInviteCode('');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message ||
                           error.message ||
                           'Failed to join group';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <TextField
        fullWidth
        label="Group Invite Code"
        value={inviteCode}
        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
        margin="normal"
        inputProps={{ maxLength: 6 }}
        placeholder="Enter 6-digit code"
        sx={{
            '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: COLORS.primary },
                '&:hover fieldset': { borderColor: COLORS.primary },
                '&.Mui-focused fieldset': { borderColor: COLORS.primary },
            },
            '& .MuiInputLabel-root': { color: COLORS.textPrimary },
            '& .MuiInputBase-input': { color: COLORS.textPrimary },
        }}
      />
      <Button
        fullWidth
        variant="contained"
        onClick={handleJoinGroup}
        disabled={loading || !inviteCode.trim()}
        sx={{
          mt: 2,
          bgcolor: COLORS.primary,
          '&:hover': { bgcolor: COLORS.primary },
          py: 1.5,
          borderRadius: 2
        }}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : 'Join Group'}
      </Button>
    </Box>
  );
};

// --- MODIFIED: GroupDetailsModal now fetches details from Google ---
const GroupDetailsModal = ({ open, onClose, group, token, onSwipeRedirect }) => {
    const [matchedRestaurants, setMatchedRestaurants] = useState([]);
    const [loadingMatches, setLoadingMatches] = useState(false);
    const [matchesError, setMatchesError] = useState(null);

    useEffect(() => {
        if (open && group?._id && token) {
            const fetchMatches = async () => {
                setLoadingMatches(true);
                setMatchesError(null);
                try {
                    // 1. Fetch the list of matched restaurant IDs from your backend
                    const response = await axios.get(`/api/group/${group._id}/matches`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    const matchedIds = response.data.matchedRestaurantIds || [];

                    if (matchedIds.length > 0) {
                        // 2. Fetch details for each matched ID from Google using Promise.all
                        const restaurantDetailsPromises = matchedIds.map(id => getRestaurantDetails(id));
                        const restaurantsWithDetails = await Promise.all(restaurantDetailsPromises);
                        setMatchedRestaurants(restaurantsWithDetails);
                    } else {
                        setMatchedRestaurants([]);
                    }

                } catch (err) {
                    console.error('Error fetching matched restaurants for modal:', err);
                    setMatchesError('Failed to load matched restaurants.');
                } finally {
                    setLoadingMatches(false);
                }
            };
            fetchMatches();
        }
    }, [open, group, token]);

    if (!group) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: COLORS.cardBackground,
                    borderRadius: 3,
                    boxShadow: 24,
                    p: 2,
                }
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography variant="h5" fontWeight={700} color={COLORS.primary}>
                    {group.name} Details
                </Typography>
                <IconButton onClick={onClose} sx={{ color: COLORS.textPrimary }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ pt: 2 }}>
                <Typography variant="h6" color={COLORS.textPrimary} mt={1} mb={1}>
                    <GroupIcon sx={{ verticalAlign: 'bottom', mr: 1 }} /> Members:
                </Typography>
                <List dense disablePadding>
                    {group.members && group.members.length > 0 ? (
                        group.members.map((member, index) => (
                            <ListItem key={index} sx={{ py: 0.5 }}>
                                <ListItemText
                                    primary={member.user ? member.user.name : 'Unknown User'}
                                    secondary={`Joined: ${new Date(member.joinedAt).toLocaleDateString()}`}
                                    primaryTypographyProps={{ color: COLORS.textPrimary }}
                                    secondaryTypographyProps={{ color: 'text.secondary', fontSize: '0.85rem' }}
                                />
                            </ListItem>
                        ))
                    ) : (
                        <Typography variant="body2" color="text.secondary" ml={2}>No members found.</Typography>
                    )}
                </List>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" color={COLORS.textPrimary} mt={2} mb={1}>
                    <LocationOnIcon sx={{ verticalAlign: 'bottom', mr: 1 }} /> Group Preferences:
                </Typography>
                <Typography variant="body1" color={COLORS.textPrimary} sx={{ mb: 1 }}>
                    <strong>Invite Code:</strong> {group.joinCode}
                </Typography>
                {group.cuisinePreferences && group.cuisinePreferences.length > 0 && (
                    <Box mt={1} mb={1}>
                        <Typography variant="body2" color={COLORS.textPrimary}><strong>Cuisines:</strong></Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {group.cuisinePreferences.map((cuisine, idx) => (
                                <Chip key={idx} label={cuisine} size="small"
                                    sx={{ bgcolor: COLORS.accent, color: COLORS.textPrimary, fontWeight: 600 }} />
                            ))}
                        </Box>
                    </Box>
                )}
                {group.location && (
                    <Typography variant="body1" color={COLORS.textPrimary} sx={{ mb: 1 }}>
                        <strong>Location:</strong> {group.location}
                    </Typography>
                )}
                {group.radius && (
                    <Typography variant="body1" color={COLORS.textPrimary} sx={{ mb: 1 }}>
                        <strong>Search Radius:</strong> {group.radius} km
                    </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" color={COLORS.textPrimary} mt={2} mb={1}>
                    <RestaurantIcon sx={{ verticalAlign: 'bottom', mr: 1 }} /> Matched Restaurants:
                </Typography>
                {loadingMatches ? (
                    <Box display="flex" justifyContent="center" py={2}><CircularProgress size={20} sx={{ color: COLORS.primary }} /></Box>
                ) : matchesError ? (
                    <Alert severity="error">{matchesError}</Alert>
                ) : matchedRestaurants.length > 0 ? (
                    <List dense disablePadding>
                        {matchedRestaurants.map((restaurant, index) => (
                            <ListItem key={restaurant.id || index} sx={{ py: 0.5 }}>
                                <ListItemText
                                    primary={restaurant.name}
                                    secondary={
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" component="span">{restaurant.address}</Typography>
                                            {restaurant.rating && (
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                                    <StarIcon fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} /> {restaurant.rating}
                                                </Typography>
                                            )}
                                        </Box>
                                    }
                                    primaryTypographyProps={{ fontWeight: 600, color: COLORS.textPrimary }}
                                />
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Typography variant="body2" color="text.secondary">No restaurants matched yet in this group.</Typography>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 2 }}>
                <Button
                    variant="contained"
                    fullWidth
                    onClick={() => onSwipeRedirect(group._id)}
                    sx={{
                        bgcolor: COLORS.primary,
                        '&:hover': { bgcolor: COLORS.primary },
                        py: 1.5,
                        fontWeight: 600,
                        borderRadius: 2
                    }}
                >
                    Go to Swipe
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const Dashboard = () => {
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [joinGroupOpen, setJoinGroupOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [activeTab, setActiveTab] = useState('myGroups');
  const navigate = useNavigate();

  const [groupDetailsModalOpen, setGroupDetailsModalOpen] = useState(false);
  const [selectedGroupForDetails, setSelectedGroupForDetails] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const EVENT_PANEL_WIDTH = 320;

  const { createdGroups, joinedGroups, loading, error, refetch } = useGroups(token);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      navigate('/login');
      return;
    }

    try {
      const decoded = jwtDecode(storedToken);
      setUsername(decoded.name || 'User');
      setToken(storedToken);
    } catch (error) {
      console.error('Invalid token:', error);
      handleLogout();
    }
  }, [navigate]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    navigate('/login');
  }, [navigate]);

  const handleGroupChange = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleDeleteGroup = useCallback(async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
        return;
    }
    try {
      await axios.delete(`/api/group/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Group deleted successfully');
      handleGroupChange();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete group');
    }
  }, [token, handleGroupChange]);

  const handleLeaveGroup = useCallback(async (groupId) => {
    if (!window.confirm('Are you sure you want to leave this group? You will lose access to its content.')) {
        return;
    }
    try {
      await axios.post(`/api/group/${groupId}/leave`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Left group successfully');
      handleGroupChange();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to leave group');
    }
  }, [token, handleGroupChange]);

  const handleGroupCardClick = useCallback((group) => {
    setSelectedGroupForDetails(group);
    setGroupDetailsModalOpen(true);
  }, []);

  const handleGoToSwipe = useCallback((groupId) => {
    setGroupDetailsModalOpen(false);
    navigate(`/swipe/${groupId}`);
  }, [navigate]);

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading groups: {error}
        </Alert>
        <Button
          variant="contained"
          onClick={handleGroupChange}
          sx={{ bgcolor: COLORS.primary }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: COLORS.background }}>
            <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            <Sidebar
                username={username}
                onLogout={handleLogout}
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <Box sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                px: 4,
                py: 3,
                overflowY: 'auto',
                maxHeight: '100vh',
                position: 'relative',
                pl: sidebarOpen ? '320px' : '32px',
                pr: `${EVENT_PANEL_WIDTH + 32}px`,
                transition: 'padding-left 0.3s ease-in-out',
                '@media (max-width:960px)': {
                    pr: '32px',
                }
            }}>
                {!sidebarOpen && (
                    <IconButton
                        onClick={() => setSidebarOpen(true)}
                        sx={{
                            position: 'fixed',
                            top: 16,
                            left: 16,
                            bgcolor: COLORS.primary,
                            color: 'white',
                            '&:hover': { bgcolor: COLORS.primary },
                            zIndex: 999,
                        }}
                    >
                        <FastfoodIcon />
                    </IconButton>
                )}


                <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    sx={{
                        mb: 3,
                        '& .MuiTabs-indicator': {
                            backgroundColor: COLORS.primary,
                        }
                    }}
                >
                    <Tab
                        label="My Groups"
                        value="myGroups"
                        sx={{
                            fontWeight: activeTab === 'myGroups' ? 'bold' : 'normal',
                            color: COLORS.textPrimary,
                            fontSize: '1.1rem'
                        }}
                    />
                    <Tab
                        label="Joined Groups"
                        value="joinedGroups"
                        sx={{
                            fontWeight: activeTab === 'joinedGroups' ? 'bold' : 'normal',
                            color: COLORS.textPrimary,
                            fontSize: '1.1rem'
                        }}
                    />
                </Tabs>

                {activeTab === 'myGroups' && (
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" color={COLORS.textPrimary} mb={3}>
                            Your Created Groups
                        </Typography>

                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                <CircularProgress size={60} sx={{ color: COLORS.primary }} />
                            </Box>
                        ) : createdGroups.length === 0 ? (
                            <Box sx={{
                                p: 3,
                                bgcolor: COLORS.cardBackground,
                                borderRadius: 2,
                                textAlign: 'center'
                            }}>
                                <Typography color={COLORS.textPrimary} mb={2}>
                                    You haven't created any groups yet
                                </Typography>
                                <Button
                                    variant="contained"
                                    onClick={() => setCreateGroupOpen(true)}
                                    sx={{
                                        bgcolor: COLORS.primary,
                                        '&:hover': { bgcolor: COLORS.primary },
                                    }}
                                >
                                    Create Your First Group
                                </Button>
                            </Box>
                        ) : (
                            <Grid container spacing={3} mb={4}>
                                {createdGroups.map(group => (
                                    <Grid item xs={12} sm={6} key={group._id}>
                                        <GroupCard
                                            group={group}
                                            isOwner={true}
                                            onDelete={handleDeleteGroup}
                                            onClick={() => handleGroupCardClick(group)}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        )}

                        <Typography variant="h6" color={COLORS.textPrimary} mb={3}>
                            Group Actions
                        </Typography>

                        <Grid container spacing={3} mb={4}>
                            <Grid item xs={12} sm={6}>
                                <Card sx={{
                                    bgcolor: COLORS.cardBackground,
                                    borderRadius: 4,
                                    boxShadow: 3,
                                    minHeight: 200,
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography variant="h6" fontWeight={700} color={COLORS.primary} gutterBottom>
                                            Create New Group
                                        </Typography>
                                        <Typography variant="body2" color={COLORS.textPrimary}>
                                            Start a new food group with your preferences
                                        </Typography>
                                    </CardContent>
                                    <CardActions sx={{ p: 2 }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={() => setCreateGroupOpen(true)}
                                            sx={{
                                                bgcolor: COLORS.primary,
                                                '&:hover': { bgcolor: COLORS.primary },
                                                py: 1.5,
                                                borderRadius: 2
                                            }}
                                        >
                                            Create Group
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {activeTab === 'joinedGroups' && (
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" color={COLORS.textPrimary} mb={3}>
                            Groups You've Joined
                        </Typography>

                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                <CircularProgress size={60} sx={{ color: COLORS.primary }} />
                            </Box>
                        ) : joinedGroups.length === 0 ? (
                            <Box sx={{
                                p: 3,
                                bgcolor: COLORS.cardBackground,
                                borderRadius: 2,
                                textAlign: 'center'
                            }}>
                                <Typography color={COLORS.textPrimary} mb={2}>
                                    You haven't joined any groups yet
                                </Typography>
                            </Box>
                        ) : (
                            <Grid container spacing={3} mb={4}>
                                {joinedGroups.map(group => (
                                    <Grid item xs={12} sm={6} key={group._id}>
                                        <GroupCard
                                            group={group}
                                            isOwner={false}
                                            onLeave={handleLeaveGroup}
                                            onClick={() => handleGroupCardClick(group)}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        )}

                        <Typography variant="h6" color={COLORS.textPrimary} mb={3}>
                            Group Actions
                        </Typography>

                        <Grid container spacing={3} mb={4}>
                            <Grid item xs={12} sm={6}>
                                <Card sx={{
                                    bgcolor: COLORS.cardBackground,
                                    borderRadius: 4,
                                    boxShadow: 3,
                                    minHeight: 200,
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography variant="h6" fontWeight={700} color={COLORS.primary} gutterBottom>
                                            Join Existing Group
                                        </Typography>
                                        <Typography variant="body2" color={COLORS.textPrimary}>
                                            Enter an invite code to join your friends' group
                                        </Typography>
                                    </CardContent>
                                    <CardActions sx={{ p: 2 }}>
                                        <JoinGroupForm token={token} onGroupChange={handleGroupChange} />
                                    </CardActions>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </Box>

            <Box
                sx={{
                    width: EVENT_PANEL_WIDTH,
                    bgcolor: COLORS.sidebarBackground,
                    display: 'flex',
                    flexDirection: 'column',
                    p: 3,
                    borderLeft: `2px solid ${COLORS.cardBackground}`,
                    position: 'sticky',
                    top: 0,
                    height: '100vh',
                    overflowY: 'auto',
                    boxShadow: 6,
                    '@media (max-width:960px)': {
                        display: 'none',
                    }
                }}
            >
                <Paper elevation={0} sx={{
                    bgcolor: 'transparent',
                    p: 0,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                }}>
                    <Typography variant="h6" fontWeight={700} color={COLORS.primary} sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                        <EventIcon sx={{ mr: 1 }} /> Events & Calendar
                    </Typography>
                    <StaticDatePicker
                        orientation="portrait"
                        defaultValue={moment()}
                        readOnly
                        sx={{
                            width: '100%',
                            '.MuiCalendarPicker-root': { width: '100%' },
                            '.MuiPickersDay-root': { color: COLORS.textPrimary },
                            '.MuiPickersDay-root.Mui-selected': { bgcolor: COLORS.primary, '&:hover': { bgcolor: COLORS.primary } },
                            '.MuiPickersToolbar-root': { bgcolor: COLORS.accent, color: COLORS.textPrimary },
                            '.MuiDateCalendar-root': { '& button': { color: COLORS.textPrimary } },
                            '.MuiTypography-root': { color: COLORS.textPrimary },
                        }}
                    />
                    <Divider sx={{ my: 2, width: '80%' }} />
                    <Typography variant="body1" color={COLORS.textPrimary} textAlign="center">
                        Upcoming group events or plan your next meal!
                    </Typography>
                    <Button
                        variant="outlined"
                        sx={{
                            mt: 1,
                            color: COLORS.primary,
                            borderColor: COLORS.primary,
                            '&:hover': { borderColor: COLORS.primary, bgcolor: COLORS.primary + '10' }
                        }}
                    >
                        Plan an Event
                    </Button>
                </Paper>
            </Box>

            <GroupDetailsModal
                open={groupDetailsModalOpen}
                onClose={() => setGroupDetailsModalOpen(false)}
                group={selectedGroupForDetails}
                token={token}
                onSwipeRedirect={handleGoToSwipe}
            />

            <Dialog
                open={joinGroupOpen}
                onClose={() => setJoinGroupOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: COLORS.cardBackground,
                        borderRadius: 3,
                        boxShadow: 24,
                        p: 2,
                    }
                }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                    <Typography variant="h5" fontWeight={700} color={COLORS.primary}>Join a Group</Typography>
                    <IconButton onClick={() => setJoinGroupOpen(false)} sx={{ color: COLORS.textPrimary }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ pt: 2 }}>
                    <JoinGroupForm
                        token={token}
                        onGroupChange={() => {
                            handleGroupChange();
                            setJoinGroupOpen(false);
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setJoinGroupOpen(false)} sx={{ color: COLORS.textPrimary }}>Cancel</Button>
                </DialogActions>
            </Dialog>

            <CreateGroup
                open={createGroupOpen}
                onClose={() => setCreateGroupOpen(false)}
                token={token}
                onGroupChange={handleGroupChange}
            />
        </Box>
    </LocalizationProvider>
  );
};

export default Dashboard;