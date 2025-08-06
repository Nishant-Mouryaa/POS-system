import React from 'react';
import { View } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AdminStats = ({ stats, styles }) => (
  <View style={styles.statsSection}>
    <Text style={styles.sectionTitle}>Overview</Text>
    <View style={styles.statsGrid}>
      {stats.map((stat, index) => (
        <Surface key={index} style={styles.statCard} elevation={2}>
          <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}20` }]}> 
            <Icon name={stat.icon} size={24} color={stat.color} />
          </View>
          <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </Surface>
      ))}
    </View>
  </View>
);

export default AdminStats; 