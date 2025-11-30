import { useState, useEffect } from 'react'
import {Box, Stack, CircularProgress, Typography} from '@mui/material';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import HomeIcon from '@mui/icons-material/Home';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import './styles.css';
import {ProfileItem, Search, TabPanel} from './Items';
import Profile from './Profile'
import default_pfp from './assets/default_pfp.png';
import Post from './Post';
import NewPost from './newPost';
import UserCard from './UserCard';
import Notifications from './Notifications';
import { getCurrentUser, getAllUsers, getConnections, getAllPosts } from './api.js';


function Home() {
  document.body.style.backgroundColor = '#dce6f1';
  const [value, setValue] = useState(0);
  const [user, setUser] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [connections, setConnections] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const handleChange = (event, newValue) => {setValue(newValue);};

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

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const data = await getAllUsers(query);
      setSearchResults(data.users || []);
    } catch (err) {
      console.error('Failed to search users:', err);
    } finally {
      setSearchLoading(false);
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
      <Box sx={{borderBottom: 2, backgroundColor:'white', borderColor: 'divider', display:'flex', alignItems:'center', top: 0, zIndex: 1000, position:"sticky"}}>
          <Search onSearch={handleSearch}/>
        <Tabs value={value} onChange={handleChange} sx={{ ml: 'auto', mt:1}}>
          <Tab icon ={<HomeIcon />} label="Home" />
          <Tab icon ={<GroupsIcon/>} label="My Network" />
          <Tab icon ={<SearchIcon/>} label="Search" />
          <Tab icon={<PersonIcon/>} label="My Profile" />
        </Tabs>
        <Notifications onRequestAccepted={handleConnectionChange} />
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
              onConnectionChange={handleConnectionChange}
            />
          ))
        )}
      </TabPanel>
      <TabPanel value={value} index={2}>
        {searchQuery.trim() === '' ? (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" color="text.secondary">Search for users</Typography>
            <Typography variant="body2" color="text.secondary">
              Use the search bar above to find people by name, email, or position
            </Typography>
          </Box>
        ) : searchLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : searchResults.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" color="text.secondary">No users found</Typography>
            <Typography variant="body2" color="text.secondary">
              Try searching with different keywords
            </Typography>
          </Box>
        ) : (
          searchResults.map(user => (
            <UserCard
              key={user.id}
              user={user}
              onConnectionChange={handleConnectionChange}
            />
          ))
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
