import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/common/Text';
import { Button } from '../../components/common/Button';
import { colors } from '../../design/tokens';
import { LoginScreen } from './LoginScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 50; // 스와이프 감지 임계값

export type AuthOnboardingStep = 'onboarding' | 'login';

const ONBOARDING_TEXTS = [
  { lines: ['혼자서는 쉽게 포기하던 자기개발', '흐르르와 함께 도전해요'] },
  { lines: ['함께 인증하고 소통하며', '꾸준함을 루틴으로 만들어가요'] },
  { lines: ['인증 기록들이 차곡차곡 쌓여', '내 성장 여정을 한 눈에 볼 수 있어요'] },
  { lines: ['오늘의 랜덤미션과 함께', '당신의 루틴을 시작해 보세요'] },
];

const TOTAL_ONBOARDING_STEPS = ONBOARDING_TEXTS.length;

export const AuthOnboardingScreen: React.FC = () => {
  const [step, setStep] = useState<AuthOnboardingStep>('onboarding');
  const [currentOnboardingStep, setCurrentOnboardingStep] = useState(1);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const currentStepRef = useRef(currentOnboardingStep);

  // currentOnboardingStep이 변경될 때마다 ref 업데이트
  useEffect(() => {
    currentStepRef.current = currentOnboardingStep;
  }, [currentOnboardingStep]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        const step = currentStepRef.current;
        // 오->왼 스와이프 (다음 단계)
        if (gestureState.dx < -SWIPE_THRESHOLD && step < TOTAL_ONBOARDING_STEPS) {
          handleNext();
        }
        // 왼->오 스와이프 (이전 단계)
        else if (gestureState.dx > SWIPE_THRESHOLD && step > 1) {
          handlePrev();
        }
      },
    })
  ).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: -(currentOnboardingStep - 1) * SCREEN_WIDTH,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, [currentOnboardingStep, slideAnim]);

  const handleSkip = () => {
    // 건너뛰기 버튼 클릭 시 로그인 화면으로 이동
    setStep('login');
  };

  const handleNext = () => {
    setCurrentOnboardingStep((prev) => {
      if (prev < TOTAL_ONBOARDING_STEPS) {
        return prev + 1;
      } else {
        // 마지막 단계 완료 시 로그인 화면으로 이동
        setStep('login');
        return prev;
      }
    });
  };

  const handlePrev = () => {
    setCurrentOnboardingStep((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleAppleLogin = () => {
    console.log('Apple 로그인');
    // TODO: Apple 로그인 구현
  };

  const handleNaverLogin = () => {
    console.log('Naver 로그인');
    // TODO: Naver 로그인 구현
  };

  const handleKakaoLogin = () => {
    console.log('Kakao 로그인');
    // TODO: Kakao 로그인 구현
  };

  if (step === 'login') {
    return (
      <LoginScreen
        onAppleLogin={handleAppleLogin}
        onNaverLogin={handleNaverLogin}
        onKakaoLogin={handleKakaoLogin}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        {/* 슬라이드 컨텐츠 (이미지 + 텍스트) */}
        <View style={styles.sliderContainer} {...panResponder.panHandlers}>
          <Animated.View
            style={[
              styles.sliderContent,
              {
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            {ONBOARDING_TEXTS.map((_, index) => (
              <View key={index} style={styles.slide}>
                {/* 이미지 영역 (TODO: 나중에 에셋 추가하기) */}
                <View style={styles.imageArea} />
              </View>
            ))}
          </Animated.View>
        </View>

        {/* 인디케이터 */}
        <View style={styles.indicatorContainer}>
          {Array.from({ length: TOTAL_ONBOARDING_STEPS }, (_, index) => (
            <View
              key={index}
              style={
                index === currentOnboardingStep - 1
                  ? styles.indicatorActive
                  : styles.indicatorInactive
              }
            />
          ))}
        </View>

        {/* 온보딩 텍스트 */}
        <View style={styles.textContainer}>
          {(() => {
            const { lines } = ONBOARDING_TEXTS[currentOnboardingStep - 1];
            return lines.map((line, idx) => (
              <Text
                key={idx}
                variant="header2"
                color={colors.text.primary}
                style={styles.text}
              >
                {line}
              </Text>
            ));
          })()}
        </View>
      </View>

      {/* 건너뛰기/시작하기 버튼 */}
      <View style={styles.buttonContainer}>
        <Button 
          variant={currentOnboardingStep === TOTAL_ONBOARDING_STEPS ? 'primary' : 'gray'} 
          size="medium" 
          onPress={handleSkip}
        >
          {currentOnboardingStep === TOTAL_ONBOARDING_STEPS ? '시작하기' : '건너뛰기'}
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 24,
  },
  imageArea: {
    width: '100%',
    flex: 1,
  },
  indicatorContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 4,
  },
  indicatorActive: {
    width: 32,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary.main,
  },
  indicatorInactive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.button,
  },
  sliderContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  sliderContent: {
    flexDirection: 'row',
    width: SCREEN_WIDTH * TOTAL_ONBOARDING_STEPS,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  textContainer: {
    marginBottom: 48,
  },
  text: {
    lineHeight: 28,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    alignItems: 'center',
  },
});
