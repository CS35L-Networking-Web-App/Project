import { useState } from 'react';
import { Card, CardContent, Avatar, Button, Typography, Box } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { sendConnectionRequest, acceptConnectionRequest } from './api.js';
import default_pfp from './assets/default_pfp.png';

export default function UserCard({ user, onConnectionChange, onUserClick }) {
  const [connectionStatus, setConnectionStatus] = useState({
    isConnection: user.isConnection,
    hasPendingRequest: user.hasPendingRequest,
    hasReceivedRequest: user.hasReceivedRequest
  });
  const [loading, setLoading] = useState(false);

  const handleConnect = async (e) => {
    e.stopPropagation(); // Prevent card click

    if(!connectionStatus.hasReceivedRequest){
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
  }

  else if (connectionStatus.hasReceivedRequest){
    setLoading(true);
    try {
      await acceptConnectionRequest(user.id);
      setConnectionStatus({ ...connectionStatus, hasPendingRequest: false, isConnection: true });
       if (onConnectionChange) {
        onConnectionChange(user.id);
         }
        } catch (err) {
      console.error('Failed to accept connection:', err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
}
  };

  const handleCardClick = () => {
    if (!user.isSelf && onUserClick) {
      onUserClick(user.id);
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
    <Card
      sx={{
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        p: 2.5,
        cursor: !user.isSelf && onUserClick ? 'pointer' : 'default',
        border: '1px solid #e0e0e0',
        borderRadius: 3,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        transition: 'all 0.2s ease',
        '&:hover': !user.isSelf && onUserClick ? {
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          transform: 'translateY(-2px)',
          borderColor: '#0066cc'
        } : {
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
        }
      }}
      onClick={handleCardClick}
    >
      <Avatar
        src={(user.profilePicture && user.profilePicture.trim() !== '') ? user.profilePicture : default_pfp}
        sx={{
          width: 64,
          height: 64,
          mr: 2.5,
          border: '2px solid #e0e0e0'
        }}
      />
      <CardContent sx={{ flex: 1, py: 0, px: 0 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600, fontSize: '17px', mb: 0.5 }}>
          {user.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '14px' }}>
          {user.position || 'No position listed'}
        </Typography>
      </CardContent>
      <Button
        variant={buttonConfig.variant}
        color={buttonConfig.color}
        startIcon={buttonConfig.icon}
        onClick={handleConnect}
        disabled={loading || buttonConfig.disabled}
        sx={{
          minWidth: 130,
          textTransform: 'none',
          fontWeight: 600,
          px: 3,
          py: 1,
          borderRadius: 2,
          ...(buttonConfig.variant === 'contained' && {
            backgroundColor: '#0066cc',
            '&:hover': {
              backgroundColor: '#0052a3'
            }
          })
        }}
      >
        {buttonConfig.text}
      </Button>
    </Card>
  );
}
