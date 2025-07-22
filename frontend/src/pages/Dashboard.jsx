import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField
} from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CreateGroup from '../components/CreateGroup';
import axios from 'axios';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const useGroups = (token, refreshFlag) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/groups/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroups(res.data.groups || []);
      } catch (err) {
        setError(err.message);
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, [token, refreshFlag]);

  return { groups, loading, error };
};

const COLORS = {
  primary: '#FF7F7F',
  secondary: '#FFD6B0',
  background: '#FFF9FA',
  textPrimary: '#575761',
  cardBackground: '#FFF5F8',
  sidebarBackground: '#FFEDE7',
  accent: '#B5EAD7'
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

const GroupCard = ({ group }) => (
  <Paper
    elevation={3}
    sx={{
      bgcolor: COLORS.cardBackground,
      p: 4,
      borderRadius: 6,
      textAlign: 'center',
      height: '100%',
      transition: 'transform 0.25s ease',
      '&:hover': {
        transform: 'translateY(-5px)',
      },
    }}
  >
    <Typography variant="h6" fontWeight={700} color={COLORS.primary}>
      {group.name}
    </Typography>
    <Typography variant="body2" color={COLORS.textPrimary}>
      Invite Code: <strong>{group.code}</strong>
    </Typography>
    <Typography variant="caption" color={COLORS.textPrimary}>
      Members: {group?.members?.length || 0}
    </Typography>
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
    if (!inviteCode) {
      toast.error('Please enter an invite code');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        '/api/groups/join',
        { code: inviteCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(response.data.message || 'Joined group successfully!');
      onGroupChange();
      setInviteCode('');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to join group';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <TextField
        fullWidth
        label="Invite Code"
        value={inviteCode}
        onChange={(e) => setInviteCode(e.target.value)}
        margin="normal"
      />
      <Button
        fullWidth
        variant="contained"
        onClick={handleJoinGroup}
        disabled={loading}
        sx={{
          mt: 2,
          bgcolor: COLORS.primary,
          '&:hover': { bgcolor: COLORS.primary },
          py: 1.5,
          borderRadius: 2
        }}
      >
        {loading ? 'Joining...' : 'Join Group'}
      </Button>
    </Box>
  );
};

const Dashboard = () => {
  const [refreshGroups, setRefreshGroups] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const navigate = useNavigate();
  
  const { groups } = useGroups(token, refreshGroups);

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

  const handleGroupChange = () => setRefreshGroups(prev => !prev);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: COLORS.background }}>
      <ToastContainer position="top-right" autoClose={3000} />
      <Sidebar username={username} onLogout={handleLogout} />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', px: 4, py: 3 }}>
        <Typography variant="h4" fontWeight={700} color={COLORS.primary} mb={1}>
          Hello, {username} 👋
        </Typography>

        <Typography variant="h5" color={COLORS.textPrimary} mb={3}>
          Your Groups
        </Typography>

        {groups.length === 0 ? (
          <Typography color={COLORS.textPrimary} mb={4}>
            No groups yet. Create or join one below!
          </Typography>
        ) : (
          <Grid container spacing={3} mb={4}>
            {groups.map(group => (
              <Grid item xs={12} sm={6} md={4} key={group._id}>
                <GroupCard group={group} />
              </Grid>
            ))}
          </Grid>
        )}

        <Typography variant="h6" color={COLORS.textPrimary} mb={3}>
          Group Actions
        </Typography>

        <Grid container spacing={3}>
          {/* Create Group Card */}
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

          {/* Join Group Card */}
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