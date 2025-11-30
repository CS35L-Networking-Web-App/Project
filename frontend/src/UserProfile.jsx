import { useState, useEffect } from 'react';
import { Box, Stack, IconButton, CircularProgress, Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { getUserById, sendConnectionRequest, getAllPosts } from './api.js';
import Post from './Post';
import default_pfp from './assets/default_pfp.png';
import './styles.css';

export default function UserProfile({ userId, onBack, currentUserId }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState({
    isConnection: false,
    hasPendingRequest: false,
    hasReceivedRequest: false
  });
  const [connectLoading, setConnectLoading] = useState(false);

  useEffect(() => {
    async function loadUserProfile() {
      setLoading(true);
      try {
        const userData = await getUserById(userId);
        setUser(userData);
        // Update connection status from user data
        setConnectionStatus({
          isConnection: userData.isConnection || false,
          hasPendingRequest: userData.hasPendingRequest || false,
          hasReceivedRequest: userData.hasReceivedRequest || false
        });
      } catch (err) {
        console.error('Failed to load user profile:', err);
      } finally {
        setLoading(false);
      }
    }

    async function loadUserPosts() {
      setPostsLoading(true);
      try {
        const data = await getAllPosts();
        // Filter posts by this user
        const userPosts = (data.posts || []).filter(post => post.author.id === userId);
        setPosts(userPosts);
      } catch (err) {
        console.error('Failed to load user posts:', err);
      } finally {
        setPostsLoading(false);
      }
    }

    loadUserProfile();
    loadUserPosts();
  }, [userId]);

  const handleConnect = async () => {
    setConnectLoading(true);
    try {
      await sendConnectionRequest(userId);
      setConnectionStatus({ ...connectionStatus, hasPendingRequest: true });
    } catch (err) {
      console.error('Failed to send connection request:', err);
      alert(err.message);
    } finally {
      setConnectLoading(false);
    }
  };

  const getConnectionButton = () => {
    if (connectionStatus.isConnection) {
      return (
        <Button
          variant="contained"
          color="success"
          startIcon={<CheckCircleIcon />}
          disabled
          sx={{
            minWidth: 160,
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
            py: 1.5,
            borderRadius: 2
          }}
        >
          Connected
        </Button>
      );
    }
    if (connectionStatus.hasPendingRequest) {
      return (
        <Button
          variant="outlined"
          startIcon={<PendingIcon />}
          disabled
          sx={{
            minWidth: 160,
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
            py: 1.5,
            borderRadius: 2
          }}
        >
          Pending
        </Button>
      );
    }
    return (
      <Button
        variant="contained"
        startIcon={<PersonAddIcon />}
        onClick={handleConnect}
        disabled={connectLoading}
        sx={{
          minWidth: 160,
          textTransform: 'none',
          fontWeight: 600,
          px: 4,
          py: 1.5,
          borderRadius: 2,
          backgroundColor: '#0066cc',
          '&:hover': {
            backgroundColor: '#0052a3'
          }
        }}
      >
        Connect
      </Button>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography variant="h6" color="text.secondary">User not found</Typography>
        <Button onClick={onBack} sx={{ mt: 2 }}>Go Back</Button>
      </Box>
    );
  }

  const userPfp = (user.profilePicture && user.profilePicture.trim() !== '') ? user.profilePicture : default_pfp;

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, margin: '0 auto' }}>
      <Box sx={{ mb: 3 }}>
        <IconButton
          onClick={onBack}
          sx={{
            '&:hover': {
              backgroundColor: '#f5f5f5'
            }
          }}
        >
          <ArrowBackIcon sx={{ color: '#5f6368' }} />
        </IconButton>
      </Box>

      <Stack direction="row" spacing={4} alignItems={'flex-start'}>
        <Box sx={{ width: '100%', maxWidth: 600 }}>
          <div className='profile'>
            <div className='headerContainer' style={{ position: 'relative' }}>
              <div className='backImage'> </div>

              <div className='headerContent'>
                <div className='image'>
                  <img src={userPfp} />
                </div>

                <div className="name">
                  {user.name}
                </div>

                <div className='regular' style={{ textAlign: 'center', color: '#5f6368', fontSize: '16px' }}>
                  {user.position}
                  {user.location && ` • ${user.location}`}
                </div>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                  {getConnectionButton()}
                </Box>
              </div>
            </div>

            <div className='container'>
              <div className='title'> About </div>
              <div className='regular'> {user.about || 'No information provided'} </div>
            </div>

            <div className='container'>
              <div className='title'> Work Experience </div>
              <div className='regular' style={{ whiteSpace: 'pre-wrap' }}> {user.workExperience || 'No work experience listed'} </div>
            </div>

            <div className='container'>
              <div className='title'> Education </div>
              <div className='regular'> {user.education || 'No education information'} </div>
            </div>

            <div className='container'>
              <div className='title'> Skills </div>
              <div className='regular'> {user.skills || 'No skills listed'} </div>
            </div>
          </div>
        </Box>

        <Stack direction="column" spacing={2} alignItems="stretch" sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#1a1a1a' }}>Posts</Typography>
          {postsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : posts.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="body1" color="text.secondary">
                No posts yet
              </Typography>
            </Box>
          ) : (
            posts.map(post => (
              <Post
                key={post.id}
                postId={post.id}
                name={post.author.name}
                text={post.text}
                position={post.author.position}
                pic={post.author.profilePicture || default_pfp}
                liked={post.isLiked}
                likesCount={post.likesCount}
                comments={post.comments}
              />
            ))
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
