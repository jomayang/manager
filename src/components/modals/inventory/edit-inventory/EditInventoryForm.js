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
import { agencies } from '../../../../data/agencies';
import supabase from '../../../../config/SupabaseClient';
import { wilayas } from '../../../../data/wilayas';
import { communesList } from '../../../../data/communes';
import { communesStopdesk } from '../../../../data/communesStopdesk';
import { fees } from '../../../../data/fees';
import { UserContext } from '../../../../context/UserContext';

const Alert = forwardRef((props, ref) => <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />);

function EditInventoryForm({
  id,
  itemIdAttr,
  itemProductAttr,
  itemSizeAttr,
  itemColorAttr,
  inventoryAttr,
  thumbnailAttr,
  handleTriggerFetch,
}) {
  const [open, setOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [currentOrder, setCurrentOrder] = useState(null);
  const [inventory, setInventory] = useState(inventoryAttr);
  const [currentItemId, setCurrentItemId] = useState(itemIdAttr);
  const [currentItemColor, setCurrentItemColor] = useState(itemColorAttr);
  const [currentItemProduct, setCurrentItemProduct] = useState(itemProductAttr);
  const [currentItemThumbnail, setCurrentItemThumbnail] = useState(thumbnailAttr);
  const [currentItemSize, setCurrentItemSize] = useState(itemSizeAttr);
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const { user } = useContext(UserContext);
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  // useEffect(() => {
  //   const fetchOrder = async () => {
  //     try {
  //       console.log('the status is', status);
  //       const { data, error } = await supabase.from('orders').select().eq('id', id).single();

  //       if (data) {
  //         console.log('the data is: ', data.wilaya);
  //         setCurrentOrder(data);
  //         setStatus(data.status);
  //       }

  //       if (error) {
  //         console.log('something went wrong: ', error);
  //       }
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };
  //   fetchOrder();
  // }, [id]);

  const updateStatus = async (e) => {
    e.preventDefault();
    try {
      setUpdateLoading(true);
      const { data: dataUpdate, error: errorUpdate } = await supabase
        .from('inventory')
        .update({ quantity: inventory })
        .eq('item_id', currentItemId);

      if (dataUpdate) {
        console.log('--->', dataUpdate);

        setFeedback('inventory updated successfully!');
        setIsError(false);
      }

      if (errorUpdate) {
        console.log(errorUpdate);
        setFeedback('a Problem accured when updating the inventory!');
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
              <TextField
                name="product"
                label="Product"
                value={currentItemProduct}
                onChange={(e) => setCurrentItemProduct(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <TextField
                name="color"
                label="Color"
                value={currentItemColor}
                onChange={(e) => setCurrentItemColor(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <TextField
                name="size"
                label="Size"
                value={currentItemSize}
                onChange={(e) => setCurrentItemSize(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <TextField
                name="thumbnail"
                label="Thumbnail"
                value={currentItemThumbnail}
                onChange={(e) => setCurrentItemThumbnail(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <TextField
                name="inventory"
                label="Inventory"
                value={inventory}
                onChange={(e) => setInventory(+e.target.value)}
              />
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

export default EditInventoryForm;
