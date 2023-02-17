import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  timelineOppositeContentClasses,
  TimelineSeparator,
} from '@mui/lab';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

import {
  Box,
  Modal,
  Button,
  Typography,
  IconButton,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import axios from 'axios';
import React, { useEffect, forwardRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Stack } from '@mui/system';
import Iconify from '../iconify/Iconify';
import Label from '../label/Label';
import CreateLeadForm from './CreateLeadForm';
import supabase from '../../config/SupabaseClient';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  // border: '2px solid #000',
  borderRadius: '20px',
  boxShadow: 24,
  p: 4,
};

const statusColors = {
  Centre: 'secondary',
  'Reçu à Wilaya': 'secondary',
  'En attente du client': 'primary',
  'Sorti en livraison': 'primary',
  'En attente': 'primary',
  'En alerte': 'warning',
  'Tentative échouée': 'warning',
  Livré: 'success',
  'Echèc livraison': 'error',
  'Retour vers centre': 'error',
  'Retourné au centre': 'error',
  'Retour transfert': 'error',
  'Retour groupé': 'error',
  'Retour à retirer': 'error',
  'Retour vers vendeur': 'error',
  'Retourné au vendeur': 'error',
  'Echange échoué': 'error',
};

const Alert = forwardRef((props, ref) => {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function EditRoleModal({ id, role }) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [openSnack, setOpenSnack] = useState(false);
  const [isError, setIsError] = useState(false);
  const [feedback, setFeedback] = useState('');

  const [newRole, setNewRole] = useState(role);

  const handleOpenModal = async () => {
    handleOpen();
  };

  const handleSnackClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenSnack(false);
  };

  const updateRole = async () => {
    try {
      const { error } = await supabase.from('users').update({ role: newRole }).eq('id', id);

      if (error) {
        console.log('something went wrong', error);
        setFeedback('a Problem accured when updating the role!');
        setIsError(true);
      } else {
        setFeedback('the role has been updated successfully!');
      }

      setOpenSnack(true);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <IconButton size="large" aria-label="Done" onClick={handleOpen}>
        <Iconify icon="eva:edit-2-outline" />
      </IconButton>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h4" component="h4" style={{ textAlign: 'center' }}>
            Parcel Details
          </Typography>
          <hr style={{ border: '1px solid #eee', marginTop: 10, marginBottom: 20 }} />
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Filter Status</InputLabel>
              <Select
                value={newRole}
                label="filter-status"
                onChange={(e) => {
                  setNewRole(e.target.value);
                }}
              >
                <MenuItem value={''}>All</MenuItem>
                <MenuItem value={'agent'}>Agent</MenuItem>
                <MenuItem value={'tracker'}>Tracker</MenuItem>
                <MenuItem value={'admin'}>Admin</MenuItem>
              </Select>
            </FormControl>
            <Button onClick={updateRole} fullWidth size="large" variant="contained">
              Update role
            </Button>
          </Stack>
          <Snackbar
            open={openSnack}
            autoHideDuration={6000}
            onClose={handleSnackClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert onClose={handleSnackClose} severity={isError ? 'error' : 'success'} sx={{ width: '100%' }}>
              {feedback}
            </Alert>
          </Snackbar>
        </Box>
      </Modal>
    </div>
  );
}

export default EditRoleModal;
