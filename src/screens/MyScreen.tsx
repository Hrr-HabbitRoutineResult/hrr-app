import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MyScreen = () => (
  <View style={styles.container}>
    <Text>My Screen</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MyScreen;
