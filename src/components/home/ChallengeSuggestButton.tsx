import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale } from '../../utils/scaling';
import { colors, typography } from '../../design/tokens';
import ChallengeSuggestBtn from '../../../assets/icons/homescreen/challenge_suggest_btn.svg';

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
        <Text style={styles.text} allowFontScaling={false}>나에게 맞는 챌린지 추천받기</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: scale(60),
    overflow: 'hidden',
    position: 'relative',
  },
  backgroundSvg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  textContainer: {
    height: '100%',
    paddingLeft: scale(24),
    justifyContent: 'center',
  },
  text: {
    ...typography.md,
    color: colors.white,
  },
});
