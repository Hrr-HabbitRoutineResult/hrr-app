import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../design/tokens';
import ChallengeSuggestBtn from '../../../assets/icons/homescreen/challenge_suggest_btn.svg';

const BUTTON_WIDTH = 350;
const BUTTON_HEIGHT = 60;

export const ChallengeSuggestButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <TouchableOpacity style={styles.wrapper} onPress={onPress} activeOpacity={0.9}>
      {/* ✅ SVG 배경 - 비율 유지 + 중앙 정렬 */}
      <View style={styles.svgContainer}>
        <ChallengeSuggestBtn
          width={BUTTON_WIDTH}
          height={BUTTON_HEIGHT}
          preserveAspectRatio="xMidYMid meet"
        />
      </View>

      {/* ✅ Figma 좌표 기준 텍스트 */}
      <View style={styles.textContainer}>
        <Text style={styles.text}>나에게 맞는 챌린지 추천받기</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    alignSelf: 'center',
    marginVertical: spacing.sm,
    position: 'relative',
  },
  svgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    position: 'absolute',
    top: 21,
    left: 36,
    width: 174,
    height: 19,
    justifyContent: 'center',
  },
  text: {
    ...typography.md,
    color: colors.white,
    fontWeight: '500',
  },
});
