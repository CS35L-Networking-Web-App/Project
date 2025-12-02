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
import { TabPanel } from './utilities.jsx';
import Profile from './Profile'
import default_pfp from './assets/default_pfp.svg';
import Post from './Post';
import NewPost from './newPost';
import UserCard from './UserCard';
import Notifications from './Notifications';
import UserProfile from './UserProfile';
import { getCurrentUser, getAllUsers, getConnections, getPosts } from './api.js';


function Home() {
  document.body.style.backgroundColor = '#f5f7fa';
  const [value, setValue] = useState(0);
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [posts, setPosts] = useState([]);
  const [foundPosts, setFoundPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);
  const [foundPostsLoading, setFoundPostsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingUserId, setViewingUserId] = useState(null);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState(null);
  const [innerTab, setInnerTab] = useState(0);
  const [updateNotifs, setUpdateNotifs] = useState(0);

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
      if (value === 0){ // Home tab is 0
        setPostsLoading(true);
        try {
          const data = await getPosts('');
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

  async function loadUsers() {
      if (value == 2 && innerTab==0){ // Search tab, keep previous searches when switching between tabs
        setUsersLoading(true);
        try {
          const data = await getAllUsers(searchQuery);
          setAllUsers(data.users || []);
            } catch (err) {
              console.error("Failed to load users:", err);
             } finally {
              setUsersLoading(false);
            }
          }
        }

  useEffect(() => {
    async function loadFoundPosts() {
      if (value === 2 && innerTab==1){ 
        setFoundPostsLoading(true);
        try {
          const data = await getPosts(searchQuery);
          setFoundPosts(data.posts || []);
        } catch (err) {
          console.error('Failed to load posts:', err);
        } finally {
          setFoundPostsLoading(false);
        }
      }
    }
    loadFoundPosts();
    loadUsers();
  }, [value, innerTab, searchQuery]);

  useEffect(() => {
    async function loadConnections() {
      if (value === 1 ) { // My Network tab
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

     if(value == 2 && innerTab==0){ 
      setUpdateNotifs(prev => !prev);
      loadUsers();
    }
  };

  const handlePostCreated = async () => {
    // Reload posts when a new post is created
    try {
      const data = await getPosts('');
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Failed to reload posts:', err);
    }
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setFoundPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleUserClick = (userId) => {
    setViewingUserId(userId);
  };

  const handleBackFromProfile = () => {
    setViewingUserId(null);
    loadFoundPosts();
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
      <Box sx={{
        backgroundColor:'white',
        borderBottom: '1px solid #e0e0e0',
        display:'flex',
        alignItems:'center',
        top: 0,
        zIndex: 1000,
        position:"sticky",
        justifyContent: 'space-between',
        px: 3,
        py: 1,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <Box sx={{ flexGrow: 1 }} />
        <Tabs
          value={value}
          onChange={handleChange}
          sx={{
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontSize: '15px',
              fontWeight: 500,
              color: '#5f6368',
              '&.Mui-selected': {
                color: '#0066cc'
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#0066cc',
              height: 3
            }
          }}
        >
          <Tab icon={<HomeIcon />} label="Home" iconPosition="start" />
          <Tab icon={<GroupsIcon/>} label="My Network" iconPosition="start" />
          <Tab icon={<SearchIcon/>} label="Search" iconPosition="start" />
          <Tab icon={<PersonIcon/>} label="My Profile" iconPosition="start" />
        </Tabs>
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
          <Notifications onRequestAccepted={handleConnectionChange} updateNotifs={updateNotifs} onRequestRejected={loadUsers} />
          <IconButton
            onClick={handleAccountMenuOpen}
            sx={{
              '&:hover': { backgroundColor: '#f5f5f5' }
            }}
          >
            <AccountCircleIcon sx={{ fontSize: 32, color: '#5f6368' }} />
          </IconButton>
          <Menu
            anchorEl={accountMenuAnchor}
            open={Boolean(accountMenuAnchor)}
            onClose={handleAccountMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                borderRadius: 2
              }
            }}
          >
            <MenuItem
              onClick={handleLogout}
              sx={{
                py: 1.5,
                px: 2,
                '&:hover': {
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      <TabPanel value={value} index={0}>
        <Box sx={{ maxWidth: 800, margin: '0 auto' }}>
          <NewPost name={user.name} position={user.position} pic={userPfp} onPostCreated={handlePostCreated} />
          {postsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : posts.length === 0 ? (
            <Box sx={{
              textAlign: 'center',
              p: 6,
              backgroundColor: 'white',
              borderRadius: 3,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>No posts yet</Typography>
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
                authorId={post.author.id}
                currentUserId={user.id}
                onDelete={handlePostDeleted}
              />
            ))
          )}
        </Box>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Box sx={{ maxWidth: 800, margin: '0 auto' }}>
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
        </Box>
      </TabPanel>
      <TabPanel value={value} index={2}>
        {viewingUserId ? (
          <UserProfile userId={viewingUserId} onBack={handleBackFromProfile} onConnectionChange={handleConnectionChange} currentUserId={user?.id} />
        ) : (
          <Box sx={{ maxWidth: 800, margin: '0 auto' }}>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                placeholder={innerTab === 0 ? 'Search for users by name, email, or position...' : 'Search for posts by content or author name...'}
                value={searchQuery}
                size="medium"
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment:(
                    <InputAdornment position='start'>
                      <SearchIcon sx={{ color: '#9e9e9e' }} />
                    </InputAdornment>),
                }}
                sx={{
                  backgroundColor: 'white',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#e0e0e0'
                    },
                    '&:hover fieldset': {
                      borderColor: '#0066cc'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#0066cc'
                    }
                  }
                }}
              />
            </Box>
          <Tabs value={innerTab} onChange={(e, newVal) => {setInnerTab(newVal)}} sx={{ mb:2, '& .MuiTab-root': {textTransform: 'none', fontSize: '15px',}}}>
          <Tab label="Users" />
          <Tab label="Posts"/>
          </Tabs>
          <TabPanel value={innerTab} index={0}>
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
          </TabPanel>
          <TabPanel value={innerTab} index={1}>
            {foundPostsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : foundPosts.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h6" color="text.secondary">No posts found</Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchQuery.trim() === '' ? 'No posts yet' : 'Try searching with different keywords'}
                </Typography>
              </Box>
            ) : (
              foundPosts.map(post => (
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
                authorId={post.author.id}
                currentUserId={user.id}
                onDelete={handlePostDeleted}
              />
            ))
            )}
          </TabPanel>
          </Box>
         )}
      </TabPanel>
      <TabPanel value={value} index={3}>
        <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
          <Stack direction="row" spacing={4} alignItems={'flex-start'}>
            <Profile
              {...user}
              pic={userPfp}
              onProfileUpdate={(updatedProfile) => {
                setUser({ ...user, ...updatedProfile });
              }}
            />
            <Stack direction="column" spacing={2} alignItems="stretch" sx={{ flex: 1 }}>
                 <NewPost name={user.name} position={user.position} pic={userPfp} onPostCreated={handlePostCreated}/>
                 {user.about && <Post name={user.name} text={user.about} position={user.position} pic={userPfp} liked={false}/>}
            </Stack>
          </Stack>
        </Box>
      </TabPanel>
      </Box>
    </Box>
  );
}

export default Home
