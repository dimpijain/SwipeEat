import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  CircularProgress,
  IconButton,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import { List, ListItem, ListItemText } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CreateGroup from '../components/CreateGroup';
import axios from 'axios';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import DeleteIcon from '@mui/icons-material/Delete';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const COLORS = {
  primary: '#FF7F7F',
  secondary: '#FFD6B0',
  background: '#FFF9FA',
  textPrimary: '#575761',
  cardBackground: '#FFF5F8',
  sidebarBackground: '#FFEDE7',
  accent: '#B5EAD7'
};

const useGroups = (token, refreshFlag) => {
  const [createdGroups, setCreatedGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/group/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.data.success) {
        setCreatedGroups(res.data.createdGroups || []);
        setJoinedGroups(res.data.joinedGroups || []);
      } else {
        setError(res.data.message || 'Failed to load groups');
        toast.error(res.data.message || 'Failed to load groups');
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.response?.data?.message || 'Error loading groups');
      setCreatedGroups([]);
      setJoinedGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchGroups();
    }
  }, [token, refreshFlag]);

  return { createdGroups, joinedGroups, loading, error, refetch: fetchGroups };
};

const Sidebar = ({ username, onLogout }) => (
  <Box
    sx={{
      width: 260,
      bgcolor: COLORS.sidebarBackground,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      px: 4,
      py: 6,
      borderRight: `2px solid ${COLORS.cardBackground}`,
    }}
  >
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
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
);

const GroupCard = ({ group, isOwner, onDelete, onLeave }) => (
  <Paper
    elevation={3}
    sx={{
      bgcolor: COLORS.cardBackground,
      p: 3,
      borderRadius: 3,
      height: '100%',
      position: 'relative',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-3px)'
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
          onClick={() => onDelete(group._id)}
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
          onClick={() => onLeave(group._id)}
          sx={{ py: 0.5, fontSize: '0.75rem' }}
        >
          Leave Group
        </Button>
      )}
    </Box>
  </Paper>
);

const EventsPanel = () => (
  <Box
    sx={{
      width: 300,
      bgcolor: COLORS.cardBackground,
      p: 4,
      borderLeft: `1px solid ${COLORS.secondary}`,
      overflowY: 'auto'
    }}
  >
    <Typography variant="h6" color={COLORS.primary} fontWeight={700} mb={2}>
      Upcoming Events
    </Typography>
    <List>
      {['Team Lunch', 'Project Meeting', 'Client Dinner'].map((event, index) => (
        <ListItem key={index} sx={{ py: 1.5 }}>
          <ListItemText
            primary={event}
            secondary={`${['Mon', 'Wed', 'Fri'][index]}, ${['12:00 PM', '2:30 PM', '7:00 PM'][index]}`}
          />
        </ListItem>
      ))}
    </List>
  </Box>
);

const JoinGroupButton = ({ token, onGroupChange }) => {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) {
      toast.error('Please enter an invite code', {
        position: "top-center",
        autoClose: 3000,
      });
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
        toast.success(`Joined group: ${response.data.group.name}`, {
          position: "top-center",
          autoClose: 3000,
        });
        onGroupChange();
        setInviteCode('');
      } else {
        toast.error(response.data.message || 'Failed to join group', {
          position: "top-center",
          autoClose: 3000,
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Failed to join group';
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 3000,
      });
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
          <>
            <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
            Joining...
          </>
        ) : 'Join Group'}
      </Button>
    </Box>
  );
};

const Dashboard = () => {
  const [refreshGroups, setRefreshGroups] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [activeTab, setActiveTab] = useState('myGroups');
  const navigate = useNavigate();
  
  const { createdGroups, joinedGroups, loading, refetch } = useGroups(token, refreshGroups);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleGroupChange = () => {
    setRefreshGroups(prev => !prev);
    refetch();
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await axios.delete(`/api/group/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Group deleted successfully');
      handleGroupChange();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete group');
    }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      await axios.post(`/api/group/${groupId}/leave`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Left group successfully');
      handleGroupChange();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to leave group');
    }
  };

  return (
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
        toastStyle={{
          backgroundColor: COLORS.cardBackground,
          color: COLORS.textPrimary,
          borderLeft: `4px solid ${COLORS.primary}`,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}
        progressStyle={{
          background: COLORS.primary
        }}
      />
      
      <Sidebar username={username} onLogout={handleLogout} />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', px: 4, py: 3 }}>
        <Typography variant="h4" fontWeight={700} color={COLORS.primary} mb={1}>
          Hello, {username} 👋
        </Typography>

        {/* Tab navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="My Groups" value="myGroups" />
            <Tab label="Joined Groups" value="joinedGroups" />
          </Tabs>
        </Box>

        {/* My Groups Tab */}
        {activeTab === 'myGroups' && (
          <Box>
            <Typography variant="h5" color={COLORS.textPrimary} mb={3}>
              Your Created Groups
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress size={60} sx={{ color: COLORS.primary }} />
              </Box>
            ) : createdGroups.length === 0 ? (
              <Typography color={COLORS.textPrimary} mb={4}>
                You haven't created any groups yet
              </Typography>
            ) : (
              <Grid container spacing={3} mb={4}>
                {createdGroups.map(group => (
                  <Grid item xs={12} sm={6} md={4} key={group._id}>
                    <GroupCard 
                      group={group}
                      isOwner={true}
                      onDelete={handleDeleteGroup}
                    />
                  </Grid>
                ))}
              </Grid>
            )}

            <Typography variant="h6" color={COLORS.textPrimary} mb={3}>
              Group Actions
            </Typography>

            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  bgcolor: COLORS.cardBackground,
                  borderRadius: 4,
                  boxShadow: 3,
                  height: '100%',
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

        {/* Joined Groups Tab */}
        {activeTab === 'joinedGroups' && (
          <Box>
            <Typography variant="h5" color={COLORS.textPrimary} mb={3}>
              Groups You've Joined
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress size={60} sx={{ color: COLORS.primary }} />
              </Box>
            ) : joinedGroups.length === 0 ? (
              <Typography color={COLORS.textPrimary} mb={4}>
                You haven't joined any groups yet
              </Typography>
            ) : (
              <Grid container spacing={3} mb={4}>
                {joinedGroups.map(group => (
                  <Grid item xs={12} sm={6} md={4} key={group._id}>
                    <GroupCard 
                      group={group}
                      isOwner={false}
                      onLeave={handleLeaveGroup}
                    />
                  </Grid>
                ))}
              </Grid>
            )}

            <Typography variant="h6" color={COLORS.textPrimary} mb={3}>
              Group Actions
            </Typography>

            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  bgcolor: COLORS.cardBackground,
                  borderRadius: 4,
                  boxShadow: 3,
                  height: '100%',
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
                    <JoinGroupButton token={token} onGroupChange={handleGroupChange} />
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>

      <EventsPanel />

      <CreateGroup 
        open={createGroupOpen} 
        onClose={() => setCreateGroupOpen(false)}
        token={token} 
        onGroupChange={handleGroupChange} 
      />
    </Box>
  );
};

export default Dashboard;