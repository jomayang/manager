import {
  Button,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import React, { forwardRef, useEffect, useState } from 'react';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { agencies } from './agencies';
import supabase from '../../config/SupabaseClient';
import { wilayas } from './wilayas';

const Alert = forwardRef((props, ref) => {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function EditLeadForm({ id }) {
  const [open, setOpen] = useState(false);
  const [isStopDesk, setIsStopDesk] = useState(false);
  const [shippingPrice, setShippingPrice] = useState(0);
  const [productPrice, setProductPrice] = useState(0);
  const [isError, setIsError] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [currentLead, setCurrentLead] = useState(null);
  const [status, setStatus] = useState('initial');
  const [agency, setAgency] = useState(null);
  const [comment, setComment] = useState('');
  const [communes, setCommunes] = useState([]);
  const [commune, setCommune] = useState('');
  const [address, setAddress] = useState('');
  const [wilaya, setWilaya] = useState('');
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const { data, error } = await supabase.from('leads').select().eq('id', id).single();

        if (data) {
          console.log('the data is: ', data.wilaya);
          setCurrentLead(data);
          console.log('some: ', agencies[data.wilaya]);
        }

        if (error) {
          console.log('something went wrong: ', error);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchLead();
  }, []);

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

  const updateStatus = async (e) => {
    e.preventDefault();
    try {
      const { data: dataUpdate, error: errorUpdate } = await supabase
        .from('leads')
        .update({ status, comment })
        .select()
        .eq('id', id);

      if (dataUpdate) {
        console.log('--->', dataUpdate);
        setFeedback('lead status updated successfully!');
        setIsError(false);
      }

      if (errorUpdate) {
        console.log(errorUpdate);
        setFeedback('a Problem accured when updating the Lead!');
        setIsError(true);
      }

      if (status === 'confirmed') {
        const { data: dataInsert, error: errorInsert } = await supabase
          .from('orders')
          .insert({
            first_name: currentLead.first_name,
            last_name: currentLead.last_name,
            address,
            phone: currentLead.phone,
            wilaya,
            commune,
            product: currentLead.product,
            is_stopdesk: isStopDesk,
            is_free_shipping: true,
            stopdesk: agency,
            product_price: productPrice,
            shipping_price: shippingPrice,
          })
          .select();

        if (dataInsert) {
          console.log('inserted: ', dataInsert);
        }

        if (dataInsert && dataUpdate) {
          setFeedback('the order has been confirmed!');
          setIsError(false);
        }

        if (errorInsert) {
          console.log('oops: ', errorInsert);
          setFeedback('a Problem accured when adding the new Order!');
          setIsError(true);
        }
      }
      setOpen(true);
    } catch (error) {
      console.log('something went wrong: ', error);
      setFeedback('a Problem accured!');
      setIsError(true);
    }
  };
  return (
    <form onSubmit={updateStatus}>
      <Stack spacing={3} style={{ marginTop: 30 }}>
        <Stack spacing={3}>
          <Stack spacing={3}>
            <FormControl>
              <InputLabel>Status</InputLabel>
              <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
                <MenuItem value={'initial'}>Initial</MenuItem>
                <MenuItem value={'confirmed'}>Confirmed</MenuItem>
                <MenuItem value={'not-responding'}>Not Responding</MenuItem>
                <MenuItem value={'unreachable'}>Unreachable</MenuItem>
                <MenuItem value={'canceled'}>Canceled</MenuItem>
                <MenuItem value={'busy'}>Busy</MenuItem>
                <MenuItem value={'reported'}>Reported</MenuItem>
                <MenuItem value={'other'}>other</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <TextField name="comment" label="Comment" value={comment} onChange={(e) => setComment(e.target.value)} />
            </FormControl>
          </Stack>
          {status === 'confirmed' && (
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Wilaya</InputLabel>
                  <Select value={wilaya} label="Wilaya" onChange={(e) => setWilaya(e.target.value)}>
                    {wilayas.map((wil) => (
                      <MenuItem value={wil.value}>{wil.label}</MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{currentLead.wilaya}</FormHelperText>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Commune</InputLabel>
                  <Select value={commune} label="Commune" onChange={(e) => setCommune(e.target.value)}>
                    {communes.map((com) => (
                      <MenuItem value={com.value}>{com.label}</MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{currentLead.commune}</FormHelperText>
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
                {isStopDesk && (
                  <FormControl>
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
                  <TextField
                    name="address"
                    label="Address"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                    }}
                  />
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
            </Stack>
          )}
        </Stack>
        <Stack>
          <Button type="submit" fullWidth size="large" variant="contained">
            Update
          </Button>
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

export default EditLeadForm;
