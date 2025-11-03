import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/common/Text';
import { SocialLoginButton } from './components/SocialLoginButton';
import { colors } from '../../design/tokens';
import LogoPrimarySvg from '../../../assets/images/logo-primary.svg';

interface LoginScreenProps {
  onAppleLogin: () => void;
  onNaverLogin: () => void;
  onKakaoLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onAppleLogin,
  onNaverLogin,
  onKakaoLogin,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* 로고 + 슬로건 */}
      <View style={styles.logoSection}>
        <View style={styles.logoContainer}>
          <LogoPrimarySvg width={100} height={100} />
        </View>
        <Text variant="header4" color={colors.primary.main} style={styles.slogan}>
          흐르르 따라 흐르는 나의 성장
        </Text>
      </View>

      {/* 소셜 로그인 버튼들 */}
      <View style={styles.buttonContainer}>
        <SocialLoginButton provider="apple" onPress={onAppleLogin} />
        <SocialLoginButton provider="naver" onPress={onNaverLogin} />
        <SocialLoginButton provider="kakao" onPress={onKakaoLogin} />
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
    marginBottom: 20,
  },
  slogan: {
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    paddingTop: 90,
    paddingBottom: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
});

