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
import { Box, Modal, Button, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Iconify from '../iconify/Iconify';
import Label from '../label/Label';
import CreateLeadForm from './CreateLeadForm';

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

function ParcelHistoryModal({ tracking, status, colors }) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState(null);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleOpenModal = async () => {
    handleOpen();
    try {
      const data = {
        extension: `?tracking=${tracking}`,
      };

      const response = await axios({
        url: `https://ecom-api-5wlr.onrender.com/histories`,
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        data,
      });
      setHistory(response.data.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      {statusColors[status] ? (
        <Label onClick={handleOpenModal} variant="filled" style={{ cursor: 'pointer' }} color={colors[status]}>
          {status}{' '}
        </Label>
      ) : (
        <Label onClick={handleOpenModal} variant="filled" style={{ cursor: 'pointer' }}>
          {status}{' '}
        </Label>
      )}

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h4" component="h4" style={{ textAlign: 'center' }}>
            Parcel Followup <Label>{tracking}</Label>
          </Typography>
          <hr style={{ border: '1px solid #eee', marginTop: 10, marginBottom: 20 }} />
          {history && (
            <>
              <Typography id="modal-modal-title" variant="h6" component="h6" style={{ textAlign: 'center' }}>
                {history[0].status}
              </Typography>
              <p style={{ textAlign: 'center' }}>
                {history[0].status !== 'Prêt à expédier' && history[0].status !== 'En préparation' && (
                  <p style={{ margin: 0, fontSize: 16 }}>
                    {history[0].wilaya_name}, {history[0].commune_name}, {history[0].center_name}
                  </p>
                )}
              </p>
              <p style={{ margin: 0, fontSize: 16, textAlign: 'center' }}>{history[0].date_status}</p>

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
                {history.map((hist, i) => (
                  <TimelineItem key={i}>
                    <TimelineOppositeContent color="textSecondary">
                      <p
                        style={{
                          fontSize: 12,
                          marginBottom: 0,
                        }}
                      >
                        {hist.date_status.split(' ')[0]}
                      </p>
                      <p
                        style={{
                          fontSize: 16,
                          marginTop: 0,
                        }}
                      >
                        {hist.date_status.split(' ')[1]}
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
                      {hist.status !== 'Prêt à expédier' && hist.status !== 'En préparation' && (
                        <p style={{ margin: 0, fontSize: 12, color: '#999' }}>
                          {hist.wilaya_name}, {hist.commune_name}, {hist.center_name}
                        </p>
                      )}
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

export default ParcelHistoryModal;
