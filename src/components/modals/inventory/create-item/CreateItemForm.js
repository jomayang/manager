import { DesktopDatePicker, LoadingButton } from '@mui/lab';
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
import React, { forwardRef, useContext, useEffect, useState } from 'react';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import axios from 'axios';
import { Link } from 'react-router-dom';
import supabase from '../../../../config/SupabaseClient';
import { wilayas } from '../../../../data/wilayas';
import { agencies } from '../../../../data/agencies';
import { fees } from '../../../../data/fees';
import { communesList } from '../../../../data/communes';
import { communesStopdesk } from '../../../../data/communesStopdesk';
import { UserContext } from '../../../../context/UserContext';

const Alert = forwardRef((props, ref) => {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function CreateItemForm({ handleTriggerFetch }) {
  const [open, setOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [product, setProduct] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [quantity, setQuantity] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const { user } = useContext(UserContext);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const createItem = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const { data: dataInsert, error: errorInsert } = await supabase
        .from('items')
        .insert({ product, color, size, thumbnail })
        .select()
        .single();

      if (dataInsert) {
        console.log('--->', dataInsert);
        const { data: dataInventory, error: errorInventory } = await supabase
          .from('inventory')
          .insert({ item_id: dataInsert.id, quantity })
          .select();
        if (dataInventory) {
          setFeedback('item inserted successfully!');
          setIsError(false);
        }
        if (errorInventory) {
          setFeedback('a Problem accured when updating the Item!');
          setIsError(true);
        }
      }

      if (errorInsert) {
        console.log(errorInsert);
        setFeedback('a Problem accured when updating the Item!');
        setIsError(true);
      }
      setIsLoading(false);
      setOpen(true);

      handleTriggerFetch(Math.random());
    } catch (error) {
      setFeedback('a Problem accured when adding the new Item!');
      setIsError(true);
      setOpen(true);
      console.log('something went wrong in try catch', error);
    }
  };

  return (
    <form onSubmit={createItem}>
      <Stack spacing={3} sx={{ maxHeight: '70vh', overflowY: 'scroll', paddingRight: '1rem' }}>
        <Stack spacing={3}>
          <FormControl>
            <TextField name="product" label="Product" value={product} onChange={(e) => setProduct(e.target.value)} />
          </FormControl>
          <FormControl>
            <TextField name="color" label="Color" value={color} onChange={(e) => setColor(e.target.value)} />
          </FormControl>
          <FormControl>
            <TextField name="size" label="Size" value={size} onChange={(e) => setSize(e.target.value)} />
          </FormControl>
          <FormControl>
            <TextField
              name="thumbnail"
              label="Thumbnail"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <TextField
              name="inventory"
              label="Inventory"
              value={quantity}
              onChange={(e) => setQuantity(+e.target.value)}
            />
          </FormControl>
        </Stack>
        <Stack>
          <LoadingButton loading={isLoading} type="submit" fullWidth size="large" variant="contained">
            Add Item
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

export default CreateItemForm;
