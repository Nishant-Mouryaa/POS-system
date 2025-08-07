// hooks/useOrderData.js
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { format } from 'date-fns';

export const useOrderData = (cafeId, timeFilter) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!cafeId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      let q = query(
        collection(db, 'orders'),
        where('cafeId', '==', cafeId),
        orderBy('orderFlow.orderedAt', 'desc')
      );

      // Apply time filter
      if (timeFilter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        q = query(q, where('orderFlow.orderedAt', '>=', today));
      } else if (timeFilter === 'this_week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        q = query(q, where('orderFlow.orderedAt', '>=', weekAgo));
      }

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const ordersData = [];
          querySnapshot.forEach((doc) => {
            const orderData = doc.data();
            ordersData.push({
              id: doc.id,
              ...orderData,
              orderFlow: {
                ...orderData.orderFlow,
                orderedAt: orderData.orderFlow.orderedAt?.toDate(),
                formattedTime: format(orderData.orderFlow.orderedAt?.toDate(), 'hh:mm a'),
                formattedDate: format(orderData.orderFlow.orderedAt?.toDate(), 'MMM dd, yyyy')
              }
            });
          });
          setOrders(ordersData);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching orders:", error);
          setError(error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up orders listener:", err);
      setError(err);
      setLoading(false);
    }
  }, [cafeId, timeFilter]);

  return {
    orders,
    loading,
    error,
    setOrders
  };
};