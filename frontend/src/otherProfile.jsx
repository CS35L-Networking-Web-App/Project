import { useState } from 'react'
import {Box, IconButton} from '@mui/material';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import GroupIcon from '@mui/icons-material/Group';
import {ListItem} from './Items';
import './styles.css';

function ConnectButton(props){

    const[connected, setConnected]= useState(props.connected);
    const handleClick = () => {
        setConnected(!connected );
    };

    return(
        <IconButton onClick={handleClick} sx={{backgroundColor: '#0a66c2', '&.Mui-disabled': {
      backgroundColor: '#0a66c2', color:'white'}, flex: '0 1 240px', padding:1, borderRadius:100, ml: 1, alignItems:'center', marginTop:3, marginBottom:3, color:'white', fontWeight:600, fontSize:16, textTransform:'none'}} disabled={connected}>
            {connected? (<> <GroupIcon sx={{ mr: 1}}/> Connected </>) : (<> <PersonAddAlt1Icon sx={{mr:1}}/> Connect </>)}
         </IconButton>
    );
}


function OtherProfile(props){

return(
<Box sx={{width:'50%', ml:4}}>
<div className='profile'>
  <div className='headerContainer' style={{position: 'relative'}}>
    <div className='backImage'></div>

    <div className='headerContent'> 
      <div className='image'>
        <img  src={props.pic}/>
      </div>

    <div className="name">
    {props.name}
    </div >

    <div className='regular'>
     {props.position}
    </div>
    <Box sx={{alignItems: 'center', width:250, maxWidth:'100%', minWidth:1, display:'flex'}}>
        <ConnectButton connected={props.connected}/>
    </Box>
   
    </div>

  </div>

<div className='container'>
  <div className='title'> About </div>
   <div className='regular'> {props.about} </div>
</div>

<div className='container'>
  <div className='title'> Education </div>
   <div className='regular'> education </div>
</div>

<div className='container'>
  <div className='title'> Experience </div>
  <ListItem title="Job" desc="desc"/>
  <ListItem title="Job" desc="desc"/> 
</div>

<div className='container'>
  <div className='title'> Skills </div>
   <div className='regular'> skills </div>
</div>
</div>
 </Box>);
} export default OtherProfile