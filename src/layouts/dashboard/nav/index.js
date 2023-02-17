import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
// @mui
import { styled, alpha } from '@mui/material/styles';
import { Box, Link, Button, Drawer, Typography, Avatar, Stack } from '@mui/material';
// mock
import account from '../../../_mock/account';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// components
import Logo from '../../../components/logo';
import Scrollbar from '../../../components/scrollbar';
import NavSection from '../../../components/nav-section';
//
import { navAdminConfig, navTrackerConfig, navAgentConfig } from './config';
import supabase from '../../../config/SupabaseClient';
import { UserContext } from '../../../context/UserContext';

// ----------------------------------------------------------------------

const NAV_WIDTH = 280;

const StyledAccount = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2.5),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: alpha(theme.palette.grey[500], 0.12),
}));

// ----------------------------------------------------------------------

Nav.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
};

export default function Nav({ openNav, onCloseNav }) {
  const { pathname } = useLocation();
  const [navConfig, setNavConfig] = useState();
  const isDesktop = useResponsive('up', 'lg');
  const [userRole, setUserRole] = useState('');
  const { user } = useContext(UserContext);
  useEffect(() => {
    const getRole = async () => {
      try {
        if (user) {
          const { data: dataFetch, error: errorFetch } = await supabase
            .from('users')
            .select('role')
            .eq('email', user.email);
          console.log('fetched', dataFetch);
          // let role = '';
          if (dataFetch && dataFetch[0]) {
            const { role } = dataFetch[0];
            console.log('the role', dataFetch[0].role, dataFetch[0].role === 'admin');
            if (role === 'admin') {
              console.log('here it is');
              setUserRole('Admin');
              setNavConfig(navAdminConfig);
            } else if (role === 'agent') {
              console.log('here it is not');
              setUserRole('Confirmation Agent');
              setNavConfig(navAgentConfig);
            } else if (role === 'tracker') {
              setUserRole('Tracking Agent');
              setNavConfig(navTrackerConfig);
            } else {
              setNavConfig(navTrackerConfig);
            }
          }
        } else {
          console.log('no user');
          setNavConfig(navTrackerConfig);
        }
      } catch (error) {
        console.log('something went wrong ', error);
      }
    };
    getRole();
  }, [user]);

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
      }}
    >
      <Box sx={{ px: 2.5, py: 3, display: 'inline-flex' }}>
        <Logo />
      </Box>

      <Box sx={{ mb: 5, mx: 2.5 }}>
        <Link underline="none">
          {user && (
            <StyledAccount>
              <Avatar src={user.user_metadata.avatar_url} alt="photoURL" />

              <Box sx={{ ml: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                  {user.user_metadata.full_name}
                </Typography>

                {userRole && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {userRole}
                  </Typography>
                )}
              </Box>
            </StyledAccount>
          )}
        </Link>
      </Box>

      <NavSection data={navConfig} />

      <Box sx={{ flexGrow: 1 }} />
    </Scrollbar>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV_WIDTH },
      }}
    >
      {isDesktop ? (
        <Drawer
          open
          variant="permanent"
          PaperProps={{
            sx: {
              width: NAV_WIDTH,
              bgcolor: 'background.default',
              borderRightStyle: 'dashed',
            },
          }}
        >
          {renderContent}
        </Drawer>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            sx: { width: NAV_WIDTH },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}
