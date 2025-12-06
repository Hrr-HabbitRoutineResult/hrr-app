import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import BootSplash from 'react-native-bootsplash';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthOnboardingScreen } from './src/screens/Auth/AuthOnboardingScreen';
import RootNavigator from './src/navigation/RootNavigator';

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

  useEffect(() => {
    // 저장된 토큰으로 인증(로그인) 상태 확인
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

    checkAuthStatus();
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