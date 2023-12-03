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
import CreateExpenseModal from '../components/modals/expense/create-expense/CreateExpenseModal';
import ExpenseDetailsModal from '../components/modals/expense/expense-details/ExpenseDetailsModal';
// ----------------------------------------------------------------------

const Alert = forwardRef((props, ref) => <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />);

const TABLE_HEAD = [
  { id: 'category', label: 'Category', alignRight: false },
  { id: 'amount', label: 'Amount', alignRight: false },
  { id: 'department', label: 'Department', alignRight: false },
  { id: 'type', label: 'Type', alignRight: false },
  { id: '', alignRight: false },
  // { id: '' },
];

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

export default function FinancePage() {
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
  const [rowsCount, setRowsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState('');

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
    const fetchLeads = async () => {
      try {
        setIsLoading(true);
        const { data: dataAuth, error: errorAuth } = await supabase.auth.getSession();
        const { email } = dataAuth.session.user;
        const { data: dataUser, error: errorUser } = await supabase.from('users').select().eq('email', email).single();

        if (dataUser) {
          console.log('data user: ', dataUser);
        }

        if (errorUser) {
          console.log('error user: ', errorUser);
        }

        let query = supabase
          .from('expenses')
          .select('*', { count: 'exact' })
          // .in('product', product)
          // .eq('agent_id', dataUser.id)
          .order('created_at', { ascending: false })
          .range(page * rowsPerPage, page * rowsPerPage + rowsPerPage - 1);
        if (filterCategory !== '' && filterDepartment !== '') {
          query = query.eq('category', filterCategory).eq('department', filterDepartment);
        } else if (filterCategory !== '' && filterDepartment === '') {
          query = query.eq('category', filterCategory);
        } else if (filterDepartment !== '' && filterCategory === '') {
          query = query.in('department', filterDepartment);
        }

        const { count, data, error } = await query;

        if (data) {
          const fetchedExpenses = data.map((expense) => ({
            id: expense.id,
            category: expense.category,
            amount: expense.amount,
            department: expense.department,
            type: expense.type,
            date: expense.created_at,
            comment: expense.comment,
          }));
          setRowsCount(count);
          setLeads(fetchedExpenses);
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
  }, [rowsPerPage, page, triggerFetch, filterCategory, filterDepartment]);

  const handleDeleteExpense = async (id) => {
    try {
      if (window.confirm('are you sure about deleting the lead?')) {
        const { error } = await supabase.from('expenses').delete().eq('id', id);

        if (error) {
          setFeedback('a Problem accured when removing the expense');
          setIsError(true);
        } else {
          setFeedback('Expense removed successfully!');
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

  return (
    <>
      <Helmet>
        <title> Finance </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Expenses
          </Typography>
          <Stack direction="row">
            <CreateExpenseModal handleTriggerFetch={(val) => setTriggerFetch(val)} />
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
                <FormControl fullWidth style={{ width: 240, marginLeft: 10, marginTop: 10 }}>
                  <InputLabel>Filter Category</InputLabel>
                  <Select
                    value={filterCategory}
                    label="filter-category"
                    onChange={(e) => {
                      setFilterCategory(e.target.value);
                      setPage(0);
                    }}
                  >
                    <MenuItem value={''}>All</MenuItem>
                    <MenuItem value="advertising">Advertising</MenuItem>
                    <MenuItem value="multimedia">Multimedia</MenuItem>
                    <MenuItem value="food">Food</MenuItem>
                    <MenuItem value="utilities">Utilities</MenuItem>
                    <MenuItem value="rent">Rent</MenuItem>
                    <MenuItem value="paycheck">Paycheck</MenuItem>
                    <MenuItem value="transport">Transport</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth style={{ width: 240, marginLeft: 10, marginTop: 10, marginBottom: 10 }}>
                  <InputLabel>Filter Department</InputLabel>
                  <Select
                    value={filterDepartment}
                    label="filter-department"
                    onChange={(e) => {
                      setFilterDepartment(e.target.value);
                      setPage(0);
                    }}
                  >
                    <MenuItem value={''}>All</MenuItem>
                    <MenuItem value="garment-factory">Garment Factory</MenuItem>
                    <MenuItem value="ecommerce">Ecommerce</MenuItem>
                  </Select>
                </FormControl>
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
                        const { id, amount, department, type, category, comment, date } = row;
                        const selectedLead = selected.indexOf(id) !== -1;

                        return (
                          <TableRow hover key={id + page} tabIndex={-1} role="checkbox" selected={selectedLead}>
                            <TableCell padding="checkbox">
                              <Checkbox checked={selectedLead} onChange={(event) => handleClick(event, id)} />
                            </TableCell>

                            <TableCell component="th" scope="row" padding="none">
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar
                                  alt={amount}
                                  src={`https://api.dicebear.com/5.x/fun-emoji/svg?seed=${amount}`}
                                />
                                <Typography variant="subtitle2" noWrap>
                                  {category}
                                </Typography>
                              </Stack>
                            </TableCell>

                            <TableCell align="left">{amount}</TableCell>

                            <TableCell align="left">{department}</TableCell>

                            <TableCell align="left">{type}</TableCell>

                            <TableCell align="right">
                              <Stack direction="row">
                                <IconButton size="large" color="inherit" onClick={() => handleDeleteExpense(id)}>
                                  <Iconify icon={'eva:trash-2-outline'} />
                                </IconButton>
                                <ExpenseDetailsModal
                                  id={id}
                                  createdAtAttr={date}
                                  amountAttr={amount}
                                  departmentAttr={department}
                                  typeAttr={type}
                                  commentAttr={comment}
                                  categoryAttr={category}
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
