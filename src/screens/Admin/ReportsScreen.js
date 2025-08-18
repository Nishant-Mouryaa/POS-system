import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  Divider,
  ActivityIndicator,
  useTheme,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getCountFromServer,
  sum,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import * as Haptics from 'expo-haptics';
import { Palette } from '../../theme/colors';
import { BarChart, PieChart } from 'react-native-chart-kit';

const ReportsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('week');
  const [reportData, setReportData] = useState({
    totalSales: 0,
    totalOrders: 0,
    popularItems: [],
    salesTrend: [],
    categoryDistribution: [],
    staffPerformance: [],
  });

  const { colors } = useTheme();

  useEffect(() => {
    loadReportData();
  }, [timeRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Get date range based on selection
      const now = new Date();
      let startDate;
      
      switch (timeRange) {
        case 'day':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      }

      // Fetch data in parallel
      const [
        salesData,
        ordersCount,
        popularItems,
        salesTrend,
        categoryData,
        staffData,
      ] = await Promise.all([
        getTotalSales(startDate),
        getTotalOrders(startDate),
        getPopularItems(startDate),
        getSalesTrend(startDate),
        getCategoryDistribution(startDate),
        getStaffPerformance(startDate),
      ]);

      setReportData({
        totalSales: salesData,
        totalOrders: ordersCount,
        popularItems,
        salesTrend,
        categoryDistribution: categoryData,
        staffPerformance: staffData,
      });
      
    } catch (error) {
      console.error('Error loading report data:', error);
      Alert.alert('Error', 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  // Data fetching functions
  const getTotalSales = async (startDate) => {
    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('createdAt', '>=', startDate),
        where('status', '==', 'completed')
      );
      const snapshot = await getDocs(ordersQuery);
      return snapshot.docs.reduce((total, doc) => total + (doc.data().total || 0), 0);
    } catch (error) {
      console.error('Error getting total sales:', error);
      return 0;
    }
  };

  const getTotalOrders = async (startDate) => {
    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('createdAt', '>=', startDate),
        where('status', '==', 'completed')
      );
      const snapshot = await getCountFromServer(ordersQuery);
      return snapshot.data().count;
    } catch (error) {
      console.error('Error getting total orders:', error);
      return 0;
    }
  };

  const getPopularItems = async (startDate) => {
    try {
      // In a real app, you would query order items and aggregate
      return [
        { name: 'Chicken Biryani', count: 124 },
        { name: 'Paneer Tikka', count: 98 },
        { name: 'Butter Naan', count: 87 },
        { name: 'Dal Makhani', count: 76 },
        { name: 'Gulab Jamun', count: 65 },
      ];
    } catch (error) {
      console.error('Error getting popular items:', error);
      return [];
    }
  };

  const getSalesTrend = async (startDate) => {
    try {
      // In a real app, you would query sales by day/week/month
      if (timeRange === 'day') {
        return Array.from({ length: 24 }, (_, i) => ({
          label: `${i}:00`,
          value: Math.floor(Math.random() * 5000) + 1000,
        }));
      } else if (timeRange === 'week') {
        return [
          { label: 'Mon', value: 12000 },
          { label: 'Tue', value: 15000 },
          { label: 'Wed', value: 18000 },
          { label: 'Thu', value: 14000 },
          { label: 'Fri', value: 22000 },
          { label: 'Sat', value: 25000 },
          { label: 'Sun', value: 21000 },
        ];
      } else {
        return Array.from({ length: 12 }, (_, i) => ({
          label: `${i + 1}/${new Date().getFullYear()}`,
          value: Math.floor(Math.random() * 100000) + 50000,
        }));
      }
    } catch (error) {
      console.error('Error getting sales trend:', error);
      return [];
    }
  };

  const getCategoryDistribution = async (startDate) => {
    try {
      // In a real app, you would query orders and aggregate by category
      return [
        { name: 'Main Course', value: 45, color: Palette.primary },
        { name: 'Appetizers', value: 20, color: Palette.secondary },
        { name: 'Breads', value: 15, color: Palette.accent },
        { name: 'Desserts', value: 12, color: Palette.warning },
        { name: 'Beverages', value: 8, color: Palette.success },
      ];
    } catch (error) {
      console.error('Error getting category distribution:', error);
      return [];
    }
  };

  const getStaffPerformance = async (startDate) => {
    try {
      // In a real app, you would query orders and staff performance
      return [
        { name: 'Rajesh K.', orders: 56, rating: 4.8 },
        { name: 'Priya M.', orders: 48, rating: 4.9 },
        { name: 'Amit S.', orders: 42, rating: 4.7 },
        { name: 'Neha P.', orders: 38, rating: 4.6 },
        { name: 'Vikram D.', orders: 35, rating: 4.5 },
      ];
    } catch (error) {
      console.error('Error getting staff performance:', error);
      return [];
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReportData();
    setRefreshing(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Palette.primary} />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[Palette.primary]}
          tintColor={Palette.primary}
        />
      }
    >
      {/* Time Range Selector */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['day', 'week', 'month', 'year'].map((range) => (
            <Chip
              key={range}
              mode={timeRange === range ? 'flat' : 'outlined'}
              selected={timeRange === range}
              onPress={() => setTimeRange(range)}
              style={styles.filterChip}
              selectedColor={Palette.primary}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <Card.Content style={styles.summaryContent}>
            <MaterialCommunityIcons 
              name="currency-rupee" 
              size={32} 
              color={Palette.success} 
            />
            <Text style={styles.summaryValue}>₹{reportData.totalSales.toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Total Sales</Text>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content style={styles.summaryContent}>
            <MaterialCommunityIcons 
              name="clipboard-list" 
              size={32} 
              color={Palette.primary} 
            />
            <Text style={styles.summaryValue}>{reportData.totalOrders}</Text>
            <Text style={styles.summaryLabel}>Total Orders</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Sales Trend Chart */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Text style={styles.chartTitle}>Sales Trend</Text>
          <BarChart
            data={{
              labels: reportData.salesTrend.map(item => item.label),
              datasets: [
                {
                  data: reportData.salesTrend.map(item => item.value),
                },
              ],
            }}
            width={Dimensions.get('window').width - 48}
            height={220}
            yAxisLabel="₹"
            chartConfig={{
              backgroundColor: Palette.surface,
              backgroundGradientFrom: Palette.surface,
              backgroundGradientTo: Palette.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(63, 81, 181, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: Palette.primary,
              },
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </Card.Content>
      </Card>

      {/* Category Distribution */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Text style={styles.chartTitle}>Category Distribution</Text>
          <View style={styles.pieChartContainer}>
            <PieChart
              data={reportData.categoryDistribution}
              width={Dimensions.get('window').width - 48}
              height={180}
              chartConfig={{
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              }}
              accessor="value"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
          <View style={styles.legendContainer}>
            {reportData.categoryDistribution.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View 
                  style={[
                    styles.legendColor, 
                    { backgroundColor: item.color }
                  ]} 
                />
                <Text style={styles.legendText}>{item.name} ({item.value}%)</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Popular Items */}
      <Card style={styles.listCard}>
        <Card.Content>
          <Text style={styles.listTitle}>Most Popular Items</Text>
          {reportData.popularItems.map((item, index) => (
            <View key={index}>
              <View style={styles.listItem}>
                <Text style={styles.listItemName}>{item.name}</Text>
                <Text style={styles.listItemValue}>{item.count} orders</Text>
              </View>
              {index < reportData.popularItems.length - 1 && <Divider />}
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Staff Performance */}
      <Card style={styles.listCard}>
        <Card.Content>
          <Text style={styles.listTitle}>Staff Performance</Text>
          {reportData.staffPerformance.map((staff, index) => (
            <View key={index}>
              <View style={styles.listItem}>
                <Text style={styles.listItemName}>{staff.name}</Text>
                <View style={styles.staffStats}>
                  <Text style={styles.listItemValue}>{staff.orders} orders</Text>
                  <View style={styles.ratingContainer}>
                    <MaterialCommunityIcons 
                      name="star" 
                      size={16} 
                      color={Palette.warning} 
                    />
                    <Text style={styles.ratingText}>{staff.rating}</Text>
                  </View>
                </View>
              </View>
              {index < reportData.staffPerformance.length - 1 && <Divider />}
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Palette.textSecondary,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterChip: {
    marginRight: 8,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: Palette.surface,
    elevation: 2,
  },
  summaryContent: {
    alignItems: 'center',
    padding: 16,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Palette.text,
    marginVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: Palette.textSecondary,
  },
  chartCard: {
    backgroundColor: Palette.surface,
    marginBottom: 16,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Palette.text,
    marginBottom: 16,
  },
  pieChartContainer: {
    alignItems: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 4,
    paddingHorizontal: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: Palette.textSecondary,
  },
  listCard: {
    backgroundColor: Palette.surface,
    marginBottom: 16,
    elevation: 2,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Palette.text,
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  listItemName: {
    fontSize: 14,
    color: Palette.text,
  },
  listItemValue: {
    fontSize: 14,
    color: Palette.textSecondary,
  },
  staffStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  ratingText: {
    fontSize: 14,
    color: Palette.text,
    marginLeft: 4,
  },
});

export default ReportsScreen;