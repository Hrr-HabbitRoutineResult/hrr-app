import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { colors, typography, spacing, radius } from '../../design/tokens';
import { useUserStore } from '../../store/userSlice';

import ChallSvg from '../../../assets/icons/homescreen/chall.svg';
import ChallDoneSvg from '../../../assets/icons/homescreen/chall_done.svg';

const RandomMissionBanner = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const isCompleted = useUserStore((state) => state.randomMissionCompleted);

  const handlePress = () => {
    navigation.navigate('RandomMission');
  };

  const BackgroundSvg = isCompleted ? ChallDoneSvg : ChallSvg;

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <BackgroundSvg 
        width="100%" 
        height="100%" 
        preserveAspectRatio="none"
        style={styles.backgroundSvg} 
      />
      {isCompleted ? (
        <View style={styles.textContainer}>
          <Text style={styles.description}>
            랜덤미션을 완료했어요!{'\n'}내일 새로운 미션으로 돌아올게요
          </Text>
        </View>
      ) : (
        <View style={styles.notCompletedContainer}>
          <Text style={styles.descriptionLine1}>새로운 랜덤미션이 도착했어요!</Text>
          <Text style={styles.descriptionLine2}>참여하고 플로우 스코어를 받아요</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 80,
    overflow: 'hidden',
    position: 'relative',
  },
  backgroundSvg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 21,
    paddingVertical: 22,
  },
  notCompletedContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 21,
    paddingVertical: 22,
  },
  description: {
    ...typography.smReg, // 15px regular
    color: colors.text.secondary,
  },
  descriptionLine1: {
    ...typography.smMd,
    color: colors.text.primary,
    marginBottom: 2,
  },
  descriptionLine2: {
    ...typography.xxs,
    color: colors.text.primary,
  },
});

export default RandomMissionBanner;