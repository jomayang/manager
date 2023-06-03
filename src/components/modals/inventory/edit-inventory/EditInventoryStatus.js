import { Box, Button, IconButton, Modal, Typography } from '@mui/material';
import React, { useState } from 'react';
import Iconify from '../../../iconify/Iconify';
import EditInventoryForm from './EditInventoryForm';

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

function EditInventoryStatus({
  id,
  itemIdAttr,
  itemColorAttr,
  itemSizeAttr,
  itemProductAttr,
  inventoryAttr,
  thumbnailAttr,
  handleTriggerFetch,
}) {
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
            Edit Inventory status
          </Typography>
          <EditInventoryForm
            id={id}
            inventoryAttr={inventoryAttr}
            itemIdAttr={itemIdAttr}
            itemProductAttr={itemProductAttr}
            itemColorAttr={itemColorAttr}
            itemSizeAttr={itemSizeAttr}
            thumbnailAttr={thumbnailAttr}
            handleTriggerFetch={handleTriggerFetch}
          />
          {/* <CreateOrderForm /> */}
        </Box>
      </Modal>
    </div>
  );
}

export default EditInventoryStatus;
