import React, { useEffect, useState } from 'react';
import { enc, SHA1 } from 'crypto-js';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import supabase from '../../config/SupabaseClient';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // backgroundColor: '#E4E4E4',
  },
  section: {
    // margin: 10,
    padding: 10,
    width: '50%',
    height: '33.33%',
    flexWrap: 'wrap',
  },
  sectionContainer: {
    marding: 10,
    padding: 10,
    width: '100%',
    height: '100%',
    border: '2px solid black',
  },
  text: {
    fontSize: 11,
    fontFamily: 'Helvetica',
    fontWeight: 700,
  },
});

function generateHashFromString(inputString) {
  const hash = SHA1(inputString).toString(enc.Hex);
  const alphanumericHash = hash.replace(/\W/g, '').substring(0, 6);
  return alphanumericHash;
}

// Create Document Component
export const DeliverySlip = () => {
  const [ordersList, setOrdersList] = useState([]);
  const [products, setProducts] = useState([]);
  useEffect(() => {
    const getParcels = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select()
          .eq('is_auto_delivered', true)
          .eq('status', 'initial');
        if (data) {
          console.log('related data', data);
          setOrdersList(data);
          const relatedItems = await Promise.all(
            data.map(async (order) => {
              const { data: dataItems, error: errorItems } = await supabase
                .from('order_item')
                .select(
                  `
                *,
                items(
                  *
                )
              `
                )
                .eq('order_id', order.id);

              if (dataItems) {
                console.log('data items', dataItems);
                const items = dataItems.map(
                  (item) =>
                    `${item.items.product}${item.items.color ? `_${item.items.color}` : ''}${
                      item.items.size ? `_${item.items.size}` : ''
                    }x${item.qty}`
                );
                console.log('itemsss', items);
                const productsStr = items.join(',');
                console.log('product', productsStr);
                return { id: order.id, productList: productsStr };
              }
              if (errorItems) {
                return [];
              }
              return [];
            })
          );
          // const obj = relatedItems.reduce((accumulator, ))
          const keyValueObj = relatedItems.reduce((obj, item) => {
            obj[item.id] = item.productList;
            return obj;
          }, {});
          setProducts(keyValueObj);
          console.log('items', keyValueObj);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getParcels();
  }, []);

  useEffect(() => console.log('somethin', products), [products]);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {ordersList.length !== 0 &&
          ordersList.map((order) => (
            <View key={order.id} style={styles.section}>
              <View style={styles.sectionContainer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Image src="/logo.png" style={{ width: 98, height: 36 }} />
                  <Text style={{ backgroundColor: '#80E415', color: 'white', fontSize: 14, padding: 10 }}>
                    E-COMMERCE
                  </Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <Image
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ECT-${generateHashFromString(
                      order.id.toString()
                    ).toUpperCase()},${order.address}, ${order.phone}`}
                    style={{ width: 64, height: 64, marginTop: 10 }}
                  />
                  <View style={{ marginLeft: 10, marginTop: 10 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', lineHeight: 1.5 }}>Destinataire:</Text>
                    <Text style={styles.text}>
                      {order.first_name} {order.last_name}
                    </Text>
                    <Text style={styles.text}>
                      {order.wilaya}, {order.commune}
                    </Text>
                    <Text style={styles.text}>{order.address}</Text>
                    <Text style={styles.text}>{order.phone}</Text>
                  </View>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', marginTop: 10, justifyContent: 'center' }}>
                  <Image
                    src={`http://bwipjs-api.metafloor.com/?bcid=code128&text=ECT-${generateHashFromString(
                      order.id.toString()
                    )}`}
                    style={{ height: 24, width: 128 }}
                  />
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', marginTop: 5, justifyContent: 'center' }}>
                  <Text style={{ fontSize: 14 }}>ECT-{generateHashFromString(order.id.toString()).toUpperCase()}</Text>
                </View>
                <View style={{ position: 'relative' }}>
                  <Image src="/table-slip.png" style={{ width: '100%' }} />
                  <Text style={{ position: 'absolute', top: 20, right: 10, bottom: 0, fontSize: 9 }}>
                    {order.product_price + order.shipping_price}DA
                  </Text>
                  <Text style={{ position: 'absolute', top: 20, left: 6, bottom: 0, fontSize: 9, right: 70 }}>
                    {products && products[order.id]}
                  </Text>
                </View>
              </View>
            </View>
          ))}
      </Page>
    </Document>
  );
};
