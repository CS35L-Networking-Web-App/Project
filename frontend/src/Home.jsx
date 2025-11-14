import { useState } from 'react'
import {Box, Stack} from '@mui/material';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import HomeIcon from '@mui/icons-material/Home';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import './styles.css';
import {ProfileItem, Search, TabPanel} from './Items';
import Profile from './Profile'                        
import default_pfp from './assets/default_pfp.png';
import Post from './Post';                       
import NewPost from './newPost';               


function Home() {
  document.body.style.backgroundColor = '#dce6f1';
  const [value, setValue] = useState(0);
  const handleChange = (event, newValue) => {setValue(newValue);};
  const user ={name: "First Last",
    about: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled",
    position: "Position"}
  const userPfp = default_pfp;
  
 
  return (
    <Box sx = {{width:'100%'}}>
      <Box>
      <Box sx={{borderBottom: 2, backgroundColor:'white', borderColor: 'divider', display:'flex', alignItems:'center', top: 0, zIndex: 1000, position:"sticky"}}>
          <Search/>
        <Tabs value={value} onChange={handleChange} sx={{ ml: 'auto', mr:2, mt:1}}>
          <Tab icon ={<HomeIcon />} label="Home" />
          <Tab icon ={<GroupsIcon/>} label="My Network" />
          <Tab icon={<PersonIcon/>} label="My Profile" />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <Post name={user.name} text={user.about} position={user.position} pic={userPfp} liked={false}/>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <ProfileItem pic={userPfp} name="First Last"/>
        <ProfileItem pic={userPfp} name="First Last"/>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Stack direction="row" spacing={10} alignItems={'flex-start'}>
          <Profile {...user} pic={userPfp}/>
          <Stack direction="column" spacing={5} alignItems="stretch">
               <NewPost name={user.name} position={user.position} pic={userPfp}/>
               <Post name={user.name} text={user.about} position={user.position} pic={userPfp} liked={false}/>
          </Stack>
        </Stack>
      </TabPanel>
      </Box>
    </Box>
  );
}

export default Home
