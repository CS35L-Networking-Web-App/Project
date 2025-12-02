import './styles.css';
import { useState } from 'react'
import {Box, IconButton, TextField, Button, Avatar, CircularProgress} from '@mui/material';
import Typography from '@mui/material/Typography';
import ThumbUpOffAltOutlinedIcon from '@mui/icons-material/ThumbUpOffAltOutlined';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import CommentIcon from '@mui/icons-material/Comment';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplyIcon from '@mui/icons-material/Reply';
import { toggleLikePost, addComment, deletePost, deleteComment, replyToComment } from './api.js';
import default_pfp from './assets/default_pfp.svg';


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

    const [comments, setComments] = useState(() => (props.comments || []).map((c) => ({ ...c, replies: c.replies || [] })));
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [commentLoading, setCommentLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [commentActionId, setCommentActionId] = useState(null);
    const [replyTexts, setReplyTexts] = useState({});
    const [replySubmittingId, setReplySubmittingId] = useState(null);
    const [replyVisible, setReplyVisible] = useState({});

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim() || !props.postId || commentLoading) return;

        setCommentLoading(true);
        try {
            const newComment = await addComment(props.postId, commentText);
            setComments((prev) => [...prev, { ...newComment, replies: newComment.replies || [] }]);
            setCommentText('');
        } catch (err) {
            console.error('Failed to add comment:', err);
            alert(err.message);
        } finally {
            setCommentLoading(false);
        }
    };

    const addReplyToList = (list, parentId, reply) => {
        return list.map((c) => {
            if (c.id === parentId) {
                return { ...c, replies: [...(c.replies || []), reply] };
            }
            if (c.replies && c.replies.length) {
                return { ...c, replies: addReplyToList(c.replies, parentId, reply) };
            }
            return c;
        });
    };

    const handleReplySubmit = async (parentId) => {
        const text = (replyTexts[parentId] || '').trim();
        if (!text || !props.postId) return;
        setReplySubmittingId(parentId);
        try {
            const newReply = await replyToComment(props.postId, parentId, text);
            setComments((prev) => addReplyToList(prev, parentId, newReply));
            setReplyTexts((prev) => ({ ...prev, [parentId]: '' }));
            setReplyVisible((prev) => ({ ...prev, [parentId]: false }));
        } catch (err) {
            console.error('Failed to reply to comment:', err);
            alert(err.message);
        } finally {
            setReplySubmittingId(null);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!props.postId) return;
        const confirmed = window.confirm('Are you sure you want to delete this comment?');
        if (!confirmed) return;
        setCommentActionId(commentId);
        try {
            const result = await deleteComment(props.postId, commentId);
            setComments(result.comments || []);
        } catch (err) {
            console.error('Failed to delete comment:', err);
            alert(err.message);
        } finally {
            setCommentActionId(null);
        }
    };

    const handleDelete = async () => {
        if (!props.postId || !props.onDelete) return;
        const confirmed = window.confirm('Deleting this post will also delete all comments. Are you sure?');
        if (!confirmed) return;
        setDeleting(true);
        try {
            await deletePost(props.postId);
            props.onDelete(props.postId);
            alert('Successfully deleted this post');
        } catch (err) {
            console.error('Failed to delete post:', err);
            alert(err.message);
        } finally {
            setDeleting(false);
        }
    };

    const isAuthor = props.currentUserId && props.authorId && props.currentUserId === props.authorId;

    const renderComment = (comment, depth = 0) => {
        const isCommentAuthor = props.currentUserId && comment.author?.id === props.currentUserId;
        const displayText = comment.isDeleted ? 'This comment has been deleted' : comment.text;
        const canReply = !comment.isDeleted;
        const canDeleteComment = isCommentAuthor && !comment.isDeleted;
        const showReplyBox = replyVisible[comment.id];

        return (
            <Box key={comment.id} sx={{ display: 'flex', mb: 2, alignItems: 'flex-start', ml: depth > 0 ? 6 : 0 }}>
                <Avatar
                    src={comment.author?.profilePicture || default_pfp}
                    sx={{ width: 36, height: 36, mr: 1.5 }}
                />
                <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5, fontSize: '14px' }}>
                            {comment.author?.name || 'Unknown User'}
                        </Typography>
                        {canDeleteComment && (
                            <IconButton
                                size="small"
                                onClick={() => handleDeleteComment(comment.id)}
                                disabled={commentActionId === comment.id}
                            >
                                <DeleteIcon sx={{ fontSize: 18, color: '#d32f2f' }} />
                            </IconButton>
                        )}
                    </Box>
                    <Typography variant="body2" sx={{ fontSize: '14px', color: '#1a1a1a', mb: 1 }}>
                        {displayText}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: showReplyBox ? 1 : 0 }}>
                        <Button
                            size="small"
                            startIcon={<ReplyIcon fontSize="small" />}
                            onClick={() => setReplyVisible((prev) => ({ ...prev, [comment.id]: !prev[comment.id] }))}
                            disabled={!canReply}
                            sx={{ textTransform: 'none' }}
                        >
                            Reply
                        </Button>
                    </Box>
                    {showReplyBox && canReply && (
                        <Box sx={{ mb: 1 }}>
                            <TextField
                                fullWidth
                                multiline
                                maxRows={4}
                                placeholder="Write a reply..."
                                value={replyTexts[comment.id] || ''}
                                onChange={(e) => setReplyTexts((prev) => ({ ...prev, [comment.id]: e.target.value }))}
                                disabled={replySubmittingId === comment.id}
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
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => handleReplySubmit(comment.id)}
                                    disabled={!replyTexts[comment.id]?.trim() || replySubmittingId === comment.id}
                                    startIcon={replySubmittingId === comment.id ? <CircularProgress size={14} /> : null}
                                    sx={{ textTransform: 'none', fontWeight: 600 }}
                                >
                                    {replySubmittingId === comment.id ? 'Posting...' : 'Reply'}
                                </Button>
                            </Box>
                        </Box>
                    )}
                    {comment.replies && comment.replies.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                            {comment.replies.map((reply) => renderComment(reply, depth + 1))}
                        </Box>
                    )}
                </Box>
            </Box>
        );
    };

return(
    <Box className='container' sx={{mb:2 }}>

        <div className='header'>
        <div className='list_image'> <img  src={props.pic}/> </div>
        <div className='user'>
        <div className='profile_list' style={{fontWeight:600, fontSize:16, margin: 0}}>{props.name}</div>
        <div className='regular' style={{ fontSize:14, color: '#5f6368', margin: 0 }}>{props.position}</div>
        </div>
        {isAuthor && props.postId && (
            <IconButton
                size="small"
                onClick={handleDelete}
                disabled={deleting}
                sx={{ ml: 'auto' }}
            >
                <DeleteIcon sx={{ fontSize: 20, color: '#d32f2f' }} />
            </IconButton>
        )}
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
                        {comments.map((comment) => renderComment(comment))}
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
