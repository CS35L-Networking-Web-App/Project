import { Box, CircularProgress, Typography } from '@mui/material';
import UserCard from '../UserCard';
import UserProfile from '../UserProfile';

export default function NetworkTab({
  viewingUserId,
  onBackFromProfile,
  connections,
  connectionsLoading,
  onConnectionChange,
  onUserClick,
  currentUserId
}) {
  if (viewingUserId) {
    return (
      <UserProfile userId={viewingUserId} onBack={onBackFromProfile} currentUserId={currentUserId} />
    );
  }

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto' }}>
      {connectionsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : connections.length === 0 ? (
        <Box sx={{ textAlign: 'center', p: 3 }}>
          <Typography variant="h6" color="text.secondary">No connections yet</Typography>
          <Typography variant="body2" color="text.secondary">
            Search for users and send connection requests to build your network!
          </Typography>
        </Box>
      ) : (
        connections.map(connection => (
          <UserCard
            key={connection.id}
            user={{
              ...connection,
              isConnection: true,
              hasPendingRequest: false,
              hasReceivedRequest: false,
              isSelf: false
            }}
            onConnectionChange={onConnectionChange}
            onUserClick={onUserClick}
          />
        ))
      )}
    </Box>
  );
}
