import { StatusBar, AppState, DeviceEventEmitter, Platform, Linking } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState, useRef } from 'react';
import BootSplash from 'react-native-bootsplash';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RootNavigator from './src/navigation/RootNavigator';
import { LOGOUT_EVENT } from './src/libs/auth/logout';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import appsFlyer from 'react-native-appsflyer';
import Config from 'react-native-config';
import { navigate, navigationRef, setAuthReady } from './src/navigation/navigationRef';

// URL에서 query parameter 추출
function getQueryParam(url: string, param: string): string | null {
  const match = url.match(new RegExp(`[?&]${param}=([^&]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function App() {
  useEffect(() => {
    // 앱 초기화 작업
    const init = async () => {
      try {
        // 앱이 종료된 상태에서 딥링크로 실행된 경우 처리
        const initialURL = await Linking.getInitialURL();
        if (initialURL) {
          const deepLinkValue = getQueryParam(initialURL, 'deep_link_value');
          const challengeId = getQueryParam(initialURL, 'deep_link_sub1');

          if (deepLinkValue === 'challenge' && challengeId) {
            setTimeout(() => {
              navigationRef.reset({
                index: 0,
                routes: [{ name: 'ChallengeProfile', params: { challengeId: parseInt(challengeId, 10) } }],
              });
            }, 500);
          }
        }

        // AppsFlyer SDK 초기화
        appsFlyer.initSdk(
          {
            devKey: Config.APPSFLYER_DEV_KEY,
            isDebug: __DEV__,
            appId: Config.APPSFLYER_APP_ID,
            onInstallConversionDataListener: true,
            onDeepLinkListener: true,
          },
          (result: unknown) => {
            if (__DEV__) console.log('AppsFlyer 초기화 성공:', result);
          },
          (error: unknown) => {
            if (__DEV__) console.error('AppsFlyer 초기화 실패:', error);
          }
        );

        // 앱 실행 중 딥링크 수신 처리 (iOS)
        appsFlyer.onDeepLink((res: any) => {
          if (__DEV__) console.log('딥링크 데이터 수신:', JSON.stringify(res));
          const value = res?.data?.deep_link_value;
          const challengeId = res?.data?.deep_link_sub1;

          if (value === 'challenge' && challengeId) {
            navigate('ChallengeProfile', { challengeId: parseInt(challengeId, 10) });
          }
        });

        // 기존 초기화 대기 로직
        await new Promise((resolve) => setTimeout(() => resolve(undefined), 2500));

      } catch (error) {
        console.error("초기화 프로세스 중 에러:", error);
      }
    };

    init().finally(() => {
      BootSplash.hide({ fade: true });
    });

    // 앱 실행 중 딥링크 수신 처리 (Android)
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      if (__DEV__) console.log('Linking url 수신:', url);
      const deepLinkValue = getQueryParam(url, 'deep_link_value');
      const challengeId = getQueryParam(url, 'deep_link_sub1');

      if (deepLinkValue === 'challenge' && challengeId) {
        navigate('ChallengeProfile', { challengeId: parseInt(challengeId, 10) });
      }
    });

    return () => {
      linkingSubscription.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView
          style={{ flex: 1 }}
          edges={Platform.OS === 'android' ? ['bottom'] : []}
        >
          <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
          <AppContent />
        </SafeAreaView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  // 회원가입 직후 추천 온보딩을 보여줄지 여부
  const [showRecommendation, setShowRecommendation] = useState(false);
  // 온보딩 슬라이드를 이미 본 적 있는지 여부 (앱 삭제 후 재설치 시에만 초기화)
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const appState = useRef(AppState.currentState);

  // 인증 상태 확인 함수
  const checkAuthStatus = async () => {
    try {
      const [[, accessToken], [, seenOnboarding]] = await AsyncStorage.multiGet([
        'accessToken',
        'hasSeenOnboarding',
      ]);
      setIsOnboardingComplete(!!accessToken);
      setHasSeenOnboarding(seenOnboarding === 'true');
    } catch {
      setIsOnboardingComplete(false);
      setHasSeenOnboarding(false);
    } finally {
      setIsCheckingAuth(false);
      setAuthReady();
    }
  };

  useEffect(() => {
    // 초기 인증 상태 확인
    checkAuthStatus();

    // 로그아웃 이벤트 리스너 (로그아웃 시 즉시 상태 업데이트)
    const logoutSubscription = DeviceEventEmitter.addListener(LOGOUT_EVENT, () => {
      setIsOnboardingComplete(false);
      setIsCheckingAuth(false);
    });

    // 앱 상태 변경 이벤트 리스너 (앱 실행 중일 때 인증 상태 확인)
    const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        checkAuthStatus();
      }
      appState.current = nextAppState;
    });

    return () => {
      logoutSubscription.remove();
      appStateSubscription.remove();
    };
  }, []);

  const handleOnboardingComplete = (showOnboarding = false) => {
    // 신규 유저인 경우 추천 온보딩 플래그 설정
    setShowRecommendation(showOnboarding);
    setIsOnboardingComplete(true);
  };

  // 인증 상태 확인 중에는 아무것도 렌더링하지 않고 스플래시 화면 유지
  if (isCheckingAuth) {
    return null;
  }

  return (
    <RootNavigator
      showRecommendation={showRecommendation}
      isAuthenticated={isOnboardingComplete}
      hasSeenOnboarding={hasSeenOnboarding}
    />
  );
}

export default App;