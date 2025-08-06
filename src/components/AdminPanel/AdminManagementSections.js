import React from 'react';
import { View, Animated } from 'react-native';
import { Title, Text, Surface, TouchableRipple, Badge } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AdminManagementSections = ({ features, fadeAnim, styles }) => (
  <>
    {features.map((section, sectionIndex) => (
      <Animated.View 
        key={sectionIndex} 
        style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            }],
          },
        ]}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Icon name={section.icon} size={25} color={styles.sectionTitle.color || '#888'} />
            <Title style={styles.sectionTitle}>{section.title}</Title>
          </View>
        </View>
        <View style={styles.cardsRow}>
          {section.items.map((item, index) => (
            <TouchableRipple
              key={index}
              onPress={item.action}
              style={styles.managementCard}
              rippleColor={`${item.color}20`}
              borderless
            >
              <Surface style={styles.cardSurface} elevation={1}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIconContainer, { backgroundColor: `${item.color}15` }]}> 
                    <Icon name={item.icon} size={28} color={item.color} />
                  </View>
                  {item.count && (
                    <Badge style={[styles.cardBadge, { backgroundColor: item.color }]}> 
                      {item.count}
                    </Badge>
                  )}
                </View>
                <Text style={styles.cardTitle}>{item.label}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
              </Surface>
            </TouchableRipple>
          ))}
        </View>
      </Animated.View>
    ))}
  </>
);

export default AdminManagementSections; 