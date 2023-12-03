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
import CreateLeadForm from '../create-expense/CreateExpenseForm';

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

function ExpenseDetailsModal({ id, amountAttr, categoryAttr, departmentAttr, commentAttr, typeAttr, createdAtAttr }) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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
            Expense Details
          </Typography>
          <hr style={{ border: '1px solid #eee', marginTop: 10, marginBottom: 20 }} />
          <Typography id="modal-modal-title" variant="p" component="p">
            <b>Date:</b> {new Date(createdAtAttr).toLocaleString('en-US')}
          </Typography>
          <Typography id="modal-modal-title" variant="p" component="p">
            <b>Amount:</b> {amountAttr}
          </Typography>
          <Typography id="modal-modal-title" variant="p" component="p">
            <b>Category:</b> {categoryAttr}
          </Typography>
          <Typography id="modal-modal-title" variant="p" component="p">
            <b>Department:</b> {departmentAttr}
          </Typography>
          <Typography id="modal-modal-title" variant="p" component="p">
            <b>Type:</b> {typeAttr}
          </Typography>
          {commentAttr && (
            <Typography id="modal-modal-title" variant="p" component="p">
              <b>Comment:</b> {commentAttr}
            </Typography>
          )}
        </Box>
      </Modal>
    </div>
  );
}

export default ExpenseDetailsModal;
