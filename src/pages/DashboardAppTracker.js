import { Helmet } from 'react-helmet-async';
// @mui
import { useTheme } from '@mui/material/styles';
import { useContext, useEffect, useState } from 'react';
import { Grid, Container, Typography, Stack } from '@mui/material';
// sections
import { AppCurrentVisits, AppWebsiteVisits, AppWidgetSummary } from '../sections/@dashboard/app';
import supabase from '../config/SupabaseClient';
import { UserContext } from '../context/UserContext';
import { fNumber } from '../utils/formatNumber';

// ----------------------------------------------------------------------

export default function DashboardAppTracker() {
  const { user: userAuth } = useContext(UserContext);
  const [userRole, setUserRole] = useState('');
  const [deliveryRate, setDeliveryRate] = useState(0);
  const [deliveryRateStatus, setDeliveryRateStatus] = useState('info');

  const [weeklyDeliveryRate, setWeeklyDeliveryRate] = useState(0);
  const [weeklyDeliveryRateStatus, setWeeklyDeliveryRateStatus] = useState('info');

  const [weekDates, setWeekDates] = useState();
  const [weekValues, setWeekValues] = useState();

  const [dailyBalance, setDailyBalance] = useState(0);

  const [monthlyBalance, setMonthlyBalance] = useState(0);

  const [trackerId, setTrackerId] = useState(28);

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
          // console.log(data);
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
      if (userAuth) {
        const { data, error } = await supabase.from('users').select().eq('email', userAuth.email).single();
        if (data) {
          setUserRole(data.role);
          setTrackerId(data.id);
        }
        if (error) {
          console.log(error);
        }
      }
    };
    getUsers();
  }, [userAuth]);

  useEffect(() => {
    const calculateDailyRewards = async () => {
      try {
        const today = new Date();

        const formattedToday = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today
          .getDate()
          .toString()
          .padStart(2, '0')}`;

        const { data: dataTrack, errorTrack } = await supabase.rpc('get_tracking_history_by_status', {
          tracker_in: trackerId,
          date_in: formattedToday,
        });

        // Get the current date and time
        const now = new Date();

        // Set the time to midnight for the current day
        const start = new Date(now);
        start.setHours(10, 0, 0, 0);

        // Calculate the difference in milliseconds
        const timeDifference = now - start;

        // Convert milliseconds to hours
        const hoursPassed = timeDifference / (1000 * 60 * 20);

        let fixedReward;

        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        if (currentHour >= 20 && currentHour <= 23 && currentMinute <= 59) {
          fixedReward = 800;
        } else if (currentHour < 10) {
          fixedReward = 0;
        } else {
          fixedReward = hoursPassed.toFixed(0) * 26;
        }
        let variableReward = 0;
        if (dataTrack) {
          dataTrack.forEach((item) => {
            if (item.value === 1) {
              variableReward += 20;
            } else if (item.value === 2) {
              variableReward += 30;
            } else if (item.value >= 3) {
              variableReward += 50;
            }
          });
        }

        setDailyBalance(fixedReward + variableReward);
      } catch (error) {
        console.log('something went wrong: ', error);
      }
    };
    calculateDailyRewards();
  }, [trackerId]);

  useEffect(() => {
    const fetchWeeklyDeliveryRate = async () => {
      try {
        const startingDate = new Date();
        startingDate.setDate(startingDate.getDate() - 11);
        const formattedStartingDate = `${startingDate.getFullYear()}-${(startingDate.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${startingDate.getDate().toString().padStart(2, '0')}`;

        const endingDate = new Date();
        endingDate.setDate(endingDate.getDate() - 4);
        const formattedEndingDate = `${endingDate.getFullYear()}-${(endingDate.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${endingDate.getDate().toString().padStart(2, '0')}`;

        const { data: dataO, error: errorO } = await supabase.rpc('get_orders_by_tracker_with_date_range', {
          date1: formattedStartingDate,
          date2: formattedEndingDate,
        });
        const { data: dataD, error: errorD } = await supabase.rpc('get_delivered_count_by_tracker_with_date_range', {
          date1: formattedStartingDate,
          date2: formattedEndingDate,
        });

        if (dataD && dataO) {
          const dataOAgent = dataO.filter((item) => item.key === trackerId);
          const dataDAgent = dataD.filter((item) => item.key === trackerId);
          // console.log('derivery rate data', dataDAgent);

          const deliveryRateTemp = ((dataDAgent[0].value / dataOAgent[0].value) * 100).toFixed(0);
          setWeeklyDeliveryRate(deliveryRateTemp);

          if (deliveryRateTemp < 55) {
            setWeeklyDeliveryRateStatus('error');
          } else if (deliveryRateTemp >= 55 && deliveryRateTemp < 60) {
            setWeeklyDeliveryRateStatus('warning');
          } else {
            setWeeklyDeliveryRateStatus('success');
          }
        }
      } catch (error) {
        console.log('something went wrong: ', error);
      }
    };
    fetchWeeklyDeliveryRate();
  }, [trackerId]);

  useEffect(() => {
    const fetchDeliveryRate = async () => {
      try {
        const { data: dataO, error: errorO } = await supabase.rpc('get_orders_by_tracker');
        const { data: dataD, error: errorD } = await supabase.rpc('get_delivered_count_by_tracker');

        const dataOAgent = dataO.filter((item) => item.key === trackerId);
        const dataDAgent = dataD.filter((item) => item.key === trackerId);

        const deliveryRateTemp = ((dataDAgent[0].value / dataOAgent[0].value) * 100).toFixed(0);

        setDeliveryRate(deliveryRateTemp);

        if (deliveryRateTemp < 55) {
          setDeliveryRateStatus('error');
        } else if (deliveryRateTemp >= 55 && deliveryRateTemp < 60) {
          setDeliveryRateStatus('warning');
        } else {
          setDeliveryRateStatus('success');
        }
      } catch (error) {
        console.log('something went wrong: ', error);
      }
    };
    fetchDeliveryRate();
  }, [trackerId]);

  useEffect(() => {
    const fetchWeeklyBalance = async () => {
      try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 8);

        const formattedSevenDaysAgo = `${sevenDaysAgo.getFullYear()}-${(sevenDaysAgo.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${sevenDaysAgo.getDate().toString().padStart(2, '0')}`;

        const { data: dataOrder, error: errorOrder } = await supabase
          .from('rewards')
          .select('date,amount')
          .eq('user_id', trackerId)
          .gte('date', formattedSevenDaysAgo)
          .order('date', { ascending: false });
        if (dataOrder) {
          const weekDatesTemp = dataOrder.map((item) => item.date);
          const weekValuesTemp = dataOrder.map((item) => item.amount);

          setWeekDates(weekDatesTemp);
          setWeekValues(weekValuesTemp);
        }
        if (errorOrder) {
          console.log('something went wrong', errorOrder);
        }
      } catch (error) {
        console.log('oops something went wrong', error);
      }
    };
    fetchWeeklyBalance();
  }, [trackerId]);

  useEffect(() => {
    const fetchOrderSituations = async () => {
      try {
        const today = new Date();
        // today.setDate(today.getDate() - 1);
        const formattedToday = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today
          .getDate()
          .toString()
          .padStart(2, '0')}`;

        const { data, error } = await supabase.rpc('get_orders_by_yalidine_status_by_date', {
          tracker_in: trackerId,
          date_in: formattedToday,
        });

        if (data) {
          const getOrdersStatus = data.map((item) => ({
            label: item.key,
            value: item.value,
          }));

          const orderStatusDict = getOrdersStatus.reduce(
            (acc, item) => {
              if (item.label === 'Livré') {
                acc[0].value += item.value;
              } else if (item.label === 'Tentative échouée') {
                acc[1].value += item.value;
              } else if (
                [
                  'Echèc livraison',
                  'Retour transfert',
                  'Retour groupé',
                  'Retour à retirer',
                  'Retour vers vendeur',
                  'Retour vers centre',
                  'Retourné au centre',
                  'Retourné au vendeur',
                ].includes(item.label)
              ) {
                acc[2].value += item.value; // unhandled
              } else if (['En attente', 'En attente du client', 'Sorti en livraison'].includes(item.label)) {
                acc[3].value += item.value; // handled
              }
              return acc;
            },
            [
              { label: 'delivered', value: 0 },
              { label: 'missed', value: 0 },
              { label: 'returned', value: 0 },
              { label: 'waiting', value: 0 },
            ]
          );
          setLeadsByStatus(orderStatusDict);
        }

        if (error) {
          console.log('something went wrong', error);
        }
      } catch (error) {
        console.log('something went wrong tr: ', error);
      }
    };
    fetchOrderSituations();
  }, [trackerId]);

  useEffect(() => {
    const fetchMonthlyBalance = async () => {
      try {
        let trackerPayDate;
        if (trackerId === 28) {
          trackerPayDate = 11;
        }

        const lastPayrollDate = getLastDateForDayOfMonth(trackerPayDate);
        const formattedLastPayrollDate = `${lastPayrollDate.getFullYear()}-${(lastPayrollDate.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${lastPayrollDate.getDate().toString().padStart(2, '0')}`;
        const { count, data, error } = await supabase
          .from('rewards')
          .select('amount', { count: 'exact' })
          .gte('date', formattedLastPayrollDate)
          .eq('user_id', trackerId);

        let accumulatedVariableRewards;
        let accumulatedFixedRewards;

        if (data) {
          accumulatedVariableRewards = data.reduce((sum, item) => sum + item.amount, 0);

          accumulatedFixedRewards = 0;
        }

        const monthlyBalanceTemp = accumulatedVariableRewards + accumulatedFixedRewards;
        setMonthlyBalance(monthlyBalanceTemp);
      } catch (error) {
        console.log('something went wrong: ', error);
      }
    };
    fetchMonthlyBalance();
  }, [trackerId]);

  function getLastDateForDayOfMonth(dayNumber) {
    // Get the current date
    const currentDate = new Date();

    // Calculate the last occurrence of the specified day in the current month
    const lastDateForDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);

    // If the calculated date is in the future, subtract a month
    if (lastDateForDay > currentDate) {
      lastDateForDay.setMonth(lastDateForDay.getMonth() - 1);
    }

    return lastDateForDay;
  }

  return (
    <>
      <Helmet>
        <title> Dashboard </title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack direction={'cols'} justifyContent={'space-between'}>
          <Typography variant="h4" sx={{ mb: 5 }}>
            Hi, Welcome Boutheina
          </Typography>

          <Typography variant="p" justifyContent={'end'} sx={{ mb: 5 }}>
            Monthly Balance:
            <br />
            <Typography variant="p" style={{ float: 'right', color: '#08660D', fontWeight: 'bold' }} color={'success'}>
              {fNumber(monthlyBalance)} DA
            </Typography>
          </Typography>
        </Stack>

        {userRole && (
          <>
            {userRole === 'admin' && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <AppWidgetSummary
                    title="Weekly Delivery Rate"
                    total={weeklyDeliveryRate}
                    isPercentage
                    color={weeklyDeliveryRateStatus}
                    icon={'ant-design:funnel-plot-outlined'}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <AppWidgetSummary
                    title="Delivery Rate"
                    isPercentage
                    total={deliveryRate}
                    color={deliveryRateStatus}
                    icon={'ant-design:transaction-outlined'}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <AppWidgetSummary
                    title="Daily Balance"
                    total={dailyBalance}
                    isCurrency
                    color="info"
                    icon={'ant-design:dollar-circle-filled'}
                  />
                </Grid>

                <Grid item xs={12} md={8} lg={8}>
                  <AppWebsiteVisits
                    title="Weekly Stats"
                    subheader="Recent lead generation performance stats"
                    chartLabels={weekDates}
                    isPercent
                    chartData={[
                      {
                        name: 'Daily balance (DA)',
                        type: 'column',
                        fill: 'solid',
                        data: weekValues,
                        color: theme.palette.success.dark,
                      },
                    ]}
                    // chartColors={[theme.palette.success.main]}
                  />
                </Grid>

                <Grid item xs={12} md={4} lg={4}>
                  <AppCurrentVisits
                    title="Recent Order Situation"
                    chartData={leadsByStatus}
                    chartColors={[
                      theme.palette.success.main,
                      theme.palette.warning.main,
                      theme.palette.error.main,
                      theme.palette.info.main,
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
