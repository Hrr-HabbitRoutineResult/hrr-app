import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
} from 'react-native';
import { scale, verticalScale } from '../../utils/scaling';
import { Text } from '../common/Text';
import { colors } from '../../design/tokens';
import AppleIcon from '../../../assets/icons/social/apple.svg';
import NaverIcon from '../../../assets/icons/social/naver.svg';
import KakaoIcon from '../../../assets/icons/social/kakao.svg';

type SocialProvider = 'apple' | 'naver' | 'kakao';

interface SocialLoginButtonProps {
  provider: SocialProvider;
  onPress: () => void;
}

const PROVIDER_CONFIG = {
  apple: {
    backgroundColor: '#000000',
    textColor: colors.white,
    text: 'Apple로 로그인',
    Icon: AppleIcon,
  },
  naver: {
    backgroundColor: '#03C75A',
    textColor: colors.white,
    text: '네이버 로그인',
    Icon: NaverIcon,
  },
  kakao: {
    backgroundColor: '#FEE500',
    textColor: '#000000CC', // 투명도 80%
    text: '카카오 로그인',
    Icon: KakaoIcon,
  },
};

export const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({
  provider,
  onPress,
}) => {
  const config = PROVIDER_CONFIG[provider];
  const IconComponent = config.Icon;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: config.backgroundColor },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        <View style={styles.iconContainer}>
          <IconComponent width={20} height={20} />
        </View>
        <Text variant="md" color={config.textColor} style={styles.buttonText} allowFontScaling={false}>
          {config.text}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    maxWidth: scale(350),
    borderRadius: scale(8),
    paddingTop: verticalScale(18),
    paddingRight: scale(16),
    paddingBottom: verticalScale(18),
    paddingLeft: scale(16),
    marginBottom: verticalScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'flex-start',
  },
  iconContainer: {
    marginLeft: scale(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    flex: 1,
    textAlign: 'center',
  },
});

