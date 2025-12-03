import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import BootSplash from 'react-native-bootsplash';
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

  const handleOnboardingComplete = () => {
    setIsOnboardingComplete(true);
  };

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