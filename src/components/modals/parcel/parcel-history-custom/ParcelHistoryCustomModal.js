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
import CreateLeadForm from '../../lead/create-lead/CreateLeadForm';
import supabase from '../../../../config/SupabaseClient';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: ['90%', '80%', 600],
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

function ParcelHistoryCustomModal({ id, status, colors }) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState(null);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleOpenModal = async () => {
    handleOpen();
    try {
      const { data, error } = await supabase
        .from('status')
        .select()
        .eq('order_id', id)
        .order('created_at', { ascending: false });
      if (data) {
        console.log('data is clear: ', data);
        setHistory(data);
      }
      if (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <IconButton size="large" color="inherit" aria-label="Done" onClick={handleOpenModal}>
        <Iconify icon="eva:archive-outline" />
      </IconButton>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h4" component="h4" style={{ textAlign: 'center' }}>
            Parcel Followup
          </Typography>
          <hr style={{ border: '1px solid #eee', marginTop: 10, marginBottom: 20 }} />
          {history && (
            <>
              <Typography id="modal-modal-title" variant="h6" component="h6" style={{ textAlign: 'center' }}>
                {history[0].status}
              </Typography>

              <p style={{ margin: 0, fontSize: 16, textAlign: 'center' }}>
                {history[0].created_at.split('T')[0]} {history[0].created_at.split('T')[1].slice(0, 8)}
              </p>

              <hr style={{ border: '1px solid #eee', marginTop: 10, marginBottom: 20 }} />
              <Typography id="modal-modal-title" variant="h6" component="h6" style={{ textAlign: 'center' }}>
                Detailed History
              </Typography>
              <Timeline
                sx={{
                  [`& .${timelineOppositeContentClasses.root}`]: {
                    flex: 0.2,
                  },
                  overflowY: 'scroll',
                  maxHeight: '450px',
                }}
              >
                {history &&
                  history.map((hist, i) => (
                    <TimelineItem key={i}>
                      <TimelineOppositeContent color="textSecondary">
                        <p
                          style={{
                            fontSize: 12,
                            marginBottom: 0,
                          }}
                        >
                          {hist.created_at.split('T')[0]}
                        </p>
                        <p
                          style={{
                            fontSize: 16,
                            marginTop: 0,
                          }}
                        >
                          {hist.created_at.split('T')[1].slice(0, 8)}
                        </p>
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        {i === 0 ? <TimelineDot color="primary" /> : <TimelineDot />}
                        <TimelineConnector />
                      </TimelineSeparator>
                      <TimelineContent>
                        <p style={{ margin: 0 }}>
                          {hist.status} {hist.reason && <span>({hist.reason})</span>}
                        </p>
                        {/* <p style={{ margin: 0, fontSize: 12 }}>{hist.reason}</p> */}
                        <p style={{ margin: 0, fontSize: 12, color: '#999' }}>{hist.comment}</p>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
              </Timeline>
            </>
          )}
          {/* <CreateLeadForm /> */}
        </Box>
      </Modal>
    </div>
  );
}

export default ParcelHistoryCustomModal;
