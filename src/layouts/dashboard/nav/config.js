// component
import SvgColor from '../../../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;

export const navAgentConfig = [
  // {
  //   title: 'dashboard',
  //   path: '/dashboard/home',
  //   icon: icon('ic_analytics'),
  // },
  {
    title: 'lead',
    path: '/dashboard/leads',
    icon: icon('ic_user'),
  },
  {
    title: 'order',
    path: '/dashboard/orders',
    icon: icon('ic_cart'),
  },
];

export const navAdminConfig = [
  {
    title: 'dashboard',
    path: '/dashboard/app',
    icon: icon('ic_analytics'),
  },
  {
    title: 'lead',
    path: '/dashboard/leads',
    icon: icon('ic_user'),
  },
  {
    title: 'order',
    path: '/dashboard/orders',
    icon: icon('ic_cart'),
  },
  {
    title: 'Tracking',
    path: '/dashboard/tracking',
    icon: icon('ic_cart'),
  },
  {
    title: 'Users',
    path: '/dashboard/users',
    icon: icon('ic_cart'),
  },
];

export const navTrackerConfig = [
  // {
  //   title: 'dashboard',
  //   path: '/dashboard/home',
  //   icon: icon('ic_analytics'),
  // },
  {
    title: 'order',
    path: '/dashboard/orders',
    icon: icon('ic_cart'),
  },
  {
    title: 'Tracking',
    path: '/dashboard/tracking',
    icon: icon('ic_cart'),
  },
];
