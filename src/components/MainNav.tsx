import React from 'react';
import { AppBar, Container, Toolbar, Typography, Box, IconButton, Menu, MenuItem, Button, Tooltip, Avatar, Divider, Grid } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import Link from 'next/link';
import { useCurrentUser, UserContextConsumer, UserContextValue } from '../hooks/UserContext';
import { UserPublic } from '../common/types/db';
import Image from "next/image";
import { useRouter } from "next/router";

const pages = [
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
          <Avatar alt={user.name} src={user.avatarUrl} sx={{ boxShadow: "0 0 1px rgba(0,0,0,0.8)" }} />
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
  <Box sx={{ display: 'flex', justifyContent: 'center', cursor: 'pointer' }}>
    <Box sx={{ padding: '5px 15px 5px 0' }}>
      <Image
        alt="BETTERLOX"
        src="/img/salmon-logo-pinks.png"
        height={30}
        width={47}
      />
    </Box>
    <Typography sx={{
      fontFamily: 'Rubik',
      fontWeight: 700,
      fontSize: '25px',
      lineHeight: 1.6,
      paddingRight: '15px',
      color: 'primary.main',
      cursor: 'pointer'
    }}>Betterlox</Typography>
  </Box>
);

function MobileMenu({ loggedIn }: { loggedIn: boolean }) {
  const [anchorElNav, setAnchorElNav] = React.useState<Element | null>(null);
  const handleOpenNavMenu: React.MouseEventHandler = React.useCallback((event) => {
    setAnchorElNav(event.currentTarget);
  }, [setAnchorElNav]);
  const handleCloseNavMenu = React.useCallback(() => {
    setAnchorElNav(null);
  }, [setAnchorElNav]);
  return (
    <Grid container spacing={0} sx={{ display: { xs: 'inherit', md: 'none', paddingTop: '5px' }}}>
      <Grid width={48} item>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleOpenNavMenu}
          color="primary"
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
              <MenuItem sx={{ minWidth: '200px' }} onClick={handleCloseNavMenu}>
                <Typography textAlign="center">{page.label}</Typography>
              </MenuItem>
            </Link>
          ))}
          <Divider />
          {loggedIn ? accountMenuItems.map((item) => (
            <AccountMenuItem key={item.label} item={item} />
          )) : loggedOutMenuItems.map((item) => (
            <AccountMenuItem key={item.label} item={item} />
          ))}
        </Menu>
      </Grid>
      <Grid item flexGrow={1} sx={{ display: { paddingTop: '7px' }}}>
        <Link href="/" passHref>
          <Box>
            <Logo />
          </Box>
        </Link>
      </Grid>
      <Grid item width={48}></Grid>
    </Grid>
  )
}

export function MainNav() {
  const router = useRouter();
  return (
    <UserContextConsumer>
      {context => (
        <AppBar position="static" elevation={0} style={{ backgroundColor: 'transparent' }}>
          <Container maxWidth="lg">
            <Toolbar disableGutters>
              <Link href="/" passHref>
                <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 2, pt: '2px' }}>
                  <Logo />
                </Box>
              </Link>
              <MobileMenu loggedIn={Boolean(context?.user)} />
              <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                {pages.map((page) => (
                  <Link key={page.label} href={page.route} passHref>
                    <Button
                      variant={router.pathname.startsWith(page.route) ? "outlined" : "text"}
                      color="secondary"
                      sx={{ my: 2, mx: 0.6, display: 'block', textAlign: 'center' }}
                    >
                      {page.label}
                    </Button>
                  </Link>
                ))}
              </Box>
              <Box sx={{ display: { xs: 'none', md: 'flex' }}}>
                {context?.user ? <UserMenu user={context.user} /> : <LoggedOutMenu />}
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
      )}
    </UserContextConsumer>
  )
}