import React, { useContext, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Avatar, Menu, MenuItem, useMediaQuery, useTheme } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';

export default function Navbar({ toggleSidebar }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const isAdminRoute = location.pathname.startsWith('/admin');

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: 'background.paper', color: 'primary.main', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      <Toolbar>
        {isAdminRoute && isMobile && (
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleSidebar} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
        )}
        
        <DirectionsBusIcon sx={{ mr: 1, color: 'secondary.main', fontSize: 32 }} />
        <Typography variant="h5" component={Link} to="/" sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main', textDecoration: 'none', letterSpacing: '-0.5px' }}>
          Easy<span style={{ color: theme.palette.secondary.main }}>Travel</span>
        </Typography>

        {!isMobile && user && (
          <Box sx={{ display: 'flex', gap: 2, mr: 4 }}>
            <Button component={Link} to="/" startIcon={<HomeIcon />} sx={{ color: location.pathname === '/' ? 'secondary.main' : 'text.primary', fontWeight: location.pathname === '/' ? 700 : 500 }}>
              Home
            </Button>
            <Button component={Link} to="/search" startIcon={<SearchIcon />} sx={{ color: location.pathname === '/search' ? 'secondary.main' : 'text.primary', fontWeight: location.pathname === '/search' ? 700 : 500 }}>
              Search Buses
            </Button>
            <Button component={Link} to="/dashboard" startIcon={<DashboardIcon />} sx={{ color: location.pathname === '/dashboard' ? 'secondary.main' : 'text.primary', fontWeight: location.pathname === '/dashboard' ? 700 : 500 }}>
              Dashboard
            </Button>
            {user.role === 'ROLE_ADMIN' && (
              <Button component={Link} to="/admin" startIcon={<AdminPanelSettingsIcon />} sx={{ color: isAdminRoute ? 'secondary.main' : 'error.main', fontWeight: 700 }}>
                Admin Panel
              </Button>
            )}
          </Box>
        )}

        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!isMobile && (
              <Box sx={{ textAlign: 'right', mr: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{user.username}</Typography>
                <Typography variant="caption" color="text.secondary">{user.email}</Typography>
              </Box>
            )}
            <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                <AccountCircleIcon />
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              slotProps={{ paper: { elevation: 3, sx: { mt: 1.5, borderRadius: 2, minWidth: 150 } } }}
            >
              <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
                <AccountCircleIcon sx={{ mr: 1, fontSize: 20 }} /> Profile
              </MenuItem>
              {isMobile && (
                 <MenuItem component={Link} to="/search" onClick={handleMenuClose}>
                   <SearchIcon sx={{ mr: 1, fontSize: 20 }} /> Search
                 </MenuItem>
              )}
              {isMobile && (
                 <MenuItem component={Link} to="/dashboard" onClick={handleMenuClose}>
                   <DashboardIcon sx={{ mr: 1, fontSize: 20 }} /> Dashboard
                 </MenuItem>
              )}
              {isMobile && user.role === 'ROLE_ADMIN' && (
                 <MenuItem component={Link} to="/admin" onClick={handleMenuClose} sx={{ color: 'error.main' }}>
                   <AdminPanelSettingsIcon sx={{ mr: 1, fontSize: 20 }} /> Admin
                 </MenuItem>
              )}
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <LogoutIcon sx={{ mr: 1, fontSize: 20 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button component={Link} to="/login" variant="outlined" color="primary" sx={{ borderRadius: 8 }}>
              Login
            </Button>
            <Button component={Link} to="/register" variant="contained" color="primary" sx={{ borderRadius: 8 }}>
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
