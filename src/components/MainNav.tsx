import React from 'react';
import { AppBar, Container, Toolbar, Typography, Box, IconButton, Menu, MenuItem, Button, Tooltip, Avatar } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import Link from 'next/link';
import { useCurrentUser, UserContextConsumer, UserContextValue } from '../hooks/UserContext';
import { UserPublic } from '../common/types/db';
import Image from "next/image";
import { pink } from "@mui/material/colors";

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

interface AccountMenuItem {
  label: string;
  route?: string;
  action?: (userContext: UserContextValue) => void;
}

const accountMenuItems: AccountMenuItem[] = [
  { label: 'My Account', route: "/account" }, 
  { label: 'Sync Letterboxd Data', route: "/account/sync" },
  { label: 'Log out', action: (userContext) => userContext.logout() }
];

interface UserMenuProps {
  user: UserPublic
}

const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
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
          <Avatar alt={user.letterboxdName} src={user.avatarUrl} />
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
        {accountMenuItems.map((item) => (
          <AccountMenuItem key={item.label} item={item} handleClick={handleCloseUserMenu} />
        ))}
      </Menu>
    </Box>
  )
}

const AccountMenuItem: React.FC<{ item: AccountMenuItem, handleClick?: () => void }> = ({ item, handleClick = () => null }) => {
  const userContext = useCurrentUser();
  if (item.route) {
    return (
      <Link href={item.route} passHref>
        <MenuItem onClick={handleClick}>
          <Typography textAlign="center">{item.label}</Typography>
        </MenuItem>
      </Link>
    );
  }
  if (item.action) {
    const wrappedHandleClick = () => {
      handleClick();
      item.action && item.action(userContext);
    };
    return (
      <MenuItem onClick={wrappedHandleClick}>
        <Typography textAlign="center">{item.label}</Typography>
      </MenuItem>
    );
  }
  return null;
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

const Logo: React.FC = () => (
  <Image
    alt="BETTERLOX"
    src="/img/lockup-cyan400.png"
    height={40}
    width={214}
  />
);

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
        <AppBar position="static" elevation={0}>
          <Container maxWidth="xl">
            <Toolbar disableGutters>
              <Link href="/" passHref>
                <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 2 }}>
                  <Logo />
                </Box>
              </Link>

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
                    <Link href={page.route} key={page.label} passHref>
                      <MenuItem onClick={handleCloseNavMenu}>
                        <Typography textAlign="center">{page.label}</Typography>
                      </MenuItem>
                    </Link>
                  ))}
                </Menu>
              </Box>
              <Link href="/" passHref>
                <Box sx={{ cursor: "pointer", flexGrow: 1, display: { xs: 'flex', md: 'none' }}}>
                  <Logo />
                </Box>
              </Link>
              <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                {pages.map((page) => (
                  <Link key={page.label} href={page.route} passHref>
                    <Button
                      onClick={handleCloseNavMenu}
                      sx={{ my: 2, color: 'white', display: 'block' }}
                    >
                      {page.label}
                    </Button>
                  </Link>
                ))}
              </Box>
              
              {context?.user ? <UserMenu user={context.user} /> : <LoggedOutMenu />}
              
            </Toolbar>
          </Container>
        </AppBar>
      )}
    </UserContextConsumer>
  )
}