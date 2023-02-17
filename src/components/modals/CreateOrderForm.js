import { DesktopDatePicker } from '@mui/lab';
import {
  Button,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Snackbar,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { Stack } from '@mui/system';
import React, { forwardRef, useEffect, useState } from 'react';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import axios from 'axios';
import { Link } from 'react-router-dom';
import supabase from '../../config/SupabaseClient';
import { wilayas } from '../../data/wilayas';
import { agencies } from '../../data/agencies';
import { fees } from '../../data/fees';
import { communesList } from '../../data/communes';
import { communesStopdesk } from '../../data/communesStopdesk';

const Alert = forwardRef((props, ref) => {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function CreateOrderForm() {
  const [open, setOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [communes, setCommunes] = useState([]);
  const [commune, setCommune] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [address, setAddress] = useState('');
  const [agency, setAgency] = useState('');
  const [isStopDesk, setIsStopDesk] = useState(false);
  const [isFreeShipping, setIsFreeShipping] = useState(true);
  const [productPrice, setProductPrice] = useState(0);
  const [shippingPrice, setShippingPrice] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(null);
  const [phone, setPhone] = useState('');
  const [product, setProduct] = useState('');

  const [trackers, setTrackers] = useState([]);
  const [trackersCount, setTrackersCount] = useState(0);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const createOrder = async (e) => {
    e.preventDefault();
    try {
      let trackerId;
      if (trackersCount !== 0) {
        trackerId = trackers[Math.floor(Math.random() * trackersCount)].id;
      } else {
        trackerId = null;
      }
      console.log('choosen tracker is: ', trackerId, 'count:', trackersCount);
      console.log({
        firstName,
        lastName,
        address,
        phone,
        wilaya,
        commune,
        product,
        isStopDesk,
        isFreeShipping: true,
        stopdesk: agency,
        price: productPrice + shippingPrice,
      });
      const response = await axios({
        url: `https://ecom-api-5wlr.onrender.com/create/`,
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        data: {
          firstName,
          lastName,
          address,
          phone,
          wilaya,
          commune,
          product,
          isStopDesk,
          isFreeShipping: true,
          stopdesk: agency,
          orderId: trackerId,
          price: productPrice + shippingPrice,
        },
      });
      const { data: dataTracker, error: errorTracker } = await supabase.from('followups').insert({
        tracking: response.data[`order_${trackerId}`].tracking,
        is_handled_out: false,
        is_handled_missed: false,
        is_handled_center: false,
        is_handled_received: false,
        tracker_id: trackerId,
      });
      if (errorTracker) {
        console.log('error tracker: ', errorTracker);
      }
      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            first_name: firstName,
            last_name: lastName,
            address,
            phone,
            wilaya,
            commune,
            product,
            is_stopdesk: isStopDesk,
            is_free_shipping: true,
            product_price: productPrice,
            shipping_price: shippingPrice,
            stopdesk: agency,
            tracking_id: response.data[`order_${trackerId}`].tracking,
            delivery_fees: deliveryFee,
            tracker_id: trackerId,
          },
        ])
        .select();

      if (error) {
        console.log('something went wrong', error);
        setFeedback('a Problem accured when adding the new Lead!');
        setIsError(true);
      }

      if (data) {
        console.log('added successfully', data);
        // setIdentifier(id);
        setIsError(false);
        setFeedback('A new order added!');
      }
      setOpen(true);
    } catch (error) {
      setFeedback('a Problem accured when adding the new Lead!');
      setIsError(true);
      setOpen(true);
      console.log('something went wrong in try catch', error);
    }
  };

  useEffect(() => {
    if (wilaya !== '') {
      console.log('wilaya', wilayas);
      console.log('communes', communesStopdesk[wilaya]);
      console.log('communes', communesList[wilaya]);
      if (isStopDesk) {
        setCommunes(communesStopdesk[wilaya]);
        console.log('fee: ', fees[wilaya].deskFee);
        setDeliveryFee(fees[wilaya].deskFee);
      } else {
        setCommunes(communesList[wilaya]);
        console.log('fee: ', fees[wilaya].homeFee);
        setDeliveryFee(fees[wilaya].homeFee);
      }
    }
  }, [wilaya, isStopDesk]);

  useEffect(() => {
    const fetchTrackers = async () => {
      try {
        const { data, error } = await supabase.from('users').select('*').eq('role', 'tracker');

        if (data) {
          console.log('the data tracker: ', data);
          setTrackers(data);
          setTrackersCount(data.length);
        }

        if (error) {
          console.log('something went wrong ', error);
        }
      } catch (error) {
        console.log('catched an error ', error);
      }
    };

    fetchTrackers();
  }, []);

  return (
    <form onSubmit={createOrder}>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ marginTop: '1rem' }}>
          <FormControl fullWidth>
            <TextField
              name="firstName"
              label="first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </FormControl>
          <FormControl fullWidth>
            <TextField
              name="lastname"
              label="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </FormControl>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormControl fullWidth>
            <TextField name="phone" label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Product</InputLabel>
            <Select value={product} label="product" onChange={(e) => setProduct(e.target.value)}>
              <MenuItem value={'prod-1'}>Product 1</MenuItem>
              <MenuItem value={'prod-2'}>Product 2</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Stack spacing={3}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Wilaya</InputLabel>
              <Select value={wilaya} label="Wilaya" onChange={(e) => setWilaya(e.target.value)}>
                {wilayas.map((wil, i) => (
                  <MenuItem key={i} value={wil.value}>
                    {wil.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Commune</InputLabel>
              <Select value={commune} label="Commune" onChange={(e) => setCommune(e.target.value)}>
                {communes.map((com, i) => (
                  <MenuItem key={i} value={com.value} disabled={!com.isDeliverable}>
                    {com.label} {!com.isDeliverable && '(Undeliverable)'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <Stack spacing={3}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={isStopDesk}
                    onChange={(e) => setIsStopDesk(e.target.checked)}
                    inputProps={{ 'aria-label': 'controlled' }}
                  />
                }
                label="Stop desk"
              />
            </FormGroup>
            {isStopDesk && commune ? (
              <FormControl>
                <InputLabel>Agency</InputLabel>
                <Select value={agency} label="Agency" onChange={(e) => setAgency(e.target.value)}>
                  {/* {agencies[commune].map((wil, i) => ( */}
                  <MenuItem value={agencies[commune].value}>{agencies[commune].label}</MenuItem>
                  {/* ))} */}
                </Select>
              </FormControl>
            ) : (
              <></>
            )}
          </Stack>
        </Stack>
        <Stack>
          <FormControl fullWidth>
            <TextField name="address" label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </FormControl>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ marginTop: '1rem' }}>
          <FormControl fullWidth>
            <TextField
              name="product-price"
              label="Product price"
              inputProps={{ type: 'number' }}
              InputProps={{
                endAdornment: <InputAdornment position="end">DA</InputAdornment>,
              }}
              value={productPrice}
              onChange={(e) => {
                setProductPrice(+e.target.value);
              }}
            />
          </FormControl>
          <FormControl fullWidth>
            <TextField
              name="shipping-price"
              label="Shipping price"
              inputProps={{ type: 'number' }}
              InputProps={{
                endAdornment: <InputAdornment position="end">DA</InputAdornment>,
              }}
              value={shippingPrice}
              onChange={(e) => setShippingPrice(+e.target.value)}
            />
          </FormControl>
          {/* <Stack> */}
          {/* </Stack> */}
        </Stack>
        <Stack>
          <Typography variant="p" component="p" style={{ fontSize: '13px', marginBottom: 8, color: '#666' }}>
            {deliveryFee && <span>Delivery Fees: {deliveryFee} DA</span>}
          </Typography>
          <Typography variant="p" component="p" style={{ fontSize: '13px' }}>
            Total: {(productPrice + shippingPrice).toFixed(2)} DA
          </Typography>
        </Stack>
        <Stack>
          {firstName === '' ||
          lastName === '' ||
          phone === '' ||
          wilaya === '' ||
          commune === '' ||
          productPrice === 0 ? (
            <Button fullWidth size="large" variant="contained" disabled>
              Add Order
            </Button>
          ) : (
            <Button type="submit" fullWidth size="large" variant="contained">
              Add Order
            </Button>
          )}
        </Stack>
      </Stack>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity={isError ? 'error' : 'success'} sx={{ width: '100%' }}>
          {feedback} {!isError && <Link to={`/dashboard/patient/`}>(click here)</Link>}
        </Alert>
      </Snackbar>
    </form>
  );
}

export default CreateOrderForm;
