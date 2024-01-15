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
  const [numberOfLeads, setNumberOfLeads] = useState(0);
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

        // setTotalRevenue(totalRev - returnedCount * 350);
        setDeliveredCount(count);
      }
    };
    fetchDelivered();
  }, [returnedCount]);

  useEffect(() => {
    const fetchRevenue = async () => {
      const { data, error } = await supabase.rpc('retrieve_total_revenue');
      if (data) {
        setTotalRevenue(data[0].value);
      }
    };
    fetchRevenue();
  }, []);
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
    const fetchLeads = async () => {
      const { count, data, error } = await supabase.from('leads').select('*', { count: 'exact' });

      if (count) {
        setNumberOfLeads(count);
      }
    };
    fetchLeads();
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
                    // isCurrency
                    isShortned
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
                    isShor
                    color="success"
                    // isShortned
                    icon={'ant-design:funnel-plot-filled'}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <AppWidgetSummary
                    title="Potential Customers"
                    total={numberOfLeads}
                    color="error"
                    icon={'ant-design:customer-service-filled'}
                  />
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
