import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { colors, typography } from '../../design/tokens';

import IconAll from '../../../assets/icons/homescreen/categorychips/ic_all.svg';
import IconExercise from '../../../assets/icons/homescreen/categorychips/ic_exercise.svg';
import IconStudy from '../../../assets/icons/homescreen/categorychips/ic_study.svg';
import IconHobby from '../../../assets/icons/homescreen/categorychips/ic_hobby.svg';
import IconJob from '../../../assets/icons/homescreen/categorychips/ic_job.svg';
import IconLifestyle from '../../../assets/icons/homescreen/categorychips/ic_lifestyle.svg';

const categories = [
  { id: 'all', name: '전체보기', Icon: IconAll },
  { id: 'exercise', name: '운동', Icon: IconExercise },
  { id: 'study', name: '학업', Icon: IconStudy },
  { id: 'hobby', name: '취미', Icon: IconHobby },
  { id: 'job', name: '취업준비', Icon: IconJob },
  { id: 'lifestyle', name: '생활습관', Icon: IconLifestyle },
];

const CategoryChips = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handlePress = (category: string) => {
    navigation.navigate('ChallengeList', { category });
  };

  return (
    <View style={styles.container}>
      {categories.map(({ id, name, Icon }) => (
        <TouchableOpacity
          key={id}
          style={styles.chip}
          onPress={() => handlePress(id)}
          accessibilityLabel={`${name} 카테고리 보기`}
          accessibilityRole="button"
        >
          <Icon
            width={48}
            height={48}
          />
          <View style={styles.textWrapper}>
            <Text style={styles.chipText}>{name}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chip: {
    alignItems: 'center',
  },
  textWrapper: {
    marginTop: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: {
    ...typography.xxs,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 12,
  },
});

export default CategoryChips;
