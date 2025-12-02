import * as z from "zod";
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';

export const formSchema = z.object({
  email: z.string().min(1,{message: "Please enter an email."}).email(), 
  password: z.string().min(1,{message: "Please enter a password."}).min(8,{message: "Password must be at least 8 characters long."})
});

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

export const getButtonConfig = (isSelf, connectionStatus) => {

    if (isSelf) {
      return { text: 'You', icon: null, disabled: true, variant: 'outlined', color: 'default' };
    }
    if (connectionStatus.isConnection) {
      return { text: 'Connected', icon: <CheckCircleIcon />, disabled: true, variant: 'contained', color: 'success' };
    }
    if (connectionStatus.hasPendingRequest) {
      return { text: 'Pending', icon: <PendingIcon />, disabled: true, variant: 'outlined', color: 'default' };
    }
    if (connectionStatus.hasReceivedRequest) {
      return { text: 'Accept Request', icon: <PersonAddIcon />, disabled: false, variant: 'contained', color: 'primary' };
    }
     return { text: 'Connect', icon: <PersonAddIcon />, disabled: false, variant: 'contained', color: 'primary' };
    
  }
