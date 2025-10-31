import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { tokens } from '../../design/tokens';

const RandomMissionBanner = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handlePress = () => {
    navigation.navigate('RandomMission');
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <Text style={styles.title}>오늘의 랜덤미션</Text>
      <Text style={styles.subCopy}>매일 주어지는 미션을 해결하고 포인트를 얻어보세요!</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: tokens.color.primary.lighter,
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.lg,
    marginHorizontal: tokens.spacing.md,
    marginVertical: tokens.spacing.lg,
  },
  title: {
    ...tokens.typography.header4,
    color: tokens.color.text.primary,
    marginBottom: tokens.spacing.xs,
  },
  subCopy: {
    ...tokens.typography.smReg,
    color: tokens.color.text.secondary,
  },
});

export default RandomMissionBanner;
