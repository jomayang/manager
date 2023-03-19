import { Helmet } from 'react-helmet-async';
import { faker } from '@faker-js/faker';
// @mui
import { useTheme } from '@mui/material/styles';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Container, Typography } from '@mui/material';
// components
import Iconify from '../components/iconify';
// sections
import {
  AppTasks,
  AppNewsUpdate,
  AppOrderTimeline,
  AppCurrentVisits,
  AppWebsiteVisits,
  AppTrafficBySite,
  AppWidgetSummary,
  AppCurrentSubject,
  AppConversionRates,
} from '../sections/@dashboard/app';
import supabase from '../config/SupabaseClient';
import { UserContext } from '../context/UserContext';

// ----------------------------------------------------------------------

export default function DashboardAppPage() {
  const { user: userAuth } = useContext(UserContext);
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [returnedCount, setReturnedCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [netRevenue, setNetRevenue] = useState(0);
  const [totalDeliveryFees, setTotalDeliveryFees] = useState(0);
  const [deliveryRate, setDeliveryRate] = useState(0);

  const [weekDates, setWeekDates] = useState();
  const [ordersByDay, setOrdersByDate] = useState();
  const [leadsByDay, setLeadsByDay] = useState();
  const [confirmRateByDay, setConfirmRateByDay] = useState();
  const [leadsByStatus, setLeadsByStatus] = useState([]);
  const theme = useTheme();
  useEffect(() => {
    const getSession = async () => {
      try {
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN') {
            const user = session.user.user_metadata;
            const { data, error } = await supabase.from('users').select('id, email').eq('email', user.email);

            if (data) {
              if (data.length === 0) {
                const { data: dataInsert, error: errorInsert } = await supabase.from('users').insert({
                  email: user.email,
                  avatar_url: user.avatar_url,
                  name: user.name,
                });
                if (dataInsert) {
                  console.log('user created successfully: ', dataInsert);
                }

                if (errorInsert) {
                  console.log('error happened when trying to add new user');
                }
              }
              console.log('user connected!', data);
            }

            if (error) {
              console.log('user error', error);
            }
          }
        });
        const { data, error } = await supabase.auth.getSession();

        if (data) {
          console.log(data);
        }

        if (error) {
          console.log(error);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getSession();
  }, []);

  useEffect(() => {
    const histories = {
      has_more: false,
      total_data: 53,
      data: [
        {
          date_status: '2023-03-19 16:59:51',
          tracking: 'yal-14SSMW',
          status: 'Centre',
          reason: '',
          center_id: 80101,
          center_name: 'Agence de Béchar',
          wilaya_id: 8,
          wilaya_name: 'Béchar',
          commune_id: 801,
          commune_name: 'Béchar',
        },
        {
          date_status: '2023-03-19 16:56:47',
          tracking: 'yal-14SSMW',
          status: 'En localisation',
          reason: '',
          center_id: 80101,
          center_name: 'Agence de Béchar',
          wilaya_id: 8,
          wilaya_name: 'Béchar',
          commune_id: 801,
          commune_name: 'Béchar',
        },
        {
          date_status: '2023-03-19 16:55:03',
          tracking: 'yal-61UXYM',
          status: 'En préparation',
          reason: '',
          center_id: null,
          center_name: null,
          wilaya_id: null,
          wilaya_name: null,
          commune_id: null,
          commune_name: null,
        },
        {
          date_status: '2023-03-19 16:37:41',
          tracking: 'yal-18NHAZ',
          status: 'Retourné au centre',
          reason: '',
          center_id: 150101,
          center_name: 'Agence de Tizi Ouzou',
          wilaya_id: 15,
          wilaya_name: 'Tizi Ouzou',
          commune_id: 1501,
          commune_name: 'Tizi Ouzou',
        },
        {
          date_status: '2023-03-19 16:30:15',
          tracking: 'yal-14SSMW',
          status: 'En localisation',
          reason: '',
          center_id: 80101,
          center_name: 'Agence de Béchar',
          wilaya_id: 8,
          wilaya_name: 'Béchar',
          commune_id: 801,
          commune_name: 'Béchar',
        },
        {
          date_status: '2023-03-19 16:29:28',
          tracking: 'yal-14SSMW',
          status: 'En localisation',
          reason: '',
          center_id: 80101,
          center_name: 'Agence de Béchar',
          wilaya_id: 8,
          wilaya_name: 'Béchar',
          commune_id: 801,
          commune_name: 'Béchar',
        },
        {
          date_status: '2023-03-19 16:28:07',
          tracking: 'yal-14SSMW',
          status: 'En localisation',
          reason: '',
          center_id: 80101,
          center_name: 'Agence de Béchar',
          wilaya_id: 8,
          wilaya_name: 'Béchar',
          commune_id: 801,
          commune_name: 'Béchar',
        },
        {
          date_status: '2023-03-19 15:26:19',
          tracking: 'yal-48KHZR',
          status: 'Livré',
          reason: '',
          center_id: 410101,
          center_name: 'Agence de Souk Ahras',
          wilaya_id: 41,
          wilaya_name: 'Souk Ahras',
          commune_id: 4101,
          commune_name: 'Souk Ahras',
        },
        {
          date_status: '2023-03-19 15:25:54',
          tracking: 'yal-75HRXU',
          status: 'Echèc livraison',
          reason: 'Client absent (reporté)',
          center_id: 165002,
          center_name: 'Amara',
          wilaya_id: 16,
          wilaya_name: 'Alger',
          commune_id: 1650,
          commune_name: 'Cheraga',
        },
        {
          date_status: '2023-03-19 14:47:20',
          tracking: 'yal-48KHZR',
          status: 'Tentative échouée',
          reason: 'Client absent (reporté)',
          center_id: 410101,
          center_name: 'Agence de Souk Ahras',
          wilaya_id: 41,
          wilaya_name: 'Souk Ahras',
          commune_id: 4101,
          commune_name: 'Souk Ahras',
        },
        {
          date_status: '2023-03-19 10:56:22',
          tracking: 'yal-48KHZR',
          status: 'Sorti en livraison',
          reason: '',
          center_id: 410101,
          center_name: 'Agence de Souk Ahras',
          wilaya_id: 41,
          wilaya_name: 'Souk Ahras',
          commune_id: 4101,
          commune_name: 'Souk Ahras',
        },
        {
          date_status: '2023-03-19 10:41:08',
          tracking: 'yal-75HRXU',
          status: 'Sorti en livraison',
          reason: '',
          center_id: 165002,
          center_name: 'Amara',
          wilaya_id: 16,
          wilaya_name: 'Alger',
          commune_id: 1650,
          commune_name: 'Cheraga',
        },
        {
          date_status: '2023-03-19 10:34:58',
          tracking: 'yal-48KHZR',
          status: 'Reçu à Wilaya',
          reason: '',
          center_id: 410101,
          center_name: 'Agence de Souk Ahras',
          wilaya_id: 41,
          wilaya_name: 'Souk Ahras',
          commune_id: 4101,
          commune_name: 'Souk Ahras',
        },
        {
          date_status: '2023-03-19 10:33:06',
          tracking: 'yal-75HRXU',
          status: 'Centre',
          reason: '',
          center_id: 165002,
          center_name: 'Amara',
          wilaya_id: 16,
          wilaya_name: 'Alger',
          commune_id: 1650,
          commune_name: 'Cheraga',
        },
        {
          date_status: '2023-03-19 00:17:57',
          tracking: 'yal-48KHZR',
          status: 'Vers Wilaya',
          reason: '',
          center_id: 250401,
          center_name: 'Agence de Constantine',
          wilaya_id: 25,
          wilaya_name: 'Constantine',
          commune_id: 2504,
          commune_name: 'Constantine',
        },
        {
          date_status: '2023-03-19 00:04:15',
          tracking: 'yal-18NHAZ',
          status: 'Echèc livraison',
          reason: 'Client no-show',
          center_id: 150101,
          center_name: 'Agence de Tizi Ouzou',
          wilaya_id: 15,
          wilaya_name: 'Tizi Ouzou',
          commune_id: 1501,
          commune_name: 'Tizi Ouzou',
        },
        {
          date_status: '2023-03-18 22:40:58',
          tracking: 'yal-48KHZR',
          status: 'Expédié',
          reason: '',
          center_id: 250401,
          center_name: 'Agence de Constantine',
          wilaya_id: 25,
          wilaya_name: 'Constantine',
          commune_id: 2504,
          commune_name: 'Constantine',
        },
        {
          date_status: '2023-03-18 22:25:56',
          tracking: 'yal-48KHZR',
          status: 'Prêt à expédier',
          reason: '',
          center_id: null,
          center_name: null,
          wilaya_id: null,
          wilaya_name: null,
          commune_id: null,
          commune_name: null,
        },
        {
          date_status: '2023-03-18 19:22:29',
          tracking: 'yal-48KHZR',
          status: 'En préparation',
          reason: '',
          center_id: null,
          center_name: null,
          wilaya_id: null,
          wilaya_name: null,
          commune_id: null,
          commune_name: null,
        },
        {
          date_status: '2023-03-18 15:37:02',
          tracking: 'yal-75HRXU',
          status: 'Tentative échouée',
          reason: 'Client ne répond pas',
          center_id: 165002,
          center_name: 'Amara',
          wilaya_id: 16,
          wilaya_name: 'Alger',
          commune_id: 1650,
          commune_name: 'Cheraga',
        },
        {
          date_status: '2023-03-18 15:21:21',
          tracking: 'yal-75HRXU',
          status: 'En alerte',
          reason: 'Client ne répond pas',
          center_id: 165002,
          center_name: 'Amara',
          wilaya_id: 16,
          wilaya_name: 'Alger',
          commune_id: 1650,
          commune_name: 'Cheraga',
        },
        {
          date_status: '2023-03-18 14:52:35',
          tracking: 'yal-18NHAZ',
          status: 'En attente du client',
          reason: '',
          center_id: 150101,
          center_name: 'Agence de Tizi Ouzou',
          wilaya_id: 15,
          wilaya_name: 'Tizi Ouzou',
          commune_id: 1501,
          commune_name: 'Tizi Ouzou',
        },
        {
          date_status: '2023-03-18 09:44:02',
          tracking: 'yal-75HRXU',
          status: 'Sorti en livraison',
          reason: '',
          center_id: 165002,
          center_name: 'Amara',
          wilaya_id: 16,
          wilaya_name: 'Alger',
          commune_id: 1650,
          commune_name: 'Cheraga',
        },
        {
          date_status: '2023-03-18 09:21:05',
          tracking: 'yal-75HRXU',
          status: 'Centre',
          reason: '',
          center_id: 165002,
          center_name: 'Amara',
          wilaya_id: 16,
          wilaya_name: 'Alger',
          commune_id: 1650,
          commune_name: 'Cheraga',
        },
        {
          date_status: '2023-03-17 02:05:11',
          tracking: 'yal-18NHAZ',
          status: 'Centre',
          reason: '',
          center_id: 150101,
          center_name: 'Agence de Tizi Ouzou',
          wilaya_id: 15,
          wilaya_name: 'Tizi Ouzou',
          commune_id: 1501,
          commune_name: 'Tizi Ouzou',
        },
        {
          date_status: '2023-03-17 00:03:58',
          tracking: 'yal-18NHAZ',
          status: 'Tentative échouée',
          reason: 'Client no-show',
          center_id: 150101,
          center_name: 'Agence de Tizi Ouzou',
          wilaya_id: 15,
          wilaya_name: 'Tizi Ouzou',
          commune_id: 1501,
          commune_name: 'Tizi Ouzou',
        },
        {
          date_status: '2023-03-16 12:26:42',
          tracking: 'yal-18NHAZ',
          status: 'En attente du client',
          reason: '',
          center_id: 150101,
          center_name: 'Agence de Tizi Ouzou',
          wilaya_id: 15,
          wilaya_name: 'Tizi Ouzou',
          commune_id: 1501,
          commune_name: 'Tizi Ouzou',
        },
        {
          date_status: '2023-03-16 11:01:03',
          tracking: 'yal-75HRXU',
          status: 'Tentative échouée',
          reason: 'Client ne répond pas',
          center_id: 165002,
          center_name: 'Amara',
          wilaya_id: 16,
          wilaya_name: 'Alger',
          commune_id: 1650,
          commune_name: 'Cheraga',
        },
        {
          date_status: '2023-03-16 10:58:33',
          tracking: 'yal-14SSMW',
          status: 'Vers Wilaya',
          reason: '',
          center_id: 481101,
          center_name: 'Agence de El Hamadna',
          wilaya_id: 48,
          wilaya_name: 'Relizane',
          commune_id: 4811,
          commune_name: 'El Hamadna',
        },
        {
          date_status: '2023-03-16 10:45:55',
          tracking: 'yal-75HRXU',
          status: 'En alerte',
          reason: 'Client ne répond pas',
          center_id: 165002,
          center_name: 'Amara',
          wilaya_id: 16,
          wilaya_name: 'Alger',
          commune_id: 1650,
          commune_name: 'Cheraga',
        },
        {
          date_status: '2023-03-16 09:47:31',
          tracking: 'yal-14SSMW',
          status: 'Centre',
          reason: '',
          center_id: 481101,
          center_name: 'Agence de El Hamadna',
          wilaya_id: 48,
          wilaya_name: 'Relizane',
          commune_id: 4811,
          commune_name: 'El Hamadna',
        },
        {
          date_status: '2023-03-16 09:43:24',
          tracking: 'yal-75HRXU',
          status: 'Sorti en livraison',
          reason: '',
          center_id: 165002,
          center_name: 'Amara',
          wilaya_id: 16,
          wilaya_name: 'Alger',
          commune_id: 1650,
          commune_name: 'Cheraga',
        },
        {
          date_status: '2023-03-16 08:31:23',
          tracking: 'yal-75HRXU',
          status: 'Centre',
          reason: '',
          center_id: 165002,
          center_name: 'Amara',
          wilaya_id: 16,
          wilaya_name: 'Alger',
          commune_id: 1650,
          commune_name: 'Cheraga',
        },
        {
          date_status: '2023-03-16 05:51:25',
          tracking: 'yal-75HRXU',
          status: 'Transfert',
          reason: '',
          center_id: 161501,
          center_name: 'Agence de Oued Smar',
          wilaya_id: 16,
          wilaya_name: 'Alger',
          commune_id: 1615,
          commune_name: 'Oued Smar',
        },
        {
          date_status: '2023-03-16 03:49:06',
          tracking: 'yal-75HRXU',
          status: 'Centre',
          reason: '',
          center_id: 161501,
          center_name: 'Agence de Oued Smar',
          wilaya_id: 16,
          wilaya_name: 'Alger',
          commune_id: 1615,
          commune_name: 'Oued Smar',
        },
        {
          date_status: '2023-03-16 02:05:08',
          tracking: 'yal-18NHAZ',
          status: 'Centre',
          reason: '',
          center_id: 150101,
          center_name: 'Agence de Tizi Ouzou',
          wilaya_id: 15,
          wilaya_name: 'Tizi Ouzou',
          commune_id: 1501,
          commune_name: 'Tizi Ouzou',
        },
        {
          date_status: '2023-03-16 00:05:11',
          tracking: 'yal-18NHAZ',
          status: 'Tentative échouée',
          reason: 'Client no-show',
          center_id: 150101,
          center_name: 'Agence de Tizi Ouzou',
          wilaya_id: 15,
          wilaya_name: 'Tizi Ouzou',
          commune_id: 1501,
          commune_name: 'Tizi Ouzou',
        },
        {
          date_status: '2023-03-15 22:49:26',
          tracking: 'yal-14SSMW',
          status: 'Transfert',
          reason: '',
          center_id: 250401,
          center_name: 'Agence de Constantine',
          wilaya_id: 25,
          wilaya_name: 'Constantine',
          commune_id: 2504,
          commune_name: 'Constantine',
        },
        {
          date_status: '2023-03-15 22:47:23',
          tracking: 'yal-75HRXU',
          status: 'Transfert',
          reason: '',
          center_id: 250401,
          center_name: 'Agence de Constantine',
          wilaya_id: 25,
          wilaya_name: 'Constantine',
          commune_id: 2504,
          commune_name: 'Constantine',
        },
        {
          date_status: '2023-03-15 22:42:07',
          tracking: 'yal-75HRXU',
          status: 'Expédié',
          reason: '',
          center_id: 250401,
          center_name: 'Agence de Constantine',
          wilaya_id: 25,
          wilaya_name: 'Constantine',
          commune_id: 2504,
          commune_name: 'Constantine',
        },
        {
          date_status: '2023-03-15 22:42:07',
          tracking: 'yal-14SSMW',
          status: 'Expédié',
          reason: '',
          center_id: 250401,
          center_name: 'Agence de Constantine',
          wilaya_id: 25,
          wilaya_name: 'Constantine',
          commune_id: 2504,
          commune_name: 'Constantine',
        },
        {
          date_status: '2023-03-15 21:56:23',
          tracking: 'yal-75HRXU',
          status: 'Prêt à expédier',
          reason: '',
          center_id: null,
          center_name: null,
          wilaya_id: null,
          wilaya_name: null,
          commune_id: null,
          commune_name: null,
        },
        {
          date_status: '2023-03-15 21:56:01',
          tracking: 'yal-14SSMW',
          status: 'Prêt à expédier',
          reason: '',
          center_id: null,
          center_name: null,
          wilaya_id: null,
          wilaya_name: null,
          commune_id: null,
          commune_name: null,
        },
        {
          date_status: '2023-03-15 19:45:22',
          tracking: 'yal-75HRXU',
          status: 'En préparation',
          reason: '',
          center_id: null,
          center_name: null,
          wilaya_id: null,
          wilaya_name: null,
          commune_id: null,
          commune_name: null,
        },
        {
          date_status: '2023-03-15 16:50:01',
          tracking: 'yal-14SSMW',
          status: 'En préparation',
          reason: '',
          center_id: null,
          center_name: null,
          wilaya_id: null,
          wilaya_name: null,
          commune_id: null,
          commune_name: null,
        },
        {
          date_status: '2023-03-15 08:40:08',
          tracking: 'yal-18NHAZ',
          status: 'En attente du client',
          reason: '',
          center_id: 150101,
          center_name: 'Agence de Tizi Ouzou',
          wilaya_id: 15,
          wilaya_name: 'Tizi Ouzou',
          commune_id: 1501,
          commune_name: 'Tizi Ouzou',
        },
        {
          date_status: '2023-03-15 04:57:08',
          tracking: 'yal-18NHAZ',
          status: 'Reçu à Wilaya',
          reason: '',
          center_id: 150101,
          center_name: 'Agence de Tizi Ouzou',
          wilaya_id: 15,
          wilaya_name: 'Tizi Ouzou',
          commune_id: 1501,
          commune_name: 'Tizi Ouzou',
        },
        {
          date_status: '2023-03-14 07:05:10',
          tracking: 'yal-18NHAZ',
          status: 'Vers Wilaya',
          reason: '',
          center_id: 161501,
          center_name: 'Agence de Oued Smar',
          wilaya_id: 16,
          wilaya_name: 'Alger',
          commune_id: 1615,
          commune_name: 'Oued Smar',
        },
        {
          date_status: '2023-03-14 06:52:02',
          tracking: 'yal-18NHAZ',
          status: 'Centre',
          reason: '',
          center_id: 161501,
          center_name: 'Agence de Oued Smar',
          wilaya_id: 16,
          wilaya_name: 'Alger',
          commune_id: 1615,
          commune_name: 'Oued Smar',
        },
        {
          date_status: '2023-03-13 21:45:00',
          tracking: 'yal-18NHAZ',
          status: 'Transfert',
          reason: '',
          center_id: 250401,
          center_name: 'Agence de Constantine',
          wilaya_id: 25,
          wilaya_name: 'Constantine',
          commune_id: 2504,
          commune_name: 'Constantine',
        },
        {
          date_status: '2023-03-13 21:37:16',
          tracking: 'yal-18NHAZ',
          status: 'Expédié',
          reason: '',
          center_id: 250401,
          center_name: 'Agence de Constantine',
          wilaya_id: 25,
          wilaya_name: 'Constantine',
          commune_id: 2504,
          commune_name: 'Constantine',
        },
        {
          date_status: '2023-03-13 20:46:51',
          tracking: 'yal-18NHAZ',
          status: 'Prêt à expédier',
          reason: '',
          center_id: null,
          center_name: null,
          wilaya_id: null,
          wilaya_name: null,
          commune_id: null,
          commune_name: null,
        },
        {
          date_status: '2023-03-13 19:51:37',
          tracking: 'yal-18NHAZ',
          status: 'En préparation',
          reason: '',
          center_id: null,
          center_name: null,
          wilaya_id: null,
          wilaya_name: null,
          commune_id: null,
          commune_name: null,
        },
      ],
      links: {
        self: 'https://api.yalidine.app/v1/histories/?tracking=yal-14SSMW,yal-61UXYM,yal-18NHAZ,yal-48KHZR,yal-75HRXU',
      },
    };

    const object = histories.data.reduce((obj, item) => {
      if (obj[item.tracking])
        return Object.assign(obj, {
          [item.tracking]: [...obj[item.tracking], item.status],
        });
      return Object.assign(obj, {
        [item.tracking]: [item.status],
      });
    }, {});
    console.log('the object => ', object);
  }, []);
  useEffect(() => {
    const getUsers = async () => {
      const { data, error } = await supabase.from('users').select().eq('email', userAuth.email).single();
      if (data) {
        setUserRole(data.role);
      }
      if (error) {
        console.log(error);
      }
    };
    getUsers();
  }, [userAuth]);

  useEffect(() => {
    if (userRole === 'agent') {
      navigate('/dashboard/leads', { replace: true });
    } else if (userRole === 'tracker') navigate('/dashboard/tracking', { replace: true });
  }, [userRole]);

  useEffect(() => {
    const fetchDelivered = async () => {
      const { count, data, error } = await supabase
        .from('orders')
        .select('product_price, shipping_price, delivery_fees', { count: 'exact' })
        .eq('status', 'delivered');

      if (data) {
        console.log('number of delivered: ', count);
        const netPayments = data.map((order) => order.product_price + order.shipping_price - order.delivery_fees);
        const totalRev = netPayments.reduce((partialSum, a) => partialSum + a, 0);
        setTotalRevenue(totalRev - returnedCount * 350);
        setDeliveredCount(count);
        console.log('orders', data, totalRev);
      }
    };
    fetchDelivered();
  }, [returnedCount]);

  useEffect(() => {
    const fetchOrders = async () => {
      const { count, data, error } = await supabase
        .from('orders')
        .select('product_price, shipping_price, delivery_fees', { count: 'exact' });

      if (data) {
        setTotalOrders(count);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchDelivered = async () => {
      const {
        count: countOrder,
        data: dataOrder,
        error: errorOrder,
      } = await supabase.from('orders').select('id', { count: 'exact' }).eq('status', 'returned');
      if (dataOrder) {
        setReturnedCount(countOrder);
      }
    };
    fetchDelivered();
  }, []);

  useEffect(() => {
    const getUsers = async () => {
      const tomorrowDate = new Date().toISOString();
      const eightDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const fromDate = eightDaysAgo.split('T')[0];
      const toDate = tomorrowDate.split('T')[0];
      console.log('date1', fromDate);
      console.log('date2', toDate);
      const { data, error } = await supabase.rpc('get_number_orders_last_week', {
        date1: fromDate,
        date2: toDate,
      });

      if (data) {
        console.log('data got: ', data);
        const days = data.map((item) => item.key);
        const orders = data.map((item) => item.value);
        setOrdersByDate(orders);
        setWeekDates(days);
      }

      if (error) {
        console.log(error);
      }
    };
    getUsers();
  }, []);

  useEffect(() => {
    const getUsers = async () => {
      const tomorrowDate = new Date(Date.now() + 0.5 * 24 * 60 * 60 * 1000).toISOString();
      const eightDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const fromDate = eightDaysAgo.split('T')[0];
      const toDate = tomorrowDate.split('T')[0];
      // console.log('date1', fromDate);
      // console.log('date2', toDate);
      const { data: dataLeads, errorLeads } = await supabase.rpc('get_number_leads_last_week', {
        date1: fromDate,
        date2: toDate,
      });
      const { data: dataConfirmed, errorConfirmed } = await supabase.rpc('get_number_confirmed_leads_last_week', {
        date1: fromDate,
        date2: toDate,
      });

      if (dataLeads && dataConfirmed) {
        // console.log('leads', dataLeads);
        // console.log('confirms', dataConfirmed);
        const leadsLastWeek = dataLeads.map((item) => item.value);
        setLeadsByDay(leadsLastWeek);
        const confirmationRate = dataLeads.map((item, i) => {
          const correspondingConfirmedItem = dataConfirmed.filter((itemD) => itemD.key === item.key);
          // console.log('the corresponding item is ', correspondingDeliveredItem);
          if (correspondingConfirmedItem.length === 0) {
            // return {
            //   // key: item.key,
            //   value: 0,
            // };
            return 0;
          }
          return +((correspondingConfirmedItem[0].value / item.value) * 100).toFixed(2);
          // return {
          //   key: item.key,
          //   value: +((correspondingConfirmedItem[0].value / item.value) * 100).toFixed(2),
          // };
        });
        setConfirmRateByDay(confirmationRate);
        // console.log('confirm -> ', confirmationRate);
      }

      if (errorLeads) {
        console.log(errorLeads);
      }

      if (errorConfirmed) {
        console.log(errorConfirmed);
      }
    };
    getUsers();
  }, []);

  useEffect(() => {
    const getUsers = async () => {
      const { data, error } = await supabase.rpc('get_leads_by_status');
      if (data) {
        console.log('the status data: ', data);
        const getLeadsStatus = data.map((item) => ({
          label: item.key,
          value: item.value,
        }));
        setLeadsByStatus(getLeadsStatus);
      }

      if (error) {
        console.log('something went wrong', error);
      }
    };
    getUsers();
  }, []);

  return (
    <>
      <Helmet>
        <title> Dashboard </title>
      </Helmet>

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Hi, Welcome back
        </Typography>
        {userRole && (
          <>
            {userRole === 'admin' && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <AppWidgetSummary
                    title="Total Revenue (DA)"
                    total={totalRevenue}
                    icon={'ant-design:dollar-circle-filled'}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <AppWidgetSummary
                    title="Delivered Orders"
                    total={deliveredCount}
                    color="info"
                    icon={'ant-design:credit-card-filled'}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <AppWidgetSummary
                    title="Confirmed Leads"
                    total={totalOrders}
                    color="success"
                    icon={'ant-design:funnel-plot-filled'}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <AppWidgetSummary title="Bug Reports" total={234} color="error" icon={'ant-design:bug-filled'} />
                </Grid>

                <Grid item xs={12} md={8} lg={8}>
                  <AppWebsiteVisits
                    title="Last week's sales"
                    subheader="Recent sales performance stats"
                    chartLabels={weekDates}
                    isPercent
                    chartData={[
                      {
                        name: 'Orders',
                        type: 'column',
                        fill: 'solid',
                        data: ordersByDay,
                      },
                      {
                        name: 'Confirmation rates',
                        type: 'area',
                        fill: 'gradient',
                        data: confirmRateByDay,
                      },
                    ]}
                  />
                </Grid>

                <Grid item xs={12} md={4} lg={4}>
                  <AppCurrentVisits
                    title="Delivery Rate"
                    chartData={[
                      { label: 'Delivered', value: deliveredCount },
                      { label: 'Returned', value: returnedCount },
                    ]}
                    chartColors={[theme.palette.success.main, theme.palette.error.main]}
                  />
                </Grid>

                <Grid item xs={12} md={8} lg={8}>
                  <AppWebsiteVisits
                    title="Last week's Leads"
                    subheader="Recent lead generation performance stats"
                    chartLabels={weekDates}
                    isPercent
                    chartData={[
                      {
                        name: 'Number of leads',
                        type: 'bar',
                        fill: 'solid',
                        data: leadsByDay,
                        color: theme.palette.primary.main,
                      },
                    ]}
                    // chartColors={[theme.palette.success.main]}
                  />
                </Grid>
                <Grid item xs={12} md={4} lg={4}>
                  <AppCurrentVisits
                    title="Confirmation Rate"
                    chartData={leadsByStatus}
                    chartColors={[
                      theme.palette.error.main,
                      theme.palette.success.main,
                      '#ffd263',
                      '#638fff',
                      '#eaea27',
                      '#db25cf',
                      '#d0ea27',
                      '#7863ff',
                    ]}
                  />
                </Grid>
                {/* <Grid item xs={12} md={6} lg={4}>
            <AppCurrentSubject
              title="Current Subject"
              chartLabels={['Consistency', 'Availability', 'Confirm Rate', 'Delivery Rate', 'Volume']}
              chartData={[
                { name: 'John doe', data: [80, 50, 30, 40, 100] },
                // { name: 'Series 2', data: [20, 30, 40, 80, 20] },
                // { name: 'Series 3', data: [44, 76, 78, 13, 43] },
              ]}
              chartColors={[...Array(6)].map(() => theme.palette.text.secondary)}
            />
          </Grid> */}
              </Grid>
            )}
          </>
        )}
      </Container>
    </>
  );
}
