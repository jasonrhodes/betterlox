import React from 'react';
import { AppBar, Container, Toolbar, Typography, Box, IconButton, Menu, MenuItem, Button, Tooltip, Avatar } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import Link from './Link';
import { UserContextConsumer } from '../hooks/UserContext';

const pages = [
  { label: 'Home', route: '/' },
  { label: 'Ratings', route: '/ratings' },
  { label: 'Stats', route: '/stats' },
  { label: 'Lists', route: '/lists' },
];

const loggedOutMenuItems = [
  { label: 'Log In', route: '/login' },
  { label: 'Register', route: '/register' }
];

const settings = [
  { label: 'My Account', route: "/account" }, 
  { label: 'Upload Data', route: "/upload" },
  { label: 'Log out', route: "/logout" }
];

interface UserMenuProps {
  // ??
}

const UserMenu: React.FC<UserMenuProps> = () => {
  const [anchorElUser, setAnchorElUser] = React.useState<Element | null>(null);
  const handleOpenUserMenu: React.MouseEventHandler = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <Box sx={{ flexGrow: 0 }}>
      <Tooltip title="Open settings">
        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
          <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
        </IconButton>
      </Tooltip>
      <Menu
        sx={{ mt: '45px' }}
        id="menu-appbar"
        anchorEl={anchorElUser}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
      >
        {settings.map((setting) => (
          <MenuItem href={setting.route} key={setting.label} onClick={handleCloseUserMenu}>
            <Typography textAlign="center">{setting.label}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}

const LoggedOutMenu: React.FC = () => {
  return (
    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'end' }}>
      {loggedOutMenuItems.map((item) => (
        <Button
          key={item.label}
          href={item.route}
          sx={{ my: 2, color: 'white', display: 'block' }}
        >
          {item.label}
        </Button>
      ))}
    </Box>
  )
}

export function MainNav() {
  const [anchorElNav, setAnchorElNav] = React.useState<Element | null>(null);
  
  const handleOpenNavMenu: React.MouseEventHandler = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <UserContextConsumer>
      {context => (
        <AppBar position="static">
          <Container maxWidth="xl">
            <Toolbar disableGutters>
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
              >
                LOGO
              </Typography>

              <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleOpenNavMenu}
                  color="inherit"
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorElNav}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  open={Boolean(anchorElNav)}
                  onClose={handleCloseNavMenu}
                  sx={{
                    display: { xs: 'block', md: 'none' },
                  }}
                >
                  {pages.map((page) => (
                    <MenuItem href={page.route} key={page.label} onClick={handleCloseNavMenu}>
                      <Typography textAlign="center">{page.label}</Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}
              >
                LOGO
              </Typography>
              <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                {pages.map((page) => (
                  <Button
                    key={page.label}
                    href={page.route}
                    onClick={handleCloseNavMenu}
                    sx={{ my: 2, color: 'white', display: 'block' }}
                  >
                    {page.label}
                  </Button>
                ))}
              </Box>
              
              {context?.user ? <UserMenu /> : <LoggedOutMenu />}
              
            </Toolbar>
          </Container>
        </AppBar>
      )}
    </UserContextConsumer>
  )
}