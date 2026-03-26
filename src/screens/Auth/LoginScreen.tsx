import React, { useState, useEffect } from 'react';
import { scale, verticalScale } from '../../utils/scaling';
import {
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/common/Text';
import { SocialLoginButton, SocialProvider } from '../../components/auth/SocialLoginButton';
import { colors } from '../../design/tokens';
import LogoPrimarySvg from '../../../assets/images/logo-primary.svg';

export const LAST_LOGIN_PROVIDER_KEY = 'lastLoginProvider';

interface LoginScreenProps {
  onAppleLogin: () => void | Promise<void>;
  onNaverLogin: () => void;
  onKakaoLogin: () => void | Promise<void>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onAppleLogin,
  onNaverLogin,
  onKakaoLogin,
}) => {
  const [lastLoginProvider, setLastLoginProvider] = useState<SocialProvider | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(LAST_LOGIN_PROVIDER_KEY).then((value) => {
      if (value) setLastLoginProvider(value as SocialProvider);
    });
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* 로고 + 슬로건 */}
      <View style={styles.logoSection}>
        <View style={styles.logoContainer}>
          <LogoPrimarySvg width={scale(100)} height={verticalScale(100)} />
        </View>
        <Text variant="header4" color={colors.primary.main} style={styles.slogan}>
          흐르르 따라 흐르는 나의 성장
        </Text>
      </View>

      {/* 소셜 로그인 버튼들 */}
      <View style={styles.buttonContainer}>
        {Platform.OS === 'ios' && (
          <SocialLoginButton
            provider="apple"
            onPress={onAppleLogin}
            showTooltip={lastLoginProvider === 'apple'}
          />
        )}
        <SocialLoginButton
          provider="naver"
          onPress={onNaverLogin}
          showTooltip={lastLoginProvider === 'naver'}
        />
        <SocialLoginButton
          provider="kakao"
          onPress={onKakaoLogin}
          showTooltip={lastLoginProvider === 'kakao'}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: verticalScale(20),
  },
  slogan: {
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(32),
    alignItems: 'center',
  },
});

