import React from 'react';
import {
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
    TouchableOpacityProps,
} from 'react-native';
import { scale, verticalScale } from '../../utils/scaling';
import { Text } from './Text';
import { colors } from '../../design/tokens';

type ButtonVariant = 'black' | 'primary' | 'white' | 'gray' | 'outlinePrimary';
type ButtonSize = 'small' | 'medium';

type ButtonTextVariant = string; // As noted in the file, can be refined

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  onPress: () => void;
  children: React.ReactNode;
  textVariant?: ButtonTextVariant;
  textColor?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onPress,
  children,
  style,
  textVariant = 'md',
  textColor,
  ...rest
}) => {
    // variant에 따른 스타일 결정
    const getVariantStyle = (): ViewStyle => {
        // 버튼이 비활성화 상태일 경우 gray 스타일 적용
        if (disabled) {
            return {
                backgroundColor: colors.line,
            };
        }

    switch (variant) {
      case 'black':
        return { backgroundColor: colors.text.primary };
      case 'primary':
        return { backgroundColor: colors.primary.main };
      case 'white':
        return {
          backgroundColor: colors.white,
          borderWidth: 1.5,
          borderColor: colors.line,
        };
      case 'gray':
        return { backgroundColor: colors.line };
      case 'outlinePrimary':
        return {
          backgroundColor: colors.white,
          borderWidth: 1.5,
          borderColor: colors.primary.main,
        };
      default:
        return { backgroundColor: colors.primary.main };
    }
  };

    // variant에 따른 텍스트 색상 결정
    const getTextColor = (): string => {
        // 버튼이 비활성화 상태일 경우
        if (disabled) {
            return colors.icon.gray;
        }

    switch (variant) {
      case 'black':
      case 'primary':
        return colors.white;
      case 'white':
        return colors.text.tertiary;
      case 'gray':
        return colors.icon.gray;
      case 'outlinePrimary':
        return colors.primary.main;
      default:
        return colors.white;
    }
  };

  const getWidth = (): number => {
    return size === 'medium' ? scale(350) : scale(170);
  };

  const getPaddingVertical = (): number => {
    return size === 'small' ? 8 : 14; // Changed from 12 to 8 for small size
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyle(),
        { width: getWidth(), paddingVertical: getPaddingVertical() },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.9}
      {...rest}
    >
      {typeof children === 'string' ? (
        <Text variant={textVariant} color={textColor ?? getTextColor()}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    button: {
        width: '100%',            // 기본적으로 부모 컨테이너 너비를 따름
        height: verticalScale(48),               // 고정 높이
        borderRadius: scale(10),         // 모서리
        // paddingVertical: verticalScale(14),      // 위아래 여백
        // paddingHorizontal: scale(10),    // 좌우 여백
        justifyContent: 'center', // 세로 중앙 정렬
        alignItems: 'center',     // 가로 중앙 정렬
    },
});