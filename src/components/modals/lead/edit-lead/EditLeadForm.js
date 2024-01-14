import {
  Box,
  Button,
  ButtonGroup,
  Chip,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InventoryIcon from '@mui/icons-material/Inventory';
import { Add } from '@mui/icons-material';
import React, { forwardRef, useContext, useEffect, useState } from 'react';
import MuiAlert from '@mui/material/Alert';
import { LoadingButton } from '@mui/lab';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { agencies } from '../../../../data/agencies';
import supabase from '../../../../config/SupabaseClient';
import { wilayas } from '../../../../data/wilayas';
import { communesList } from '../../../../data/communes';
import { communesStopdesk } from '../../../../data/communesStopdesk';
import { fees } from '../../../../data/fees';
import { UserContext } from '../../../../context/UserContext';
import { zone0, zone1, zone2, zone3, zone4, zone5, zone6 } from '../../../../data/comFees';

const Alert = forwardRef((props, ref) => <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />);

function EditLeadForm({
  id,
  communeAttr,
  wilayaAttr,
  addressAttr,
  productAttr,
  firstNameAttr,
  lastNameAttr,
  commentAttr,
  statusAttr,
  phoneAttr,
  handleTriggerFetch,
  colorAttr,
  sizeAttr,
}) {
  const [open, setOpen] = useState(false);
  const [isStopDesk, setIsStopDesk] = useState(false);
  const [shippingPrice, setShippingPrice] = useState(0);
  const [productPrice, setProductPrice] = useState(0);
  const [isError, setIsError] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [currentLead, setCurrentLead] = useState(null);
  const [status, setStatus] = useState(statusAttr);
  const [agency, setAgency] = useState(null);
  const [comment, setComment] = useState(commentAttr);
  const [communes, setCommunes] = useState([]);
  const [commune, setCommune] = useState(communeAttr);
  const [address, setAddress] = useState(addressAttr);
  const [wilaya, setWilaya] = useState(wilayaAttr);
  const [firstName, setFirstName] = useState(firstNameAttr);
  const [lastName, setLastName] = useState(lastNameAttr);
  const [phone, setPhone] = useState(phoneAttr);
  const [product, setProduct] = useState(productAttr);
  const [color, setColor] = useState(colorAttr || '');
  const [size, setSize] = useState(sizeAttr || '');
  const [deliveryFee, setDeliveryFee] = useState(null);
  const [trackers, setTrackers] = useState([]);
  const [trackersCount, setTrackersCount] = useState(0);
  const [currentAgentId, setCurrentAgentId] = useState();
  const [updateLoading, setUpdateLoading] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [isDisabled, setIsDisabled] = useState(true);
  const [productQty, setProductQty] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isYalidine, setIsYalidine] = useState(true);
  const [accurateDeliveryFee, setAccurateDeliveryFee] = useState(null);
  const [relevantItems, setRelevantItems] = useState([]);
  const [qty, setQty] = useState(1);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);

  const [productList, setProductList] = useState([
    { product: productAttr, color: colorAttr || '', size: `${sizeAttr || ''}`, qty: 1 },
  ]);

  const { user } = useContext(UserContext);
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  useEffect(() => {
    const fetchTrackers = async () => {
      try {
        console.log('the status->', statusAttr, status);
        const { data, error } = await supabase.from('users').select('*').eq('role', 'tracker');

        if (data) {
          console.log('the data tracker: ', data);
          setTrackers(data);
          setTrackersCount(data.length);
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

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const { data, error } = await supabase.from('users').select('*').eq('role', 'agent');

        if (data) {
          console.log('the data tracker: ', data);

          console.log('the user context: ', user);
          if (user) {
            const { email } = user;
            const relevantEmail = data.filter((item) => item.email === email);
            if (relevantEmail.length !== 0) {
              setCurrentAgentId(relevantEmail[0].id);
            } else {
              setCurrentAgentId(8);
            }
          }
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

  useEffect(() => {
    const fetchLead = async () => {
      try {
        console.log('the status is', status);
        const { data, error } = await supabase.from('leads').select().eq('id', id).single();

        if (data) {
          console.log('the data is: ', data.wilaya);
          setCurrentLead(data);
          setAddress(data.address);
          setFirstName(data.first_name);
          setPhone(data.phone);
          console.log('some: ', agencies[data.wilaya]);
        }

        if (error) {
          console.log('something went wrong: ', error);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchLead();
  }, [id]);

  useEffect(() => {
    const wilayaValues = wilayas.map((wil, i) => wil.value);
    if (wilayaValues.includes(wilaya)) {
      setEstimatedTime(fees[wilaya].estimatedDeliveryTime);
      if (isStopDesk) {
        setCommunes(communesStopdesk[wilaya]);
      } else {
        setCommunes(communesList[wilaya]);
      }
    }
  }, [wilaya, isStopDesk]);

  useEffect(() => {
    if (wilaya !== '' && commune !== '') {
      console.log('wilaya => ', wilaya);
      console.log('wilaya => ', commune);
      console.log('wilaya => ', communesList[wilaya]);

      const wilayaValues = wilayas.map((wil, i) => wil.value);
      if (wilayaValues.includes(wilaya)) {
        // const communesListValues = communesList[wilaya].map((com) => com.value);
        // if (communesListValues.includes(commune)) {
        // const associatedCommune = communesList[wilaya].filter((com) => com.value === commune);
        // console.log('assoc com', associatedCommune, commune);
        // if (associatedCommune.length !== 0) {
        if (isStopDesk) {
          console.log('fee: ', fees[wilaya].deskFee);
          setDeliveryFee(fees[wilaya].deskFee);
          setAccurateDeliveryFee(fees[wilaya].deskFee);
        } else {
          console.log('fee: ', fees[wilaya].homeFee);
          // const communeFee = associatedCommune[0].fee;
          // console.log('associated fee', communeFee, commune);
          let reduction;
          let homeDeliverFee;
          if (zone0.includes(wilaya)) {
            homeDeliverFee = fees[wilaya].homeFee;
            reduction = 150;
          } else if (zone1.includes(wilaya)) {
            homeDeliverFee = fees[wilaya].homeFee + 100;
            reduction = 50;
          } else if (zone2.includes(wilaya)) {
            homeDeliverFee = fees[wilaya].homeFee + 100;
            reduction = 50;
          } else if (zone3.includes(wilaya)) {
            homeDeliverFee = fees[wilaya].homeFee + 100;
            reduction = 100;
          } else if (zone4.includes(wilaya)) {
            homeDeliverFee = fees[wilaya].homeFee + 100;
            reduction = 150;
          } else if (zone5.includes(wilaya)) {
            homeDeliverFee = fees[wilaya].homeFee + 100;
            reduction = 100;
          } else if (zone6.includes(wilaya)) {
            homeDeliverFee = fees[wilaya].homeFee;
            reduction = 0;
          }
          setDeliveryFee(homeDeliverFee - reduction);
          const homeDeliveryFee = fees[wilaya].homeFee;
          console.log('bzz', communesList[wilaya]);

          if (homeDeliveryFee && commune) {
            const communeData = communesList[wilaya].filter((com) => com.value === commune);
            console.log('dd', communeData[0]); //
            const communeExtraFee = communeData[0] ? communeData[0].fee : 0;
            console.log('dd', communeExtraFee); //
            setAccurateDeliveryFee(homeDeliveryFee + communeExtraFee);
            // console.log('home delivery fee ', homeDeliveryFee, communeData, communeExtraFee);
          }
        }
        // }
        // }
      }
    }
  }, [wilaya, isStopDesk, commune]);
  useEffect(() => console.log('product qty ==> ', productQty), [productQty]);
  const updateStatus = async (e) => {
    e.preventDefault();
    try {
      setUpdateLoading(true);
      const currentDate = new Date().toLocaleString('en-US', {
        timeZone: 'Europe/Paris',
      });
      let trackerId;
      if (trackersCount !== 0) {
        trackerId = trackers[Math.floor(Math.random() * trackersCount)].id;
      } else {
        const { error: errorOrderLog } = await supabase
          .from('logs')
          .insert({ user_fullname: user.user_metadata.name, action: 'failed_add', entity: 'order', number: phone });
        if (errorOrderLog) {
          console.log('oops log: ', errorOrderLog);
          setFeedback('a Problem accured when adding the new LOG!');
          setIsError(true);
        }
        setFeedback('a Problem accured when adding the new LOG!');
        setIsError(true);
        throw new Error('Something went wrong');
      }
      const { data: dataUpdate, error: errorUpdate } = await supabase
        .from('leads')
        .update({
          status,
          comment,
          last_changed_status: currentDate,
        })
        .select()
        .eq('id', id);

      if (dataUpdate) {
        // console.log('-------->', dataUpdate);

        setFeedback('lead status updated successfully!');
        setIsError(false);
      }

      if (errorUpdate) {
        console.log(errorUpdate);
        setFeedback('a Problem accured when updating the Lead!');
        setIsError(true);
      }

      if (status === 'confirmed') {
        const itemsList = productList.map((productItem) => {
          if (productItem.color && productItem.size) {
            return `${productItem.product}_${productItem.color}_${productItem.size}_Qty_${productItem.qty}`;
          }
          if (productItem.color && !productItem.size) {
            return `${productItem.product}_${productItem.color}_Qty_${productItem.qty}`;
          }
          if (!productItem.color && productItem.size) {
            return `${productItem.product}_${productItem.size}_Qty_${productItem.qty}`;
          }
          return `${productItem.product}_Qty_${productItem.qty}`;
        });

        const prodList = itemsList.join(',');

        // if (color && size) {
        //   prodList = `${product}_${color}_${size}`;
        // } else if (color && !size) {
        //   prodList = `${product}_${color}`;
        // } else if (!color && size) {
        //   prodList = `${product}_${size}`;
        // } else {
        //   prodList = product;
        // }
        // const prodList = `${product}_${color}_${size}`;
        console.log('product ->', prodList, productList[0].product);
        let dataInsert;
        let errorInsert;
        if (isYalidine) {
          const response = await axios({
            url: `https://ecom-api-5wlr.onrender.com/create/`,
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            data: {
              firstName,
              lastName,
              address,
              phone,
              wilaya,
              commune,
              product: prodList,
              isStopDesk,
              isFreeShipping: true,
              stopdesk: agency,
              orderId: trackerId,
              price: productPrice + shippingPrice,
              hasExchange: false,
              productToCollect: null,
            },
          });
          console.log('added to yal ', response.data);

          const { data: dataTracker, error: errorTracker } = await supabase
            .from('followups')
            .insert({
              tracking: response.data[`order_${trackerId}`].tracking,
              is_handled_out: false,
              is_handled_missed: false,
              is_handled_center: false,
              is_handled_received: false,
              tracker_id: trackerId,
            })
            .select();
          if (dataTracker) {
            console.log('created data tracker', dataTracker);
          }
          if (errorTracker) {
            console.log('something went wrog creating tracekr', errorTracker);
          }
          const { data, error } = await supabase
            .from('orders')
            .insert({
              first_name: firstName,
              last_name: lastName,
              address,
              phone,
              wilaya,
              commune,
              product: productList[0].product,
              is_stopdesk: isStopDesk,
              is_free_shipping: true,
              stopdesk: agency,
              product_price: productPrice,
              shipping_price: shippingPrice,
              tracking_id: response.data[`order_${trackerId}`].tracking,
              delivery_fees: accurateDeliveryFee,
              tracker_id: trackerId,
              agent_id: currentAgentId,
            })
            .select();
          dataInsert = data;
          errorInsert = error;
        } else {
          const { data, error } = await supabase
            .from('orders')
            .insert({
              first_name: firstName,
              last_name: lastName,
              address,
              phone,
              wilaya,
              commune,
              product: productList[0].product,
              is_stopdesk: isStopDesk,
              is_free_shipping: true,
              stopdesk: agency,
              product_price: productPrice,
              shipping_price: shippingPrice,
              tracking_id: '',
              delivery_fees: 250,
              tracker_id: trackerId,
              agent_id: currentAgentId,
              is_auto_delivered: true,
            })
            .select();
          dataInsert = data;
          errorInsert = error;
        }

        productList.forEach(async (productItem) => {
          // 1 - Get item_id where product = productItem.product and color = productItem.color and size = productItem.size
          const { data: dataItems, error: errorItems } = await supabase
            .from('items')
            .select('id')
            .eq('product', productItem.product)
            .eq('color', productItem.color)
            .eq('size', productItem.size)
            .single();

          const itemId = dataItems.id;
          console.log('items ', dataItems, dataInsert);
          // 2 - Add order_item order_id = dataInsert.id item_id = item_id
          const { data: dataOrderItem, error: errorOrderItem } = await supabase
            .from('order_item')
            .insert({ order_id: dataInsert[0].id, item_id: itemId, qty: productItem.qty });
          console.log('qantity', productItem.qty, itemId);
          // 3 - decrease inventory with productItem.qty where item_id = item_id
          const { data: dataInventory, errorInventory } = await supabase.rpc('decrement_inventory', {
            qty_in: productItem.qty,
            item_id_in: itemId,
          });

          if (dataOrderItem && dataInventory) {
            console.log('order item inventory');
          }
          if (errorOrderItem || errorInventory) {
            console.log('something went wrong', errorOrderItem, errorInventory);
          }
        });

        // console.log('name ->', product, 'color -> ', color, ' size -> ', size, ' qty -> ', qty);
        // const { data: dataProduct, errorProduct } = await supabase.rpc('decrement_stock', {
        //   qty_in: qty,
        //   name_in: product,
        //   color_in: color,
        //   size_in: size,
        // });

        // if (dataProduct) {
        //   console.log('data product', dataProduct);
        // }

        // if (errorProduct) {
        //   console.log('error product', errorProduct);
        // }
        if (dataInsert) {
          console.log('inserted: ', dataInsert);
        }

        if (dataInsert /* && dataUpdate */) {
          setFeedback('the order has been confirmed!');
          setIsError(false);
        }

        if (errorInsert) {
          console.log('oops: ', errorInsert);
          setFeedback('a Problem accured when adding the new Order!');
          setIsError(true);
        }
        const { error: errorOrderLog } = await supabase
          .from('logs')
          .insert({ user_fullname: user.user_metadata.name, action: 'add', entity: 'order', number: phone });
        if (errorOrderLog) {
          console.log('oops log: ', errorOrderLog);
          setFeedback('a Problem accured when adding the new LOG!');
          setIsError(true);
        }
      }

      const { error: errorLeadLog } = await supabase.from('logs').insert({
        user_fullname: user.user_metadata.name,
        action: 'update',
        entity: 'lead',
        number: phone,
        last_status: status,
        attempt: status === 'not-responding' || status === 'unreachable' ? +comment : null,
      });
      if (errorLeadLog) {
        console.log('oops log: ', errorLeadLog);
        setFeedback('a Problem accured when adding the new LOG!');
        setIsError(true);
      }

      setUpdateLoading(false);
      setOpen(true);
      handleTriggerFetch(Math.random());
    } catch (error) {
      console.log('something went wrong: ', error);
      setFeedback('a Problem accured!');
      setIsError(true);
      setUpdateLoading(false);
    }
  };
  useEffect(() => {
    const getProducts = async () => {
      const { data, error } = await supabase.rpc('get_available_products');

      if (data) {
        // console.log('available products', data);
        const availableProductsTemp = data.map((prod) => prod.key);
        console.log('available Products', availableProductsTemp);
        setAvailableProducts(availableProductsTemp);
      }
    };
    getProducts();
  }, []);

  useEffect(() => {
    const getColors = async () => {
      const { data: dataColor, error: errorColor } = await supabase.rpc('get_available_colors_in_product', {
        product_in: productList[productList.length - 1].product,
      });
      if (dataColor) {
        // console.log('available colors', dataColor);
        const availableProductsTemp = dataColor.map((prod) => prod.key);
        console.log('available colors', availableProductsTemp);
        setAvailableColors(availableProductsTemp);
      }
      const { data: dataSize, error: errorSize } = await supabase.rpc('get_available_sizes_in_product', {
        product_in: productList[productList.length - 1].product,
        color_in: productList[productList.length - 1].color,
      });
      if (dataSize) {
        // console.log('available sizes', dataSize);
        const availableProductsTemp = dataSize.map((prod) => prod.key);
        console.log('available sizes', availableProductsTemp);
        setAvailableSizes(availableProductsTemp);
      }
    };
    getColors();
  }, [productList]);

  useEffect(() => {
    const getColors = async () => {
      const { data, error } = await supabase.rpc('get_available_sizes_in_product', {
        product_in: productList[productList.length - 1].product,
        color_in: productList[productList.length - 1].color,
      });
      if (data) {
        console.log('available sizes', data);
        const availableProductsTemp = data.map((prod) => prod.key);
        console.log('av', availableProductsTemp);
      }
    };
    getColors();
  }, []);

  useEffect(() => {
    if ((productPrice === 0 || shippingPrice === 0 || +remaining <= 0) && status === 'confirmed') {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [productPrice, shippingPrice, status, remaining]);

  // useEffect(() => {
  //   const getQty = async () => {
  //     if (product) {
  //       const { data, error } = await supabase
  //         .from('products')
  //         .select('quantity')
  //         .eq('name', product)
  //         .eq('size', size)
  //         .eq('color', color)
  //         .single();

  //       if (data) {
  //         setProductQty(data.quantity);
  //       }

  //       if (error) {
  //         setProductQty(null);
  //         // console.log('something went wrong', error);
  //       }
  //     }
  //   };
  //   getQty();
  // }, [product, size, color]);

  const handleProductAdd = () => {
    setProductList([...productList, { product: '', color: '', size: '', qty: 1 }]);
    console.log('product list', productList);
  };

  const handleProductRemove = (index) => {
    const pList = [...productList];
    pList.splice(index, 1);
    setProductList(pList);
  };

  const handleProductChange = (e, index) => {
    const { name, value } = e.target;
    const pList = [...productList];
    pList[index][name] = value.toLowerCase();
    setProductList(pList);
  };

  const handleIncreaseQty = (index) => {
    const pList = [...productList];
    pList[index].qty += 1;
    setProductList(pList);
  };

  const handleDecreaseQty = (index) => {
    const pList = [...productList];
    pList[index].qty -= 1;
    setProductList(pList);
  };

  const handleInventoryCheck = async (index) => {
    const { product, color, size } = productList[index];

    console.log('product', product, color, size);
    const { data: dataItem, error: errorItem } = await supabase
      .from('items')
      .select()
      .eq('product', product)
      .eq('color', color)
      .eq('size', size)
      .single();

    if (dataItem) {
      console.log('some', dataItem);
      const itemId = dataItem.id;
      const { data: dataInventory, error: errorInventory } = await supabase
        .from('inventory')
        .select()
        .eq('item_id', itemId)
        .single();

      setRemaining(`${dataInventory.quantity}`);

      if (dataInventory.quantity <= 0) {
        setIsDisabled(true);
      } else {
        setIsDisabled(false);
      }

      setSelectedItem(`${product} ${color} ${size}`);

      if (dataInventory.quantity === 0) {
        const { data: dataRelatedInventory, error: errorRelatedInventory } = await supabase.from('inventory').select(
          `
          *,
          items(
            *
          )
        `
        );

        if (dataRelatedInventory) {
          const fetchedInventory = dataRelatedInventory.map((row) => ({
            id: row.id,
            product: row.items.product,
            color: row.items.color,
            size: row.items.size,
            quantity: row.quantity,
          }));

          const filteredInventory = fetchedInventory.filter((item) => item.size === size && item.quantity !== 0);
          setRelevantItems(filteredInventory);
          console.log('filtered inventory', filteredInventory);
        }
      } else {
        setRelevantItems([]);
      }
      console.log('quantity remaining is ', dataInventory);
    }
    if (errorItem) {
      console.log('something went wrong', errorItem);
    }
  };

  return (
    <form onSubmit={updateStatus}>
      <Stack spacing={3} style={{ marginTop: 30, maxHeight: '70vh', overflowY: 'scroll', padding: '1rem' }}>
        <Stack spacing={3}>
          <Stack spacing={3}>
            <FormControl>
              <InputLabel>Status</InputLabel>
              <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
                <MenuItem value={'initial'}>Initial</MenuItem>
                <MenuItem value={'confirmed'}>Confirmed</MenuItem>
                <MenuItem value={'not-responding'}>Not Responding</MenuItem>
                <MenuItem value={'unreachable'}>Unreachable</MenuItem>
                <MenuItem value={'canceled'}>Canceled</MenuItem>
                <MenuItem value={'busy'}>Busy</MenuItem>
                <MenuItem value={'reported'}>Reported</MenuItem>
                <MenuItem value={'other'}>other</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <TextField name="comment" label="Comment" value={comment} onChange={(e) => setComment(e.target.value)} />
            </FormControl>
          </Stack>
          {status === 'confirmed' && (
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <TextField
                    name="firstName"
                    label="first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <TextField
                    name="lastname"
                    label="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </FormControl>
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <TextField
                    name="phone"
                    label="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </FormControl>
              </Stack>
              {/* <Stack>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isYalidine}
                        onChange={(e) => setIsYalidine(e.target.checked)}
                        inputProps={{ 'aria-label': 'controlled' }}
                      />
                    }
                    label="Yalidine"
                  />
                </FormGroup>
              </Stack> */}

              {/* {productList.map((productItem, i) => (

              ))} */}
              <Box sx={{ background: '#fafafa', padding: '1rem' }}>
                {productList.map((productItem, i) => (
                  <>
                    <Box sx={{ marginBottom: '1.5rem' }}>
                      {productList.length - 1 === i ? (
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} marginBottom={1}>
                          <FormControl fullWidth>
                            <InputLabel>Product</InputLabel>
                            <Select
                              value={productItem.product}
                              label="Product"
                              name="product"
                              onChange={(e) => handleProductChange(e, i)}
                            >
                              {availableProducts.map((prod, ix) => (
                                <MenuItem key={ix} value={prod}>
                                  {prod}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <FormControl fullWidth>
                            <InputLabel>Color</InputLabel>
                            <Select
                              value={productItem.color}
                              label="Color"
                              name="color"
                              onChange={(e) => handleProductChange(e, i)}
                            >
                              {availableColors.map((color, ix) => (
                                <MenuItem key={ix} value={color}>
                                  {color}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <FormControl fullWidth>
                            <InputLabel>Size</InputLabel>
                            <Select
                              value={productItem.size}
                              label="Size"
                              name="size"
                              onChange={(e) => handleProductChange(e, i)}
                            >
                              {availableSizes.map((size, ix) => (
                                <MenuItem key={ix} value={size}>
                                  {size}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Stack>
                      ) : (
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} marginBottom={1}>
                          <FormControl fullWidth>
                            <TextField
                              name="product"
                              label="Product"
                              value={productItem.product}
                              size="small"
                              onChange={(e) => handleProductChange(e, i)}
                            />
                          </FormControl>
                          <FormControl fullWidth>
                            <TextField
                              name="color"
                              label="Product Color"
                              value={productItem.color}
                              size="small"
                              onChange={(e) => handleProductChange(e, i)}
                            />
                          </FormControl>
                          <FormControl fullWidth>
                            <TextField
                              name="size"
                              label="Product Size"
                              value={productItem.size}
                              size="small"
                              onChange={(e) => handleProductChange(e, i)}
                            />
                          </FormControl>
                        </Stack>
                      )}
                      <Stack justifyContent="end" direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <FormControl>
                          <ButtonGroup variant="outlined" aria-label="outlined button group">
                            <Button
                              size="small"
                              onClick={(e) => {
                                e.preventDefault();
                                if (productItem.qty > 0) handleDecreaseQty(i);
                              }}
                            >
                              -
                            </Button>
                            <Button size="small" disabled>
                              {productItem.qty}
                            </Button>
                            <Button
                              size="small"
                              onClick={(e) => {
                                e.preventDefault();
                                if (productItem.qty > 0) handleIncreaseQty(i);
                              }}
                            >
                              +
                            </Button>
                          </ButtonGroup>
                        </FormControl>
                        <IconButton
                          onClick={() => handleInventoryCheck(i)}
                          aria-label="Check inventory"
                          color="primary"
                          size="small"
                        >
                          <InventoryIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleProductRemove(i)}
                          aria-label="delete"
                          color="primary"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </Box>
                    {productList.length - 1 === i && productList.length < 4 && (
                      <Button startIcon={<Add />} onClick={handleProductAdd}>
                        {' '}
                        Add Item
                      </Button>
                    )}
                  </>
                ))}
                {remaining && (
                  <MuiAlert severity="info">
                    <b>{selectedItem}</b> remaining in stock <Chip label={remaining} color="info" size="small" />
                  </MuiAlert>
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
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Wilaya</InputLabel>
                  <Select value={wilaya} label="Wilaya" onChange={(e) => setWilaya(e.target.value)}>
                    {wilayas.map((wil, i) => (
                      <MenuItem key={i} value={wil.value}>
                        {wil.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{wilaya}</FormHelperText>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Commune</InputLabel>
                  <Select value={commune} label="Commune" onChange={(e) => setCommune(e.target.value)}>
                    {communes.map((com, i) => (
                      <MenuItem key={i} value={com.value} disabled={!isStopDesk && !com.isDeliverable}>
                        {com.label} {!isStopDesk && !com.isDeliverable && '(Undeliverable)'}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{commune}</FormHelperText>
                </FormControl>
              </Stack>
              <Stack spacing={3}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isStopDesk}
                        onChange={(e) => setIsStopDesk(e.target.checked)}
                        inputProps={{ 'aria-label': 'controlled' }}
                      />
                    }
                    label="Stop desk"
                  />
                </FormGroup>
                {isStopDesk && commune ? (
                  <FormControl>
                    <InputLabel>Agency</InputLabel>
                    <Select value={agency} label="Agency" onChange={(e) => setAgency(e.target.value)}>
                      {agencies[commune] &&
                        agencies[commune].map((com, key) => (
                          <MenuItem key={key} value={com.value}>
                            {com.label}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                ) : (
                  <></>
                )}
              </Stack>
              <Stack>
                <FormControl fullWidth>
                  <TextField
                    name="address"
                    label="Address"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                    }}
                  />
                </FormControl>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ marginTop: '1rem' }}>
                <FormControl fullWidth>
                  <TextField
                    name="product-price"
                    label="Product price"
                    inputProps={{ type: 'number' }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">DA</InputAdornment>,
                    }}
                    value={productPrice}
                    onChange={(e) => {
                      setProductPrice(+e.target.value);
                    }}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <TextField
                    name="shipping-price"
                    label="Shipping price"
                    inputProps={{ type: 'number' }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">DA</InputAdornment>,
                    }}
                    value={shippingPrice}
                    onChange={(e) => setShippingPrice(+e.target.value)}
                  />
                </FormControl>
              </Stack>
              <Stack>
                <Typography variant="p" component="p" style={{ fontSize: '13px', marginBottom: 8, color: '#666' }}>
                  {productQty && (
                    <span>
                      Stock remaining: <b>{productQty}</b>
                    </span>
                  )}
                </Typography>
                <Typography variant="p" component="p" style={{ fontSize: '13px', marginBottom: 8, color: '#666' }}>
                  {deliveryFee && (
                    <span>
                      Delivery Fees: <b>{deliveryFee} DA</b>
                    </span>
                  )}
                </Typography>
                <Typography variant="p" component="p" style={{ fontSize: '13px', marginBottom: 8, color: '#666' }}>
                  {estimatedTime && (
                    <span>
                      Estimated delivery time: <b>{estimatedTime}</b>
                    </span>
                  )}
                </Typography>
                <Typography variant="p" component="p" style={{ fontSize: '13px' }}>
                  Total: {(productPrice + shippingPrice).toFixed(2)} DA
                </Typography>
              </Stack>
            </Stack>
          )}
        </Stack>
        <Stack>
          <LoadingButton
            loading={updateLoading}
            disabled={isDisabled}
            type="submit"
            fullWidth
            size="large"
            variant="contained"
          >
            Update
          </LoadingButton>
        </Stack>
      </Stack>
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
    </form>
  );
}

export default EditLeadForm;
