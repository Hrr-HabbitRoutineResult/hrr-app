import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './Text';
import { colors, spacing, radius, typography } from '../../design/tokens';
import LockIcon from '../../../assets/icons/lock.svg';
import BlockIcon from '../../../assets/icons/ic_block.svg';
import CheckboxFilterCheckedIcon from '../../../assets/icons/checkbox-filter-checked.svg';

interface ToastNotificationProps {
  visible: boolean;
  message: string;
  duration?: number;
  onHide: () => void;
  iconType?: 'block' | 'lock' | 'success'; // New prop
}

const ANIMATION_DURATION = 300;

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  visible,
  message,
  duration = 2000, // Disappears after 2 seconds
  onHide,
  iconType, // New prop
}) => {
  const insets = useSafeAreaInsets();
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.delay(duration),
        Animated.timing(animValue, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          onHide();
        }
      });
    }
  }, [visible, duration, onHide, animValue]);

  if (!visible) {
    return null;
  }

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0],
  });

  const opacity = animValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.8, 1],
  });

  // Determine the icon to render based on iconType prop or message content
  const IconComponent =
    iconType === 'block'
      ? BlockIcon
      : iconType === 'success'
      ? CheckboxFilterCheckedIcon
      : iconType === 'lock'
      ? LockIcon
      : message.includes('차단')
      ? BlockIcon
      : LockIcon;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: insets.bottom + spacing.md,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {IconComponent && <IconComponent width={16} height={16} style={styles.icon} />}
      <Text variant="smReg" color={colors.text.primary}>
        {message}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: spacing.md,
    right: spacing.md,
    height: 48,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  icon: {
    marginRight: spacing.sm,
  },
});
