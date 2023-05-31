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

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [updating, setUpdating] = useState(false);
  useEffect(() => {
    const getLogs = async () => {
      try {
        const agentsMap = {
          'Shakira Lozi': 'Boutheina Nezzar',
          'Rahm Bnf19': 'Rahma benfedda',
          'Jemy Gift': 'Lina Gherzouli',
        };
        const { data, error } = await supabase
          .from('logs')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(200);
        if (data) {
          console.log('data is', data);
          const genLogs = data.map((log) => {
            // if (log.enti)
            const suffix = log.action === 'add' ? 'ed' : 'd';
            const formattedDate = `${log.created_at.split('T')[0]} ${log.created_at.split('T')[1].slice(0, 8)}`;
            return (
              <>
                [{formattedDate}] <span style={{ color: '#3f51b5' }}>{agentsMap[log.user_fullname]}</span> {log.action}
                {suffix} {log.entity} with number {log.number} {log.last_status ? `(${log.last_status})` : ''}
              </>
            );
          });
          setLogs(genLogs);
        }
        if (error) {
          console.log('something went wrong', error);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getLogs();
  }, []);

  useEffect(() => {
    const getLogs = async () => {
      try {
        const { data, error } = await supabase.from('inventory').select(`
            *,
            items(
              *
            )
          `);

        if (data) {
          const newData = data.map((row) => ({
            product: row.items.product,
            color: row.items.color,
            size: row.items.size,
            quantity: row.quantity,
          }));
          console.log('data is join', newData);
        }
        if (error) {
          console.log('something went wrong', error);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getLogs();
  }, []);

  useEffect(() => {
    const getLogs = async () => {
      try {
        const { data, error } = await supabase
          .from('order_item')
          .select(
            `
            qty,
            items(
              *
            )
          `
          )
          .eq('order_id', 2352);

        if (data) {
          const newData = data.map((row) => ({
            product: row.items.product,
            color: row.items.color,
            size: row.items.size,
            quantity: row.qty,
          }));
          console.log('data is join order', newData);
        }
        if (error) {
          console.log('something went wrong', error);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getLogs();
  }, []);

  return (
    <>
      <Helmet>
        <title> Audit Page </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Audit Page
          </Typography>
          {/* <Stack direction="row">
            
          </Stack> */}
        </Stack>

        <Card style={{ minHeight: '50vh' }}>
          <Scrollbar>
            <div style={{ margin: '2rem' }}>
              {logs.map((log, i) => (
                <p key={i}>
                  <code style={{ marginY: '10px' }}>{log}</code>
                </p>
              ))}
            </div>
          </Scrollbar>
        </Card>
      </Container>
    </>
  );
}
