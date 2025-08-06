// components/Test/LoadingScreen.js
const LoadingScreen = () => {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Palette.primary} />
        <Text style={styles.loadingText}>Preparing your test...</Text>
      </View>
    );
  };