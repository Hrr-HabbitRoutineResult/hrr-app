import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/common/Text';
import { Header } from '../../components/common/Header';
import { colors } from '../../design/tokens';
import LoadingImage from '../../../assets/images/onboarding-loading.svg';

interface OnboardingLoadingProps {
  onBack: () => void;
  onComplete: () => void;
}

export const OnboardingLoading: React.FC<OnboardingLoadingProps> = ({
  onBack,
  onComplete,
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const imageWidth = 220;
  const gap = 12;
  const totalImages = 5;

  useEffect(() => {
    // 오->왼 무한 스와이프 애니메이션
    let animation: Animated.CompositeAnimation | null = null;

    const startAnimation = () => {
      const animate = () => {
        slideAnim.setValue(0);
        animation = Animated.timing(slideAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        });
        animation.start(() => {
          // 애니메이션이 완료되면 다시 시작
          animate();
        });
      };
      animate();
    };

    startAnimation();

    // 클린업 함수
    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, []);

  // 4초 후 자동으로 다음 화면으로 전환
  // TODO: API 연동 후 로딩에 성공하면 추천 챌린지 화면으로 이동
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // 이미지 위치 계산
  const getImageTranslateX = (index: number) => {
    // 화면 중앙을 기준으로 이미지 배치
    const baseOffset = (imageWidth + gap) * (index - 2); // 중앙(index 2) 기준으로 배치
    const moveDistance = imageWidth + gap; // 한 이미지 너비 + 간격만큼 이동
    return slideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [baseOffset, baseOffset - moveDistance],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <Header onBack={onBack} />

      <View style={styles.content}>
        {/* 타이틀 */}
        <View style={styles.titleContainer}>
          <Text variant="header1" color={colors.text.primary} style={styles.title}>
            추천드릴 챌린지를{'\n'}탐색 중이에요
          </Text>
          <Text variant="xsReg" color={colors.text.tertiary} style={styles.subtitle}>
            잠시만 기다려주시면 바로 알려드릴게요!
          </Text>
        </View>
      </View>

      {/* 로딩 이미지 캐러셀 - 화면 전체 너비 사용 */}
      <View style={styles.imageContainer}>
        {Array.from({ length: totalImages }).map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.animatedImage,
              {
                transform: [{ translateX: getImageTranslateX(index) }],
              },
            ]}
          >
            <LoadingImage width={220} height={320} />
          </Animated.View>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  titleContainer: {
    alignItems: 'flex-start',
    marginBottom: 0,
    width: '100%',
  },
  title: {
    textAlign: 'left',
    lineHeight: 32,
    marginBottom: 12,
  },
  subtitle: {
    textAlign: 'left',
    lineHeight: 22,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    marginTop: -100,
  },
  animatedImage: {
    position: 'absolute',
    width: 220,
    height: 320,
  },
});

