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
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
