import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale } from 'react-native-size-matters';
import { colors, typography } from '../../design/tokens';
import ChallengeSuggestBtn from '../../../assets/icons/homescreen/challenge_suggest_btn.svg';

const BUTTON_HEIGHT = verticalScale(60);

export const ChallengeSuggestButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <TouchableOpacity style={styles.wrapper} onPress={onPress} activeOpacity={0.9}>
      {/* SVG 배경 */}
      <ChallengeSuggestBtn
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        style={styles.backgroundSvg}
      />

      {/* 텍스트 */}
      <View style={styles.textContainer}>
        <Text style={styles.text}>나에게 맞는 챌린지 추천받기</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: BUTTON_HEIGHT,
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
    paddingTop: verticalScale(21),
    paddingBottom: verticalScale(20),
    paddingLeft: scale(36),
  },
  text: {
    ...typography.md,
    color: colors.white,
  },
});
