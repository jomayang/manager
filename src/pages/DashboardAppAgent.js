import { Helmet } from 'react-helmet-async';
// @mui
import { useTheme } from '@mui/material/styles';
import { useContext, useEffect, useState } from 'react';
import { Grid, Container, Typography, Stack } from '@mui/material';
// sections
import { AppCurrentVisits, AppWebsiteVisits, AppWidgetSummary } from '../sections/@dashboard/app';
import supabase from '../config/SupabaseClient';
import { UserContext } from '../context/UserContext';

// ----------------------------------------------------------------------

export default function DashboardAppAgent() {
  const { user: userAuth } = useContext(UserContext);
  const [userRole, setUserRole] = useState('');
  const [deliveryRate, setDeliveryRate] = useState(0);
  const [deliveryRateStatus, setDeliveryRateStatus] = useState('info');

  const [weekDates, setWeekDates] = useState();
  const [weekValues, setWeekValues] = useState();

  const [dailyConfirmRate, setDailyConfirmRate] = useState(0);
  const [dailyConfirmRateStatus, setDailyConfirmRateStatus] = useState('info');

  const [confirmRate, setConfirmRate] = useState(0);
  const [confirmRateStatus, setConfirmRateStatus] = useState('info');

  const [dailyBalance, setDailyBalance] = useState(0);

  const [monthlyBalance, setMonthlyBalance] = useState(0);

  const [agentId, setAgentId] = useState(17);

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
          setAgentId(data.id);
        }
        if (error) {
          console.log(error);
        }
      }
    };
    getUsers();
  }, [userAuth]);

  useEffect(() => {
    const fetchDailyBalance = async () => {
      try {
        const today = new Date();

        const formattedToday = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today
          .getDate()
          .toString()
          .padStart(2, '0')}`;

        const { count, data, error } = await supabase
          .from('orders')
          .select('product_price, shipping_price, delivery_fees', { count: 'exact' })
          .eq('modified_at', formattedToday)
          .eq('status', 'delivered')
          .eq('agent_id', agentId)
          .eq('is_exchange', false);

        // Get the current date and time
        const now = new Date();

        // Set the time to midnight for the current day
        const start = new Date(now);
        start.setHours(10, 0, 0, 0);

        // Calculate the difference in milliseconds
        const timeDifference = now - start;

        // Convert milliseconds to hours
        const hoursPassed = timeDifference / (1000 * 60 * 20);

        let fixedReward = 0;

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

        if (data) {
          if (confirmRate > 65) {
            variableReward = count * 50;
          } else if (confirmRate >= 55) {
            variableReward = count * 40;
          } else if (confirmRate > 42) {
            variableReward = count * 30;
          } else {
            variableReward = 0;
          }
        }

        const dailyBalanceTemp = fixedReward + variableReward;

        setDailyBalance(dailyBalanceTemp);
      } catch (error) {
        console.log('something went wrong: ', error);
      }
    };
    fetchDailyBalance();
  }, [agentId]);

  useEffect(() => {
    const fetchDailyConfirmRate = async () => {
      try {
        const today = new Date();
        // today.setDate(today.getDate() - 1);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const formattedDateToday = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today
          .getDate()
          .toString()
          .padStart(2, '0')}`;

        const formattedTomorrow = `${tomorrow.getFullYear()}-${(tomorrow.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${tomorrow.getDate().toString().padStart(2, '0')}`;

        const { data: dataO, error: errorO } = await supabase.rpc('get_leads_by_agent_with_date_range', {
          objective_in: 'conversion',
          date1: formattedDateToday,
          date2: formattedTomorrow,
        });
        const { data: dataD, error: errorD } = await supabase.rpc('get_confirmed_count_by_agent_with_date_range', {
          objective_in: 'conversion',
          date1: formattedDateToday,
          date2: formattedTomorrow,
        });

        if (dataD && dataO) {
          const dataOAgent = dataO.filter((item) => item.key === agentId);
          const dataDAgent = dataD.filter((item) => item.key === agentId);
          if (dataDAgent.length === 0) {
            setDailyConfirmRate(0);
          } else {
            const dailyConfirmRateTemp = ((dataDAgent[0].value / dataOAgent[0].value) * 100).toFixed(0);

            setDailyConfirmRate(dailyConfirmRateTemp);
            if (dailyConfirmRateTemp < 42) {
              setDailyConfirmRateStatus('error');
            } else if (dailyConfirmRateTemp >= 42 && dailyConfirmRateTemp < 55) {
              setDailyConfirmRateStatus('warning');
            } else {
              setDailyConfirmRateStatus('success');
            }
          }
        }
      } catch (error) {
        console.log('something went wrong: ', error);
      }
    };
    fetchDailyConfirmRate();
  }, [agentId]);

  useEffect(() => {
    const fetchConfirmRate = async () => {
      try {
        const { data: dataO, error: errorO } = await supabase.rpc('get_leads_by_agent', {
          objective_in: 'conversion',
        });
        const { data: dataD, error: errorD } = await supabase.rpc('get_confirmed_count_by_agent', {
          objective_in: 'conversion',
        });

        const dataOAgent = dataO.filter((item) => item.key === agentId);
        const dataDAgent = dataD.filter((item) => item.key === agentId);

        const confirmRateTemp = ((dataDAgent[0].value / dataOAgent[0].value) * 100).toFixed(0);

        setConfirmRate(confirmRateTemp);
        if (confirmRateTemp < 42) {
          setConfirmRateStatus('error');
        } else if (confirmRateTemp >= 42 && confirmRateTemp < 55) {
          setConfirmRateStatus('warning');
        } else {
          setConfirmRateStatus('success');
        }
      } catch (error) {
        console.log('something went wrong: ', error);
      }
    };
    fetchConfirmRate();
  }, [agentId]);

  useEffect(() => {
    const fetchDeliveryRate = async () => {
      try {
        const { data: dataO, error: errorO } = await supabase.rpc('get_orders_by_agent');
        const { data: dataD, error: errorD } = await supabase.rpc('get_delivered_count_by_agent');

        const dataOAgent = dataO.filter((item) => item.key === agentId);
        const dataDAgent = dataD.filter((item) => item.key === agentId);

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
  }, [agentId]);

  useEffect(() => {
    const fetchDelivered = async () => {
      try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 8);

        const formattedSevenDaysAgo = `${sevenDaysAgo.getFullYear()}-${(sevenDaysAgo.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${sevenDaysAgo.getDate().toString().padStart(2, '0')}`;

        const { data: dataOrder, error: errorOrder } = await supabase
          .from('rewards')
          .select('date,amount')
          .eq('user_id', agentId)
          .gte('date', formattedSevenDaysAgo)
          .order('date', { ascending: false });
        if (dataOrder) {
          const weekDatesTemp = dataOrder.map((item) => item.date);
          const weekValuesTemp = dataOrder.map((item) => item.amount + 800);

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
    fetchDelivered();
  }, [agentId]);

  useEffect(() => {
    const fetchHandleRate = async () => {
      try {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const formattedThreeDaysAgo = `${threeDaysAgo.getFullYear()}-${(threeDaysAgo.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${threeDaysAgo.getDate().toString().padStart(2, '0')}`;

        const nextDay = new Date();
        nextDay.setDate(nextDay.getDate() + 1);
        const formattedNextDay = `${nextDay.getFullYear()}-${(nextDay.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${nextDay.getDate().toString().padStart(2, '0')}`;

        const { data, error } = await supabase.rpc('get_leads_by_status_by_agent', {
          agent_in: agentId,
          date1: formattedThreeDaysAgo,
          date2: formattedNextDay,
        });
        if (data) {
          const getLeadsStatus = data.map((item) => ({
            label: item.key,
            value: item.value,
          }));

          const handleRate = getLeadsStatus.reduce(
            (acc, item) => {
              if (['not-responding', 'busy', 'unreachable', 'initial'].includes(item.label)) {
                acc[1].value += item.value; // unhandled
              } else {
                acc[0].value += item.value; // handled
              }
              return acc;
            },
            [
              { label: 'handled', value: 0 },
              { label: 'unhandled', value: 0 },
            ]
          );

          setLeadsByStatus(handleRate);
        }

        if (error) {
          console.log('something went wrong', error);
        }
      } catch (error) {
        console.log('something went wrong: ', error);
      }
    };
    fetchHandleRate();
  }, [agentId]);

  useEffect(() => {
    const fetchMonthlyBalance = async () => {
      try {
        let lastPayrollDay;
        if (agentId === 17) {
          lastPayrollDay = 14;
        } else if (agentId === 23) {
          lastPayrollDay = 13;
        } else {
          lastPayrollDay = 1;
        }

        const lastPayrollDate = getLastDateForDayOfMonth(lastPayrollDay);
        const formattedLastPayrollDate = `${lastPayrollDate.getFullYear()}-${(lastPayrollDate.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${lastPayrollDate.getDate().toString().padStart(2, '0')}`;
        const { count, data, error } = await supabase
          .from('rewards')
          .select('amount', { count: 'exact' })
          .gte('date', formattedLastPayrollDate)
          .eq('user_id', agentId);

        let accumulatedVariableRewards;
        let accumulatedFixedRewards;

        if (data) {
          accumulatedVariableRewards = data.reduce((sum, item) => sum + item.amount, 0);

          accumulatedFixedRewards = count * 800;
        }

        const monthlyBalanceTemp = accumulatedVariableRewards + accumulatedFixedRewards;
        setMonthlyBalance(monthlyBalanceTemp);
      } catch (error) {
        console.log('something went wrong: ', error);
      }
    };
    fetchMonthlyBalance();
  }, [agentId]);

  function getLastDateForDayOfMonth(dayNumber) {
    // Get the current date
    // const currentDate = new Date();
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
            Hi, Welcome {agentId === 17 ? 'Lina' : ''} {agentId === 23 ? 'Rahma' : ''}
          </Typography>

          <Typography variant="p" justifyContent={'end'} sx={{ mb: 5 }}>
            Monthly Balance:
            <br />
            <Typography variant="p" style={{ float: 'right', color: '#08660D', fontWeight: 'bold' }} color={'success'}>
              {monthlyBalance} DA
            </Typography>
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Daily Confirmation Rate"
              total={dailyConfirmRate}
              isPercentage
              color={dailyConfirmRateStatus}
              icon={'ant-design:funnel-plot-outlined'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Confirmation Rate"
              isPercentage
              total={confirmRate}
              color={confirmRateStatus}
              star={confirmRate > 65}
              icon={'ant-design:funnel-plot-filled'}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Delivery Rate"
              isPercentage
              total={deliveryRate}
              color={deliveryRateStatus}
              star={deliveryRate > 70}
              icon="ant-design:transaction-outlined"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Daily Balance"
              total={dailyBalance}
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
              title="Recent Handle Rate"
              chartData={leadsByStatus}
              chartColors={[
                theme.palette.success.main,
                theme.palette.error.main,
                '#ffd263',
                '#db25cf',
                '#d0ea27',
                '#eaea27',
                '#638fff',
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
      </Container>
    </>
  );
}
