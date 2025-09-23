import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Box, Typography, Grid, Paper, Button, Card, CardContent, TextField, CircularProgress, IconButton, Divider, Tabs, Tab, Alert, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Chip, Avatar, AvatarGroup, Stack } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CreateGroup from '../components/CreateGroup';
import FriendsListModal from '../components/FriendsListModal';
import api from '../api'; 
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
// ✅ FIXED: Added 'StarIcon' to the import list
import { Delete as DeleteIcon, Restaurant as RestaurantIcon, Fastfood as FastfoodIcon, Close as CloseIcon, Group as GroupIcon, LocationOn as LocationOnIcon, Star as StarIcon, Event as EventIcon, Add as AddIcon, People as PeopleIcon } from '@mui/icons-material';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers';
import moment from 'moment';

const COLORS = {
  primary: '#FF7F7F',
  secondary: '#FFD6B0',
  background: '#FFF9FA',
  textPrimary: '#575761',
  cardBackground: '#FFFFFF',
  sidebarBackground: '#FFEDE7',
  accent: '#B5EAD7'
};

const useGroups = (token) => {
  const [createdGroups, setCreatedGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGroups = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/group/my');
      if (res.data.success) {
        setCreatedGroups(res.data.createdGroups || []);
        setJoinedGroups(res.data.joinedGroups || []);
      } else {
        throw new Error(res.data.message || 'Failed to load groups');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return { createdGroups, joinedGroups, loading, error, refetch: fetchGroups };
};

const Sidebar = ({ username, onLogout, onOpenFriends }) => (
    <Box sx={{ width: 280, bgcolor: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 2, borderRight: `1px solid #f0f0f0`, height: '100vh', position: 'fixed', zIndex: 1000 }}>
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 2 }}>
                <FastfoodIcon sx={{ color: COLORS.primary, fontSize: 32, mr: 1.5 }} />
                <Typography variant="h5" fontWeight={800} color={COLORS.primary}>SwipeEat</Typography>
            </Box>
            <Divider sx={{ mb: 2 }}/>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={onOpenFriends}
              startIcon={<PeopleIcon />}
              sx={{ 
                mb: 2, 
                bgcolor: COLORS.accent, 
                color: COLORS.textPrimary, 
                '&:hover': { bgcolor: '#a2d9c1' },
                boxShadow: 'none'
              }}
            >
              Friends List
            </Button>
            <Box sx={{ p: 2, bgcolor: COLORS.background, borderRadius: 2 }}>
              <Typography variant="subtitle1" color={COLORS.textPrimary}>Welcome,</Typography>
              <Typography variant="h6" fontWeight={700} color={COLORS.primary}>{username || 'User'}</Typography>
            </Box>
        </Box>
        <Stack spacing={1}>
            <Button 
              variant="contained" 
              color="error" 
              fullWidth 
              onClick={onLogout} 
              sx={{ fontWeight: 600, bgcolor: COLORS.primary, '&:hover': { bgcolor: '#E56D62' } }}
            >
              Logout 
            </Button>
        </Stack>
    </Box>
  );

const GroupCard = ({ group, isOwner, onDelete, onLeave, onClick }) => (
    <Paper 
      onClick={onClick} 
      sx={{ 
        p: 2.5, 
        borderRadius: 4, 
        minHeight: '170px', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between', 
        transition: 'transform 0.2s, box-shadow 0.2s', 
        cursor: 'pointer', 
        '&:hover': { transform: 'translateY(-5px)', boxShadow: 8 }, 
        border: '1px solid #f0f0f0' 
      }} 
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="h5" fontWeight={700} color={COLORS.primary}>{group.name}</Typography>
          <Chip 
            label={isOwner ? `Invite: ${group.joinCode}` : `${group.members?.length || 0} members`} 
            size="small" 
            sx={{ mt: 1, bgcolor: isOwner ? COLORS.accent : COLORS.secondary }} 
          />
        </Box>
        {isOwner ? 
          <IconButton onClick={(e) => { e.stopPropagation(); onDelete(group._id); }} color="error" size="small"><DeleteIcon /></IconButton> : 
          <Button size="small" onClick={(e) => { e.stopPropagation(); onLeave(group._id); }} sx={{ color: COLORS.textPrimary, fontSize: '0.75rem' }}>Leave</Button>
        }
      </Stack>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <AvatarGroup max={6}>
          {group.members?.map(member => (
            <Avatar key={member.user._id} sx={{ width: 38, height: 38, fontSize: '1rem' }}>{member.user.name.charAt(0)}</Avatar>
          ))}
        </AvatarGroup>
        {group.eventDate && 
          <Chip 
            icon={<EventIcon fontSize='small'/>} 
            label={moment(group.eventDate).format('MMM D, YYYY')} 
            size="small" 
          />
        }
      </Stack>
    </Paper>
  );

const GroupDetailsModal = ({ open, onClose, group, onSwipeRedirect }) => {
    const [matchedRestaurants, setMatchedRestaurants] = useState([]);
    const [loadingMatches, setLoadingMatches] = useState(false);
    const [matchesError, setMatchesError] = useState(null);

    useEffect(() => {
        if (open && group?._id) {
            const fetchMatches = async () => {
                setLoadingMatches(true);
                setMatchesError(null);
                try {
                    const response = await api.get(`/api/group/${group._id}/matches`);
                    
                    const matchedIds = response.data.matchedRestaurantIds || [];
                    if (matchedIds.length > 0) {
                        const restaurantDetailsPromises = matchedIds.map(id => 
                            api.get(`/api/restaurants/details/${id}`)
                        );
                        const responses = await Promise.all(restaurantDetailsPromises);
                        const restaurantsWithDetails = responses.map(res => res.data);
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
    }, [open, group]);

    if (!group) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: COLORS.cardBackground, borderRadius: 3, p: 2 } }} >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, fontSize: '1.5rem', fontWeight: 700, color: COLORS.primary, }}>
                {group.name} Details
                <IconButton onClick={onClose} sx={{ color: COLORS.textPrimary }}> <CloseIcon /> </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ pt: 2 }}>
                <Typography variant="h6" color={COLORS.textPrimary} mt={1} mb={1}> <GroupIcon sx={{ verticalAlign: 'bottom', mr: 1 }} /> Members: </Typography>
                <List dense disablePadding>
                    {group.members?.map((member, index) => ( <ListItem key={index} sx={{ py: 0.5 }}> <ListItemText primary={member.user ? member.user.name : 'Unknown User'} /> </ListItem> ))}
                </List>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" color={COLORS.textPrimary} mt={2} mb={1}> <LocationOnIcon sx={{ verticalAlign: 'bottom', mr: 1 }} /> Group Preferences: </Typography>
                <Typography variant="body1" color={COLORS.textPrimary} sx={{ mb: 1 }}> <strong>Invite Code:</strong> {group.joinCode} </Typography>
                {group.cuisinePreferences?.length > 0 && ( <Box mt={1} mb={1}> <Typography variant="body2" color={COLORS.textPrimary}><strong>Cuisines:</strong></Typography> <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}> {group.cuisinePreferences.map((cuisine, idx) => ( <Chip key={idx} label={cuisine} size="small" sx={{ bgcolor: COLORS.accent }} /> ))} </Box> </Box> )}
                {group.location && ( <Typography variant="body1" color={COLORS.textPrimary} sx={{ mb: 1 }}> <strong>Location:</strong> {group.location} </Typography> )}
                {group.radius && ( <Typography variant="body1" color={COLORS.textPrimary} sx={{ mb: 1 }}> <strong>Search Radius:</strong> {group.radius} km </Typography> )}
                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" color={COLORS.textPrimary} mt={2} mb={1}> <RestaurantIcon sx={{ verticalAlign: 'bottom', mr: 1 }} /> Matched Restaurants: </Typography>
                {loadingMatches ? ( <Box display="flex" justifyContent="center" py={2}><CircularProgress size={20} sx={{ color: COLORS.primary }} /></Box> ) 
                : matchesError ? ( <Alert severity="error">{matchesError}</Alert> ) 
                : matchedRestaurants.length > 0 ? ( 
                    <List dense disablePadding> 
                        {matchedRestaurants.map((restaurant) => ( 
                            <ListItem key={restaurant.id}> 
                                <ListItemText 
                                    primary={restaurant.name} 
                                    secondary={
                                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <StarIcon fontSize="inherit" sx={{ color: '#FFD700' }} /> {restaurant.rating || 'N/A'}
                                        </Box>
                                    } 
                                /> 
                            </ListItem> 
                        ))} 
                    </List> 
                ) : ( <Typography variant="body2" color="text.secondary">No restaurants matched yet.</Typography> )}
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 2 }}>
                <Button variant="contained" fullWidth onClick={() => onSwipeRedirect(group._id)} sx={{ bgcolor: COLORS.primary, '&:hover': { bgcolor: '#E56D62' }, py: 1.5, borderRadius: 2 }} > Go to Swipe </Button>
            </DialogActions>
        </Dialog>
    );
};

const Dashboard = () => {
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [friendsModalOpen, setFriendsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({ id: null, name: '' });
  const [token, setToken] = useState('');
  const [activeTab, setActiveTab] = useState('myGroups');
  const navigate = useNavigate();
  const [groupDetailsModalOpen, setGroupDetailsModalOpen] = useState(false);
  const [selectedGroupForDetails, setSelectedGroupForDetails] = useState(null);

  const { createdGroups, joinedGroups, loading, error, refetch } = useGroups(token);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      navigate('/login');
      return;
    }
    try {
      const decoded = jwtDecode(storedToken);
      setCurrentUser({ id: decoded.id, name: decoded.name || 'User' });
      setToken(storedToken);
    } catch (error) {
      handleLogout();
    }
  }, [navigate]);

  const friendsList = useMemo(() => {
    const allMembers = new Map();
    [...createdGroups, ...joinedGroups].forEach(group => {
      group.members?.forEach(member => {
        if (member.user?._id !== currentUser.id) {
          allMembers.set(member.user._id, { id: member.user._id, name: member.user.name });
        }
      });
    });
    return Array.from(allMembers.values());
  }, [createdGroups, joinedGroups, currentUser.id]);
  
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    navigate('/login');
  }, [navigate]);

  const handleGroupChange = useCallback(() => refetch(), [refetch]);

  const handleDeleteGroup = useCallback(async (groupId) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        await api.delete(`/api/group/${groupId}`);
        toast.success('Group deleted');
        handleGroupChange();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete group');
      }
    }
  }, [handleGroupChange]);

  const handleLeaveGroup = useCallback(async (groupId) => {
    if (window.confirm('Are you sure you want to leave this group?')) {
      try {
        await api.post(`/api/group/${groupId}/leave`);
        toast.success('Left group');
        handleGroupChange();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to leave group');
      }
    }
  }, [handleGroupChange]);

  const handleGroupCardClick = useCallback((group) => {
    setSelectedGroupForDetails(group);
    setGroupDetailsModalOpen(true);
  }, []);

  const handleGoToSwipe = useCallback((groupId) => {
    setGroupDetailsModalOpen(false);
    navigate(`/swipe/${groupId}`);
  }, [navigate]);

  const renderGroupGrid = (groups, isOwner) => {
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress sx={{ color: COLORS.primary }} /></Box>;
    if (groups.length === 0) {
      return (
        <Paper sx={{ p: 4, bgcolor: '#fafafa', borderRadius: 2, textAlign: 'center', mt: 2 }}>
          <Typography color="text.secondary">
            {isOwner ? "You haven't created any events yet." : "You haven't joined any events yet."}
          </Typography>
        </Paper>
      );
    }
    return (
      <Grid container spacing={3} mt={1}>
        {groups.map(group => (
          <Grid item xs={12} md={6} key={group._id}>
            <GroupCard group={group} isOwner={isOwner} onDelete={handleDeleteGroup} onLeave={handleLeaveGroup} onClick={() => handleGroupCardClick(group)} />
          </Grid>
        ))}
      </Grid>
    );
  };

  if (error) {
    return <Alert severity="error">Error loading groups: {error}</Alert>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: COLORS.background }}>
        <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
        <Sidebar username={currentUser.name} onLogout={handleLogout} onOpenFriends={() => setFriendsModalOpen(true)} />
        
        <Box sx={{ display: 'flex', flexGrow: 1, ml: '280px' }}>
          <Box sx={{ flexGrow: 1, p: 4, overflowY: 'auto' }}>
            <Stack direction="row" spacing={2} mb={4}>
              <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: COLORS.primary, '&:hover': { bgcolor: '#E56D62' } }} onClick={() => setCreateGroupOpen(true)}>
                Schedule Event
              </Button>
            </Stack>
             
            <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{ mb: 2, '& .MuiTabs-indicator': { backgroundColor: COLORS.primary }, '& .Mui-selected': { color: COLORS.primary } }}>
              <Tab label="My Events" value="myGroups" />
              <Tab label="Joined Events" value="joinedGroups" />
            </Tabs>
            
            {activeTab === 'myGroups' && renderGroupGrid(createdGroups, true)}
            {activeTab === 'joinedGroups' && renderGroupGrid(joinedGroups, false)}
          </Box>
          
          <Box sx={{ width: 340, flexShrink: 0, p: 2, borderLeft: '1px solid #f0f0f0', bgcolor: 'white' }}>
            <Typography variant="h6" fontWeight={700} color={COLORS.primary} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <EventIcon /> Events Calendar
            </Typography>
            <StaticDatePicker orientation="portrait" defaultValue={moment()} readOnly sx={{'.MuiPickersDay-root.Mui-selected': {backgroundColor: COLORS.primary}}}/>
             <Card sx={{ mt: 2 }}>
               <CardContent>
                 <Typography variant="h6" gutterBottom>Join an Event</Typography>
                 <JoinGroupForm onGroupChange={handleGroupChange} />
               </CardContent>
             </Card>
          </Box>
        </Box>

        <FriendsListModal open={friendsModalOpen} onClose={() => setFriendsModalOpen(false)} friends={friendsList} />
        <GroupDetailsModal open={groupDetailsModalOpen} onClose={() => setGroupDetailsModalOpen(false)} group={selectedGroupForDetails} onSwipeRedirect={handleGoToSwipe} />
        <CreateGroup open={createGroupOpen} onClose={() => setCreateGroupOpen(false)} onGroupChange={handleGroupChange} />
      </Box>
    </LocalizationProvider>
  );
};

const JoinGroupForm = ({ onGroupChange }) => {
    const [inviteCode, setInviteCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleJoinGroup = async () => {
        if (!inviteCode.trim()) return toast.error('Please enter an invite code');
        setLoading(true);
        try {
            const res = await api.post('/api/group/join', { code: inviteCode.toUpperCase() });
            toast.success(`Joined group: ${res.data.group.name}`);
            onGroupChange();
            setInviteCode('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to join group');
        } finally {
            setLoading(false);
        }
    };
    return (
        <Stack spacing={1}>
            <TextField fullWidth label="Invite Code" size="small" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} />
            <Button fullWidth variant="contained" onClick={handleJoinGroup} disabled={loading} sx={{ bgcolor: COLORS.primary, '&:hover': { bgcolor: '#E56D62' } }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Join'}
            </Button>
        </Stack>
    );
};

export default Dashboard;