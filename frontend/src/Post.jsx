import './styles.css';
import { useState } from 'react'
import {Box, IconButton, TextField, Button, Avatar, Divider, CircularProgress} from '@mui/material';
import Typography from '@mui/material/Typography';
import ThumbUpOffAltOutlinedIcon from '@mui/icons-material/ThumbUpOffAltOutlined';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import CommentIcon from '@mui/icons-material/Comment';
import { toggleLikePost, addComment } from './api.js';
import default_pfp from './assets/default_pfp.png';


function LikeButton(props){

    const[liked,setLiked]= useState(props.liked);
    const[likesCount, setLikesCount] = useState(props.likesCount || 0);
    const[loading, setLoading] = useState(false);

    const handleClick = async () => {
        if (!props.postId || loading) return;

        setLoading(true);
        try {
            const result = await toggleLikePost(props.postId);
            setLiked(result.liked);
            setLikesCount(result.likesCount);
        } catch (err) {
            console.error('Failed to toggle like:', err);
        } finally {
            setLoading(false);
        }
    };

    return(
        <IconButton size="small" onClick={handleClick} disabled={loading || !props.postId}>
            {liked? (<>
            <ThumbUpAltIcon sx={{ mr: 0.7, color:'#1976D2' }}/>
            <Typography fontWeight={510} color='#1976D2'>
                Liked {likesCount > 0 && `(${likesCount})`}
            </Typography>
            </>) : (<>
            <ThumbUpOffAltOutlinedIcon sx={{ mr: 0.7 }}/>
            <Typography fontWeight={510}>
                Like {likesCount > 0 && `(${likesCount})`}
            </Typography>
            </>)}
         </IconButton>
    );
}


function Post(props){

    const [comments, setComments] = useState(props.comments || []);
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [commentLoading, setCommentLoading] = useState(false);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim() || !props.postId || commentLoading) return;

        setCommentLoading(true);
        try {
            const newComment = await addComment(props.postId, commentText);
            setComments([...comments, newComment]);
            setCommentText('');
        } catch (err) {
            console.error('Failed to add comment:', err);
            alert(err.message);
        } finally {
            setCommentLoading(false);
        }
    };

return(
    <Box className='container' sx={{mb:2 }}>

        <div className='header'>
        <div className='list_image' style={{ marginTop: '7px' }}> <img  src={props.pic}/> </div>
        <div className='user'>
        <div className='profile_list' style={{fontWeight:590, fontSize:20 }}>{props.name}</div>
        <div className='regular'style={{ fontSize:17 }}>{props.position}</div>
        </div>
        </div>

        <div className='postText'>
            {props.text}
        </div>

        <div className='bottom'>
           <LikeButton liked={props.liked} postId={props.postId} likesCount={props.likesCount} />
           <IconButton size="small" onClick={() => setShowComments(!showComments)}>
                <CommentIcon sx={{ mr: 0.7 }} />
                <Typography fontWeight={510}>Comment {comments.length > 0 && `(${comments.length})`}</Typography>
           </IconButton>
        </div>

        {showComments && props.postId && (
            <Box sx={{ mt: 2, px: 2, pb: 2 }}>
                <Divider sx={{ mb: 2 }} />
                {comments.length > 0 && (
                    <Box sx={{ mb: 2, maxHeight: 300, overflowY: 'auto' }}>
                        {comments.map((comment, index) => (
                            <Box key={index} sx={{ display: 'flex', mb: 2 }}>
                                <Avatar
                                    src={comment.author?.profilePicture || default_pfp}
                                    sx={{ width: 32, height: 32, mr: 1 }}
                                />
                                <Box sx={{ flex: 1, bgcolor: '#f0f2f5', borderRadius: 2, p: 1.5 }}>
                                    <Typography variant="subtitle2" fontWeight={600}>
                                        {comment.author?.name || 'Unknown User'}
                                    </Typography>
                                    <Typography variant="body2">{comment.text}</Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}
                <form onSubmit={handleAddComment}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Write a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            disabled={commentLoading}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={!commentText.trim() || commentLoading}
                            startIcon={commentLoading ? <CircularProgress size={16} /> : null}
                        >
                            {commentLoading ? 'Posting...' : 'Post'}
                        </Button>
                    </Box>
                </form>
            </Box>
        )}
    </Box>
);} export default Post