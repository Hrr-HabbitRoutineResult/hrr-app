import { StatusBar, StyleSheet, useColorScheme, View, AppState, DeviceEventEmitter } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import React, { useEffect, useState, useRef } from 'react';
import BootSplash from 'react-native-bootsplash';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthOnboardingScreen } from './src/screens/Auth/AuthOnboardingScreen';
import RootNavigator from './src/navigation/RootNavigator';
import { LOGOUT_EVENT } from './src/libs/auth/logout';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    // 앱 초기화 작업
    const init = async () => {
      // TODO: 실제 초기화 작업 추가하기
      await new Promise((resolve) => setTimeout(() => resolve(undefined), 2500)); // 2.5초
    };

    // 초기화 완료 후에는 스플래시 화면 부드럽게 숨기기
    init().finally(() => {
      BootSplash.hide({ fade: true });
    });
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <AppContent />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const appState = useRef(AppState.currentState);

  // 인증 상태 확인 함수
  const checkAuthStatus = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      if (accessToken) {
        setIsOnboardingComplete(true);
      } else {
        setIsOnboardingComplete(false);
      }
    } catch (error) {
      setIsOnboardingComplete(false);
    } finally {
      setIsCheckingAuth(false);
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

    // 앱이 포커스될 때마다 인증 상태 재확인 (로그아웃 시 상태 반영)
    const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // 앱이 백그라운드에서 포그라운드로 돌아올 때 인증 상태 확인
        checkAuthStatus();
      }
      appState.current = nextAppState;
    });

    return () => {
      logoutSubscription.remove();
      appStateSubscription.remove();
    };
  }, []);

  const handleOnboardingComplete = () => {
    setIsOnboardingComplete(true);
  };

  // 인증 상태 확인 중에는 아무것도 렌더링하지 않고 스플래시 화면 유지
  if (isCheckingAuth) {
    return null;
  }

  if (isOnboardingComplete) {
    return <RootNavigator />;
  }

  return (
    <View style={styles.container}>
      <AuthOnboardingScreen onOnboardingComplete={handleOnboardingComplete} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;