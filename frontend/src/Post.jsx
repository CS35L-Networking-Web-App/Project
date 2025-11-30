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
        <IconButton
            size="medium"
            onClick={handleClick}
            disabled={loading || !props.postId}
            sx={{
                borderRadius: 2,
                px: 2,
                '&:hover': {
                    backgroundColor: liked ? '#e3f2fd' : '#f5f5f5'
                }
            }}
        >
            {liked? (<>
            <ThumbUpAltIcon sx={{ mr: 1, color:'#0066cc', fontSize: 20 }}/>
            <Typography fontWeight={600} fontSize={14} color='#0066cc'>
                Liked {likesCount > 0 && `· ${likesCount}`}
            </Typography>
            </>) : (<>
            <ThumbUpOffAltOutlinedIcon sx={{ mr: 1, fontSize: 20, color: '#5f6368' }}/>
            <Typography fontWeight={500} fontSize={14} color='#5f6368'>
                Like {likesCount > 0 && `· ${likesCount}`}
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
        <div className='list_image'> <img  src={props.pic}/> </div>
        <div className='user'>
        <div className='profile_list' style={{fontWeight:600, fontSize:16, margin: 0}}>{props.name}</div>
        <div className='regular' style={{ fontSize:14, color: '#5f6368', margin: 0 }}>{props.position}</div>
        </div>
        </div>

        <div className='postText'>
            {props.text}
        </div>

        <div className='bottom'>
           <LikeButton liked={props.liked} postId={props.postId} likesCount={props.likesCount} />
           <IconButton
                size="medium"
                onClick={() => setShowComments(!showComments)}
                sx={{
                    borderRadius: 2,
                    px: 2,
                    '&:hover': {
                        backgroundColor: '#f5f5f5'
                    }
                }}
            >
                <CommentIcon sx={{ mr: 1, fontSize: 20, color: '#5f6368' }} />
                <Typography fontWeight={500} fontSize={14} color='#5f6368'>
                    Comment {comments.length > 0 && `· ${comments.length}`}
                </Typography>
           </IconButton>
        </div>

        {showComments && props.postId && (
            <Box sx={{ mt: 0, px: 3, pb: 3, pt: 2, backgroundColor: '#fafafa' }}>
                {comments.length > 0 && (
                    <Box sx={{ mb: 2, maxHeight: 400, overflowY: 'auto' }}>
                        {comments.map((comment, index) => (
                            <Box key={index} sx={{ display: 'flex', mb: 2, alignItems: 'flex-start' }}>
                                <Avatar
                                    src={comment.author?.profilePicture || default_pfp}
                                    sx={{ width: 36, height: 36, mr: 1.5 }}
                                />
                                <Box sx={{
                                    flex: 1,
                                    bgcolor: 'white',
                                    borderRadius: 2,
                                    p: 1.5,
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }}>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5, fontSize: '14px' }}>
                                        {comment.author?.name || 'Unknown User'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontSize: '14px', color: '#1a1a1a' }}>
                                        {comment.text}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}
                <form onSubmit={handleAddComment}>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                        <TextField
                            fullWidth
                            multiline
                            maxRows={4}
                            placeholder="Write a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            disabled={commentLoading}
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
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={!commentText.trim() || commentLoading}
                            startIcon={commentLoading ? <CircularProgress size={16} /> : null}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3,
                                py: 1,
                                backgroundColor: '#0066cc',
                                '&:hover': {
                                    backgroundColor: '#0052a3'
                                }
                            }}
                        >
                            {commentLoading ? 'Posting...' : 'Post'}
                        </Button>
                    </Box>
                </form>
            </Box>
        )}
    </Box>
);} export default Post