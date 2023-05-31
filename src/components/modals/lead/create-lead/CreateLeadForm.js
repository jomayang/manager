import { DesktopDatePicker, LoadingButton } from '@mui/lab';
import {
  Button,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
} from '@mui/material';
import { Stack } from '@mui/system';
import React, { forwardRef, useContext, useEffect, useState } from 'react';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { Link } from 'react-router-dom';
import axios from 'axios';
import supabase from '../../../../config/SupabaseClient';
import { wilayas } from '../../../../data/wilayas';
import { UserContext } from '../../../../context/UserContext';
import { communesList } from '../../../../data/communes';

const Alert = forwardRef((props, ref) => {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function CreateLeadForm({ handleTriggerFetch }) {
  const [open, setOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [communes, setCommunes] = useState([]);
  const [commune, setCommune] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [product, setProduct] = useState('');
  const [agents, setAgents] = useState([]);
  const [agentsCount, setAgentsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAgentId, setCurrentAgentId] = useState('');
  const { user } = useContext(UserContext);
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const { data, error } = await supabase.from('users').select('*').eq('role', 'agent');

        if (data) {
          console.log('the data tracker: ', data);
          setAgents(data);
          setAgentsCount(data.length);
          console.log('the user context: ', user);
          if (user) {
            const { email } = user;
            const relevantEmail = data.filter((item) => item.email === email);
            if (relevantEmail.length !== 0) {
              setCurrentAgentId(relevantEmail[0].id);
            } else {
              setCurrentAgentId(null);
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

  const createLead = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      console.log({ first_name: firstName, last_name: lastName, address, phone, wilaya, commune, product });
      let agentId;
      if (agentsCount !== 0) {
        if (currentAgentId) {
          agentId = currentAgentId;
        } else {
          agentId = agents[Math.floor(Math.random() * agentsCount)].id;
        }
      } else {
        agentId = null;
      }
      const { data, error } = await supabase
        .from('leads')
        .insert({
          first_name: firstName,
          last_name: lastName,
          address,
          phone,
          wilaya,
          commune,
          product,
          agent_id: agentId,
        })
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
        setOpen(true);

        handleTriggerFetch(Math.random());
      }
      const { error: errorLeadLog } = await supabase.from('logs').insert({
        user_fullname: user.user_metadata.name,
        action: 'add',
        entity: 'lead',
        number: phone,
      });
      if (errorLeadLog) {
        console.log('oops log: ', errorLeadLog);
        setFeedback('a Problem accured when adding the new LOG!');
        setIsError(true);
      }
      setIsLoading(false);
    } catch (error) {
      setFeedback('a Problem accured when adding the new Lead!');
      setIsError(true);
      console.log('something went wrong in try catch', error);
    }
  };

  useEffect(() => {
    if (wilaya !== '') {
      console.log('wilaya', wilayas);
      console.log('communes', communesList[wilaya]);
      setCommunes(communesList[wilaya]);
    }
  }, [wilaya]);

  return (
    <form onSubmit={createLead}>
      <Stack spacing={3} sx={{ maxHeight: '70vh', overflowY: 'scroll', paddingRight: '1rem' }}>
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
        <Stack>
          <FormControl fullWidth>
            <TextField name="phone" label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </FormControl>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormControl fullWidth>
            <TextField name="product" label="Product" value={product} onChange={(e) => setProduct(e.target.value)} />
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
        <Stack>
          <FormControl fullWidth>
            <TextField name="address" label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </FormControl>
        </Stack>
        <Stack>
          {firstName === '' || lastName === '' || phone === '' || wilaya === '' || commune === '' ? (
            <Button fullWidth size="large" variant="contained" disabled>
              Add Lead
            </Button>
          ) : (
            <LoadingButton loading={isLoading} type="submit" fullWidth size="large" variant="contained">
              Add Lead
            </LoadingButton>
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
          {feedback}
        </Alert>
      </Snackbar>
    </form>
  );
}

export default CreateLeadForm;
