import { Helmet } from 'react-helmet-async';
import { faker } from '@faker-js/faker';
// @mui
import { Stack } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import { useContext, useEffect, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { useNavigate } from 'react-router-dom';
import { Grid, Container, Typography, Select, MenuItem, Button } from '@mui/material';
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
  const [deliveryRatesBy, setDeliveryRatesBy] = useState('agent');
  const [confirmationRatesByX, setConfirmationRatesByX] = useState([]);
  const [confirmationRatesBy, setConfirmationRatesBy] = useState('agent');
  const [users, setUsers] = useState([]);
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
          const deliveryRate = dataOrders.map((item, i) => ({
            key: users[item.key],
            value: +((dataDelivered[i].value / item.value) * 100).toFixed(2),
          }));
          console.log(deliveryRate);
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
      if (salesBy === 'wilaya') {
        const { data, error } = await supabase.rpc('get_sales_by_province');

        if (data) {
          console.log('sales: ', data);
          setSalesByX(data);
        }
      } else if (salesBy === 'product') {
        const { data, error } = await supabase.rpc('get_sales_by_product');

        if (data) {
          console.log('sales: ', data);
          setSalesByX(data);
        }
      } else if (salesBy === 'agent') {
        const { data, error } = await supabase.rpc('get_sales_by_agent');

        if (data) {
          const agents = data.map((item) => ({ key: users[item.key], value: item.value }));
          setSalesByX(agents);
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
      let dataOrders;
      let dataDelivered;
      if (deliveryRatesBy === 'wilaya') {
        const { data: dataO, error: errorO } = await supabase.rpc('get_orders_by_wilaya');
        const { data: dataD, error: errorD } = await supabase.rpc('get_delivered_count_by_wilaya');
        if (dataD && dataO) {
          dataOrders = dataO;
          dataDelivered = dataD;
        }
      } else if (deliveryRatesBy === 'product') {
        const { data: dataO, error: errorO } = await supabase.rpc('get_orders_by_product');
        const { data: dataD, error: errorD } = await supabase.rpc('get_delivered_count_by_product');
        if (dataD && dataO) {
          dataOrders = dataO;
          dataDelivered = dataD;
        }
      } else if (deliveryRatesBy === 'tracker') {
        const { data: dataO, error: errorO } = await supabase.rpc('get_orders_by_tracker');
        const { data: dataD, error: errorD } = await supabase.rpc('get_delivered_count_by_tracker');
        if (dataD && dataO) {
          dataOrders = dataO;
          dataDelivered = dataD;
        }
      } else if (deliveryRatesBy === 'agent') {
        const { data: dataO, error: errorO } = await supabase.rpc('get_orders_by_agent');
        const { data: dataD, error: errorD } = await supabase.rpc('get_delivered_count_by_agent');
        if (dataD && dataO) {
          dataOrders = dataO;
          dataDelivered = dataD;
        }
      }
      if (dataOrders && dataDelivered) {
        let deliveryRate;
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
      let dataOrders;
      let dataConfirmed;
      if (confirmationRatesBy === 'agent') {
        const { data: dataO, error: errorO } = await supabase.rpc('get_leads_by_agent');
        const { data: dataD, error: errorD } = await supabase.rpc('get_confirmed_count_by_agent');
        if (dataD && dataO) {
          dataOrders = dataO;
          dataConfirmed = dataD;
        }
      } else if (confirmationRatesBy === 'product') {
        const { data: dataO, error: errorO } = await supabase.rpc('get_leads_by_product');
        const { data: dataD, error: errorD } = await supabase.rpc('get_confirmed_count_by_product');
        if (dataD && dataO) {
          dataOrders = dataO;
          dataConfirmed = dataD;
        }
      }

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
            <Stack direction="row" width={'50%'} spacing={3} marginBottom={1}>
              <Select
                size="small"
                value={confirmationRatesBy}
                fullWidth
                label="confirmation rate by"
                onChange={(e) => setConfirmationRatesBy(e.target.value)}
              >
                <MenuItem value="agent">Agent</MenuItem>
                <MenuItem value="product">Product</MenuItem>
              </Select>
              <LoadingButton
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
            <Stack direction="row" width={'50%'} spacing={3} marginBottom={1}>
              <Select
                size="small"
                value={deliveryRatesBy}
                fullWidth
                label="sales by"
                onChange={(e) => setDeliveryRatesBy(e.target.value)}
              >
                <MenuItem value="agent">Agent</MenuItem>
                <MenuItem value="wilaya">Wilaya</MenuItem>
                <MenuItem value="tracker">Tracker</MenuItem>
                <MenuItem value="product">Product</MenuItem>
              </Select>
              <LoadingButton
                loading={isDeliveryRateLoading}
                fullWidth
                variant={'contained'}
                onClick={handleGetDeliveryRatesStats}
              >
                Get stats
              </LoadingButton>
            </Stack>

            <AppConversionRates
              title={`Delivery Rates by ${deliveryRatesBy}`}
              subheader={`Delivery Rates by ${deliveryRatesBy} (in %)`}
              chartData={deliveryRatesByX.map((dr, i) => ({ label: dr.key, value: dr.value }))}
            />
          </Grid>

          <Grid item xs={12} md={12} lg={12}>
            <Typography variant="h3" mb={3}>
              Sales stats
            </Typography>
            <Stack direction="row" width={'50%'} spacing={3} marginBottom={1}>
              <Select
                size="small"
                value={salesBy}
                fullWidth
                label="sales by"
                onChange={(e) => setSalesBy(e.target.value)}
              >
                <MenuItem value="wilaya">Wilaya</MenuItem>
                <MenuItem value="agent">Agent</MenuItem>
                <MenuItem value="product">Product</MenuItem>
              </Select>
              <LoadingButton loading={isSalesLoading} fullWidth variant={'contained'} onClick={handleGetSalesStats}>
                Get stats
              </LoadingButton>
            </Stack>

            <AppConversionRates
              title={`Sales by ${salesBy}`}
              subheader={`Total sales by ${salesBy} (in DA)`}
              chartData={salesByX.map((sale, i) => ({ label: sale.key, value: sale.value }))}
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
