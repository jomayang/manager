import { Box, Button, IconButton, Modal, Typography } from '@mui/material';
import React, { useState } from 'react';
import Iconify from '../iconify/Iconify';
import EditOrderForm from './EditOrderForm';

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

function EditOrderStatus({ id, statusAttr, handleTriggerFetch }) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <IconButton size="large" color="secondary" onClick={handleOpen}>
        <Iconify icon="eva:edit-2-outline" />
      </IconButton>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h5" component="h5" style={{ textAlign: 'center' }}>
            Edit lead status
          </Typography>
          <EditOrderForm id={id} statusAttr={statusAttr} handleTriggerFetch={handleTriggerFetch} />
          {/* <CreateOrderForm /> */}
        </Box>
      </Modal>
    </div>
  );
}

export default EditOrderStatus;
