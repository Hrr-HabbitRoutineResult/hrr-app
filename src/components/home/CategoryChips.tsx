import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { tokens } from '../../design/tokens';

const categories = [
  { id: 'all', name: '전체보기' },
  { id: 'exercise', name: '운동' },
  { id: 'study', name: '학업' },
  { id: 'hobby', name: '취미' },
  { id: 'job', name: '취업준비' },
  { id: 'lifestyle', name: '생활습관' },
];

const CategoryChips = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handlePress = (category: string) => {
    navigation.navigate('ChallengeList', { category });
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={styles.chip}
          onPress={() => handlePress(category.id)}
          accessibilityLabel={`${category.name} 카테고리 보기`}
          accessibilityRole="button"
        >
          <Text style={styles.chipText}>{category.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
  },
  chip: {
    backgroundColor: tokens.color.background,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radius.lg,
    marginRight: tokens.spacing.sm,
  },
  chipText: {
    ...tokens.typography.smMd,
    color: tokens.color.text.secondary,
  },
});

export default CategoryChips;
