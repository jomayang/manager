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
import { Box, Modal, Button, Typography, IconButton } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Iconify from '../iconify/Iconify';
import Label from '../label/Label';
import CreateLeadForm from './CreateLeadForm';
import supabase from '../../config/SupabaseClient';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: ['90%', '80%', 600],
  maxHeight: '90%',
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

function ParcelDetailsModal({
  id,
  tracking,
  fullName,
  phone,
  departure,
  destination,
  product,
  price,
  deliveryFees,
  creationDate,
  expeditionDate,
}) {
  const [open, setOpen] = useState(false);
  const [agent, setAgent] = useState();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleOpenModal = async () => {
    handleOpen();
    console.log('gooo');
    const { data: dataOrder, error: errorOrder } = await supabase
      .from('orders')
      .select('agent_id')
      .eq('tracking_id', tracking)
      .single();

    if (dataOrder) {
      console.log('the data ----->>> ', dataOrder);

      const { data: dataUser, error: errorUser } = await supabase
        .from('users')
        .select('name')
        .eq('id', dataOrder.agent_id)
        .single();
      if (dataUser) {
        console.log('the corresponding user: ', dataUser);
        setAgent(dataUser.name);
      }

      if (errorUser) {
        console.log(errorUser);
      }
    }

    if (errorOrder) {
      console.log(errorOrder);
    }
  };

  return (
    <div>
      <IconButton aria-label="Done" onClick={handleOpenModal}>
        <Iconify icon="eva:plus-circle-outline" />
      </IconButton>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h4" component="h4" style={{ textAlign: 'center' }}>
            Parcel Details <Label>{tracking}</Label>
          </Typography>
          <hr style={{ border: '1px solid #eee', marginTop: 10, marginBottom: 20 }} />
          <Typography id="modal-modal-title" variant="p" component="p">
            <b>Creation date:</b> {creationDate}
          </Typography>
          {expeditionDate && (
            <Typography id="modal-modal-title" variant="p" component="p">
              <b>Expedition date:</b> {expeditionDate}
            </Typography>
          )}
          {agent && (
            <Typography id="modal-modal-title" variant="p" component="p">
              <b>Agent:</b> {agent}
            </Typography>
          )}

          <hr style={{ border: '1px solid #eee', marginTop: 10, marginBottom: 20 }} />
          <Typography id="modal-modal-title" variant="p" component="p">
            <b>Customer:</b> {fullName}
          </Typography>
          <Typography id="modal-modal-title" variant="p" component="p">
            <b>phone number:</b> {phone}
          </Typography>
          <Typography id="modal-modal-title" variant="p" component="p">
            <b>Path:</b> {departure}{' '}
            <Label color="info" variant="filled">
              to
            </Label>{' '}
            {destination}
          </Typography>
          <Typography id="modal-modal-title" variant="p" component="p">
            <b>Product:</b> {product}
          </Typography>
          <Typography id="modal-modal-title" variant="p" component="p">
            <b>Price:</b> {price}
          </Typography>
          <Typography id="modal-modal-title" variant="p" component="p">
            <b>Delivery fee:</b> {deliveryFees}
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}

export default ParcelDetailsModal;
