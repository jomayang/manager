import { Navigate, useRoutes } from 'react-router-dom';
import { useEffect, useState } from 'react';
// layouts
import DashboardLayout from './layouts/dashboard';
import SimpleLayout from './layouts/simple';
//
import BlogPage from './pages/BlogPage';
import UserPage from './pages/UserPage';
import LoginPage from './pages/LoginPage';
import Page404 from './pages/Page404';
import ProductsPage from './pages/ProductsPage';
import DashboardAppPage from './pages/DashboardAppPage';
import LeadPage from './pages/LeadPage';
import OrderPage from './pages/OrderPage';
// import TrackingPage from './pages/TrackingPageOldOne';
import supabase from './config/SupabaseClient';
import BackupPage from './pages/BackupPage';
import StatPage from './pages/StatPage';
// import TrackingPageFake from './pages/TrackingPageFake';
import TrackingPage from './pages/TrackingPage';
import TrackingPageOldOne from './pages/TrackingPageOldOne';

// ----------------------------------------------------------------------

const ADMIN_ROUTES = [
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      { element: <Navigate to="/dashboard/app" />, index: true },
      { path: 'app', element: <DashboardAppPage /> },
      { path: 'leads', element: <LeadPage /> },
      { path: 'orders', element: <OrderPage /> },
      { path: 'tracking', element: <TrackingPage /> },
      { path: 'tracking2', element: <TrackingPageOldOne /> },
      // { path: 'tracking2', element: <TrackingPageFake /> },
      // { path: 'tracking3', element: <TrackingPageX /> },

      { path: 'backup', element: <BackupPage /> },
      // { path: 'user', element: <UserPage /> },
      { path: 'users', element: <UserPage /> },
      { path: 'stats', element: <StatPage /> },
    ],
  },
  {
    path: 'login',
    element: <LoginPage />,
  },
  {
    element: <SimpleLayout />,
    children: [
      { element: <Navigate to="/dashboard/app" />, index: true },
      { path: '404', element: <Page404 /> },
      { path: '*', element: <Navigate to="/404" /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  },
];

const AGENT_ROUTES = [
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      { element: <Navigate to="/dashboard/app" />, index: true },
      { path: 'app', element: <DashboardAppPage /> },
      { path: 'leads', element: <LeadPage /> },
      { path: 'orders', element: <OrderPage /> },
    ],
  },
  {
    path: 'login',
    element: <LoginPage />,
  },
  {
    element: <SimpleLayout />,
    children: [
      { element: <Navigate to="/dashboard/leads" />, index: true },
      { path: '404', element: <Page404 /> },
      { path: '*', element: <Navigate to="/404" /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  },
];

const TRACKER_ROUTES = [
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      { element: <Navigate to="/dashboard/app" />, index: true },
      { path: 'app', element: <DashboardAppPage /> },
      { path: 'orders', element: <OrderPage /> },
      { path: 'tracking', element: <TrackingPage /> },
      // { path: 'tracking3', element: <TrackingPageX /> },
      { path: 'tracking2', element: <TrackingPageOldOne /> },
    ],
  },
  {
    path: 'login',
    element: <LoginPage />,
  },
  {
    element: <SimpleLayout />,
    children: [
      { element: <Navigate to="/dashboard/tracking" />, index: true },
      { path: '404', element: <Page404 /> },
      { path: '*', element: <Navigate to="/404" /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  },
];

const DEFAULT_ROUTES = [
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      { element: <Navigate to="/dashboard/app" />, index: true },
      { path: 'app', element: <DashboardAppPage /> },
      { path: 'orders', element: <OrderPage /> },
    ],
  },
  {
    path: 'login',
    element: <LoginPage />,
  },
  {
    element: <SimpleLayout />,
    children: [
      { element: <Navigate to="/dashboard/orders" />, index: true },
      { path: '404', element: <Page404 /> },
      { path: '*', element: <Navigate to="/404" /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  },
];

export default function Router() {
  let routeObject;
  const [userSession, setUserSession] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [routeState, setRouteState] = useState(ADMIN_ROUTES);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        console.log('geooooooo', data.session);
        if (data && data.session) {
          setUserSession(data.session);

          const { data: dataFetch, error: errorFetch } = await supabase
            .from('users')
            .select('role')
            .eq('email', data.session.user.email);

          let role = '';

          if (dataFetch && dataFetch[0]) role = dataFetch[0].role;
          if (role === 'admin') {
            setRouteState(ADMIN_ROUTES);
            console.log('the role is admin');
          } else if (role === 'agent') setRouteState(AGENT_ROUTES);
          else if (role === 'tracker') setRouteState(TRACKER_ROUTES);
          else setRouteState(DEFAULT_ROUTES);
        } else setRouteState(DEFAULT_ROUTES);
      } catch (error) {
        console.log('something went wrong ', error);
      }
    };
    getSession();
  }, []);

  // const routes = ;

  return useRoutes(routeState);
}
