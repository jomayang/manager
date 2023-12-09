import { Box, Button, IconButton, Modal, Typography } from '@mui/material';
import React, { useState } from 'react';
import Iconify from '../../../iconify/Iconify';
import CreateExchangeForm from './CreateExchangeForm';

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

function CreateExchangeStatus({
  id,
  communeAttr,
  wilayaAttr,
  addressAttr,
  productAttr,
  firstNameAttr,
  lastNameAttr,
  phoneAttr,
  createdAtAttr,
  trackingAttr,
  handleTriggerFetch,
}) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <IconButton size="large" onClick={handleOpen}>
        <Iconify icon="eva:swap-outline" />
      </IconButton>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h5" component="h5" style={{ textAlign: 'center' }}>
            Make an Exchange
          </Typography>
          <Typography id="modal-modal-title" variant="p" component="p" style={{ textAlign: 'center', color: '#777' }}>
            {new Date(createdAtAttr).toLocaleString()}
          </Typography>

          <CreateExchangeForm
            id={id}
            communeAttr={communeAttr}
            wilayaAttr={wilayaAttr}
            addressAttr={addressAttr}
            productAttr={productAttr}
            firstNameAttr={firstNameAttr}
            lastNameAttr={lastNameAttr}
            phoneAttr={phoneAttr}
            trackingAttr={trackingAttr}
            handleTriggerFetch={handleTriggerFetch}
          />
          {/* <CreateOrderForm /> */}
        </Box>
      </Modal>
    </div>
  );
}

export default CreateExchangeStatus;
