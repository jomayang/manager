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
import {
  Box,
  Modal,
  Button,
  Typography,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  Paper,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Iconify from '../../../iconify/Iconify';
import Label from '../../../label/Label';
import CreateLeadForm from '../../lead/create-lead/CreateLeadForm';
import supabase from '../../../../config/SupabaseClient';

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

function OrderDetailsModal({
  id,
  communeAttr,
  wilayaAttr,
  addressAttr,
  productAttr,
  firstNameAttr,
  lastNameAttr,
  fullNameAttr,
  statusAttr,
  isStopDeskAttr,
  stopdeskAttr,
  productPriceAttr,
  shippingPriceAttr,
  phoneAttr,
  createdAtAttr,
}) {
  const [open, setOpen] = useState(false);
  const [relevantItems, setRelevantItems] = useState([]);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleOpenModal = async () => {
    handleOpen();

    const { data: dataRelatedInventory, error: errorRelatedInventory } = await supabase
      .from('order_item')
      .select(
        `
        *,
        items(
          *
        )
      `
      )
      .eq('order_id', id);

    if (dataRelatedInventory) {
      const fetchedInventory = dataRelatedInventory.map((row) => ({
        id: row.id,
        product: row.items.product,
        color: row.items.color,
        size: row.items.size,
        quantity: row.qty,
      }));

      setRelevantItems(fetchedInventory);
      console.log('filtered inventory', fetchedInventory);
    }
  };

  return (
    <div>
      <IconButton size="large" color="inherit" onClick={handleOpenModal}>
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
            <b>Customer:</b> {fullNameAttr}
          </Typography>
          <Typography id="modal-modal-title" variant="p" component="p">
            <b>Phone number:</b> {phoneAttr}
          </Typography>
          <Typography id="modal-modal-title" variant="p" component="p">
            <b>Status:</b> {statusAttr}
          </Typography>

          <Typography id="modal-modal-title" variant="p" component="p">
            <b>Delivery Type:</b> {isStopDeskAttr ? 'Stopdesk' : 'Home delivery'}
          </Typography>

          <hr style={{ border: '1px solid #eee', marginTop: 10, marginBottom: 20 }} />

          <Typography id="modal-modal-title" variant="p" component="p">
            <b>Product:</b> {productAttr}
          </Typography>

          <Typography id="modal-modal-title" variant="p" component="p">
            <b>Wilaya:</b> {wilayaAttr}
          </Typography>
          {communeAttr && (
            <Typography id="modal-modal-title" variant="p" component="p">
              <b>Commune:</b> {communeAttr}
            </Typography>
          )}
          {stopdeskAttr && (
            <Typography id="modal-modal-title" variant="p" component="p">
              <b>Agency:</b> {stopdeskAttr}
            </Typography>
          )}

          {addressAttr && (
            <Typography id="modal-modal-title" variant="p" component="p">
              <b>Address:</b> {addressAttr}
            </Typography>
          )}

          {shippingPriceAttr && (
            <Typography id="modal-modal-title" variant="p" component="p">
              <b>Shipping price:</b> {shippingPriceAttr}
            </Typography>
          )}
          {productPriceAttr && (
            <Typography id="modal-modal-title" variant="p" component="p">
              <b>product price:</b> {productPriceAttr}
            </Typography>
          )}
          {relevantItems.length !== 0 && (
            <TableContainer style={{ marginTop: 10 }} component={Paper}>
              <Table size="small" aria-label="a dense table">
                <TableHead>
                  <TableRow>
                    <TableCell align="right">Product</TableCell>
                    <TableCell align="right">Color</TableCell>
                    <TableCell align="right">Size</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {relevantItems.map((row) => (
                    <TableRow key={Math.random()} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell component="th" scope="row">
                        {row.product}
                      </TableCell>
                      <TableCell align="right">{row.color}</TableCell>
                      <TableCell align="right">{row.size}</TableCell>
                      <TableCell align="right">{row.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Modal>
    </div>
  );
}

export default OrderDetailsModal;
