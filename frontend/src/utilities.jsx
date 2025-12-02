import * as z from "zod";
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

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