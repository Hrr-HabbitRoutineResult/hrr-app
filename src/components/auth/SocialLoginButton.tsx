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

export type SocialProvider = 'apple' | 'naver' | 'kakao';

interface SocialLoginButtonProps {
  provider: SocialProvider;
  onPress: () => void;
  showTooltip?: boolean;
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
  showTooltip = false,
}) => {
  const config = PROVIDER_CONFIG[provider];
  const IconComponent = config.Icon;

  return (
    <View style={styles.wrapper}>
      {showTooltip && (
        <View style={styles.tooltipContainer}>
          <View style={styles.tooltipBadge}>
            <View style={styles.tooltipArrow} />
            <Text variant="xsReg" color={colors.text.primary} allowFontScaling={false}>
              최근 로그인
            </Text>
          </View>
        </View>
      )}
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
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    maxWidth: scale(350),
    alignItems: 'center',
    marginBottom: verticalScale(12),
    overflow: 'visible',
  },
  tooltipContainer: {
    position: 'absolute',
    right: scale(12),
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  tooltipBadge: {
    backgroundColor: colors.white,
    borderRadius: scale(8),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    alignItems: 'center',
    flexDirection: 'row',
  },
  tooltipArrow: {
    position: 'absolute',
    left: -scale(5.5),
    width: 0,
    height: 0,
    borderTopWidth: scale(5),
    borderBottomWidth: scale(5),
    borderRightWidth: scale(7),
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: colors.white,
  },
  button: {
    width: '100%',
    height: scale(54),
    borderRadius: scale(8),
    paddingHorizontal: scale(16),
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

