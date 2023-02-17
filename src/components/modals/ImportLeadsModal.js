import { Box, Modal, Button, Typography, IconButton, Snackbar } from '@mui/material';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import Papa from 'papaparse';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import supabase from '../../config/SupabaseClient';
import Iconify from '../iconify/Iconify';
import CreateLeadForm from './CreateLeadForm';

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
const Alert = forwardRef((props, ref) => {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
function ImportLeadsModal() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [leadsCsv, setLeadsCsv] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [openSnack, setOpenSnack] = useState(false);
  const [isError, setIsError] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [agents, setAgents] = useState([]);
  const [agentsCount, setAgentsCount] = useState(0);
  const [currentAgentId, setCurrentAgentId] = useState('');
  const inputRef = useRef();

  const handleSnackClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const { data, error } = await supabase.from('users').select('*').eq('role', 'agent');

        if (data) {
          console.log('the data tracker: ', data);
          setAgents(data);
          setAgentsCount(data.length);
          // const { data: dataAuth, error: errorAuth } = await supabase.auth.getSession();
          // if (dataAuth) {
          //   const { email } = dataAuth.session.user;
          //   const relevantEmail = data.filter((item) => item.email === email);
          //   console.log('the relevant record', relevantEmail);
          // }
          // if (errorAuth) {
          //   console.log('could not get user ', errorAuth);
          // }
        }

        if (error) {
          console.log('something went wrong ', error);
        }
      } catch (error) {
        console.log('catched an error ', error);
      }
    };

    fetchAgents();
  }, []);

  const handleUploadCSV = async () => {
    setUploading(true);

    const input = inputRef?.current;
    const reader = new FileReader();
    const [file] = input.files;

    reader.onloadend = async ({ target }) => {
      const csv = await Papa.parse(target.result, { header: true });
      try {
        let rows = [];
        let agentId;

        rows = csv.data.map((item) => {
          if (agentsCount !== 0) {
            agentId = agents[Math.floor(Math.random() * agentsCount)].id;
          } else {
            agentId = null;
          }
          const phone = item.phone_number ? item.phone_number.replace('p:', '') : '';
          console.log('the phone is ', phone);
          const createdTime = item.created_time;
          const fullName = item.full_name;
          const wilaya = item.state;
          const address = item.street_address;

          return {
            first_name: fullName,
            last_name: '',
            wilaya,
            commune: '',
            address,
            phone,
            created_at: new Date(createdTime),
            agent_id: agentId,
          };
        });
        const csvData = rows.filter((item) => !!item.first_name && item.first_name !== '');
        console.log('the rows: ', csvData);
        // console.log('the rows are ', rows);
        const { error } = await supabase.from('leads').insert(csvData);
        if (error) {
          console.log('something went wrong wth record');
          setIsError(true);
          setFeedback('a Problem accured when importing leads!');
        } else {
          setIsError(false);
          setFeedback('Leads imported successfully');
        }
        setUploading(false);
        setOpenSnack(true);
        // setUploaded(true);
      } catch (error) {
        console.log(error);
      }
      console.log(csv);
    };

    reader.readAsText(file);
  };
  return (
    <div>
      <IconButton
        onClick={handleOpen}
        color="primary"
        aria-label="upload picture"
        component="label"
        style={{ marginLeft: 10 }}
      >
        <Iconify icon="eva:cloud-upload-outline" />
      </IconButton>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h3" component="h2" style={{ textAlign: 'center' }}>
            Import Leads
          </Typography>
          <div style={{ marginTop: 10 }}>
            <div
              className="mb-4"
              style={{
                width: '100%',
                marginBottom: '1rem',
                background: 'rgb(246, 247, 251)',
                borderRadius: 6,
                border: '1px solid rgb(204, 204, 204)',
              }}
            >
              <input
                ref={inputRef}
                disabled={uploading}
                type="file"
                style={{
                  // height: '3rem',
                  paddingTop: '1.5rem',
                  paddingBottom: '1.5rem',
                  display: 'block',
                  fontSize: '1rem',
                  lineHeight: 2,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              />
            </div>
            <Button onClick={handleUploadCSV} fullWidth disabled={uploading} size="large" variant="contained">
              {uploading ? 'Importing...' : 'Import'}
            </Button>
          </div>
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

export default ImportLeadsModal;
