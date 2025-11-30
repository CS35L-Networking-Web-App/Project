import { useState, useEffect } from 'react'
import {Box, Stack, CircularProgress, Typography, TextField, InputAdornment, IconButton, Menu, MenuItem} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import HomeIcon from '@mui/icons-material/Home';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import './styles.css';
import {ProfileItem, TabPanel} from './Items';
import Profile from './Profile'
import default_pfp from './assets/default_pfp.png';
import Post from './Post';
import NewPost from './newPost';
import UserCard from './UserCard';
import Notifications from './Notifications';
import UserProfile from './UserProfile';
import { getCurrentUser, getAllUsers, getConnections, getAllPosts } from './api.js';


function Home() {
  document.body.style.backgroundColor = '#dce6f1';
  const [value, setValue] = useState(0);
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingUserId, setViewingUserId] = useState(null);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState(null);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setViewingUserId(null); // Clear viewing user when switching tabs
  };

  const handleAccountMenuOpen = (event) => {
    setAccountMenuAnchor(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAccountMenuAnchor(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/'; // Redirect to login page
  };

  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('Failed to load user:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    async function loadPosts() {
      if (value === 0) { // Home tab
        setPostsLoading(true);
        try {
          const data = await getAllPosts();
          setPosts(data.posts || []);
        } catch (err) {
          console.error('Failed to load posts:', err);
        } finally {
          setPostsLoading(false);
        }
      }
    }
    loadPosts();
  }, [value]);

  useEffect(() => {
    async function loadConnections() {
      if (value === 1) { // My Network tab
        setConnectionsLoading(true);
        try {
          const data = await getConnections();
          setConnections(data.connections || []);
        } catch (err) {
          console.error('Failed to load connections:', err);
        } finally {
          setConnectionsLoading(false);
        }
      }
    }
    loadConnections();
  }, [value]);

  useEffect(() => {
    async function loadUsers() {
      if (value === 2) { // Search tab
        setUsersLoading(true);
        try {
          const data = await getAllUsers('');
          setAllUsers(data.users || []);
        } catch (err) {
          console.error('Failed to load users:', err);
        } finally {
          setUsersLoading(false);
        }
      }
    }
    loadUsers();
  }, [value]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setUsersLoading(true);
    try {
      const data = await getAllUsers(query);
      setAllUsers(data.users || []);
    } catch (err) {
      console.error('Failed to search users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleConnectionChange = () => {
    // Reload connections when a new connection is made
    if (value === 1) {
      async function reloadConnections() {
        try {
          const data = await getConnections();
          setConnections(data.connections || []);
        } catch (err) {
          console.error('Failed to reload connections:', err);
        }
      }
      reloadConnections();
    }
  };

  const handlePostCreated = async () => {
    // Reload posts when a new post is created
    try {
      const data = await getAllPosts();
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Failed to reload posts:', err);
    }
  };

  const handleUserClick = (userId) => {
    setViewingUserId(userId);
  };

  const handleBackFromProfile = () => {
    setViewingUserId(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Failed to load user data. Please try logging in again.</p>
      </Box>
    );
  }

  const userPfp = user.profilePicture || default_pfp;


  return (
    <Box sx = {{width:'100%'}}>
      <Box>
      <Box sx={{borderBottom: 2, backgroundColor:'white', borderColor: 'divider', display:'flex', alignItems:'center', top: 0, zIndex: 1000, position:"sticky", justifyContent: 'space-between', px: 2}}>
        <Box sx={{ flexGrow: 1 }} />
        <Tabs value={value} onChange={handleChange} sx={{ mt:1}}>
          <Tab icon ={<HomeIcon />} label="Home" />
          <Tab icon ={<GroupsIcon/>} label="My Network" />
          <Tab icon ={<SearchIcon/>} label="Search" />
          <Tab icon={<PersonIcon/>} label="My Profile" />
        </Tabs>
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Notifications onRequestAccepted={handleConnectionChange} />
          <IconButton
            onClick={handleAccountMenuOpen}
            sx={{ ml: 1 }}
          >
            <AccountCircleIcon sx={{ fontSize: 32 }} />
          </IconButton>
          <Menu
            anchorEl={accountMenuAnchor}
            open={Boolean(accountMenuAnchor)}
            onClose={handleAccountMenuClose}
          >
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      <TabPanel value={value} index={0}>
        <NewPost name={user.name} position={user.position} pic={userPfp} onPostCreated={handlePostCreated} />
        {postsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : posts.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" color="text.secondary">No posts yet</Typography>
            <Typography variant="body2" color="text.secondary">
              Be the first to share something!
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
              pic={post.author.profilePicture || userPfp}
              liked={post.isLiked}
              likesCount={post.likesCount}
              comments={post.comments}
            />
          ))
        )}
      </TabPanel>
      <TabPanel value={value} index={1}>
        {viewingUserId ? (
          <UserProfile userId={viewingUserId} onBack={handleBackFromProfile} currentUserId={user?.id} />
        ) : connectionsLoading ? (
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
              onConnectionChange={handleConnectionChange}
              onUserClick={handleUserClick}
            />
          ))
        )}
      </TabPanel>
      <TabPanel value={value} index={2}>
        {viewingUserId ? (
          <UserProfile userId={viewingUserId} onBack={handleBackFromProfile} currentUserId={user?.id} />
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                placeholder='Search for users by name, email, or position...'
                value={searchQuery}
                size="medium"
                onChange={(e) => handleSearch(e.target.value)}
                InputProps={{
                  startAdornment:(
                    <InputAdornment position='start'>
                      <SearchIcon />
                    </InputAdornment>),
                }}
                sx={{ backgroundColor: 'white', borderRadius: 1 }}
              />
            </Box>
            {usersLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : allUsers.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h6" color="text.secondary">No users found</Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchQuery.trim() === '' ? 'No users in the system yet' : 'Try searching with different keywords'}
                </Typography>
              </Box>
            ) : (
              allUsers.map(u => (
                <UserCard
                  key={u.id}
                  user={u}
                  onConnectionChange={handleConnectionChange}
                  onUserClick={handleUserClick}
                />
              ))
            )}
          </>
        )}
      </TabPanel>
      <TabPanel value={value} index={3}>
        <Stack direction="row" spacing={10} alignItems={'flex-start'}>
          <Profile
            {...user}
            pic={userPfp}
            onProfileUpdate={(updatedProfile) => {
              setUser({ ...user, ...updatedProfile });
            }}
          />
          <Stack direction="column" spacing={5} alignItems="stretch">
               <NewPost name={user.name} position={user.position} pic={userPfp} onPostCreated={handlePostCreated}/>
               {user.about && <Post name={user.name} text={user.about} position={user.position} pic={userPfp} liked={false}/>}
          </Stack>
        </Stack>
      </TabPanel>
      </Box>
    </Box>
  );
}

export default Home
