import { useState } from 'react';
import {Box, IconButton} from '@mui/material';
import {ListItem} from './Items';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EditProfileModal from './EditProfileModal';
import './styles.css';

export default function Profile(props){
  const [modalOpen, setModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: props.name || '',
    position: props.position || '',
    location: props.location || '',
    about: props.about || '',
    workExperience: props.workExperience || '',
    education: props.education || '',
    skills: props.skills || '',
    profilePicture: props.profilePicture || ''
  });

  const handleProfileUpdate = (updatedProfile) => {
    const newProfileData = {
      name: updatedProfile.name || '',
      position: updatedProfile.position || '',
      location: updatedProfile.location || '',
      about: updatedProfile.about || '',
      workExperience: updatedProfile.workExperience || '',
      education: updatedProfile.education || '',
      skills: updatedProfile.skills || '',
      profilePicture: updatedProfile.profilePicture || ''
    };
    setProfileData(newProfileData);
    if (props.onProfileUpdate) {
      props.onProfileUpdate(updatedProfile);
    }
  };

return(
<Box sx={{width:'50%', ml:4}}>
<div className='profile'>
  <div className='headerContainer' style={{position: 'relative'}}>
        <div className='backImage'> </div>
    <IconButton
        onClick={() => setModalOpen(true)}
        sx={{ color: '#000000ff', opacity: 0.45, position: 'absolute',
          top: 0,
          right: 0}}
      >
      <EditOutlinedIcon sx={{ fontSize:38}}/>
      </IconButton>


    <div className='headerContent'>
      <div className='image' >
        <img src={(profileData.profilePicture && profileData.profilePicture.trim() !== '') ? profileData.profilePicture : props.pic}/>
      </div>

    <div className="name">
    {profileData.name}
    </div >

    <div className='regular'>
      {profileData.position}
      {profileData.location && ` • ${profileData.location}`}
    </div>

    </div>
  </div>

<div className='container'>
  <div className='title'> About </div>
   <div className='regular'> {profileData.about || 'No information provided'} </div>
</div>

<div className='container'>
  <div className='title'> Work Experience </div>
   <div className='regular' style={{ whiteSpace: 'pre-wrap' }}> {profileData.workExperience || 'No work experience listed'} </div>
</div>

<div className='container'>
  <div className='title'> Education </div>
   <div className='regular'> {profileData.education || 'No education information'} </div>
</div>

<div className='container'>
  <div className='title'> Skills </div>
   <div className='regular'> {profileData.skills || 'No skills listed'} </div>
</div>

<EditProfileModal
  open={modalOpen}
  onClose={() => setModalOpen(false)}
  currentProfile={profileData}
  onProfileUpdated={handleProfileUpdate}
/>
</div>
 </Box>
);
}

