import { useState } from 'react'
import {Box, Stack, CircularProgress, Typography, Button} from '@mui/material';
import './styles.css';
import { TabPanel } from './utilities.jsx';
import Profile from './Profile'
import { useNavigate } from 'react-router-dom';
import NewPost from './newPost';
import Post from './Post';
import HomeTab from './components/HomeTab';
import NetworkTab from './components/NetworkTab';
import SearchTab from './components/SearchTab';
import { AppHeader } from './components/AppHeader';
import { useCurrentUser } from './hooks/useCurrentUser';
import { usePostsFeed, useConnectionsPosts, useProfilePosts } from './hooks/usePosts';
import { useConnections } from './hooks/useConnections';
import { useUserSearch, usePostSearch } from './hooks/useSearch';
const default_pfp = "https://cpng.pikpng.com/pngl/s/80-805068_my-profile-icon-blank-profile-picture-circle-clipart.png"

function Home() {
  document.body.style.backgroundColor = '#f5f7fa';
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingUserId, setViewingUserId] = useState(null);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState(null);
  const [innerSearchTab, setInnerSearchTab] = useState(0);
  const [innerHomeTab, setInnerHomeTab] = useState(0);
  const [updateNotifs, setUpdateNotifs] = useState(0);

  const { user, loading, setUser } = useCurrentUser();
  const {
    posts: homePosts,
    loading: postsLoading,
    setPosts: setHomePosts,
    refresh: refreshHomePosts
  } = usePostsFeed({ enabled: tab === 0 && innerHomeTab === 0, query: '' });
  const {
    posts: connectionsPosts,
    loading: connectionsPostsLoading,
    setPosts: setConnectionsPosts,
    refresh: refreshConnectionsPosts
  } = useConnectionsPosts({ enabled: tab === 0 && innerHomeTab === 1 });
  const {
    posts: profilePosts,
    loading: profilePostsLoading,
    setPosts: setProfilePosts,
    refresh: refreshProfilePosts
  } = useProfilePosts({ enabled: tab === 3, userId: user?.id });
  const {
    connections,
    loading: connectionsLoading,
    refresh: refreshConnections
  } = useConnections({ enabled: tab === 1 });
  const {
    users: allUsers,
    loading: usersLoading,
    refresh: refreshUsers
  } = useUserSearch({ enabled: tab === 2 && innerSearchTab === 0, query: searchQuery });
  const {
    posts: foundPosts,
    loading: foundPostsLoading,
    setPosts: setFoundPosts,
    refresh: refreshFoundPosts
  } = usePostSearch({ enabled: tab === 2 && innerSearchTab === 1, query: searchQuery });

  const handleChange = (event, newValue) => {
    setTab(newValue);
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

  const handleLogoClick = () => {
    setTab(0);
    setViewingUserId(null);
  };

  const handleConnectionChange = () => {
    if (tab === 1) {
      refreshConnections(true);
    }

    if (tab === 0) {
      setUpdateNotifs(prev => !prev);
    }

    if (tab === 0 && innerHomeTab === 1) {
      refreshConnectionsPosts(true);
    }

    if (tab === 2 && innerSearchTab === 0) {
      setUpdateNotifs(prev => !prev);
      refreshUsers(true);
    }
  };

  const handleRequestRejected = () => {
    if (tab === 2 && innerSearchTab === 0) {
      refreshUsers(true);
    }
  }

  const handlePostCreated = async () => {
    await Promise.all([
      refreshHomePosts(true),
      refreshConnectionsPosts(true),
      refreshProfilePosts(true),
      refreshFoundPosts(true)
    ]);
  };

  const handlePostDeleted = (postId) => {
    setHomePosts((prev) => prev.filter((p) => p.id !== postId));
    setFoundPosts((prev) => prev.filter((p) => p.id !== postId));
    setProfilePosts((prev) => prev.filter((p) => p.id !== postId));
    setConnectionsPosts((prev) => prev.filter((p) => p.id !== postId));
  };

    const handlePostUpdated = (updatedPost) => {
    setHomePosts((prev) => prev.map((p) => p.id === updatedPost.id ? updatedPost : p));
    setFoundPosts((prev) => prev.map((p) => p.id === updatedPost.id ? updatedPost : p));
    setProfilePosts((prev) => prev.map((p) => p.id === updatedPost.id ? updatedPost : p));
    setConnectionsPosts((prev) => prev.map((p) => p.id === updatedPost.id ? updatedPost : p));
  };


  const handleUserClick = (userId) => {
    if (user && userId === user.id) {
      // Navigate to my profile tab for self
      setTab(3);
      setViewingUserId(null);
    } else {
      // Always view others in the Home tab profile view for consistent layout
      setTab(0);
      setViewingUserId(userId);
    }
  };

  const handleBackFromProfile = () => {
    setViewingUserId(null);
    if (tab === 2 && innerSearchTab === 1) {
      // refresh search results if we were on search posts view
      refreshFoundPosts(true);
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
        <Box sx={{ textAlign: 'center', p: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>Failed to load user data. Please try logging in again.</Typography>
          <Button
            variant="contained"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/');
            }}
          >
            Back to Sign In
          </Button>
        </Box>
      </Box>
    );
  }

  const userPfp = user.profilePicture || default_pfp;


  return (
    <Box sx = {{width:'100%'}}>
      <Box>
      <AppHeader
        tab={tab}
        onTabChange={handleChange}
        onLogoClick={handleLogoClick}
        accountMenuAnchor={accountMenuAnchor}
        onAccountMenuOpen={handleAccountMenuOpen}
        onAccountMenuClose={handleAccountMenuClose}
        onLogout={handleLogout}
        onMessagesClick={() => navigate('/messages')}
        onRequestAccepted={handleConnectionChange}
        onRequestRejected={handleRequestRejected}
        updateNotifs={updateNotifs}
      />
        <Box sx={{ maxWidth: viewingUserId ? 1200 : 800, margin: '0 auto' }}>
          <TabPanel value={tab} index={0}>
            <HomeTab
              viewingUserId={viewingUserId}
              onBackFromProfile={handleBackFromProfile}
              user={user}
              userPfp={userPfp}
              innerHomeTab={innerHomeTab}
              setInnerHomeTab={setInnerHomeTab}
              posts={homePosts}
              postsLoading={postsLoading}
              connectionsPosts={connectionsPosts}
              connectionsPostsLoading={connectionsPostsLoading}
              connections={connections}
              onPostCreated={handlePostCreated}
              onPostDeleted={handlePostDeleted}
              onPostUpdated={handlePostUpdated}
              onAuthorClick={handleUserClick}
            />
          </TabPanel>
        </Box>
      <TabPanel value={tab} index={1}>
        <NetworkTab
          viewingUserId={viewingUserId}
          onBackFromProfile={handleBackFromProfile}
          connections={connections}
          connectionsLoading={connectionsLoading}
          onConnectionChange={handleConnectionChange}
          onUserClick={handleUserClick}
          currentUserId={user?.id}
        />
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <SearchTab
          viewingUserId={viewingUserId}
          onBackFromProfile={handleBackFromProfile}
          onConnectionChange={handleConnectionChange}
          currentUserId={user?.id}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          innerTab={innerSearchTab}
          setInnerTab={setInnerSearchTab}
          users={allUsers}
          usersLoading={usersLoading}
          posts={foundPosts}
          postsLoading={foundPostsLoading}
          onUserClick={handleUserClick}
          onPostDeleted={handlePostDeleted}
        />
      </TabPanel>
      <TabPanel value={tab} index={3}>
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
                 {profilePostsLoading ? (
                   <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                     <CircularProgress />
                   </Box>
                 ) : profilePosts.length === 0 ? (
                   <Box sx={{ textAlign: 'center', p: 3 }}>
                     <Typography variant="body2" color="text.secondary">
                       You have no posts yet
                     </Typography>
                   </Box>
                 ) : (
                   profilePosts.map(post => (
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
                       authorId={post.author.id}
                       currentUserId={user.id}
                       onDelete={handlePostDeleted}
                       onAuthorClick={handleUserClick}
                     />
                   ))
                 )}
           </Stack>
         </Stack>
       </Box>
      </TabPanel>
      </Box>
    </Box>
  );
}

export default Home
