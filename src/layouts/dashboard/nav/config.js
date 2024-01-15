// component
import SvgColor from '../../../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;

export const navAgentConfig = [
  {
    title: 'dashboard',
    path: '/dashboard/app',
    icon: icon('ic_analytics'),
  },
  {
    title: 'lead',
    path: '/dashboard/leads',
    icon: icon('ic_file'),
  },
  {
    title: 'order',
    path: '/dashboard/orders',
    icon: icon('ic_invoice'),
  },
];

export const navAdminConfig = [
  {
    title: 'dashboard',
    path: '/dashboard/app',
    icon: icon('ic_dashboard'),
  },
  {
    title: 'rewards',
    path: '/dashboard/rewards',
    icon: icon('ic_label'),
  },
  {
    title: 'tracker',
    path: '/dashboard/tracker',
    icon: icon('ic_label'),
  },
  {
    title: 'lead',
    path: '/dashboard/leads',
    icon: icon('ic_file'),
  },
  {
    title: 'order',
    path: '/dashboard/orders',
    icon: icon('ic_invoice'),
  },
  {
    title: 'Tracking',
    path: '/dashboard/tracking',
    icon: icon('ic_calendar'),
  },
  {
    title: 'Stats',
    path: '/dashboard/stats',
    icon: icon('ic_analytics'),
  },
  {
    title: 'Users',
    path: '/dashboard/users',
    icon: icon('ic_user'),
  },
  {
    title: 'Inventory',
    path: '/dashboard/inventory',
    icon: icon('ic_ecommerce'),
  },
  {
    title: 'Backup',
    path: '/dashboard/backup',
    icon: icon('ic_folder'),
  },

  {
    title: 'Parcels',
    path: '/dashboard/parcels',
    icon: icon('ic_invoice'),
  },
  {
    title: 'Finance',
    path: '/dashboard/finance',
    icon: icon('ic_banking'),
  },
  {
    title: 'Audit',
    path: '/dashboard/audit',
    icon: icon('ic_lock'),
  },
];

export const navTrackerConfig = [
  {
    title: 'dashboard',
    path: '/dashboard/app',
    icon: icon('ic_analytics'),
  },
  {
    title: 'order',
    path: '/dashboard/orders',
    icon: icon('ic_invoice'),
  },
  {
    title: 'Tracking',
    path: '/dashboard/tracking',
    icon: icon('ic_calendar'),
  },
];

export const navDmConfig = [
  {
    title: 'order',
    path: '/dashboard/orders',
    icon: icon('ic_invoice'),
  },
  {
    title: 'Parcels',
    path: '/dashboard/parcels',
    icon: icon('ic_invoice'),
  },
];
