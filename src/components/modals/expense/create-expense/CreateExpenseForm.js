import { DesktopDatePicker, LoadingButton } from '@mui/lab';
import {
  Button,
  FormControl,
  FormControlLabel,
  InputAdornment,
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
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import axios from 'axios';
import supabase from '../../../../config/SupabaseClient';
import { wilayas } from '../../../../data/wilayas';
import { UserContext } from '../../../../context/UserContext';
import { communesList } from '../../../../data/communes';

const Alert = forwardRef((props, ref) => {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function CreateExpenseForm({ handleTriggerFetch }) {
  const [open, setOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const [feedback, setFeedback] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState(Date.now());
  const [category, setCategory] = useState('utilities');
  const [type, setType] = useState('fixed');
  const [department, setDepartment] = useState('ecommerce');
  const [correspondingQty, setCorrespondingQty] = useState(0);
  const [correspondingProduct, setCorrespondingProduct] = useState('');
  const [amount, setAmount] = useState(0);
  const [comment, setComment] = useState('');

  const { user } = useContext(UserContext);
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const createExpense = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('expenses')
        .insert({
          created_at: date,
          amount,
          comment,
          type,
          category,
          correspondingQty,
          correspondingProduct,
          department,
        })
        .select();

      if (error) {
        console.log('something went wrong', error);
        setFeedback('a Problem accured when adding the new Expense!');
        setIsError(true);
      }

      if (data) {
        console.log('added successfully', data);
        // setIdentifier(id);
        setFeedback('A new Expense added!');
        setOpen(true);

        handleTriggerFetch(Math.random());
      }

      setIsLoading(false);
    } catch (error) {
      setFeedback('a Problem accured when adding the new Expense!');
      setIsError(true);
      console.log('something went wrong in try catch', error);
    }
  };

  return (
    <form onSubmit={createExpense}>
      <Stack spacing={3} sx={{ maxHeight: '70vh', overflowY: 'scroll', paddingRight: '1rem' }}>
        <Stack>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>
              <MenuItem value="advertising">Advertising</MenuItem>
              <MenuItem value="multimedia">Multimedia</MenuItem>
              <MenuItem value="food">Food</MenuItem>
              <MenuItem value="utilities">Utilities</MenuItem>
              <MenuItem value="rent">Rent</MenuItem>
              <MenuItem value="paycheck">Payroll</MenuItem>
              <MenuItem value="transport">Transport</MenuItem>
              <MenuItem value="raw-materials">Raw materials</MenuItem>
              <MenuItem value="packaging">Packaging</MenuItem>
              <MenuItem value="goods">Goods</MenuItem>
              <MenuItem value="gifts">Gifts</MenuItem>
              <MenuItem value="personal-charges">Personal charges</MenuItem>
              <MenuItem value="refund">Refund</MenuItem>
              <MenuItem value="investment">Investment</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
        </Stack>
        <Stack fullWidth spacing={2} sx={{ marginTop: '1rem' }}>
          <FormControl fullWidth>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date"
                value={date}
                onChange={(newValue) => {
                  setDate(newValue);
                }}
                renderInput={(params) => <TextField sx={{ marginBottom: [2, 0] }} fullWidth {...params} />}
              />
            </LocalizationProvider>
          </FormControl>
        </Stack>
        <Stack>
          <FormControl fullWidth>
            <TextField
              name="amount"
              label="Amount"
              inputProps={{ type: 'number' }}
              InputProps={{
                endAdornment: <InputAdornment position="end">DA</InputAdornment>,
              }}
              value={amount}
              onChange={(e) => setAmount(+e.target.value)}
            />
          </FormControl>
        </Stack>
        <Stack>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select value={type} label="Type" onChange={(e) => setType(e.target.value)}>
              <MenuItem value="fixed">Fixed</MenuItem>
              <MenuItem value="variable">Variable</MenuItem>
            </Select>
          </FormControl>
        </Stack>
        <Stack>
          <FormControl fullWidth>
            <InputLabel>Department</InputLabel>
            <Select value={department} label="Department" onChange={(e) => setDepartment(e.target.value)}>
              <MenuItem value="garment-factory">Garment Factory</MenuItem>
              <MenuItem value="ecommerce">Ecommerce</MenuItem>
            </Select>
          </FormControl>
        </Stack>
        <Stack>
          <FormControl fullWidth>
            <InputLabel>Corresponding Quantity</InputLabel>
            <TextField
              name="corresponding-qty"
              label="Corresponding Quantity"
              inputProps={{ type: 'number' }}
              value={correspondingQty}
              onChange={(e) => setCorrespondingQty(+e.target.value)}
            />
          </FormControl>
        </Stack>
        <Stack>
          <FormControl fullWidth>
            <InputLabel>Corresponding Product</InputLabel>
            <TextField
              name="corresponding-product"
              label="Corresponding Product"
              value={correspondingProduct}
              onChange={(e) => setCorrespondingProduct(e.target.value)}
            />
          </FormControl>
        </Stack>
        <Stack>
          <FormControl fullWidth>
            <InputLabel>Department</InputLabel>
            <Select value={department} label="Department" onChange={(e) => setDepartment(e.target.value)}>
              <MenuItem value="garment-factory">Garment Factory</MenuItem>
              <MenuItem value="ecommerce">Ecommerce</MenuItem>
            </Select>
          </FormControl>
        </Stack>
        <Stack>
          <FormControl>
            <TextField name="comment" label="Comment" value={comment} onChange={(e) => setComment(e.target.value)} />
          </FormControl>
        </Stack>
        <Stack>
          {amount === 0 ? (
            <Button fullWidth size="large" variant="contained" disabled>
              Add Expense
            </Button>
          ) : (
            <LoadingButton loading={isLoading} type="submit" fullWidth size="large" variant="contained">
              Add Expense
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

export default CreateExpenseForm;
