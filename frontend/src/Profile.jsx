import {Box, IconButton} from '@mui/material';
import {ListItem} from './Items';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import './styles.css';

export default function Profile(props){

return(
<Box sx={{width:'50%', ml:4}}>
<div className='profile'>
  <div className='headerContainer' style={{position: 'relative'}}>
        <div className='backImage'> </div>
    <IconButton 
        sx={{ color: '#000000ff', opacity: 0.45, position: 'absolute',
          top: 0,
          right: 0}}
      >
      <EditOutlinedIcon sx={{ fontSize:38}}/>
      </IconButton>


    <div className='headerContent'> 
      <div className='image' >
        <img  src={props.pic}/>
      </div>

    <div className="name">
    {props.name}
    </div >

    <div className='regular'>
      {props.position}
    </div>
  
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
 </Box>
);
}

