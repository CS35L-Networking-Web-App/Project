import { Box, Typography, Tabs, Tab, Button, IconButton, Menu, MenuItem } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import GroupsIcon from '@mui/icons-material/Groups';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Notifications from '../Notifications';

export function AppHeader({
  tab,
  onTabChange,
  onLogoClick,
  accountMenuAnchor,
  onAccountMenuOpen,
  onAccountMenuClose,
  onLogout,
  onMessagesClick,
  onRequestAccepted,
  onRequestRejected,
  updateNotifs
}) {
  return (
    <Box sx={{
      backgroundColor: 'white',
      borderBottom: '1px solid #e0e0e0',
      display: 'flex',
      alignItems: 'center',
      top: 0,
      zIndex: 1000,
      position: 'sticky',
      justifyContent: 'space-between',
      px: 3,
      py: 1,
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1, cursor: 'pointer' }}
        onClick={onLogoClick}
      >
        <span className="logo-dot" />
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0b3c99' }}>LinkU</Typography>
      </Box>

      <Tabs
        value={tab}
        onChange={onTabChange}
        sx={{
          '& .MuiTab-root': {
            minHeight: 64,
            textTransform: 'none',
            fontSize: '15px',
            fontWeight: 500,
            color: '#5f6368',
            '&.Mui-selected': {
              color: '#0066cc'
            }
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#0066cc',
            height: 3
          }
        }}
      >
        <Tab icon={<HomeIcon />} label="Home" iconPosition="start" />
        <Tab icon={<GroupsIcon />} label="My Network" iconPosition="start" />
        <Tab icon={<SearchIcon />} label="Search" iconPosition="start" />
        <Tab icon={<PersonIcon />} label="My Profile" iconPosition="start" />
      </Tabs>

      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={onMessagesClick}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Messages
        </Button>

        <Notifications onRequestAccepted={onRequestAccepted} updateNotifs={updateNotifs} onRequestRejected={onRequestRejected} />
        <IconButton
          onClick={onAccountMenuOpen}
          sx={{
            '&:hover': { backgroundColor: '#f5f5f5' }
          }}
        >
          <AccountCircleIcon sx={{ fontSize: 32, color: '#5f6368' }} />
        </IconButton>
        <Menu
          anchorEl={accountMenuAnchor}
          open={Boolean(accountMenuAnchor)}
          onClose={onAccountMenuClose}
          PaperProps={{
            sx: {
              mt: 1,
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              borderRadius: 2
            }
          }}
        >
          <MenuItem
            onClick={onLogout}
            sx={{
              py: 1.5,
              px: 2,
              '&:hover': {
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}
