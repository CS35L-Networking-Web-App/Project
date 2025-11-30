import './styles.css';
import { useState } from 'react'
import {Box, Button, TextField, CircularProgress, Alert} from '@mui/material';
import { createPost } from './api.js';

function NewPost(props){

const maxChars = 3000;
const [value, setValue] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const [success, setSuccess] = useState(false);

const handleChange = (event) => {
        setValue(event.target.value);
    };

const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
        await createPost(value);
        setValue('');
        setSuccess(true);
        if (props.onPostCreated) {
            props.onPostCreated();
        }
        setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
}

return(
    <Box className='container' sx={{ display:'flex', flexDirection: 'column', flexGrow:1}}>
        <div className='header'>
        <div className='list_image'> <img  src={props.pic}/> </div>
        <div className='user'>
        <div className='profile_list' style={{fontWeight:600, fontSize:16, margin: 0}}>{props.name}</div>
        <div className='regular' style={{ fontSize:14, color: '#5f6368', margin: 0 }}>{props.position}</div>
        </div>
        </div>
        <form onSubmit={handleSubmit}>
        {error && <Alert severity="error" sx={{ mb: 2, mx: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2, mx: 2 }}>Post created successfully!</Alert>}
        <TextField
            multiline
            minRows={3}
            maxRows={10}
            fullWidth
            value={value}
            onChange={handleChange}
            helperText={`${value.length}/${maxChars}`}
            disabled={loading}
            placeholder="What do you want to share?"
            FormHelperTextProps={{sx: {
              color: (value.length > maxChars) ? 'error.main' : '#5f6368',
              fontWeight: (value.length > maxChars) ? 600 : 500,
              textAlign: 'right',
              fontSize:13,
              mx: 2
            },}}
            sx={{
                mx: 2,
                mt: 1,
                mb: 2,
                '& .MuiOutlinedInput-root': {
                    fontSize: 15,
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
         <Box sx={{ display:'flex', justifyContent:'flex-end', px: 2, pb: 2 }}>
            <Button
                type="submit"
                disabled={value.trim()==='' || (value.length > maxChars) || loading}
                startIcon={loading ? <CircularProgress size={18} /> : null}
                variant="contained"
                sx={{
                    backgroundColor:'#0066cc',
                    color:'white',
                    fontWeight:600,
                    px: 4,
                    py: 1,
                    fontSize:14,
                    textTransform:'none',
                    borderRadius: 2,
                    '&:hover': {
                        backgroundColor: '#0052a3'
                    },
                    '&.Mui-disabled': {
                        backgroundColor: '#cccccc',
                        color: 'white'
                    }
                }}
            >
              {loading ? 'Posting...' : 'Post'}
            </Button>
         </Box>
         </form>
    </Box>
);} export default NewPost