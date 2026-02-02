import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { scale, verticalScale } from '../../utils/scaling';
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
      <View style={styles.notCompletedContainer}>
        {isCompleted ? (
          <>
            <Text style={styles.descriptionLine1} allowFontScaling={false}>랜덤미션을 완료했어요!</Text>
            <Text style={styles.descriptionLine2} allowFontScaling={false}>내일 새로운 미션으로 돌아올게요</Text>
          </>
        ) : (
          <>
            <Text style={styles.descriptionLine1} allowFontScaling={false}>새로운 랜덤미션이 도착했어요!</Text>
            <Text style={styles.descriptionLine2} allowFontScaling={false}>참여하고 오늘의 루틴을 완성해요</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: verticalScale(80),
    overflow: 'hidden',
    position: 'relative',
  },
  backgroundSvg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  notCompletedContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: scale(21),
    paddingVertical: verticalScale(22),
  },
  descriptionLine1: {
    ...typography.smMd,
    color: colors.text.primary,
    marginBottom: verticalScale(2),
  },
  descriptionLine2: {
    ...typography.xxs,
    color: colors.text.primary,
  },
});

export default RandomMissionBanner;