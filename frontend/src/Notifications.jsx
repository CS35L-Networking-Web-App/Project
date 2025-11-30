import { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Box,
  Button,
  Divider,
  CircularProgress
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { getConnectionRequests, acceptConnectionRequest, rejectConnectionRequest } from './api.js';
import default_pfp from './assets/default_pfp.png';

export default function Notifications({ onRequestAccepted }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const open = Boolean(anchorEl);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await getConnectionRequests();
      setRequests(data.requests || []);
    } catch (err) {
      console.error('Failed to load connection requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    // Poll for new requests every 30 seconds
    const interval = setInterval(loadRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAccept = async (fromUserId) => {
    setActionLoading(fromUserId);
    try {
      await acceptConnectionRequest(fromUserId);
      setRequests(requests.filter(req => req.from.id !== fromUserId));
      if (onRequestAccepted) {
        onRequestAccepted();
      }
    } catch (err) {
      console.error('Failed to accept request:', err);
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (fromUserId) => {
    setActionLoading(fromUserId);
    try {
      await rejectConnectionRequest(fromUserId);
      setRequests(requests.filter(req => req.from.id !== fromUserId));
    } catch (err) {
      console.error('Failed to reject request:', err);
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{ ml: 2, color: 'inherit' }}
      >
        <Badge badgeContent={requests.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 360, maxHeight: 500 }
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="h6">Connection Requests</Typography>
        </Box>
        <Divider />
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : requests.length === 0 ? (
          <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No pending connection requests
            </Typography>
          </Box>
        ) : (
          requests.map((request, index) => (
            <Box key={request.from.id}>
              {index > 0 && <Divider />}
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar
                    src={request.from.profilePicture || default_pfp}
                    sx={{ width: 40, height: 40, mr: 1.5 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2">{request.from.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {request.from.position || 'No position'}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    onClick={() => handleAccept(request.from.id)}
                    disabled={actionLoading === request.from.id}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={() => handleReject(request.from.id)}
                    disabled={actionLoading === request.from.id}
                  >
                    Decline
                  </Button>
                </Box>
              </Box>
            </Box>
          ))
        )}
      </Menu>
    </>
  );
}
