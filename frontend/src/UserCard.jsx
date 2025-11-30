import { useState } from 'react';
import { Card, CardContent, Avatar, Button, Typography, Box } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { sendConnectionRequest } from './api.js';
import default_pfp from './assets/default_pfp.png';

export default function UserCard({ user, onConnectionChange }) {
  const [connectionStatus, setConnectionStatus] = useState({
    isConnection: user.isConnection,
    hasPendingRequest: user.hasPendingRequest,
    hasReceivedRequest: user.hasReceivedRequest
  });
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      await sendConnectionRequest(user.id);
      setConnectionStatus({ ...connectionStatus, hasPendingRequest: true });
      if (onConnectionChange) {
        onConnectionChange(user.id);
      }
    } catch (err) {
      console.error('Failed to send connection request:', err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getButtonConfig = () => {
    if (user.isSelf) {
      return { text: 'You', icon: null, disabled: true, variant: 'outlined', color: 'default' };
    }
    if (connectionStatus.isConnection) {
      return { text: 'Connected', icon: <CheckCircleIcon />, disabled: true, variant: 'contained', color: 'success' };
    }
    if (connectionStatus.hasPendingRequest) {
      return { text: 'Pending', icon: <PendingIcon />, disabled: true, variant: 'outlined', color: 'default' };
    }
    if (connectionStatus.hasReceivedRequest) {
      return { text: 'Accept Request', icon: <PersonAddIcon />, disabled: false, variant: 'contained', color: 'primary' };
    }
    return { text: 'Connect', icon: <PersonAddIcon />, disabled: false, variant: 'contained', color: 'primary' };
  };

  const buttonConfig = getButtonConfig();

  return (
    <Card sx={{ mb: 2, display: 'flex', alignItems: 'center', p: 2 }}>
      <Avatar
        src={(user.profilePicture && user.profilePicture.trim() !== '') ? user.profilePicture : default_pfp}
        sx={{ width: 60, height: 60, mr: 2 }}
      />
      <CardContent sx={{ flex: 1, py: 0 }}>
        <Typography variant="h6" component="div">
          {user.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user.position || 'No position listed'}
        </Typography>
      </CardContent>
      <Button
        variant={buttonConfig.variant}
        color={buttonConfig.color}
        startIcon={buttonConfig.icon}
        onClick={handleConnect}
        disabled={loading || buttonConfig.disabled}
        sx={{ minWidth: 120 }}
      >
        {buttonConfig.text}
      </Button>
    </Card>
  );
}
