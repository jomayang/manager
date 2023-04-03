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

const Alert = forwardRef((props, ref) => <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />);

function EditOrderForm({ id, statusAttr, handleTriggerFetch }) {
  const [open, setOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [currentOrder, setCurrentOrder] = useState(null);
  const [status, setStatus] = useState(statusAttr);

  const [updateLoading, setUpdateLoading] = useState(false);
  const { user } = useContext(UserContext);
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        console.log('the status is', status);
        const { data, error } = await supabase.from('orders').select().eq('id', id).single();

        if (data) {
          console.log('the data is: ', data.wilaya);
          setCurrentOrder(data);
          setStatus(data.status);
        }

        if (error) {
          console.log('something went wrong: ', error);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchOrder();
  }, [id]);

  const updateStatus = async (e) => {
    e.preventDefault();
    try {
      setUpdateLoading(true);
      const { data: dataUpdate, error: errorUpdate } = await supabase
        .from('orders')
        .update({ status })
        .select()
        .eq('id', id);

      if (dataUpdate) {
        console.log('--->', dataUpdate);

        setFeedback('order status updated successfully!');
        setIsError(false);
      }

      if (errorUpdate) {
        console.log(errorUpdate);
        setFeedback('a Problem accured when updating the order!');
        setIsError(true);
      }
      const { error: errorLeadLog } = await supabase.from('logs').insert({
        user: user.user_metadata.name,
        action: 'update',
        entity: 'order',
        number: currentOrder.phone,
        last_status: status,
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
                <MenuItem value={'delivered'}>Delivered</MenuItem>
              </Select>
            </FormControl>
          </Stack>
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

export default EditOrderForm;
