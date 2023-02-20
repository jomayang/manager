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
              console.log('user connected!');
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
  }, []);

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

  return (
    <>
      <Helmet>
        <title> Dashboard </title>
      </Helmet>

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Hi, Welcome back
        </Typography>
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

            <Grid item xs={12} md={6} lg={8}>
              <AppWebsiteVisits
                title="Website Visits"
                subheader="(+43%) than last year"
                chartLabels={[
                  '01/01/2003',
                  '02/01/2003',
                  '03/01/2003',
                  '04/01/2003',
                  '05/01/2003',
                  '06/01/2003',
                  '07/01/2003',
                  '08/01/2003',
                  '09/01/2003',
                  '10/01/2003',
                  '11/01/2003',
                ]}
                chartData={[
                  {
                    name: 'Team A',
                    type: 'column',
                    fill: 'solid',
                    data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30],
                  },
                  {
                    name: 'Team B',
                    type: 'area',
                    fill: 'gradient',
                    data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43],
                  },
                  {
                    name: 'Team C',
                    type: 'line',
                    fill: 'solid',
                    data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39],
                  },
                ]}
              />
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <AppCurrentVisits
                title="Delivery Rate"
                chartData={[
                  { label: 'Delivered', value: deliveredCount },
                  { label: 'Returned', value: returnedCount },
                ]}
                chartColors={[theme.palette.success.main, theme.palette.error.main]}
              />
            </Grid>

            <Grid item xs={12} md={6} lg={8}>
              <AppConversionRates
                title="Conversion Rates"
                subheader="(+43%) than last year"
                chartData={[
                  { label: 'Italy', value: 400 },
                  { label: 'Japan', value: 430 },
                  { label: 'China', value: 448 },
                  { label: 'Canada', value: 470 },
                  { label: 'France', value: 540 },
                  { label: 'Germany', value: 580 },
                  { label: 'South Korea', value: 690 },
                  { label: 'Netherlands', value: 1100 },
                  { label: 'United States', value: 1200 },
                  { label: 'United Kingdom', value: 1380 },
                ]}
              />
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
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
            </Grid>
          </Grid>
        )}
      </Container>
    </>
  );
}
