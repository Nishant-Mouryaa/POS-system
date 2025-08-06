import React from 'react';
import { View, StyleSheet } from 'react-native';

const UserList = ({ users, UserCard, scrollY, handleSendMessageTo, handleEditFees, handleRemindPayment }) => {
  const styles = makeStyles();
  return (
    <View style={styles.groupContent}>
      {users.map((user, index) => (
        <UserCard
          key={user.id}
          user={user}
          index={index}
          scrollY={scrollY}
          onMessage={handleSendMessageTo}
          onEditFees={handleEditFees}
          onRemindPayment={handleRemindPayment}
        />
      ))}
    </View>
  );
};

const makeStyles = () => ({
  groupContent: {
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    padding: 8,
  },
});

export default UserList;