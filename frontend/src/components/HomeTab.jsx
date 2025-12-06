import { Box, CircularProgress, Tabs, Tab, Typography } from '@mui/material';
import NewPost from '../newPost';
import Post from '../Post';
import UserProfile from '../UserProfile';

const default_pfp = 'https://cpng.pikpng.com/pngl/s/80-805068_my-profile-icon-blank-profile-picture-circle-clipart.png';

export default function HomeTab({
  viewingUserId,
  onBackFromProfile,
  user,
  userPfp,
  innerHomeTab,
  setInnerHomeTab,
  posts,
  postsLoading,
  connectionsPosts,
  connectionsPostsLoading,
  connections,
  onPostCreated,
  onPostDeleted,
  onPostUpdated,
  onAuthorClick
}) {
  if (viewingUserId) {
    return (
      <UserProfile
        userId={viewingUserId}
        onBack={onBackFromProfile}
        currentUserId={user?.id}
      />
    );
  }

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto' }}>
      <Tabs
        value={innerHomeTab}
        onChange={(e, newVal) => {
          setInnerHomeTab(newVal);
        }}
        sx={{ mb: 1.5, ml: 3, display: 'flex', mt: -1, '& .MuiTab-root': { textTransform: 'none', fontSize: '15px' } }}
      >
        <Tab label="New" />
        <Tab label="Connections" />
      </Tabs>

      {innerHomeTab === 0 && (
        <>
          <NewPost name={user.name} position={user.position} pic={userPfp} onPostCreated={onPostCreated} />
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
                pic={post.author.profilePicture || default_pfp}
                liked={post.isLiked}
                likesCount={post.likesCount}
                comments={post.comments}
                authorId={post.author.id}
                currentUserId={user.id}
                onUpdate={onPostUpdated}
                onDelete={onPostDeleted}
                onAuthorClick={onAuthorClick}
              />
            ))
          )}
        </>
      )}

      {innerHomeTab === 1 && (
        <>
          <NewPost name={user.name} position={user.position} pic={userPfp} onPostCreated={onPostCreated} />
          {connectionsPostsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : connectionsPosts.length === 0 ? (
            <Box sx={{
              textAlign: 'center',
              p: 6,
              backgroundColor: 'white',
              borderRadius: 3,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
              {connections.length === 0 ? (
                <>
                  <Typography variant="h6" color="text.secondary">No connections yet</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Search for users and send connection requests to build your network!
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>No posts yet</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your connections haven't posted yet.
                  </Typography>
                </>
              )}
            </Box>
          ) : (
            <Box>
              {connectionsPosts.map(post => (
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
                  onDelete={onPostDeleted}
                  onAuthorClick={onAuthorClick}
                />
              ))}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
