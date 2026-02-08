import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TouchableOpacityProps,
  GestureResponderEvent,
} from 'react-native';
import { scale, verticalScale } from '../../utils/scaling';
import { Text, TypographyVariant } from './Text';
import { colors } from '../../design/tokens';

type ButtonVariant = 'black' | 'primary' | 'white' | 'gray' | 'outlinePrimary';
type ButtonSize = 'small' | 'medium';

interface ButtonProps extends Omit<TouchableOpacityProps, 'onPress'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  children: React.ReactNode;
  textVariant?: TypographyVariant;
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
      return {
        backgroundColor: colors.line,
      };
    }

    switch (variant) {
      case 'black':
        return {
          backgroundColor: colors.text.primary
        };
      case 'primary':
        return {
          backgroundColor: colors.primary.main
        };
      case 'white':
        return {
          backgroundColor: colors.white,
          borderWidth: 1.5,
          borderColor: colors.line,
        };
      case 'gray':
        return {
          backgroundColor: colors.line,
        };
      case 'outlinePrimary':
        return {
          backgroundColor: colors.white,
          borderWidth: 1.5,
          borderColor: colors.primary.main,
        };
      default:
        return {
          backgroundColor: colors.primary.main
        };
    }
  };

  const getTextColor = (): string => {
    if (disabled) {
      return colors.icon.gray;
    }

    switch (variant) {
      case 'black':
        return colors.white;
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

  const getMaxWidth = (): number => {
    return size === 'medium' ? scale(350) : scale(170);
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyle(),
        { width: getMaxWidth() },
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
    width: '100%',
    height: verticalScale(48),
    borderRadius: scale(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
});