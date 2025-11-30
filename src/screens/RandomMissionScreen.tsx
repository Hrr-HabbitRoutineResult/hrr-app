import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RandomMissionScreen = () => {
  return (
    <View style={styles.container}>
      <Text>오늘의 랜덤미션</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RandomMissionScreen;
