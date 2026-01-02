import React from 'react';
import { scale, verticalScale } from '../../utils/scaling';
import {
  View,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/common/Text';
import { Button } from '../../components/common/Button';
import { colors } from '../../design/tokens';
import OnboardingIntroSvg from '../../../assets/images/onboarding-intro.svg';
import LogoPrimarySvg from '../../../assets/images/logo-primary.svg';
import BackGraphicSvg from '../../../assets/images/back-graphic.svg';
import BackgroundBlur1Svg from '../../../assets/images/background-blur-1.svg';
import BackgroundBlur2Svg from '../../../assets/images/background-blur-2.svg';

interface OnboardingIntroProps {
  onSkip: () => void;
  onStart: () => void;
}

export const OnboardingIntro: React.FC<OnboardingIntroProps> = ({
  onSkip,
  onStart,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* 배경 블러 효과들 */}
      <View style={styles.backgroundBlur1}>
        <BackgroundBlur1Svg width={280} height={280} />
      </View>
      <View style={styles.backgroundBlur2}>
        <BackgroundBlur1Svg width={270} height={270} />
      </View>
      <View style={styles.backgroundBlur3}>
        <BackgroundBlur2Svg width={200} height={200} />
      </View>

      {/* 왼쪽 상단 로고 */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <LogoPrimarySvg width={28} height={28} />
        </View>
      </View>

      <View style={styles.content}>
        {/* 카드 콘텐츠 SVG 이미지 영역 */}
        <View style={styles.imageContainer}>
          <OnboardingIntroSvg width={340} height={410} />
        </View>

        {/* 텍스트 영역 */}
        <View style={styles.textContainer}>
          <Text variant="header1" color={colors.text.primary} style={styles.title}>
            나에게 맞는 챌린지를
          </Text>

          <View style={styles.highlightContainer}>
            <Text variant="header1" color={colors.text.primary} style={styles.title}>
              <Text variant="header1" color={colors.primary.sub}>
                쏙!
              </Text>
              {' '}추천해드려요
            </Text>
            <View style={styles.highlightGraphic}>
              <BackGraphicSvg width={177} height={21} />
            </View>
          </View>

          <Text variant="xxs" color={colors.text.tertiary} style={styles.subtitle}>
            언제든 중단하고 홈으로 넘어갈 수 있어요
          </Text>
        </View>

        {/* 버튼 영역 */}
        <View style={styles.buttonContainer}>
          <Button
            variant="gray"
            size="small"
            onPress={onSkip}
          >
            넘어가기
          </Button>

          <Button
            variant="black"
            size="small"
            onPress={onStart}
          >
            추천 받을래요
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundBlur1: {
    position: 'absolute',
    top: verticalScale(48),
    left: scale(240),
    zIndex: 0,
  },
  backgroundBlur2: {
    position: 'absolute',
    top: verticalScale(297),
    left: -66,
    zIndex: 0,
  },
  backgroundBlur3: {
    position: 'absolute',
    top: verticalScale(477),
    left: scale(302),
    zIndex: 0,
  },
  header: {
    paddingHorizontal: scale(40),
    paddingTop: verticalScale(15),
    zIndex: 1,
  },
  logoContainer: {
    width: scale(28),
    height: verticalScale(28),
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(24),
    justifyContent: 'space-between',
    zIndex: 1,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    lineHeight: verticalScale(30),
  },
  highlightContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  highlightGraphic: {
    position: 'absolute',
    bottom: -0.5,
    zIndex: -1,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: verticalScale(22),
    marginBottom: 80
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(32),
    gap: scale(10),
  },
});
