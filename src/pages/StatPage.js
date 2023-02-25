import { Helmet } from 'react-helmet-async';
import { faker } from '@faker-js/faker';
// @mui
import { Stack } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import { useContext, useEffect, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { useNavigate } from 'react-router-dom';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Grid, Container, Typography, Select, MenuItem, Button, TextField, Box } from '@mui/material';
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
import AppDoubleChart from '../sections/@dashboard/app/AppDoubleChart';

// ----------------------------------------------------------------------

export default function StatPage() {
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
  const [salesByX, setSalesByX] = useState([]);
  const [salesBy, setSalesBy] = useState('wilaya');
  const [isSalesLoading, setIsSalesLoading] = useState(false);
  const [isDeliveryRateLoading, setIsDeliveryRateLoading] = useState(false);
  const [isConfirmationRateLoading, setIsConfirmationRateLoading] = useState(false);
  const [deliveryRatesByX, setDeliveryRatesByX] = useState([]);
  const [deliveryRatesCountByX, setDeliveryRatesCountByX] = useState([]);
  const [deliveryRatesKeyByX, setDeliveryRateKeyByX] = useState([]);
  const [deliveryRatesValueByX, setDeliveryRatesValueByX] = useState([]);
  const [deliveryRatesBy, setDeliveryRatesBy] = useState('agent');
  const [confirmationRatesByX, setConfirmationRatesByX] = useState([]);
  const [confirmationRatesBy, setConfirmationRatesBy] = useState('agent');
  const [users, setUsers] = useState([]);

  const [deliveryRateFromDate, setDeliveryRateFromDate] = useState();
  const [deliveryRateToDate, setDeliveryRateToDate] = useState();

  const [confirmationRateFromDate, setConfirmationRateFromDate] = useState();
  const [confirmationRateToDate, setConfirmationRateToDate] = useState();

  const [salesFromDate, setSalesFromDate] = useState();
  const [salesToDate, setSalesToDate] = useState();

  const theme = useTheme();

  useEffect(() => {
    const getSales = async () => {
      const { data, error } = await supabase.rpc('get_sales_by_province');

      if (data) {
        console.log('sales: ', data);
        setSalesByX(data);
      }
    };
    getSales();
  }, []);

  useEffect(() => {
    const getSales = async () => {
      try {
        const { data: dataOrders, error: errorOrders } = await supabase.rpc('get_orders_by_agent');
        const { data: dataDelivered, error: errorDelivered } = await supabase.rpc('get_delivered_count_by_agent');
        console.log('here we are');
        if (dataOrders && dataDelivered) {
          const countOrders = dataOrders.map((item) => item.value);
          setDeliveryRatesCountByX(countOrders);
          const deliveryRate = dataOrders.map((item, i) => ({
            key: users[item.key],
            value: +((dataDelivered[i].value / item.value) * 100).toFixed(2),
          }));
          console.log(deliveryRate);
          const drKey = deliveryRate.map((dr) => dr.key);
          const drVal = deliveryRate.map((dr) => dr.value);
          setDeliveryRateKeyByX(drKey);
          setDeliveryRatesValueByX(drVal);
          setDeliveryRatesByX(deliveryRate);
        }
      } catch (error) {
        console.log('error', error);
      }
    };
    getSales();
  }, [users]);

  useEffect(() => {
    const getSales = async () => {
      try {
        const { data: dataOrders, error: errorOrders } = await supabase.rpc('get_leads_by_agent');
        const { data: dataConfirmed, error: errorDelivered } = await supabase.rpc('get_confirmed_count_by_agent');
        console.log('here we are');
        if (dataOrders && dataConfirmed) {
          const confirmationRate = dataOrders.map((item, i) => ({
            key: users[item.key],
            value: +((dataConfirmed[i].value / item.value) * 100).toFixed(2),
          }));
          console.log(confirmationRate);
          setConfirmationRatesByX(confirmationRate);
        }
      } catch (error) {
        console.log('error', error);
      }
    };
    getSales();
  }, [users]);

  useEffect(() => {
    const getUsers = async () => {
      const { data, error } = await supabase.from('users').select('id, name');

      const object = data.reduce(
        (obj, item) =>
          Object.assign(obj, {
            [item.id]: item.name,
          }),
        {}
      );
      setUsers(object);
    };
    getUsers();
  }, []);

  const handleGetSalesStats = async () => {
    try {
      setIsSalesLoading(true);
      let formatedFromDate = '';
      let formatedToDate = '';
      if (salesFromDate && salesToDate) {
        console.log(salesFromDate);
        const fromDateDay = salesFromDate.month();
        const fromDateMonth = salesFromDate.date();
        const fromDateYear = salesFromDate.year();

        const toDateDay = salesToDate.day();
        const toDateMonth = salesToDate.month();
        const toDateYear = salesToDate.year();

        formatedFromDate = salesFromDate.toISOString().split('T')[0];
        formatedToDate = salesToDate.toISOString().split('T')[0];
        console.log('from:', formatedFromDate);
        console.log('to:', formatedToDate);
      }
      if (salesBy === 'wilaya') {
        if (salesFromDate && salesToDate) {
          const { data, error } = await supabase.rpc('get_sales_by_province_with_date_range', {
            date1: formatedFromDate,
            date2: formatedToDate,
          });

          if (data) {
            console.log('sales: ', data);
            setSalesByX(data);
          }
        } else {
          const { data, error } = await supabase.rpc('get_sales_by_province');

          if (data) {
            console.log('sales: ', data);
            setSalesByX(data);
          }
        }
      } else if (salesBy === 'product') {
        if (salesFromDate && salesToDate) {
          const { data, error } = await supabase.rpc('get_sales_by_product_with_date_range', {
            date1: formatedFromDate,
            date2: formatedToDate,
          });

          if (data) {
            console.log('sales: ', data);
            setSalesByX(data);
          }
        } else {
          const { data, error } = await supabase.rpc('get_sales_by_product');

          if (data) {
            console.log('sales: ', data);
            setSalesByX(data);
          }
        }
      } else if (salesBy === 'agent') {
        if (salesFromDate && salesToDate) {
          const { data, error } = await supabase.rpc('get_sales_by_agent_with_date_range', {
            date1: formatedFromDate,
            date2: formatedToDate,
          });

          if (data) {
            const agents = data.map((item) => ({ key: users[item.key], value: item.value }));
            setSalesByX(agents);
          }
        } else {
          const { data, error } = await supabase.rpc('get_sales_by_agent');

          if (data) {
            const agents = data.map((item) => ({ key: users[item.key], value: item.value }));
            setSalesByX(agents);
          }
        }
      }
      setIsSalesLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleGetDeliveryRatesStats = async () => {
    try {
      setIsDeliveryRateLoading(true);
      let formatedFromDate = '';
      let formatedToDate = '';
      if (deliveryRateFromDate && deliveryRateToDate) {
        console.log(deliveryRateFromDate);
        const fromDateDay = deliveryRateFromDate.month();
        const fromDateMonth = deliveryRateFromDate.date();
        const fromDateYear = deliveryRateFromDate.year();

        const toDateDay = deliveryRateToDate.day();
        const toDateMonth = deliveryRateToDate.month();
        const toDateYear = deliveryRateToDate.year();

        formatedFromDate = deliveryRateFromDate.toISOString().split('T')[0];
        formatedToDate = deliveryRateToDate.toISOString().split('T')[0];
        console.log('from:', formatedFromDate);
        console.log('to:', formatedToDate);
      }
      let dataOrders;
      let dataDelivered;
      if (deliveryRatesBy === 'wilaya') {
        if (deliveryRateFromDate && deliveryRateToDate) {
          const { data: dataO, error: errorO } = await supabase.rpc('get_orders_by_wilaya_with_date_range', {
            date1: formatedFromDate,
            date2: formatedToDate,
          });
          const { data: dataD, error: errorD } = await supabase.rpc('get_delivered_count_by_wilaya_with_date_range', {
            date1: formatedFromDate,
            date2: formatedToDate,
          });
          if (dataD && dataO) {
            dataOrders = dataO;
            dataDelivered = dataD;
          }
        } else {
          const { data: dataO, error: errorO } = await supabase.rpc('get_orders_by_wilaya');
          const { data: dataD, error: errorD } = await supabase.rpc('get_delivered_count_by_wilaya');
          if (dataD && dataO) {
            dataOrders = dataO;
            dataDelivered = dataD;
          }
        }
      } else if (deliveryRatesBy === 'product') {
        if (deliveryRateFromDate && deliveryRateToDate) {
          const { data: dataO, error: errorO } = await supabase.rpc('get_orders_by_product_with_date_range', {
            date1: formatedFromDate,
            date2: formatedToDate,
          });
          const { data: dataD, error: errorD } = await supabase.rpc('get_delivered_count_by_product_with_date_range', {
            date1: formatedFromDate,
            date2: formatedToDate,
          });
          if (dataD && dataO) {
            dataOrders = dataO;
            dataDelivered = dataD;
          }
        } else {
          const { data: dataO, error: errorO } = await supabase.rpc('get_orders_by_product');
          const { data: dataD, error: errorD } = await supabase.rpc('get_delivered_count_by_product');
          if (dataD && dataO) {
            dataOrders = dataO;
            dataDelivered = dataD;
          }
        }
      } else if (deliveryRatesBy === 'tracker') {
        if (deliveryRateFromDate && deliveryRateToDate) {
          const { data: dataO, error: errorO } = await supabase.rpc('get_orders_by_tracker_with_date_range', {
            date1: formatedFromDate,
            date2: formatedToDate,
          });
          const { data: dataD, error: errorD } = await supabase.rpc('get_delivered_count_by_tracker_with_date_range', {
            date1: formatedFromDate,
            date2: formatedToDate,
          });
          if (dataD && dataO) {
            dataOrders = dataO;
            dataDelivered = dataD;
          }
        } else {
          const { data: dataO, error: errorO } = await supabase.rpc('get_orders_by_tracker');
          const { data: dataD, error: errorD } = await supabase.rpc('get_delivered_count_by_tracker');
          if (dataD && dataO) {
            dataOrders = dataO;
            dataDelivered = dataD;
          }
        }
      } else if (deliveryRatesBy === 'agent') {
        if (deliveryRateFromDate && deliveryRateToDate) {
          const { data: dataO, error: errorO } = await supabase.rpc('get_orders_by_agent_with_date_range', {
            date1: formatedFromDate,
            date2: formatedToDate,
          });
          const { data: dataD, error: errorD } = await supabase.rpc('get_delivered_count_by_agent_with_date_range', {
            date1: formatedFromDate,
            date2: formatedToDate,
          });
          if (dataD && dataO) {
            dataOrders = dataO;
            dataDelivered = dataD;
          }
        } else {
          const { data: dataO, error: errorO } = await supabase.rpc('get_orders_by_agent');
          const { data: dataD, error: errorD } = await supabase.rpc('get_delivered_count_by_agent');
          if (dataD && dataO) {
            dataOrders = dataO;
            dataDelivered = dataD;
          }
        }
      }
      if (dataOrders && dataDelivered) {
        let deliveryRate;
        const countOrders = dataOrders.map((item) => item.value);
        setDeliveryRatesCountByX(countOrders);
        if (deliveryRatesBy === 'agent' || deliveryRatesBy === 'tracker') {
          deliveryRate = dataOrders.map((item, i) => ({
            key: users[item.key],
            value: +((dataDelivered[i].value / item.value) * 100).toFixed(2),
          }));
        } else {
          console.log('or:', dataOrders);
          console.log('dr:', dataDelivered);
          let obj;
          // deliveryRate = dataOrders.map((item, i) => {

          // });
          deliveryRate = dataOrders.map((item, i) => {
            const correspondingDeliveredItem = dataDelivered.filter((itemD) => itemD.key === item.key);
            // console.log('the corresponding item is ', correspondingDeliveredItem);
            if (correspondingDeliveredItem.length === 0) {
              return {
                key: item.key,
                value: 0,
              };
            }
            return {
              key: item.key,
              value: +((correspondingDeliveredItem[0].value / item.value) * 100).toFixed(2),
            };
          });

          console.log('obj:', deliveryRate);
        }
        console.log('delivery rates: ', deliveryRate);
        const drKey = deliveryRate.map((dr) => dr.key);
        const drVal = deliveryRate.map((dr) => dr.value);
        setDeliveryRateKeyByX(drKey);
        setDeliveryRatesValueByX(drVal);
        setDeliveryRatesByX(deliveryRate);
      }
      setIsDeliveryRateLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleGetConfirmationRatesStats = async () => {
    try {
      setIsConfirmationRateLoading(true);
      let formatedFromDate = '';
      let formatedToDate = '';
      if (confirmationRateFromDate && confirmationRateToDate) {
        console.log(confirmationRateFromDate);
        const fromDateDay = confirmationRateFromDate.month();
        const fromDateMonth = confirmationRateFromDate.date();
        const fromDateYear = confirmationRateFromDate.year();

        const toDateDay = confirmationRateToDate.day();
        const toDateMonth = confirmationRateToDate.month();
        const toDateYear = confirmationRateToDate.year();

        formatedFromDate = confirmationRateFromDate.toISOString().split('T')[0];
        formatedToDate = confirmationRateToDate.toISOString().split('T')[0];
        console.log('from:', formatedFromDate);
        console.log('to:', formatedToDate);
      }

      let dataOrders;
      let dataConfirmed;

      if (confirmationRatesBy === 'agent' && confirmationRateFromDate && confirmationRateToDate) {
        const { data: dataO, error: errorO } = await supabase.rpc('get_leads_by_agent_with_date_range', {
          date1: formatedFromDate,
          date2: formatedToDate,
        });
        const { data: dataD, error: errorD } = await supabase.rpc('get_confirmed_count_by_agent_with_date_range', {
          date1: formatedFromDate,
          date2: formatedToDate,
        });
        if (dataD && dataO) {
          dataOrders = dataO;
          dataConfirmed = dataD;
          console.log(dataO);
        }
      } else if ((confirmationRatesBy === 'agent' && !confirmationRateFromDate) || !confirmationRateToDate) {
        const { data: dataO, error: errorO } = await supabase.rpc('get_leads_by_agent');
        const { data: dataD, error: errorD } = await supabase.rpc('get_confirmed_count_by_agent');
        if (dataD && dataO) {
          dataOrders = dataO;
          dataConfirmed = dataD;
        }
      } else if (confirmationRatesBy === 'product' && confirmationRateFromDate && confirmationRateToDate) {
        const { data: dataO, error: errorO } = await supabase.rpc('get_leads_by_product_with_date_range', {
          date1: formatedFromDate,
          date2: formatedToDate,
        });
        const { data: dataD, error: errorD } = await supabase.rpc('get_confirmed_count_by_product_with_date_range', {
          date1: formatedFromDate,
          date2: formatedToDate,
        });
        if (dataD && dataO) {
          dataOrders = dataO;
          dataConfirmed = dataD;
        }
      } else if ((confirmationRatesBy === 'product' && !confirmationRateFromDate) || !confirmationRateToDate) {
        const { data: dataO, error: errorO } = await supabase.rpc('get_leads_by_product');
        const { data: dataD, error: errorD } = await supabase.rpc('get_confirmed_count_by_product');
        if (dataD && dataO) {
          dataOrders = dataO;
          dataConfirmed = dataD;
        }
      }
      console.log('data order', dataOrders);
      if (dataOrders && dataConfirmed) {
        let confirmationRate;
        if (confirmationRatesBy === 'agent') {
          confirmationRate = dataOrders.map((item, i) => ({
            key: users[item.key],
            value: +((dataConfirmed[i].value / item.value) * 100).toFixed(2),
          }));
        } else {
          console.log('or:', dataOrders);
          console.log('dr:', dataConfirmed);
          let obj;
          // ConfirmationRate = dataOrders.map((item, i) => {

          // });
          confirmationRate = dataOrders.map((item, i) => {
            const correspondingDeliveredItem = dataConfirmed.filter((itemD) => itemD.key === item.key);
            // console.log('the corresponding item is ', correspondingDeliveredItem);
            if (correspondingDeliveredItem.length === 0) {
              return {
                key: item.key,
                value: 0,
              };
            }
            return {
              key: item.key,
              value: +((correspondingDeliveredItem[0].value / item.value) * 100).toFixed(2),
            };
          });

          console.log('obj:', confirmationRate);
        }
        console.log('Confirmation rates: ', confirmationRate);
        setConfirmationRatesByX(confirmationRate);
      }
      setIsConfirmationRateLoading(false);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <Helmet>
        <title> Dashboard </title>
      </Helmet>

      <Container maxWidth="xl">
        <Grid container spacing={3}>
          <Grid item xs={12} md={12} lg={12}>
            <Typography variant="h3" mb={3}>
              Confirmation rate stats
            </Typography>
            <Stack direction={{ sm: 'row' }} spacing={3} marginBottom={1}>
              <Select
                value={confirmationRatesBy}
                fullWidth
                sx={{ marginBottom: [2, 0] }}
                label="confirmation rate by"
                onChange={(e) => setConfirmationRatesBy(e.target.value)}
              >
                <MenuItem value="agent">Agent</MenuItem>
                <MenuItem value="product">Product</MenuItem>
              </Select>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="From"
                  value={confirmationRateFromDate}
                  onChange={(newValue) => {
                    setConfirmationRateFromDate(newValue);
                  }}
                  renderInput={(params) => <TextField sx={{ marginBottom: [2, 0] }} fullWidth {...params} />}
                />
              </LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="To"
                  value={confirmationRateToDate}
                  onChange={(newValue) => {
                    setConfirmationRateToDate(newValue);
                  }}
                  renderInput={(params) => <TextField sx={{ marginBottom: [2, 0] }} fullWidth {...params} />}
                />
              </LocalizationProvider>

              <LoadingButton
                sx={{ marginBottom: 2 }}
                loading={isConfirmationRateLoading}
                fullWidth
                variant={'contained'}
                onClick={handleGetConfirmationRatesStats}
              >
                Get stats
              </LoadingButton>
            </Stack>

            <AppConversionRates
              title={`Confirmation Rates by ${confirmationRatesBy}`}
              subheader={`Confirmation Rates by ${confirmationRatesBy} (in %)`}
              chartData={confirmationRatesByX.map((dr, i) => ({ label: dr.key, value: dr.value }))}
            />
          </Grid>
          <Grid item xs={12} md={12} lg={12}>
            <Typography variant="h3" mb={3}>
              Derlivery rate stats
            </Typography>
            <Stack direction={{ sm: 'row' }} width={'100%'} spacing={3} marginBottom={1}>
              <Select
                size="small"
                value={deliveryRatesBy}
                fullWidth
                sx={{ marginBottom: [2, 0] }}
                label="sales by"
                onChange={(e) => setDeliveryRatesBy(e.target.value)}
              >
                <MenuItem value="agent">Agent</MenuItem>
                <MenuItem value="wilaya">Wilaya</MenuItem>
                <MenuItem value="tracker">Tracker</MenuItem>
                <MenuItem value="product">Product</MenuItem>
              </Select>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="From"
                  value={deliveryRateFromDate}
                  onChange={(newValue) => {
                    setDeliveryRateFromDate(newValue);
                  }}
                  renderInput={(params) => <TextField sx={{ marginBottom: [2, 0] }} fullWidth {...params} />}
                />
              </LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="To"
                  value={deliveryRateToDate}
                  onChange={(newValue) => {
                    setDeliveryRateToDate(newValue);
                  }}
                  renderInput={(params) => <TextField sx={{ marginBottom: [2, 0] }} fullWidth {...params} />}
                />
              </LocalizationProvider>
              <LoadingButton
                loading={isDeliveryRateLoading}
                fullWidth
                variant={'contained'}
                onClick={handleGetDeliveryRatesStats}
              >
                Get stats
              </LoadingButton>
            </Stack>
            <AppDoubleChart
              title={`Delivery Rates by ${deliveryRatesBy}`}
              subheader={`Delivery Rates by ${deliveryRatesBy} (in %)`}
              chartLabels={deliveryRatesKeyByX}
              chartData={[
                {
                  name: 'Delivery rate',
                  type: 'column',
                  fill: 'solid',
                  data: deliveryRatesValueByX,
                },
                {
                  name: 'Orders',
                  type: 'area',
                  fill: 'gradient',
                  data: deliveryRatesCountByX,
                },
              ]}
            />
            {/* 
            <AppConversionRates
              title={`Delivery Rates by ${deliveryRatesBy}`}
              subheader={`Delivery Rates by ${deliveryRatesBy} (in %)`}
              chartData={deliveryRatesByX.map((dr, i) => ({ label: dr.key, value: dr.value }))}
            /> */}
          </Grid>

          <Grid item xs={12} md={12} lg={12}>
            <Typography variant="h3" mb={3}>
              Sales stats
            </Typography>
            <Stack direction={{ sm: 'row' }} sx={{ width: ['100%'] }} spacing={3} marginBottom={1}>
              <Select
                size="small"
                value={salesBy}
                fullWidth
                sx={{ marginBottom: [2, 0] }}
                label="sales by"
                onChange={(e) => setSalesBy(e.target.value)}
              >
                <MenuItem value="wilaya">Wilaya</MenuItem>
                <MenuItem value="agent">Agent</MenuItem>
                <MenuItem value="product">Product</MenuItem>
              </Select>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="From"
                  value={salesFromDate}
                  onChange={(newValue) => {
                    setSalesFromDate(newValue);
                  }}
                  renderInput={(params) => <TextField sx={{ marginBottom: [2, 0] }} fullWidth {...params} />}
                />
              </LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="To"
                  value={salesToDate}
                  onChange={(newValue) => {
                    setSalesToDate(newValue);
                  }}
                  renderInput={(params) => <TextField sx={{ marginBottom: [2, 0] }} fullWidth {...params} />}
                />
              </LocalizationProvider>
              <LoadingButton loading={isSalesLoading} fullWidth variant={'contained'} onClick={handleGetSalesStats}>
                Get stats
              </LoadingButton>
            </Stack>
            <AppDoubleChart
              title={`Sales by ${salesBy}`}
              subheader={`Total sales by ${salesBy} (in DA)`}
              chartLabels={salesByX.map((sale) => sale.key)}
              chartData={[
                {
                  name: 'Sales',
                  type: 'column',
                  fill: 'solid',
                  data: salesByX.map((sale) => sale.value),
                },
              ]}
            />
            {/* <AppConversionRates
              title={`Sales by ${salesBy}`}
              subheader={`Total sales by ${salesBy} (in DA)`}
              chartData={salesByX.map((sale, i) => ({ label: sale.key, value: sale.value }))}
            /> */}
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
