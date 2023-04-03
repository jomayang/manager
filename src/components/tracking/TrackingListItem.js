import { Checkbox, IconButton, Stack, TableCell, TableRow, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import Label from '../label/Label';
import supabase from '../../config/SupabaseClient';
import Iconify from '../iconify/Iconify';
import ParcelDetailsModal from '../modals/ParcelDetailsModal';
import ParcelHistoryModal from '../modals/ParcelHistoryModal';

function TrackingListItem({
  id,
  lastName,
  firstName,
  status,
  wilaya,
  phone,
  commune,
  creationDate,
  expeditionDate,
  deliveryFees,
  price,
  tracking,
  product,
  isStopdesk,
  selectedLead,
  page,
  historiesLoading,
  followupStatusArray,
  currentUserRole,
  statusColors,
  handleClick,
  handleLastChangedTracking,
  histories,
  trackingState,
  user,
}) {
  const [isActive, setIsActive] = useState(false);
  // const styleRow = ;
  const handleValidateTask = async (tracking, status) => {
    try {
      // console.log(' ==> ', tracking);
      // console.log(' ==> ', status);
      // console.log('==>', histories);
      let queryObject;
      const attemptOut = histories[tracking].filter((state) => state === 'Sorti en livraison').length;
      const attemptMissed = histories[tracking].filter((state) => state === 'Tentative échouée').length;
      const currentDate = new Date().toLocaleString('en-US', {
        timeZone: 'Europe/Paris',
      });

      switch (status) {
        case 'Centre':
          queryObject = { is_handled_center: true, last_changed: currentDate };
          break;
        case 'Reçu à Wilaya':
          queryObject = { is_handled_received: true, last_changed: currentDate };
          break;
        case 'Sorti en livraison':
          if (attemptOut === 2) {
            queryObject = { is_handled_out_2: true, last_changed: currentDate };
          } else if (attemptOut === 3) {
            queryObject = { is_handled_out_3: true, last_changed: currentDate };
          } else {
            queryObject = { is_handled_out: true, last_changed: currentDate };
          }
          break;
        case 'Tentative échouée':
          if (attemptMissed === 2) {
            queryObject = { is_handled_missed_2: true, last_changed: currentDate };
          } else if (attemptMissed === 3) {
            queryObject = { is_handled_missed_3: true, last_changed: currentDate };
          } else {
            queryObject = { is_handled_missed: true, last_changed: currentDate };
          }
          break;
        default:
          return;
        // break;
      }
      console.log('query obj', queryObject);
      const { data, error } = await supabase.from('followups').update(queryObject).eq('tracking', tracking);
      if (data) {
        console.log('hello');
        console.log('successful', data);
      }

      if (error) {
        console.log('error happened', error);
      }
      const { error: errorTrackLog } = await supabase.from('logs').insert({
        user: user.user_metadata.name,
        action: 'validate',
        entity: 'order',
        number: phone,
        last_status: status,
      });
      if (errorTrackLog) {
        console.log('oops log: ', errorTrackLog);
      }
      handleLastChangedTracking(tracking);
      setIsActive(true);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    console.log('tracking number', tracking);
  }, []);

  useEffect(() => {
    if (histories && !historiesLoading && trackingState && trackingState[tracking] && histories[tracking]) {
      // console.log('*-*>', histories);
      // console.log('*-*>', histories[tracking]);
      console.log('*-**-*-*-*-*-');
      if (status === 'Centre') {
        setIsActive(trackingState[tracking].isHandledCenter);
      } else if (status === 'Reçu à Wilaya') {
        console.log('resuuuult', trackingState[tracking].isHandledReceived);
        setIsActive(trackingState[tracking].isHandledReceived);
      } else if (status === 'Sorti en livraison') {
        const attempt = histories[tracking].filter((state) => state === 'Sorti en livraison').length;

        if (attempt === 2) {
          setIsActive(trackingState[tracking].isHandledOut2);
        } else if (attempt === 3) {
          setIsActive(trackingState[tracking].isHandledOut3);
        } else {
          setIsActive(trackingState[tracking].isHandledOut);
        }
      } else if (status === 'Tentative échouée') {
        const attempt = histories[tracking].filter((state) => state === 'Tentative échouée').length;

        // console.log('attempt: ', attempt);
        if (attempt === 2) {
          setIsActive(trackingState[tracking].isHandledMissed2);
        }
        if (attempt === 3) {
          setIsActive(trackingState[tracking].isHandledMissed3);
        } else {
          setIsActive(trackingState[tracking].isHandledMissed);
        }
      }
    }
  }, [histories, trackingState]);
  useEffect(() => {
    console.log('is active', histories);
  }, [histories]);
  useEffect(() => {
    console.log('is active tracking', trackingState);
  }, [trackingState]);
  return (
    <TableRow
      hover
      key={id + page}
      tabIndex={-1}
      role="checkbox"
      selected={selectedLead}
      style={
        !isActive && ['Centre', 'Reçu à Wilaya', 'Sorti en livraison', 'Tentative échouée'].includes(status)
          ? { background: '#e5eef5' }
          : {}
      }
    >
      <TableCell padding="checkbox">
        <Checkbox checked={selectedLead} onChange={(event) => handleClick(event, id)} />
      </TableCell>
      <TableCell align="left">
        <Label color="primary" variant="filled" style={{ height: 32 }}>
          {tracking}
          {isStopdesk ? (
            <Label
              style={{
                height: 16,
                borderRadius: 16,
                padding: '0 1px',
                marginLeft: 6,
                width: 16,
                minWidth: 16,
              }}
              color="error"
              variant="filled"
            >
              s
            </Label>
          ) : (
            <Label
              variant="filled"
              style={{
                height: 16,
                borderRadius: 16,
                padding: '0 1px',
                marginLeft: 6,
                width: 16,
                minWidth: 16,
              }}
            >
              H
            </Label>
          )}
        </Label>
      </TableCell>
      <TableCell component="th" scope="row" padding="none">
        <Stack direction="row" spacing={2}>
          <Typography variant="subtitle2" noWrap>
            {firstName} {lastName}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell align="left">{phone}</TableCell>

      <TableCell align="left">{wilaya}</TableCell>

      <TableCell align="left">{commune}</TableCell>

      <TableCell align="left">
        {/* {statusColors ? ( */}

        <ParcelHistoryModal status={status} tracking={tracking} colors={statusColors} />
        {/* // ) : (
         
        // )} */}
        {/* <Label>{status}</Label> */}
      </TableCell>

      <TableCell align="right">
        <Stack direction={{ xs: 'column', sm: 'row' }}>
          <ParcelDetailsModal
            tracking={tracking}
            fullName={`${firstName} ${lastName}`}
            phone={phone}
            departure="Constantine"
            destination={`${wilaya} (${commune})`}
            product={product}
            price={price}
            deliveryFees={deliveryFees}
            creationDate={creationDate}
            expeditionDate={expeditionDate}
          />
          {followupStatusArray.includes(status) && (
            <>
              {!historiesLoading && (
                <>
                  {!isActive && currentUserRole !== 'admin' && (
                    <IconButton aria-label="Done" onClick={() => handleValidateTask(tracking, status)}>
                      <Iconify icon="eva:checkmark-circle-outline" />
                    </IconButton>
                  )}
                </>
              )}
            </>
          )}
        </Stack>
      </TableCell>
    </TableRow>
  );
}

export default TrackingListItem;
