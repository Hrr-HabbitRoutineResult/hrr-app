import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TouchableOpacityProps,
} from 'react-native';
import { Text } from './Text';
import { colors } from '../../design/tokens';

type ButtonVariant = 'black' | 'primary' | 'white' | 'gray' | 'outlinePrimary';
type ButtonSize = 'small' | 'medium';

// ✅ Text 컴포넌트의 variant 타입을 정확히 모르니,
// 일단 string으로 열어두고(안전), 나중에 Text의 타입을 가져와도 됩니다.
// 예: import type { TextVariant } from './Text';
type ButtonTextVariant = string;

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  onPress: () => void;
  children: React.ReactNode;

  // ✅ 추가: 버튼 내부 기본 텍스트 variant를 덮어쓰기
  // 안 주면 기존처럼 'md'
  textVariant?: ButtonTextVariant;

  // ✅ 추가(선택): 기본 텍스트 색상도 덮어쓰기
  // 안 주면 기존 getTextColor() 사용
  textColor?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onPress,
  children,
  style,
  textVariant = 'md', // ✅ 기본값: 기존 유지
  textColor,          // ✅ 선택
  ...rest
}) => {
  const getVariantStyle = (): ViewStyle => {
    if (disabled) {
      return { backgroundColor: colors.line };
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

  const getTextColor = (): string => {
    if (disabled) return colors.icon.gray;

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
    return size === 'medium' ? 350 : 170;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyle(),
        { width: getWidth() },
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
    height: 48,
    borderRadius: 10,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
