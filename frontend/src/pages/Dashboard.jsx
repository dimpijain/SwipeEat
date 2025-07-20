import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Button, Divider } from '@mui/material';
import CreateGroup from '../components/CreateGroup';
import JoinGroup from '../components/JoinGroup';
import axios from 'axios';

const COLORS = {
  primary: '#FF8A80', // soft coral
  secondary: '#FFD180', // pastel orange
  bgLight: '#FFF3E0', // light cream
  textDark: '#4E342E', // dark brown
  cardBg: '#FFEBEE', // very light coral
};

const Dashboard = ({ token }) => {
  const [groups, setGroups] = useState([]);
  const [refreshGroups, setRefreshGroups] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get('/api/groups/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroups(res.data.groups);
      } catch (err) {
        console.error('Failed to fetch groups:', err);
      }
    };
    fetchGroups();
  }, [token, refreshGroups]);

  // Refresh groups list after creating/joining
  const onGroupChange = () => setRefreshGroups((prev) => !prev);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: COLORS.bgLight,
        p: { xs: 3, md: 6 },
      }}
    >
      <Typography
        variant="h3"
        fontWeight={700}
        color={COLORS.primary}
        align="center"
        gutterBottom
        sx={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
      >
        Your Groups
      </Typography>

      {groups.length === 0 ? (
        <Typography
          variant="h6"
          align="center"
          color={COLORS.textDark}
          sx={{ mb: 5 }}
        >
          You have not joined any groups yet. Start by creating or joining one below!
        </Typography>
      ) : (
        <Grid container spacing={3} justifyContent="center" sx={{ mb: 5 }}>
          {groups.map((group) => (
            <Grid item xs={12} sm={6} md={4} key={group._id}>
              <Paper
                elevation={3}
                sx={{
                  bgcolor: COLORS.cardBg,
                  p: 3,
                  borderRadius: 4,
                  textAlign: 'center',
                  boxShadow: '0 4px 8px rgba(255, 138, 128, 0.3)',
                }}
              >
                <Typography variant="h5" fontWeight={600} color={COLORS.primary}>
                  {group.name}
                </Typography>
                <Typography variant="body2" color={COLORS.textDark} sx={{ mt: 1 }}>
                  Invite Code: <strong>{group.code}</strong>
                </Typography>
                <Typography
                  variant="caption"
                  color={COLORS.textDark}
                  sx={{ mt: 1, display: 'block' }}
                >
                  Members: {group.members.length}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Divider sx={{ mb: 4, bgcolor: COLORS.primary, height: 3, borderRadius: 2 }} />

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={5}>
          <CreateGroup token={token} onGroupChange={onGroupChange} />
        </Grid>
        <Grid item xs={12} md={5}>
          <JoinGroup token={token} onGroupChange={onGroupChange} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
