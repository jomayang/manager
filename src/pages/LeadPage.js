import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { forwardRef, useEffect, useState } from 'react';
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
  Snackbar,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
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
import LeadDetailsModal from '../components/modals/lead/lead-details/LeadDetailsModal';
import { missedLeads } from '../data/missedLeads';
// ----------------------------------------------------------------------

const Alert = forwardRef((props, ref) => <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />);

const TABLE_HEAD = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'phone', label: 'Phone', alignRight: false },
  { id: 'wilaya', label: 'Wilaya', alignRight: false },
  { id: 'commune', label: 'Commune', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: '', alignRight: false },
  { id: '' },
];

const statusColors = {
  initial: 'info',
  canceled: 'error',
  confirmed: 'success',
  'not-responding': 'warning',
  unreachable: 'warning',
  busy: 'warning',
  reported: 'secondary',
  other: 'secondary',
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
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1, 0, 3),
  paddingTop: 18,
  paddingBottom: 18,
}));

const StyledSearch = styled(OutlinedInput)(({ theme }) => ({
  width: 240,
  marginTop: 10,
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

export default function LeadPage() {
  const [open, setOpen] = useState(null);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);
  const [triggerFetch, setTriggerFetch] = useState();
  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');
  const [isError, setIsError] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [leads, setLeads] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [rowsCount, setRowsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [filterAgent, setFilterAgent] = useState('');
  const [userSession, setUserSession] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [currentUser, setCurrentUser] = useState({});
  const [listOfProducts, setListOfProducts] = useState([]);
  useEffect(() => {
    console.log(selected);
  }, [selected]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = leads.map((n) => n.name);
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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - leads.length) : 0;

  const filteredLeads = applySortFilter(leads, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredLeads.length && !!filterName;

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.rpc('get_all_products');
      if (data) {
        setListOfProducts(data);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setIsLoading(true);
        const { data: dataAuth, error: errorAuth } = await supabase.auth.getSession();
        const { email } = dataAuth.session.user;
        const { data: dataUser, error: errorUser } = await supabase.from('users').select().eq('email', email).single();

        if (dataUser) {
          console.log('data user: ', dataUser);
          setCurrentUser(dataUser);
        }

        if (errorUser) {
          console.log('error user: ', errorUser);
        }
        const product = filterProduct;

        let agent;
        if (filterAgent === 'lina-gherzouli') {
          agent = 17;
        } else if (filterAgent === 'rahma-benfedda') {
          agent = 23;
        }

        let query = supabase
          .from('leads')
          .select('*', { count: 'exact' })
          // .in('product', product)
          // .eq('agent_id', dataUser.id)
          .order('created_at', { ascending: false })
          .range(page * rowsPerPage, page * rowsPerPage + rowsPerPage - 1);

        if (filterStatus !== '') {
          query = query.eq('status', filterStatus);
        }

        if (filterProduct !== '') {
          query = query.eq('product', filterProduct);
        }

        if (filterAgent !== '') {
          query = query.eq('agent_id', agent);
        }

        // if (filterAgent !== '') {
        //   query = query.eq('agent_id', agent)
        // }

        if (dataUser.role === 'agent' || dataUser.role === 'agent-associate') {
          query = query.eq('agent_id', dataUser.id);
        }

        const { count, data, error } = await query;

        // if (dataAuth) {

        //   const relevantEmail = data.filter((item) => item.email === email);
        //   if (relevantEmail.length !== 0) {
        //     setCurrentAgentId(relevantEmail[0].id);
        //   } else {
        //     setCurrentAgentId(null);
        //   }
        // }
        console.log([page * rowsPerPage, page * rowsPerPage + rowsPerPage - 1]);
        if (data) {
          const fetchedLeads = data.map((lead) => ({
            id: lead.id,
            fullName: `${lead.first_name} ${lead.last_name}`,
            firstName: lead.first_name,
            lastName: lead.last_name,
            phone: lead.phone,
            commune: lead.commune,
            product: lead.product,
            address: lead.address,
            comment: lead.comment,
            agentId: lead.agent_id,
            status: lead.status,
            wilaya: lead.wilaya,
            createdAt: lead.created_at,
            color: lead.color,
            size: lead.size,
          }));
          setRowsCount(count);
          setLeads(fetchedLeads);
        }

        if (error) {
          console.log('something went wrong', error);
        }
        setIsLoading(false);
      } catch (error) {
        console.log('something was wrong', error);
        setIsLoading(false);
      }
    };
    fetchLeads();
  }, [rowsPerPage, page, triggerFetch, filterStatus, filterProduct, filterAgent]);
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        console.log('geooooooo', data.session);
        if (data && data.session) {
          setUserSession(data.session);

          const { data: dataFetch, error: errorFetch } = await supabase
            .from('users')
            .select('role')
            .eq('email', data.session.user.email);

          let role = '';

          if (dataFetch && dataFetch[0]) role = dataFetch[0].role;
          setCurrentUserRole(role);
        }
      } catch (error) {
        console.log('something went wrong ', error);
      }
    };
    getSession();
  }, []);
  // useEffect(() => {
  //   const init = async () => {
  //     try {
  //       const response = await axios({
  //         url: `https://ecom-api-5wlr.onrender.com/`,
  //         method: 'post',
  //         headers: { 'Content-Type': 'application/json' },
  //         data: {
  //           extension: '',
  //         },
  //       });
  //       console.log('the response: ', response.data);
  //       console.log('--', process.env.REACT_APP_API_ID);
  //       console.log('--', process.env.REACT_APP_API_TOKEN);
  //     } catch (error) {
  //       console.log(error);
  //       console.log('--', process.env.REACT_APP_API_ID);
  //       console.log('--', process.env.REACT_APP_API_TOKEN);
  //     }
  //   };
  //   init();
  // }, []);

  // useEffect(() => {
  //   const fetchFilteredLeads = async () => {
  //     try {
  //       setIsLoading(true);
  //       let count;
  //       let data;
  //       let error;
  //       if (filterStatus !== '') {
  //         const {
  //           count: countFilter,
  //           data: dataFilter,
  //           error: errorFilter,
  //         } = await supabase
  //           .from('leads')
  //           .select('*', { count: 'exact' })
  //           .eq('status', filterStatus)
  //           .order('created_at', { ascending: false })
  //           .range(page * rowsPerPage, page * rowsPerPage + rowsPerPage - 1);
  //         count = countFilter;
  //         data = dataFilter;
  //         error = errorFilter;
  //       } else {
  //         const {
  //           count: countAll,
  //           data: dataAll,
  //           error: errorAll,
  //         } = await supabase
  //           .from('leads')
  //           .select('*', { count: 'exact' })
  //           .order('created_at', { ascending: false })
  //           .range(page * rowsPerPage, page * rowsPerPage + rowsPerPage - 1);

  //         count = countAll;
  //         data = dataAll;
  //         error = errorAll;
  //       }
  //       if (data) {
  //         const fetchedLeads = data.map((lead) => ({
  //           id: lead.id,
  //           fullName: `${lead.first_name} ${lead.last_name}`,
  //           firstName: lead.first_name,
  //           lastName: lead.last_name,
  //           phone: lead.phone,
  //           commune: lead.commune,
  //           product: lead.product,
  //           address: lead.address,
  //           comment: lead.comment,
  //           status: lead.status,
  //           wilaya: lead.wilaya,
  //           createdAt: lead.created_at,
  //         }));

  //         setRowsCount(count);
  //         setLeads(fetchedLeads);
  //       }
  //       if (error) {
  //         console.log(error);
  //       }
  //       setIsLoading(false);
  //     } catch (error) {
  //       console.log('something went wrong', error);
  //       setIsLoading(false);
  //     }
  //   };
  //   fetchFilteredLeads();
  // }, [filterStatus]);

  const handleSearchInDb = async (e) => {
    if (e.key === 'Enter') {
      try {
        setIsLoading(true);
        let query = supabase
          .from('leads')
          .select('*', { count: 'exact' })
          .like('phone', `%${searchInput}%`)
          .order('created_at', { ascending: false })
          .range(page * rowsPerPage, page * rowsPerPage + rowsPerPage - 1);

        if (currentUserRole !== 'admin') {
          query = query.eq('agent_id', currentUser.id);
        }

        const { count, data, error } = await query;

        if (data) {
          const fetchedLeads = data.map((lead) => ({
            id: lead.id,
            fullName: `${lead.first_name} ${lead.last_name}`,
            firstName: lead.first_name,
            lastName: lead.last_name,
            phone: lead.phone,
            commune: lead.commune,
            product: lead.product,
            address: lead.address,
            comment: lead.comment,
            status: lead.status,
            wilaya: lead.wilaya,
            createdAt: lead.created_at,
            agentId: lead.agent_id,
            color: lead.color,
            size: lead.size,
          }));

          setRowsCount(count);
          setLeads(fetchedLeads);
        }
        if (error) {
          console.log('something went very wrong', error);
        }
        setIsLoading(false);
      } catch (error) {
        console.log('something went wrong', error);
        setIsLoading(false);
      }
    }
  };

  const handleDeleteLead = async (id) => {
    try {
      if (window.confirm('are you sure about deleting the lead?')) {
        const { error } = await supabase.from('leads').delete().eq('id', id);

        if (error) {
          setFeedback('a Problem accured when removing the lead');
          setIsError(true);
        } else {
          setFeedback('Lead removed successfully!');
          setIsError(false);
          setTriggerFetch(Math.random());
        }
        setOpen(true);
      }
    } catch (error) {
      console.log(error);
      setFeedback('a Problem accured!');
      setIsError(true);
      setOpen(true);
    }
  };

  const handleAddMissedLeads = async () => {
    try {
      const { error } = await supabase.from('leads').update({ product: 'زيت اللحية' }).eq('product', '');
      if (error) {
        console.log('something not good', error);
      } else {
        console.log('success');
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Helmet>
        <title> Leads </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Leads
          </Typography>
          <Stack direction="row">
            <CreateLeadModal handleTriggerFetch={(val) => setTriggerFetch(val)} />
            <ImportLeadsModal />
          </Stack>
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
              // <form onSubmit={handleSearchInDb}>
              <div>
                <StyledSearch
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleSearchInDb}
                  placeholder="Search lead..."
                  startAdornment={
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
                    </InputAdornment>
                  }
                />
                <FormControl fullWidth style={{ width: 240, marginLeft: 10, marginTop: 10 }}>
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
                    <MenuItem value={'initial'}>Initial</MenuItem>
                    <MenuItem value={'confirmed'}>Confirmed</MenuItem>
                    <MenuItem value={'not-responding'}>Not Responding</MenuItem>
                    <MenuItem value={'unreachable'}>Unreachable</MenuItem>
                    <MenuItem value={'canceled'}>Canceled</MenuItem>
                    <MenuItem value={'busy'}>Busy</MenuItem>
                    <MenuItem value={'reported'}>Reported</MenuItem>
                    <MenuItem value={'out-of-stock'}>Out of Stock</MenuItem>
                    <MenuItem value={'other'}>other</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth style={{ width: 240, marginLeft: 10, marginTop: 10, marginBottom: 10 }}>
                  <InputLabel>Filter Product</InputLabel>
                  <Select
                    value={filterProduct}
                    label="filter-product"
                    onChange={(e) => {
                      setFilterProduct(e.target.value);
                      setPage(0);
                    }}
                  >
                    <MenuItem value={''}>All</MenuItem>
                    {listOfProducts.map((item) => (
                      <MenuItem value={item.val}>{item.val}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {currentUserRole === 'admin' && (
                  <FormControl fullWidth style={{ width: 240, marginLeft: 10, marginTop: 10, marginBottom: 10 }}>
                    <InputLabel>Filter Agent</InputLabel>
                    <Select
                      value={filterAgent}
                      label="filter-agent"
                      onChange={(e) => {
                        setFilterAgent(e.target.value);
                        setPage(0);
                      }}
                    >
                      <MenuItem value={''}>All</MenuItem>
                      <MenuItem value={'lina-gherzouli'}>Gherzouli lina</MenuItem>
                      <MenuItem value={'rahma-benfedda'}>Benfedda rahma</MenuItem>
                    </Select>
                  </FormControl>
                )}
              </div>
              // <button
              // </form>
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
                  rowCount={leads.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {isLoading ? (
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
                      {filteredLeads.map((row) => {
                        const {
                          id,
                          fullName,
                          status,
                          phone,
                          wilaya,
                          commune,
                          address,
                          comment,
                          product,
                          firstName,
                          lastName,
                          color,
                          agentId,
                          size,
                          createdAt,
                        } = row;
                        const selectedLead = selected.indexOf(id) !== -1;

                        return (
                          <TableRow hover key={id + page} tabIndex={-1} role="checkbox" selected={selectedLead}>
                            <TableCell padding="checkbox">
                              <Checkbox checked={selectedLead} onChange={(event) => handleClick(event, id)} />
                            </TableCell>

                            <TableCell component="th" scope="row" padding="none">
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar
                                  alt={fullName}
                                  src={`https://api.dicebear.com/5.x/fun-emoji/svg?seed=${fullName}`}
                                />
                                <Typography variant="subtitle2" noWrap>
                                  {fullName}
                                </Typography>
                              </Stack>
                            </TableCell>

                            <TableCell align="left">{phone}</TableCell>

                            <TableCell align="left">{wilaya}</TableCell>

                            <TableCell align="left">{commune}</TableCell>

                            <TableCell align="left">
                              <Label color={statusColors[status]}>{sentenceCase(status)}</Label>
                            </TableCell>
                            <TableCell align="right">
                              <EditLeadStatus
                                id={id}
                                communeAttr={commune}
                                wilayaAttr={wilaya}
                                addressAttr={address}
                                productAttr={product}
                                firstNameAttr={firstName}
                                lastNameAttr={lastName}
                                commentAttr={comment}
                                statusAttr={status}
                                phoneAttr={phone}
                                colorAttr={color}
                                sizeAttr={size}
                                createdAtAttr={createdAt}
                                handleTriggerFetch={(val) => setTriggerFetch(val)}
                              />
                            </TableCell>

                            <TableCell align="right">
                              <Stack direction="row">
                                {currentUserRole === 'admin' && (
                                  <IconButton size="large" color="inherit" onClick={() => handleDeleteLead(id)}>
                                    <Iconify icon={'eva:trash-2-outline'} />
                                  </IconButton>
                                )}
                                <LeadDetailsModal
                                  id={id}
                                  communeAttr={commune}
                                  wilayaAttr={wilaya}
                                  addressAttr={address}
                                  productAttr={product}
                                  firstNameAttr={firstName}
                                  lastNameAttr={lastName}
                                  commentAttr={comment}
                                  agentIdAttr={agentId}
                                  statusAttr={status}
                                  phoneAttr={phone}
                                  createdAtAttr={createdAt}
                                  colorAttr={color}
                                  sizeAttr={size}
                                />
                              </Stack>
                            </TableCell>
                          </TableRow>
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

      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity={isError ? 'error' : 'success'} sx={{ width: '100%' }}>
          {feedback}
        </Alert>
      </Snackbar>
    </>
  );
}
