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
  useTheme
} from '@mui/material';
import CreateGroup from '../components/CreateGroup';
import JoinGroup from '../components/JoinGroup';
import axios from 'axios';

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
      <Typography
        variant="h4"
        fontWeight={800}
        color={COLORS.primary}
        sx={{ fontFamily: "'Pacifico', cursive", mb: 4 }}
      >
        SwipeEat
      </Typography>
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

const Dashboard = ({ token, username, onLogout }) => {
  const [refreshGroups, setRefreshGroups] = useState(false);
  const { groups } = useGroups(token, refreshGroups);
  const theme = useTheme();

  const handleGroupChange = () => setRefreshGroups(prev => !prev);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: COLORS.background }}>
      <Sidebar username={username} onLogout={onLogout} />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', px: 4, py: 3 }}>
        <Typography variant="h4" fontWeight={700} color={COLORS.primary} mb={1}>
          Hello, {username || 'User'} 👋
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

        <Grid container spacing={3} mt={1}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <CreateGroup token={token} onGroupChange={handleGroupChange} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <JoinGroup token={token} onGroupChange={handleGroupChange} />
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <EventsPanel />
    </Box>
  );
};

export default Dashboard;
