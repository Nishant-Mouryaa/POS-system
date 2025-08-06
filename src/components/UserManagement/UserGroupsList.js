import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Surface, Button, Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import GroupHeader from './GroupHeader';
import UserList from './UserList';
import EmptyState from './EmptyState';
import { AdminPalette } from '../../theme/colors';

const UserGroupsList = ({
  filteredGroups,
  expandedGroups,
  toggleGroup,
  notifyGroup,
  UserCard,
  scrollY,
  handleSendMessageTo,
  handleEditFees,
  handleRemindPayment,
  searchQuery
}) => {
  const styles = makeStyles(AdminPalette);
  return (
    <FlatList
      data={filteredGroups}
      keyExtractor={(item) => item.standard}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item: group }) => (
        <View style={styles.groupContainer}>
          <GroupHeader
            group={group}
            expanded={expandedGroups[group.standard]}
            toggleGroup={toggleGroup}
            notifyGroup={notifyGroup}
          />
          {expandedGroups[group.standard] && (
            <UserList
              users={group.data}
              UserCard={UserCard}
              scrollY={scrollY}
              handleSendMessageTo={handleSendMessageTo}
              handleEditFees={handleEditFees}
              handleRemindPayment={handleRemindPayment}
            />
          )}
        </View>
      )}
      ListEmptyComponent={<EmptyState searchQuery={searchQuery} />}
    />
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
    listContent: {
      padding: 16,
      paddingBottom: 100,
    },
    groupContainer: {
      marginBottom: 16,
    },
  });

export default UserGroupsList; 