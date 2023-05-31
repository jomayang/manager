import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { useEffect, useState } from 'react';
// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  Avatar,
  Popover,
  Checkbox,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  Container,
  Typography,
  IconButton,
  TableContainer,
  TablePagination,
  Tooltip,
  InputAdornment,
  styled,
  OutlinedInput,
  Toolbar,
  alpha,
  Button,
} from '@mui/material';
// components
import axios from 'axios';
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
import supabase from '../config/SupabaseClient';
// sections
// mock
import USERLIST from '../_mock/user';
import { LeadListHead } from '../sections/@dashboard/lead';
import CreateLeadModal from '../components/modals/lead/create-lead/CreateLeadModal';
import EditLeadStatus from '../components/modals/lead/edit-lead/EditLeadStatus';
import ImportLeadsModal from '../components/modals/lead/import-leads/ImportLeadsModal';

// ----------------------------------------------------------------------

const statusColors = {
  initial: 'info',
  canceled: 'danger',
  confirmed: 'success',
  'not-responding': 'warning',
  unreachable: 'warning',
  busy: 'warning',
  reported: 'secondary',
  other: 'secondary',
};

const statusArray = [
  'Pas encore expédié',
  'A vérifier',
  'En préparation',
  'Pas encore ramassé',
  'Prêt à expédier',
  'Ramassé',
  'Transfert',
  'Expédié',
  'Centre',
  'En localisation',
  'Vers Wilaya',
  'Reçu à Wilaya',
  'En attente du client',
  'Sorti en livraison',
  'En attente',
  'En alerte',
  'Tentative échouée',
  'Livré',
  'Echèc livraison',
  'Retour vers centre',
  'Retourné au centre',
  'Retour transfert',
  'Retour groupé',
  'Retour à retirer',
  'Retour vers vendeur',
  'Retourné au vendeur',
  'Echange échoué',
];
const returned = [
  'Echèc livraison',
  'Retour vers centre',
  'Retourné au centre',
  'Retour transfert',
  'Retour groupé',
  'Retour à retirer',
  'Retour vers vendeur',
  'Retourné au vendeur',
];
// ----------------------------------------------------------------------

export default function BackupPage() {
  const [logs, setLogs] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [updating, setUpdating] = useState(false);
  useEffect(() => {
    const getParcels = async () => {
      try {
        console.log(statusArray.join(','));
        const data = {
          extension: `?payment_status=not-ready&order_by=date_last_status&page_size=500`,
        };
        const response = await axios({
          url: `https://ecom-api-5wlr.onrender.com/`,
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          data,
        });
        console.log(response.data.data.data);
        setParcels(response.data.data.data);
      } catch (error) {
        console.log(error);
      }
    };
    getParcels();
  }, []);

  const updateParcels = async () => {
    try {
      setLogs([]);
      setUpdating(true);
      const localLogsPromise = parcels.map(async (parcel, i) => {
        let finalStatus;
        if (returned.includes(parcel.last_status)) {
          finalStatus = 'returned';
        } else if (parcel.last_status === 'Livré') {
          finalStatus = 'delivered';
        } else if (parcel.last_status === 'En préparation') {
          finalStatus = 'initial';
        } else {
          finalStatus = 'processing';
        }
        console.log('final status ', finalStatus);
        console.log('date last: ', new Date(parcel.date_last_status));
        const modifiedAt = new Date(parcel.date_last_status);
        const { error } = await supabase
          .from('orders')
          .update({ status: finalStatus, yalidine_status: parcel.last_status, modified_at: modifiedAt })
          .eq('tracking_id', parcel.tracking);

        if (error) {
          console.log(error);
          return `Error: Failed to updated parcel ${parcel.tracking}`;
        }
        return (
          <>
            <span style={{ color: '#3f51b5' }}>{parcel.tracking}</span> has been successfully update to{' '}
            {parcel.last_status}
          </>
        );
      });
      const localLogs = await Promise.all(localLogsPromise);
      setLogs(localLogs);
      setUpdating(false);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <Helmet>
        <title> BackupPage </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Backup Page
          </Typography>
          <Stack direction="row">
            <Button variant="contained" onClick={updateParcels}>
              Backup
            </Button>
          </Stack>
        </Stack>

        <Card style={{ minHeight: '50vh' }}>
          <Scrollbar>
            <div style={{ margin: '2rem' }}>
              {updating && <p>Updating the database...</p>}
              {logs.length !== 0 && (
                <>
                  {logs.map((log, i) => (
                    <p key={i}>
                      <code style={{ marginY: '10px' }}>{log}</code>
                    </p>
                  ))}
                </>
              )}
            </div>
          </Scrollbar>
        </Card>
      </Container>
    </>
  );
}
