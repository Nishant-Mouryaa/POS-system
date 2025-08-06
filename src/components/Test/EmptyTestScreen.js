// components/Test/EmptyTestScreen.js
const EmptyTestScreen = ({ 
    onGoBack, 
    scaleValue, 
    handlePressIn, 
    handlePressOut 
  }) => {
    return (
      <View style={styles.screenContainer}>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="book-remove-outline"
            size={48}
            color={Palette.textFaded}
          />
          <Title style={styles.emptyTitle}>No Questions Found</Title>
          <Text style={styles.emptyText}>
            This test doesn't contain any questions yet.
          </Text>
  
          <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <TouchableRipple
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={onGoBack}
              style={styles.emptyButton}
              rippleColor={Palette.primaryXLight}
            >
              <Text style={styles.emptyButtonText}>Go Back</Text>
            </TouchableRipple>
          </Animated.View>
        </View>
      </View>
    );
  };

