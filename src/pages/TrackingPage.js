import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { useCallback, useContext, useEffect, useState } from 'react';
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
  Badge,
  Select,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Skeleton,
} from '@mui/material';
// components
import axios from 'axios';
import CheckIcon from '@mui/icons-material/Check';
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
import supabase from '../config/SupabaseClient';
// sections
// mock
import USERLIST from '../_mock/user';
import { LeadListHead } from '../sections/@dashboard/lead';
import CreateLeadModal from '../components/modals/CreateLeadModal';
import EditLeadStatus from '../components/modals/EditLeadStatus';
import ParcelHistoryModal from '../components/modals/ParcelHistoryModal';
import ParcelDetailsModal from '../components/modals/ParcelDetailsModal';
import { UserContext } from '../context/UserContext';
import { histResponse } from '../data/histResponse';
import { parcelsResponse } from '../data/parcelsResponse';
import TrackingListItem from '../components/tracking/TrackingListItem';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: '', label: '', alignRight: false },
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'phone', label: 'Phone', alignRight: false },
  { id: 'wilaya', label: 'Wilaya', alignRight: false },
  { id: 'commune', label: 'Commune', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  // { id: '', label: '', alignRight: false },
  { id: '' },
];

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

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}
const pause = (duration) =>
  new Promise((resolve) => {
    setTimeout(resolve, duration);
  });

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

const StyledRoot = styled(Toolbar)(({ theme }) => ({
  height: 96,
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1, 0, 3),
}));

const followupStatusArray = ['Centre', 'Reçu à Wilaya', 'Sorti en livraison', 'Tentative échouée'];

const StyledSearch = styled(OutlinedInput)(({ theme }) => ({
  width: 240,
  transition: theme.transitions.create(['box-shadow', 'width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  '&.Mui-focused': {
    width: 320,
    boxShadow: theme.customShadows.z8,
  },
  '& fieldset': {
    borderWidth: `1px !important`,
    borderColor: `${alpha(theme.palette.grey[500], 0.32)} !important`,
  },
}));

export default function TrackingPage() {
  const [open, setOpen] = useState(null);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [leads, setLeads] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [rowsCount, setRowsCount] = useState(0);
  const [trackingState, setTrackingState] = useState({});
  const [currentUserId, setCurrentUserId] = useState();
  const [loading, setLoading] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [histories, setHistories] = useState(null);
  const [historiesLoading, setHistoriesLoading] = useState(false);
  const { user } = useContext(UserContext);
  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };
  const [lastChangedTracking, setLastChangedTracking] = useState('');
  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = USERLIST.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  useEffect(() => {
    const fetchTrackers = async () => {
      try {
        const { data, error } = await supabase.from('users').select('*').eq('role', 'tracker');

        if (data) {
          const { data: dataAuth, error: errorAuth } = await supabase.auth.getSession();
          if (dataAuth) {
            const { email } = dataAuth.session.user;
            const { data: dataUser, error: errorUser } = await supabase
              .from('users')
              .select()
              .eq('email', email)
              .single();

            if (dataUser) {
              setCurrentUserRole(dataUser.role);
            }
            if (errorUser) {
              console.log(errorUser);
            }
            const relevantEmail = data.filter((item) => item.email === email);
            if (relevantEmail.length !== 0) {
              setCurrentUserId(relevantEmail[0].id);
            } else {
              setCurrentUserId(null);
            }
          }
          if (errorAuth) {
            console.log('could not get user ', errorAuth);
          }
        }

        if (error) {
          console.log('something went wrong ', error);
        }
      } catch (error) {
        console.log('catched an error ', error);
      }
    };

    fetchTrackers();
  }, []);
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rowsCount) : 0;

  const filteredLeads = applySortFilter(leads, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredLeads.length && !!filterName;

  // useEffect(() => {
  //   const fetchLeads = async () => {
  //     try {
  //       const { count, data, error } = await supabase
  //         .from('orders')
  //         .select('id', { count: 'exact' })
  //         .order('created_at', { ascending: false })
  //         .range(page * rowsPerPage, page * rowsPerPage + rowsPerPage - 1);
  //       console.log([page * rowsPerPage, page * rowsPerPage + rowsPerPage - 1]);
  //       if (data) {
  //         setRowsCount(count);
  //       }

  //       if (error) {
  //         console.log('something went wrong', error);
  //       }
  //     } catch (error) {
  //       console.log('something was wrong', error);
  //     }
  //   };
  //   fetchLeads();
  // }, [rowsPerPage, page]);

  useEffect(() => {
    const fetchParcels = async () => {
      let data;
      let object;
      if (currentUserRole === 'admin' && filterStatus !== '') {
        data = {
          extension: `?page_size=${rowsPerPage}&page=${page + 1}&order_by=date_last_status&last_status=${filterStatus}`,
        };
      } else if (currentUserRole === 'admin' && filterStatus === '') {
        data = {
          extension: `?page_size=${rowsPerPage}&page=${page + 1}&order_by=date_last_status`,
        };
      } else if (currentUserRole !== 'admin' && filterStatus !== '') {
        data = {
          extension: `?page_size=${rowsPerPage}&page=${
            page + 1
          }&order_by=date_last_status&last_status=${filterStatus}&order_id=order_${currentUserId}`,
        };
      } else if (currentUserRole !== 'admin' && filterStatus === '') {
        data = {
          extension: `?page_size=${rowsPerPage}&page=${
            page + 1
          }&order_by=date_last_status&order_id=order_${currentUserId}`,
        };
      }
      console.log('user id', currentUserId, 'user role', currentUserRole);
      if (currentUserRole !== '') {
        try {
          // console.log('calling API');
          setLoading(true);
          const response = await axios({
            url: `https://ecom-api-5wlr.onrender.com/`,
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            data,
          });
          /* -------------------------------------------
           * PARCELS RESPONSE
           */
          // const response = parcelsResponse;
          console.log('response fulfiled', response);
          setRowsCount(response.data.data.total_data);
          setLeads(response.data.data.data);
          // setRowsCount(response.length);
          // setLeads(response);
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchParcels();
  }, [page, rowsPerPage, filterStatus, currentUserId, currentUserRole]);

  useEffect(() => {
    const fetchHistories = async () => {
      try {
        setHistoriesLoading(true);
        console.log('new leads', leads);
        const trackings = leads.map((lead) => lead.tracking);

        const trackingsStr = trackings.join(',');

        await pause(1000);
        const data = {
          extension: `?tracking=${trackingsStr}`,
        };
        console.log('ext: ', data);
        // if (currentUserId !== '') {
        const response = await axios({
          url: `https://ecom-api-5wlr.onrender.com/histories`,
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          data,
        });

        // const response =

        /* ------------------------------------------------
         * HISTORY RESPONSE
         */
        // const response = histResponse;
        console.log('***************************', response);
        // console.log('response -> ', response.data);
        if (response) {
          // const responseData = response.data.data.data;
          const responseData = response.data.data.data;
          // console.log('response data', responseData);
          const object = responseData.reduce((obj, item) => {
            if (obj[item.tracking])
              return Object.assign(obj, {
                [item.tracking]: [...obj[item.tracking], item.status],
              });
            return Object.assign(obj, {
              [item.tracking]: [item.status],
            });
          }, {});
          console.log('the object => ', object);
          setHistories(object);
        }
        setHistoriesLoading(false);
        // }
      } catch (error) {
        console.log('something went wrong', error);
        setHistoriesLoading(false);
      }
    };
    fetchHistories();
  }, [lastChangedTracking, leads, page, rowsPerPage, filterStatus]);

  useEffect(() => {
    const fetch = async () => {
      let object;
      try {
        // console.log('new leads', leads);
        const trackings = leads.map((lead) => lead.tracking);
        const { data: trackingData, error: trackingError } = await supabase
          .from('followups')
          .select('*')
          .in('tracking', trackings);
        // const trackings = leads;

        if (trackingData) {
          // console.log('tracking data', trackingData);
          object = trackingData.reduce(
            (obj, item) =>
              Object.assign(obj, {
                [item.tracking]: {
                  isHandledOut: item.is_handled_out,
                  isHandledOut2: item.is_handled_out_2,
                  isHandledOut3: item.is_handled_out_3,
                  isHandledReceived: item.is_handled_received,
                  isHandledCenter: item.is_handled_center,
                  isHandledMissed: item.is_handled_missed,
                  isHandledMissed2: item.is_handled_missed_2,
                  isHandledMissed3: item.is_handled_missed_3,
                },
              }),
            {}
          );
          // console.log('the object', object);
          setTrackingState(object);
        }

        if (trackingError) console.log('tracking error: ', trackingError);
      } catch (error) {
        console.log(error);
      }
    };
    fetch();
  }, [lastChangedTracking, leads, histories, page]);
  useEffect(() => {
    console.log('histories === ---> ', histories);
    console.log('tracking state === --->', trackingState);
  }, [histories, trackingState]);

  // const getIsActive = (tracking, status) => {
  //   // console.log(`getIsActive(${tracking}, ${status})`);
  //   // console.log(trackingState);
  //   // console.log(histories);
  //   if (histories && !historiesLoading && trackingState && trackingState[tracking]) {
  //     // console.log('*-*>', histories);
  //     // console.log('*-*>', histories[tracking]);
  //     if (status === 'Centre') {
  //       return trackingState[tracking].isHandledCenter;
  //     }
  //     if (status === 'Reçu à Wilaya') {
  //       return trackingState[tracking].isHandledReceived;
  //     }
  //     if (status === 'Sorti en livraison') {
  //       const attempt = histories[tracking].filter((state) => state === 'Sorti en livraison').length;

  //       if (attempt === 2) {
  //         return trackingState[tracking].isHandledOut2;
  //       }
  //       if (attempt === 3) {
  //         return trackingState[tracking].isHandledOut3;
  //       }
  //       return trackingState[tracking].isHandledOut;
  //     }
  //     if (status === 'Tentative échouée') {
  //       const attempt = histories[tracking].filter((state) => state === 'Tentative échouée').length;

  //       // console.log('attempt: ', attempt);
  //       if (attempt === 2) {
  //         return trackingState[tracking].isHandledMissed2;
  //       }
  //       if (attempt === 3) {
  //         return trackingState[tracking].isHandledMissed3;
  //       }
  //       return trackingState[tracking].isHandledMissed;
  //     }
  //   }

  //   return false;
  // };

  return (
    <>
      <Helmet>
        <title> Tracking </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Tracking{' '}
          </Typography>
        </Stack>

        <Card>
          <StyledRoot
            sx={{
              ...(selected.length > 0 && {
                color: 'primary.main',
                bgcolor: 'primary.lighter',
              }),
            }}
          >
            {selected.length > 0 ? (
              <Typography component="div" variant="subtitle1">
                {selected.length} selected
              </Typography>
            ) : (
              <FormControl fullWidth style={{ width: 200 }}>
                <InputLabel>Filter Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="filter-status"
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value={''}>All</MenuItem>
                  <MenuItem value={'Centre'}>Centre</MenuItem>
                  <MenuItem value={'Reçu à Wilaya'}>Reçu à Wilaya</MenuItem>
                  <MenuItem value={'Sorti en livraison'}>Sorti en livraison</MenuItem>
                  <MenuItem value={'Tentative échouée'}>Tentative échouée</MenuItem>
                </Select>
              </FormControl>
            )}

            {selected.length > 0 ? (
              <Tooltip title="Delete">
                <IconButton>
                  <Iconify icon="eva:trash-2-fill" />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Filter list">
                <IconButton>
                  <Iconify icon="ic:round-filter-list" />
                </IconButton>
              </Tooltip>
            )}
          </StyledRoot>

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <LeadListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={rowsCount}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {loading ? (
                    <>
                      <TableRow>
                        <TableCell>
                          <p> </p>
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="text" sx={{ fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="text" sx={{ fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="text" sx={{ fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="text" sx={{ fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="text" sx={{ fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="text" sx={{ fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={2}>
                            <Skeleton variant="circular" width={20} height={20} />
                            <Skeleton variant="circular" width={20} height={20} />
                          </Stack>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <p> </p>
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="text" sx={{ fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="text" sx={{ fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="text" sx={{ fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="text" sx={{ fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="text" sx={{ fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="text" sx={{ fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={2}>
                            <Skeleton variant="circular" width={20} height={20} />
                            <Skeleton variant="circular" width={20} height={20} />
                          </Stack>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <p> </p>
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="text" sx={{ fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="text" sx={{ fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="text" sx={{ fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="text" sx={{ fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="text" sx={{ fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="text" sx={{ fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={2}>
                            <Skeleton variant="circular" width={20} height={20} />
                            <Skeleton variant="circular" width={20} height={20} />
                          </Stack>
                        </TableCell>
                      </TableRow>
                    </>
                  ) : (
                    <>
                      {leads.map((row) => {
                        const {
                          tracking: id,
                          familyname: lastName,
                          firstname: firstName,
                          last_status: status,
                          contact_phone: phone,
                          to_wilaya_name: wilaya,
                          to_commune_name: commune,
                          date_creation: creationDate,
                          date_expedition: expeditionDate,
                          delivery_fee: deliveryFees,
                          price,
                          product_list: product,
                          tracking,
                          is_stopdesk: isStopdesk,
                        } = row;
                        const selectedLead = selected.indexOf(id) !== -1;
                        return (
                          <TrackingListItem
                            key={id}
                            id={id}
                            lastName={lastName}
                            firstName={firstName}
                            status={status}
                            wilaya={wilaya}
                            phone={phone}
                            commune={commune}
                            creationDate={creationDate}
                            expeditionDate={expeditionDate}
                            deliveryFees={deliveryFees}
                            price={price}
                            tracking={tracking}
                            product={product}
                            isStopdesk={isStopdesk}
                            selectedLead={selectedLead}
                            page={page}
                            historiesLoading={historiesLoading}
                            followupStatusArray={followupStatusArray}
                            currentUserRole={currentUserRole}
                            statusColors={statusColors}
                            handleClick={handleClick}
                            handleLastChangedTracking={(val) => setLastChangedTracking(val)}
                            histories={histories}
                            trackingState={trackingState}
                            user={user}
                          />
                        );
                      })}
                    </>
                  )}
                  {/* {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )} */}
                </TableBody>

                {isNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <Paper
                          sx={{
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h6" paragraph>
                            Not found
                          </Typography>

                          <Typography variant="body2">
                            No results found for &nbsp;
                            <strong>&quot;{filterName}&quot;</strong>.
                            <br /> Try checking for typos or using complete words.
                          </Typography>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[25, 50, 100]}
            component="div"
            count={rowsCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 1,
            width: 140,
            '& .MuiMenuItem-root': {
              px: 1,
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        <MenuItem>
          <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }} />
          Edit
        </MenuItem>

        <MenuItem sx={{ color: 'error.main' }}>
          <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>
    </>
  );
}
