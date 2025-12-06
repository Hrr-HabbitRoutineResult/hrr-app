import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  PanResponder,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shadow } from 'react-native-shadow-2';
import { Text } from '../../components/common/Text';
import { Button } from '../../components/common/Button';
import { colors } from '../../design/tokens';
import { LoginScreen } from './LoginScreen';
import { TermsAgreementScreen } from './TermsAgreementScreen';
import { NicknameSetupScreen } from './NicknameSetupScreen';
import { OnboardingScreen } from '../Onboarding/OnboardingScreen';
import { loginWithKakao, handleKakaoLogin as handleKakaoLoginWithToken } from '../../libs/auth/kakao';
import OnboardingStep1 from '../../../assets/images/onboarding-step-1.svg';
import OnboardingStep2 from '../../../assets/images/onboarding-step-2.svg';
import OnboardingStep3 from '../../../assets/images/onboarding-step-3.svg';
import OnboardingStep4 from '../../../assets/images/onboarding-step-4.svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_PADDING = 24;
const CARD_HEIGHT = 460; // SVG 이미지 높이
const SWIPE_THRESHOLD = 50; // 스와이프 감지 임계값

export type AuthOnboardingStep = 'onboarding' | 'login' | 'terms' | 'nickname' | 'userOnboarding';

interface AuthOnboardingScreenProps {
  onOnboardingComplete?: () => void;
}

const ONBOARDING_TEXTS = [
  { lines: ['혼자서는 쉽게 포기하던 자기개발', '흐르르와 함께 도전해요'] },
  { lines: ['함께 인증하고 소통하며', '꾸준함을 루틴으로 만들어가요'] },
  { lines: ['인증 기록들이 차곡차곡 쌓여', '내 성장 여정을 한 눈에 볼 수 있어요'] },
  { lines: ['오늘의 랜덤미션과 함께', '당신의 루틴을 시작해 보세요'] },
];

const TOTAL_ONBOARDING_STEPS = ONBOARDING_TEXTS.length;

const ONBOARDING_IMAGES = [
  OnboardingStep1,
  OnboardingStep2,
  OnboardingStep3,
  OnboardingStep4,
];

export const AuthOnboardingScreen: React.FC<AuthOnboardingScreenProps> = ({ onOnboardingComplete }) => {
  const [step, setStep] = useState<AuthOnboardingStep>('onboarding');
  const [currentOnboardingStep, setCurrentOnboardingStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const currentStepRef = useRef(currentOnboardingStep);

  // currentOnboardingStep이 변경될 때마다 ref 업데이트
  useEffect(() => {
    currentStepRef.current = currentOnboardingStep;
  }, [currentOnboardingStep]);

  // 카카오 로그인 처리
  const processKakaoLogin = useCallback(async (kakaoAccessToken: string) => {
    try {
      setIsLoading(true);

      // 백엔드 로그인 API 호출
      const response = await handleKakaoLoginWithToken(kakaoAccessToken);

      if (response.isSuccess) {
        // 서버에서 받은 토큰/사용자 정보를 AsyncStorage에 저장
        await AsyncStorage.setItem('accessToken', response.result.accessToken);
        await AsyncStorage.setItem('refreshToken', response.result.refreshToken);
        await AsyncStorage.setItem('userId', String(response.result.userId));

        // nickname이 null이거나 undefined가 아닐 때만 저장
        if (response.result.nickname != null && response.result.nickname !== undefined) {
          await AsyncStorage.setItem('nickname', response.result.nickname);
        } else {
          // nickname이 null이면 로컬에 남아있을 수 있는 이전 nickname을 제거해 데이터 불일치 방지
          await AsyncStorage.removeItem('nickname');
        }

        // 신규/기존 사용자 구분한 뒤 다음 단계 분기 처리
        if (response.result.loginStatus === 'NEW') {
          // 신규 사용자: 약관 동의 화면
          setStep('terms');
        } else {
          // 기존 사용자: 온보딩 완료
          if (onOnboardingComplete) {
            onOnboardingComplete();
          }
        }
      } else {
        Alert.alert('로그인 실패', response.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [onOnboardingComplete]);

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
    // TODO: 애플 로그인 구현
    // 현재는 약관 동의 화면으로 바로 이동
    setStep('terms');
  };

  const handleNaverLogin = () => {
    // TODO: 네이버 로그인 구현
    // 현재는 약관 동의 화면으로 바로 이동
    setStep('terms');
  };

  // 카카오 로그인 버튼 클릭 핸들러
  const handleKakaoLogin = async () => {
    try {
      setIsLoading(true);

      // 카카오 SDK 로그인 호출
      const kakaoAccessToken = await loginWithKakao();

      if (kakaoAccessToken) {
        // 카카오 로그인 성공 -> 백엔드 로그인 처리
        await processKakaoLogin(kakaoAccessToken);
      } else {
        // 사용자가 로그인 취소
        setIsLoading(false);
      }
    } catch (error) {
      // 실제 에러가 난 경우에만 알러트창 표시 (취소는 제외)
      if (error instanceof Error) {
        if (!error.message.includes('cancel') && !error.message.includes('취소') && !error.message.includes('Cancel')) {
          Alert.alert('오류', `카카오 로그인 중 오류가 발생했습니다.\n${error.message}`);
        }
      } else {
        Alert.alert('오류', '카카오 로그인 중 오류가 발생했습니다.');
      }
      setIsLoading(false);
    }
  };

  const handleTermsBack = () => {
    setStep('login');
  };

  const handleTermsNext = () => {
    setStep('nickname');
  };

  const handleNicknameBack = () => {
    setStep('terms');
  };

  const handleNicknameComplete = (nickname: string) => {
    setStep('userOnboarding');
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

  if (step === 'terms') {
    return (
      <TermsAgreementScreen
        onBack={handleTermsBack}
        onNext={handleTermsNext}
      />
    );
  }

  if (step === 'nickname') {
    return (
      <NicknameSetupScreen
        onBack={handleNicknameBack}
        onComplete={handleNicknameComplete}
      />
    );
  }

  if (step === 'userOnboarding') {
    return <OnboardingScreen onComplete={onOnboardingComplete} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        {/* 1) 이미지 슬라이드 영역 */}
        <View style={styles.fullWidthSliderWrapper}>
          <View style={styles.sliderContainer} {...panResponder.panHandlers}>
            <Animated.View
              style={[
                styles.sliderContent,
                {
                  transform: [{ translateX: slideAnim }],
                },
              ]}
            >
              {ONBOARDING_TEXTS.map((_, index) => {
                const OnboardingImage = ONBOARDING_IMAGES[index];
                return (
                  <View key={index} style={styles.slide}>
                    <View style={styles.imageArea}>
                      <Shadow
                        distance={16}
                        startColor="rgba(0, 0, 0, 0.08)"
                        offset={[0, 4]}
                        containerStyle={{ borderRadius: 30 }}
                      >
                        <View style={styles.imageContainer}>
                          <OnboardingImage
                            width={342}
                            height={460}
                          />
                        </View>
                      </Shadow>
                    </View>
                  </View>
                );
              })}
            </Animated.View>
          </View>
        </View>

        {/* 2) 인디케이터 영역 */}
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

        {/* 3) 텍스트 영역 */}
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

      {/* 4) 버튼 */}
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
    flexShrink: 1,
    paddingHorizontal: H_PADDING, // 인디케이터, 텍스트는 그리드 안
  },
  // 슬라이드만 그리드 밖으로
  fullWidthSliderWrapper: {
    marginHorizontal: -H_PADDING, // 패딩을 상쇄시켜 슬라이드만 화면에 풀로 보이게
    overflow: 'hidden', // 옆 슬라이드 안 보이게
  },
  sliderContainer: {
    height: CARD_HEIGHT + 100, // 위에 paddingTop 주는 만큼 여유 + 그림자 높이
    overflow: 'visible', // 그림자는 보이게
  },
  sliderContent: {
    flexDirection: 'row',
    width: SCREEN_WIDTH * TOTAL_ONBOARDING_STEPS,
  },
  slide: {
    width: SCREEN_WIDTH,
  },
  imageArea: {
    alignItems: 'center',
    paddingTop: 60,
  },
  imageContainer: {
    width: 342,
    height: 460,
    borderRadius: 30,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    marginTop: 26,
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
  textContainer: {
    marginBottom: 48,
    flexShrink: 1, // 공간이 부족하면 줄어들 수 있게
  },
  text: {
    lineHeight: 28,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    alignItems: 'center',
    flexShrink: 0, // 버튼이 항상 보이게
  },
});
