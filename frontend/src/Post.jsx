import './styles.css';
import { useState } from 'react'
import {Box, IconButton} from '@mui/material';
import Typography from '@mui/material/Typography';
import ThumbUpOffAltOutlinedIcon from '@mui/icons-material/ThumbUpOffAltOutlined';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';


function LikeButton(props){

    const[liked,setLiked]= useState(props.liked);
    const handleClick = () => {
        setLiked(!liked );
    };

    return(
        <IconButton size="small" onClick={handleClick}>
            {liked? (<>
            <ThumbUpAltIcon sx={{ mr: 0.7, color:'#1976D2' }}/> <Typography fontWeight={510} color='#1976D2'>Liked</Typography> </>) : (<> <ThumbUpOffAltOutlinedIcon sx={{ mr: 0.7 }}/> <Typography fontWeight={510}>Like</Typography> </>)}
         </IconButton>
    );
}


function Post(props){

return(
    <Box className='container' sx={{mb:22 }}>

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
           <LikeButton liked={props.liked}/>
    
    </div>
    </Box>
);} export default Post