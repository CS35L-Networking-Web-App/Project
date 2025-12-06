import { Box, CircularProgress, Tabs, Tab, TextField, InputAdornment, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Post from '../Post';
import UserCard from '../UserCard';
import UserProfile from '../UserProfile';

const default_pfp = 'https://cpng.pikpng.com/pngl/s/80-805068_my-profile-icon-blank-profile-picture-circle-clipart.png';

export default function SearchTab({
  viewingUserId,
  onBackFromProfile,
  onConnectionChange,
  currentUserId,
  searchQuery,
  setSearchQuery,
  innerTab,
  setInnerTab,
  users,
  usersLoading,
  posts,
  postsLoading,
  onUserClick,
  onPostDeleted
}) {
  if (viewingUserId) {
    return (
      <UserProfile
        userId={viewingUserId}
        onBack={onBackFromProfile}
        onConnectionChange={onConnectionChange}
        currentUserId={currentUserId}
      />
    );
  }

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto' }}>
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder={innerTab === 0 ? 'Search for users by name, email, or position...' : 'Search for posts by content or author name...'}
          value={searchQuery}
          size="medium"
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon sx={{ color: '#9e9e9e' }} />
              </InputAdornment>)
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
      <Tabs value={innerTab} onChange={(e, newVal) => { setInnerTab(newVal); }} sx={{ mb: 2, '& .MuiTab-root': { textTransform: 'none', fontSize: '15px', } }}>
        <Tab label="Users" />
        <Tab label="Posts" />
      </Tabs>
      {innerTab === 0 && (
        usersLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : users.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" color="text.secondary">No users found</Typography>
            <Typography variant="body2" color="text.secondary">
              {searchQuery.trim() === '' ? 'No users in the system yet' : 'Try searching with different keywords'}
            </Typography>
          </Box>
        ) : (
          users.map(u => (
            <UserCard
              key={u.id}
              user={u}
              onConnectionChange={onConnectionChange}
              onUserClick={onUserClick}
            />
          ))
        )
      )}
      {innerTab === 1 && (
        postsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : posts.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" color="text.secondary">No posts found</Typography>
            <Typography variant="body2" color="text.secondary">
              {searchQuery.trim() === '' ? 'No posts yet' : 'Try searching with different keywords'}
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
              authorId={post.author.id}
              currentUserId={currentUserId}
              onDelete={onPostDeleted}
            />
          ))
        )
      )}
    </Box>
  );
}
