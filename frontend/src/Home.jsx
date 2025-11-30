import { useState, useEffect } from 'react'
import {Box, Stack, CircularProgress} from '@mui/material';
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
import { getCurrentUser } from './api.js';


function Home() {
  document.body.style.backgroundColor = '#dce6f1';
  const [value, setValue] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const handleChange = (event, newValue) => {setValue(newValue);};

  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('Failed to load user:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Failed to load user data. Please try logging in again.</p>
      </Box>
    );
  }

  const userPfp = user.profilePicture || default_pfp;
  
 
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
          <Profile
            {...user}
            pic={userPfp}
            onProfileUpdate={(updatedProfile) => {
              setUser({ ...user, ...updatedProfile });
            }}
          />
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
