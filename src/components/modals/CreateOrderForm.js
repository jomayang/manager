import { DesktopDatePicker } from '@mui/lab';
import {
  Button,
  FormControl,
  FormControlLabel,
  FormGroup,
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
import { wilayas } from './wilayas';
import { agencies } from './agencies';

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
  const [phone, setPhone] = useState('');
  const [product, setProduct] = useState('');

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const createLead = async (e) => {
    e.preventDefault();
    try {
      console.log({ first_name: firstName, last_name: lastName, address, phone, wilaya, commune, product });
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
        setFeedback('A new lead added!');
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
    const fetch = async () => {
      if (wilaya !== '') {
        const getCommunes = await axios({
          url: `https://province-api.onrender.com/`,
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          data: {
            wilaya,
          },
        });
        setCommunes(getCommunes.data.communes);
        console.log('the new communes: ', getCommunes.data);
      }
    };
    fetch();
  }, [wilaya]);

  return (
    <form onSubmit={createLead}>
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
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormControl fullWidth>
            <InputLabel>Wilaya</InputLabel>
            <Select value={wilaya} label="Wilaya" onChange={(e) => setWilaya(e.target.value)}>
              {wilayas.map((wil) => (
                <MenuItem value={wil.value}>{wil.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Commune</InputLabel>
            <Select value={commune} label="Commune" onChange={(e) => setCommune(e.target.value)}>
              {communes.map((com) => (
                <MenuItem value={com.value}>{com.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {isStopDesk && (
            <FormControl fullWidth>
              <InputLabel>Agency</InputLabel>
              <Select value={agency} label="Agency" onChange={(e) => setAgency(e.target.value)}>
                {agencies[wilaya].map((wil) => (
                  <MenuItem value={wil.value}>{wil.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
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
