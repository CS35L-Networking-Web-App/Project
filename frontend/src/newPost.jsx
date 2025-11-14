import './styles.css';
import { useState } from 'react'
import {Box, Button, TextField} from '@mui/material';

function NewPost(props){

const maxChars = 3000;
const [value, setValue] = useState('');
const handleChange = (event) => {
        setValue(event.target.value);
    };

const handleSubmit = (event) => {
    event.preventDefault(); // prevent page reload
    setValue('');
}

return(
    <Box className='container' sx={{ display:'flex', flexDirection: 'column', flexGrow:1}}>
        <div className='header'>
        <div className='list_image' style={{ marginTop: '7px' }}> <img  src={props.pic}/> </div>
        <div className='user'>
        <div className='profile_list' style={{fontWeight:590, fontSize:20 }}>{props.name}</div>
        <div className='regular'style={{fontSize:17}}>{props.position}</div>
        </div>
        </div>
        <form onSubmit={handleSubmit}>
        <TextField multiline minRows={4} fullWidth value={value} onChange={handleChange} helperText={`${value.length}/${maxChars}`}

FormHelperTextProps={{sx: {
      color: (value.length > maxChars) ? 'error.main' : 'text.secondary',
      fontWeight: (value.length > maxChars) ? 600 : 500,
      textAlign: 'right',
      fontSize:15,
    },}}

        sx={{display:'flex', justifyContent:'flex-start', margin: 1, mt:0, mb:2, fontSize: 20, color: 'black', paddingLeft:2, paddingRight:4}}/>
         <Box sx={{ display:'flex', justifyContent:'flex-end', mr:3, mb: 1, mt:-1}}>
            <Button type="submit" disabled={value.trim()==='' || (value.length > maxChars)} style={{backgroundColor:'#0a66c2', color:'white', fontWeight:510, width:100, fontSize:15,textTransform:'none', opacity: (value.trim()==='' || (value.length > maxChars))? 0.83: 1, transition: 'opacity 0.2s' }}>Post</Button>
         </Box>
         </form>
    </Box>
);} export default NewPost