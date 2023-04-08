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
import React, { forwardRef, useContext, useEffect, useState } from 'react';
import MuiAlert from '@mui/material/Alert';
import { LoadingButton } from '@mui/lab';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { agencies } from '../../data/agencies';
import supabase from '../../config/SupabaseClient';
import { wilayas } from '../../data/wilayas';
import { communesList } from '../../data/communes';
import { communesStopdesk } from '../../data/communesStopdesk';
import { fees } from '../../data/fees';
import { UserContext } from '../../context/UserContext';
import { zone0, zone1, zone2, zone3, zone4, zone5, zone6 } from '../../data/comFees';

const Alert = forwardRef((props, ref) => <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />);

function EditLeadForm({
  id,
  communeAttr,
  wilayaAttr,
  addressAttr,
  productAttr,
  firstNameAttr,
  lastNameAttr,
  commentAttr,
  statusAttr,
  phoneAttr,
  handleTriggerFetch,
}) {
  const [open, setOpen] = useState(false);
  const [isStopDesk, setIsStopDesk] = useState(false);
  const [shippingPrice, setShippingPrice] = useState(0);
  const [productPrice, setProductPrice] = useState(0);
  const [isError, setIsError] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [currentLead, setCurrentLead] = useState(null);
  const [status, setStatus] = useState(statusAttr);
  const [agency, setAgency] = useState(null);
  const [comment, setComment] = useState(commentAttr);
  const [communes, setCommunes] = useState([]);
  const [commune, setCommune] = useState(communeAttr);
  const [address, setAddress] = useState(addressAttr);
  const [wilaya, setWilaya] = useState(wilayaAttr);
  const [firstName, setFirstName] = useState(firstNameAttr);
  const [lastName, setLastName] = useState(lastNameAttr);
  const [phone, setPhone] = useState(phoneAttr);
  const [product, setProduct] = useState(productAttr);
  const [deliveryFee, setDeliveryFee] = useState(null);
  const [trackers, setTrackers] = useState([]);
  const [trackersCount, setTrackersCount] = useState(0);
  const [currentAgentId, setCurrentAgentId] = useState();
  const [updateLoading, setUpdateLoading] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const { user } = useContext(UserContext);
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  useEffect(() => {
    const fetchTrackers = async () => {
      try {
        console.log('the status->', statusAttr, status);
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

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const { data, error } = await supabase.from('users').select('*').eq('role', 'agent');

        if (data) {
          console.log('the data tracker: ', data);

          console.log('the user context: ', user);
          if (user) {
            const { email } = user;
            const relevantEmail = data.filter((item) => item.email === email);
            if (relevantEmail.length !== 0) {
              setCurrentAgentId(relevantEmail[0].id);
            } else {
              setCurrentAgentId(8);
            }
          }
        }

        if (error) {
          console.log('something went wrong ', error);
        }
      } catch (error) {
        console.log('catched an error ', error);
      }
    };

    fetchAgents();
  }, []);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        console.log('the status is', status);
        const { data, error } = await supabase.from('leads').select().eq('id', id).single();

        if (data) {
          console.log('the data is: ', data.wilaya);
          setCurrentLead(data);
          setAddress(data.address);
          setFirstName(data.first_name);
          setPhone(data.phone);
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
  }, [id]);

  useEffect(() => {
    const wilayaValues = wilayas.map((wil, i) => wil.value);
    if (wilayaValues.includes(wilaya)) {
      setEstimatedTime(fees[wilaya].estimatedDeliveryTime);
      if (isStopDesk) {
        setCommunes(communesStopdesk[wilaya]);
      } else {
        setCommunes(communesList[wilaya]);
      }
    }
  }, [wilaya, isStopDesk]);

  useEffect(() => {
    if (wilaya !== '' && commune !== '') {
      console.log('wilaya => ', wilaya);
      console.log('wilaya => ', commune);
      console.log('wilaya => ', communesList[wilaya]);

      const wilayaValues = wilayas.map((wil, i) => wil.value);
      if (wilayaValues.includes(wilaya)) {
        // const communesListValues = communesList[wilaya].map((com) => com.value);
        // if (communesListValues.includes(commune)) {
        // const associatedCommune = communesList[wilaya].filter((com) => com.value === commune);
        // console.log('assoc com', associatedCommune, commune);
        // if (associatedCommune.length !== 0) {
        if (isStopDesk) {
          console.log('fee: ', fees[wilaya].deskFee);
          setDeliveryFee(fees[wilaya].deskFee);
        } else {
          console.log('fee: ', fees[wilaya].homeFee);
          // const communeFee = associatedCommune[0].fee;
          // console.log('associated fee', communeFee, commune);
          let reduction;
          let homeDeliverFee;
          if (zone0.includes(wilaya)) {
            homeDeliverFee = fees[wilaya].homeFee;
            reduction = 250;
          } else if (zone1.includes(wilaya)) {
            homeDeliverFee = fees[wilaya].homeFee + 100;
            reduction = 150;
          } else if (zone2.includes(wilaya)) {
            homeDeliverFee = fees[wilaya].homeFee + 100;
            reduction = 250;
          } else if (zone3.includes(wilaya)) {
            homeDeliverFee = fees[wilaya].homeFee + 100;
            reduction = 300;
          } else if (zone4.includes(wilaya)) {
            homeDeliverFee = fees[wilaya].homeFee + 100;
            reduction = 300;
          } else if (zone5.includes(wilaya)) {
            homeDeliverFee = fees[wilaya].homeFee + 100;
            reduction = 400;
          } else if (zone6.includes(wilaya)) {
            homeDeliverFee = fees[wilaya].homeFee;
            reduction = 100;
          }
          setDeliveryFee(homeDeliverFee - reduction);
        }
        // }
        // }
      }
    }
  }, [wilaya, isStopDesk, commune]);

  const updateStatus = async (e) => {
    e.preventDefault();
    try {
      setUpdateLoading(true);
      const currentDate = new Date().toLocaleString('en-US', {
        timeZone: 'Europe/Paris',
      });
      const { data: dataUpdate, error: errorUpdate } = await supabase
        .from('leads')
        .update({
          status,
          comment,
          last_changed_status: currentDate,
        })
        .select()
        .eq('id', id);

      if (dataUpdate) {
        // console.log('-------->', dataUpdate);

        setFeedback('lead status updated successfully!');
        setIsError(false);
      }

      if (errorUpdate) {
        console.log(errorUpdate);
        setFeedback('a Problem accured when updating the Lead!');
        setIsError(true);
      }

      if (status === 'confirmed') {
        let trackerId;
        if (trackersCount !== 0) {
          trackerId = trackers[Math.floor(Math.random() * trackersCount)].id;
        } else {
          throw new Error('Something went wrong');
        }
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
        console.log('added to yal ', response.data);
        const { data: dataTracker, error: errorTracker } = await supabase
          .from('followups')
          .insert({
            tracking: response.data[`order_${trackerId}`].tracking,
            is_handled_out: false,
            is_handled_missed: false,
            is_handled_center: false,
            is_handled_received: false,
            tracker_id: trackerId,
          })
          .select();
        if (dataTracker) {
          console.log('created data tracker', dataTracker);
        }
        if (errorTracker) {
          console.log('something went wrog creating tracekr', errorTracker);
        }
        const { data: dataInsert, error: errorInsert } = await supabase
          .from('orders')
          .insert({
            first_name: firstName,
            last_name: lastName,
            address,
            phone,
            wilaya,
            commune,
            product,
            is_stopdesk: isStopDesk,
            is_free_shipping: true,
            stopdesk: agency,
            product_price: productPrice,
            shipping_price: shippingPrice,
            tracking_id: response.data[`order_${trackerId}`].tracking,
            delivery_fees: deliveryFee,
            tracker_id: trackerId,
            agent_id: currentAgentId,
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

        const { error: errorOrderLog } = await supabase
          .from('logs')
          .insert({ user_fullname: user.user_metadata.name, action: 'add', entity: 'order', number: phone });
        if (errorOrderLog) {
          console.log('oops log: ', errorOrderLog);
          setFeedback('a Problem accured when adding the new LOG!');
          setIsError(true);
        }
      }

      const { error: errorLeadLog } = await supabase.from('logs').insert({
        user_fullname: user.user_metadata.name,
        action: 'update',
        entity: 'lead',
        number: phone,
        last_status: status,
        attempt: status === 'not-responding' || status === 'unreachable' ? +comment : null,
      });
      if (errorLeadLog) {
        console.log('oops log: ', errorLeadLog);
        setFeedback('a Problem accured when adding the new LOG!');
        setIsError(true);
      }
      setUpdateLoading(false);
      setOpen(true);
      handleTriggerFetch(Math.random());
    } catch (error) {
      console.log('something went wrong: ', error);
      setFeedback('a Problem accured!');
      setIsError(true);
      setUpdateLoading(false);
    }
  };

  return (
    <form onSubmit={updateStatus}>
      <Stack spacing={3} style={{ marginTop: 30, maxHeight: '70vh', overflowY: 'scroll', padding: '1rem' }}>
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
                  <TextField
                    name="phone"
                    label="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <TextField
                    name="product"
                    label="Product"
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                  />
                </FormControl>
              </Stack>
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
                  <FormHelperText>{wilaya}</FormHelperText>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Commune</InputLabel>
                  <Select value={commune} label="Commune" onChange={(e) => setCommune(e.target.value)}>
                    {communes.map((com, i) => (
                      <MenuItem key={i} value={com.value} disabled={!isStopDesk && !com.isDeliverable}>
                        {com.label} {!isStopDesk && !com.isDeliverable && '(Undeliverable)'}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{commune}</FormHelperText>
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
                      {agencies[commune] && (
                        <MenuItem value={agencies[commune].value}>{agencies[commune].label}</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                ) : (
                  <></>
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
              </Stack>
              <Stack>
                <Typography variant="p" component="p" style={{ fontSize: '13px', marginBottom: 8, color: '#666' }}>
                  {deliveryFee && (
                    <span>
                      Delivery Fees: <b>{deliveryFee} DA</b>
                    </span>
                  )}
                </Typography>
                <Typography variant="p" component="p" style={{ fontSize: '13px', marginBottom: 8, color: '#666' }}>
                  {estimatedTime && (
                    <span>
                      Estimated delivery time: <b>{estimatedTime}</b>
                    </span>
                  )}
                </Typography>
                <Typography variant="p" component="p" style={{ fontSize: '13px' }}>
                  Total: {(productPrice + shippingPrice).toFixed(2)} DA
                </Typography>
              </Stack>
            </Stack>
          )}
        </Stack>
        <Stack>
          <LoadingButton loading={updateLoading} type="submit" fullWidth size="large" variant="contained">
            Update
          </LoadingButton>
        </Stack>
      </Stack>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity={isError ? 'error' : 'success'} sx={{ width: '100%' }}>
          {feedback}
        </Alert>
      </Snackbar>
    </form>
  );
}

export default EditLeadForm;
