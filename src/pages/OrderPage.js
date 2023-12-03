import { Helmet } from 'react-helmet-async';
import { create, filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { useEffect, useState, forwardRef, useContext } from 'react';
// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  Avatar,
  Button,
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
  styled,
  OutlinedInput,
  alpha,
  Tooltip,
  InputAdornment,
  Toolbar,
  Snackbar,
  Skeleton,
  Box,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { PDFDownloadLink } from '@react-pdf/renderer';
// components
import axios from 'axios';
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';
// mock
import USERLIST from '../_mock/user';
import { OrderListHead, OrderListToolbar } from '../sections/@dashboard/order';
import CreateOrderModal from '../components/modals/order/create-order/CreateOrderModal';
import supabase from '../config/SupabaseClient';
import OrderDetailsModal from '../components/modals/order/order-details/OrderDetailsModal';
import EditOrderStatus from '../components/modals/order/edit-order/EditOrderStatus';
import { UserContext } from '../context/UserContext';
import ParcelHistoryCustomModal from '../components/modals/parcel/parcel-history-custom/ParcelHistoryCustomModal';
import { DeliverySlip } from '../components/pdf/delivery-slip';

// ----------------------------------------------------------------------
const Alert = forwardRef((props, ref) => <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />);

const TABLE_HEAD = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'phone', label: 'Phone', alignRight: false },
  { id: 'wilaya', label: 'wilaya', alignRight: false },
  { id: 'commune', label: 'Commune', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: '', alignRight: false },
  { id: '' },
];

const statusColors = {
  initial: 'info',
  processing: 'warning',
  returned: 'error',
  delivered: 'success',
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
    return filter(array, (_order) => _order.fullName.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}
const StyledRoot = styled(Toolbar)(({ theme }) => ({
  height: 96,
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1, 0, 3),
}));

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

export default function OrderPage() {
  const [open, setOpen] = useState(null);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');
  const [rowsCount, setRowsCount] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [orders, setOrders] = useState([]);
  const [triggerFetch, setTriggerFetch] = useState();
  const [isError, setIsError] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useContext(UserContext);
  const [currentUserRole, setCurrentUserRole] = useState();
  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

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
      const newSelecteds = orders.map((n) => n.fullName);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - orders.length) : 0;
  const filteredOrders = applySortFilter(orders, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredOrders.length && !!filterName;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const { count, data, error } = await supabase
          .from('orders')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(page * rowsPerPage, page * rowsPerPage + rowsPerPage - 1);
        console.log([page * rowsPerPage, page * rowsPerPage + rowsPerPage - 1]);
        if (data) {
          const fetchedOrders = data.map((order) => ({
            id: order.id,
            fullName: `${order.first_name} ${order.last_name}`,
            firstName: order.first_name,
            lastName: order.last_name,
            phone: order.phone,
            commune: order.commune,
            wilaya: order.wilaya,
            status: order.status,
            trackingId: order.tracking_id,
            product: order.product,
            shippingPrice: order.shipping_price,
            productPrice: order.product_price,
            stopdesk: order.stopdesk,
            isStopdesk: order.is_stopdesk,
            createdAt: order.created_at,
            isAutoDelivered: order.is_auto_delivered,
          }));
          setRowsCount(count);
          setOrders(fetchedOrders);
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
    fetchOrders();
  }, [rowsPerPage, page, triggerFetch]);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (data && data.session) {
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

  const handleSearchInDb = async (e) => {
    if (e.key === 'Enter') {
      try {
        setIsLoading(true);
        const { count, data, error } = await supabase
          .from('orders')
          .select('*', { count: 'exact' })
          .like('phone', `%${searchInput}%`)
          .order('created_at', { ascending: false })
          .range(page * rowsPerPage, page * rowsPerPage + rowsPerPage - 1);
        if (data) {
          const fetchedOrders = data.map((order) => ({
            id: order.id,
            fullName: `${order.first_name} ${order.last_name}`,
            firstName: order.first_name,
            lastName: order.last_name,
            phone: order.phone,
            commune: order.commune,
            wilaya: order.wilaya,
            status: order.status,
            trackingId: order.tracking_id,
            product: order.product,
            shippingPrice: order.shipping_price,
            productPrice: order.product_price,
            stopdesk: order.stopdesk,
            isStopdesk: order.is_stopdesk,
            createdAt: order.created_at,

            isAutoDelivered: order.is_auto_delivered,
          }));
          setRowsCount(count);
          setOrders(fetchedOrders);
        }
        setIsLoading(false);
      } catch (error) {
        console.log('something went wrong', error);
        setIsLoading(false);
      }
    }
  };

  const handleDeleteOrder = async (trackingId, phone) => {
    try {
      alert('are you sure about deleting the order?');
      console.log('tracking is', trackingId);
      const response = await axios({
        url: `https://ecom-api-5wlr.onrender.com/delete/`,
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        data: { tracking: trackingId },
      });
      console.log('done');
      const { error: errorFollowup } = await supabase.from('followups').delete().eq('tracking', trackingId);
      // 1 - Get order_item (item_id, qty) on order_id
      // 2 - For each order_item
      // --> Increase inventory with qty on item_id
      // --> Remove order_item
      // 3 - Remove order
      const { data: dataOrder, error: errorOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('tracking_id', trackingId)
        .single();

      if (dataOrder) {
        const { data: dataOrderItem, error: errorOrderItem } = await supabase
          .from('order_item')
          .select()
          .eq('order_id', dataOrder.id);

        if (dataOrderItem) {
          dataOrderItem.forEach(async (orderItem) => {
            console.log('order item', orderItem);
            const { item_id: itemId, qty } = orderItem;
            console.log('item id ', itemId, 'quantity', qty);
            const { data: dataInventory, error: errorInventory } = await supabase.rpc('increment_inventory', {
              qty_in: qty,
              item_id_in: itemId,
            });

            if (dataInventory) {
              console.log('stock added');
            }
            if (errorInventory) {
              console.log('stock did not increase', errorInventory);
            }
          });
        }
        if (errorOrderItem) {
          console.log('something went wrong', errorOrderItem);
        }
        const { error: errorOrderItemRemove } = await supabase.from('order_item').delete().eq('order_id', dataOrder.id);

        if (errorOrderItemRemove) {
          console.log('could not delete order item', errorOrderItemRemove);
        }
      }

      const { error } = await supabase.from('orders').delete().eq('tracking_id', trackingId);

      if (error || errorFollowup) {
        setFeedback('a Problem accured when removing the lead');
        setIsError(true);
      } else {
        const { error: errorLeadLog } = await supabase.from('logs').insert({
          user_fullname: user.user_metadata.name,
          action: 'delete',
          entity: 'order',
          number: phone,
        });
        if (errorLeadLog) {
          console.log('oops log: ', errorLeadLog);
          setFeedback('a Problem accured when adding the new LOG!');
          setIsError(true);
        }
        setFeedback('Lead removed successfully!');
        setIsError(false);
        setTriggerFetch(Math.random());
      }
      setOpen(true);
    } catch (error) {
      console.log(error);
      setFeedback('a Problem accured!');
      setIsError(true);
      setOpen(true);
    }
  };

  const handleDeleteOrderAuto = async (id, phone) => {
    try {
      alert('are you sure about deleting the order?');
      const { data: dataOrder, error: errorOrder } = await supabase.from('orders').select('id').eq('id', id).single();

      if (dataOrder) {
        const { data: dataOrderItem, error: errorOrderItem } = await supabase
          .from('order_item')
          .select()
          .eq('order_id', dataOrder.id);

        if (dataOrderItem) {
          dataOrderItem.forEach(async (orderItem) => {
            console.log('order item', orderItem);
            const { item_id: itemId, qty } = orderItem;
            console.log('item id ', itemId, 'quantity', qty);
            const { data: dataInventory, error: errorInventory } = await supabase.rpc('increment_inventory', {
              qty_in: qty,
              item_id_in: itemId,
            });

            if (dataInventory) {
              console.log('stock added');
            }
            if (errorInventory) {
              console.log('stock did not increase', errorInventory);
            }
          });
        }
        if (errorOrderItem) {
          console.log('something went wrong', errorOrderItem);
        }
        const { error: errorOrderItemRemove } = await supabase.from('order_item').delete().eq('order_id', dataOrder.id);

        if (errorOrderItemRemove) {
          console.log('could not delete order item', errorOrderItemRemove);
        }
      }
      const { error } = await supabase.from('orders').delete().eq('id', id);

      if (error) {
        setFeedback('a Problem accured when removing the lead');
        setIsError(true);
      } else {
        const { error: errorLeadLog } = await supabase.from('logs').insert({
          user_fullname: user.user_metadata.name,
          action: 'delete',
          entity: 'order',
          number: phone,
        });
        if (errorLeadLog) {
          console.log('oops log: ', errorLeadLog);
          setFeedback('a Problem accured when adding the new LOG!');
          setIsError(true);
        }
        setFeedback('Lead removed successfully!');
        setIsError(false);
        setTriggerFetch(Math.random());
      }
      setOpen(true);
    } catch (error) {
      console.log(error);
      setFeedback('a Problem accured!');
      setIsError(true);
      setOpen(true);
    }
  };

  const handleExpedition = async (id, phone) => {
    try {
      console.log('orderId', id);

      const { error: errorOrder } = await supabase.from('orders').update({ status: 'processing' }).eq('id', id);
      const { data: dataCreateStatus, error: errorCreateStatus } = await supabase
        .from('status')
        .insert({ order_id: id, status: 'processing' })
        .select()
        .single();

      if (errorOrder) {
        setFeedback('Could not change order status');
        setIsError(true);
      } else {
        setFeedback('order status changed successfully');
        setIsError(false);
        setTriggerFetch(Math.random());
      }
    } catch (error) {
      setFeedback('Could not change order status');
      setIsError(true);
    }
  };

  return (
    <>
      <Helmet>
        <title> Orders </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Orders
          </Typography>
          <Stack direction="row" spacing={2}>
            {currentUserRole === 'admin' && (
              <PDFDownloadLink document={<DeliverySlip />} fileName="Ecomeast-delivery-slip">
                <Button color="warning" variant="contained" startIcon={<Iconify icon="eva:printer-outline" />}>
                  Print
                </Button>
              </PDFDownloadLink>
            )}

            <CreateOrderModal handleTriggerFetch={(val) => setTriggerFetch(val)} />
          </Stack>{' '}
        </Stack>

        <Card>
          {/* <OrderListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} /> */}
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
              <StyledSearch
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchInDb}
                placeholder="Search order..."
                startAdornment={
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
                  </InputAdornment>
                }
              />
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
                <OrderListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={orders.length}
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
                      {filteredOrders.map((row) => {
                        const {
                          id,
                          fullName,
                          phone,
                          wilaya,
                          commune,
                          status,
                          trackingId,
                          product,
                          shippingPrice,
                          productPrice,
                          stopdesk,
                          isStopdesk,
                          isAutoDelivered,
                          createdAt,
                        } = row;
                        const selectedOrder = selected.indexOf(id) !== -1;

                        return (
                          <TableRow hover key={id} tabIndex={-1} role="checkbox" selected={selectedOrder}>
                            <TableCell padding="checkbox">
                              <Checkbox checked={selectedOrder} onChange={(event) => handleClick(event, id)} />
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
                              <Label color={statusColors[status]}>{status}</Label>
                            </TableCell>
                            <TableCell align="right">
                              <EditOrderStatus
                                id={id}
                                statusAttr={status}
                                handleTriggerFetch={(val) => setTriggerFetch(val)}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Stack direction="row" justifyContent="right">
                                {status === 'initial' && (
                                  <>
                                    {isAutoDelivered ? (
                                      <IconButton
                                        size="large"
                                        color="inherit"
                                        onClick={() => handleDeleteOrderAuto(id, phone)}
                                      >
                                        <Iconify icon={'eva:trash-2-outline'} />
                                      </IconButton>
                                    ) : (
                                      <IconButton
                                        size="large"
                                        color="inherit"
                                        onClick={() => handleDeleteOrder(trackingId, phone)}
                                      >
                                        <Iconify icon={'eva:trash-2-outline'} />
                                      </IconButton>
                                    )}
                                  </>
                                )}

                                {currentUserRole === 'admin' && isAutoDelivered && (
                                  <ParcelHistoryCustomModal id={id} status={status} />
                                )}

                                <OrderDetailsModal
                                  fullNameAttr={fullName}
                                  id={id}
                                  phoneAttr={phone}
                                  communeAttr={commune}
                                  wilayaAttr={wilaya}
                                  statusAttr={status}
                                  isStopDeskAttr={isStopdesk}
                                  stopdeskAttr={stopdesk}
                                  trackingAttr={trackingId}
                                  productAttr={product}
                                  shippingPriceAttr={shippingPrice}
                                  productPriceAttr={productPrice}
                                  createdAtAttr={createdAt}
                                />

                                {currentUserRole === 'admin' && status === 'initial' && isAutoDelivered && (
                                  <IconButton size="large" color="inherit" onClick={() => handleExpedition(id, phone)}>
                                    <Iconify icon={'eva:checkmark-square-2-outline'} />
                                  </IconButton>
                                )}
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
