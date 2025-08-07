// hooks/useOrderFilters.js
import { useState, useEffect } from 'react';

export const useOrderFilters = (orders) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('today');
  const [filteredOrders, setFilteredOrders] = useState([]);

  // Apply filters and search
  useEffect(() => {
    let result = [...orders];

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(order => order.type === typeFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        order.orderNumber?.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query) ||
        order.customer?.name?.toLowerCase().includes(query) ||
        order.dining?.tableNumber?.toLowerCase().includes(query)
      );
    }

    setFilteredOrders(result);
  }, [orders, statusFilter, typeFilter, searchQuery]);

  const resetFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setTimeFilter('today');
    setSearchQuery('');
  };

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    timeFilter,
    setTimeFilter,
    filteredOrders,
    resetFilters
  };
};