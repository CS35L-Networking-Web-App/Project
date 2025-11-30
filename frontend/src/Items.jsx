import './styles.css';
import { Box } from '@mui/material';
import { useState } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import PropTypes from 'prop-types';


export function ListItem(props){
return(
    <div className='item'>
        <div className='subtitle'>{props.title}</div>
         <div className='regular'> {props.desc} </div>
    </div>
    );
}

export function ProfileItem(props) {
return(
    <div className='profileItem'>
            <div className='list_image' style={{ marginTop: '7px' }}> <img  src={props.pic}/> </div>
            <div className='profile_list'>{props.name}</div>
    </div>
    );
} 

export function TabPanel(props){
  const{children, value, index} = props;
  return (
    <div hidden={value!==index}>
      {value === index &&(
        <Box sx={{p: 3}}>
         {children}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes= {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

export function Search({ onSearch }){

const [searchVal, setSearchVal] = useState('');

const handleKeyDown = (event) => {
  if(event.key === 'Enter'){
    if (onSearch) {
      onSearch(searchVal);
    }
  }
}

const handleChange = (typed) => {
  const value = typed.target.value;
  setSearchVal(value);
  // Trigger search on every change for real-time search
  if (onSearch) {
    onSearch(value);
  }
}

  return(
    <Box sx={{ mt:1, maxWidth: 350, display:'flex', justifyContent:'flex-start', ml:2, flexGrow:1}}>
      <TextField
     fullWidth
      placeholder='Search for users...'
      value={searchVal}
      size="small"
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      InputProps={{
        startAdornment:(
        <InputAdornment position='start'>
            <SearchIcon />
        </InputAdornment>),
      }}
      sx={{ borderRadius: 10, backgroundColor: '#eef3f8', '& .MuiOutlinedInput-root': {'& fieldset': {
        borderWidth: 0}}}}
      />
    </Box>
  );
}