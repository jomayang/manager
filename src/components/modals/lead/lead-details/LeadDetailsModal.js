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
import Iconify from '../../../iconify/Iconify';
import Label from '../../../label/Label';
import CreateLeadForm from '../create-lead/CreateLeadForm';

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

function LeadDetailsModal({
  id,
  communeAttr,
  wilayaAttr,
  addressAttr,
  productAttr,
  firstNameAttr,
  lastNameAttr,
  commentAttr,
  statusAttr,
  sizeAttr,
  colorAttr,
  agentIdAttr,
  phoneAttr,
  createdAtAttr,
}) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const agents = {
    a17: 'Gherzouli Lina',
    a23: 'Benfedda Rahma',
  };
  const handleOpenModal = async () => {
    handleOpen();
  };

  return (
    <div>
      <IconButton size="large" color="inherit" onClick={handleOpen}>
        <Iconify icon="eva:eye-outline" />
      </IconButton>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h4" component="h4" style={{ textAlign: 'center' }}>
            Order Details
          </Typography>
          <hr style={{ border: '1px solid #eee', marginTop: 10, marginBottom: 20 }} />
          <Typography id="modal-modal-title" variant="p" component="p">
            <b>Creation date:</b> {new Date(createdAtAttr).toLocaleString('en-US')}
          </Typography>
          <Typography id="modal-modal-title" variant="p" component="p">
            <b>Customer:</b> {firstNameAttr} {lastNameAttr}
          </Typography>
          <Typography id="modal-modal-title" variant="p" component="p">
            <b>Phone number:</b> {phoneAttr}
          </Typography>
          <Typography id="modal-modal-title" variant="p" component="p">
            <b>Status:</b> {statusAttr}
          </Typography>
          {commentAttr && (
            <Typography id="modal-modal-title" variant="p" component="p">
              <b>Comment:</b> {commentAttr}
            </Typography>
          )}

          <hr style={{ border: '1px solid #eee', marginTop: 10, marginBottom: 20 }} />

          <Typography id="modal-modal-title" variant="p" component="p">
            <b>Product:</b> {productAttr} {colorAttr && colorAttr} {sizeAttr && sizeAttr}
          </Typography>

          <Typography id="modal-modal-title" variant="p" component="p">
            <b>Wilaya:</b> {wilayaAttr}
          </Typography>
          {communeAttr && (
            <Typography id="modal-modal-title" variant="p" component="p">
              <b>Commune:</b> {communeAttr}
            </Typography>
          )}

          {addressAttr && (
            <Typography id="modal-modal-title" variant="p" component="p">
              <b>Address:</b> {addressAttr}
            </Typography>
          )}
          {agentIdAttr && (
            <Typography id="modal-modal-title" variant="p" component="p">
              <b>Agent:</b> {agents[`a${agentIdAttr}`]}
            </Typography>
          )}
        </Box>
      </Modal>
    </div>
  );
}

export default LeadDetailsModal;
