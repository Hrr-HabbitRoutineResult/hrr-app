import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './Text';
import { scale, verticalScale } from '../../utils/scaling';
import { colors, typography, spacing } from '../../design/tokens';

type SectionHeaderProps = {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
  rightContent?: React.ReactNode;
  isScreenHeader?: boolean;
};

const SectionHeader = ({ title, actionText, onActionPress, rightContent, isScreenHeader = false }: SectionHeaderProps) => {
  const insets = useSafeAreaInsets();

  const topPadding = isScreenHeader ? (Platform.OS === 'android' ? verticalScale(18) : verticalScale(10)) : 0;
  const bottomPadding = isScreenHeader ? verticalScale(4) : 0;
  const safeAreaTop = isScreenHeader ? (Platform.OS === 'android' ? Math.max(insets.top, verticalScale(24)) : insets.top) : 0;

  return (
    <View style={[
      isScreenHeader ? styles.screenHeaderContainer : styles.container,
      isScreenHeader && {
        paddingTop: safeAreaTop + topPadding,
        paddingBottom: bottomPadding
      }
    ]}>
      {isScreenHeader ? (
        <Text variant="header1" color={colors.text.primary}>
          {title}
        </Text>
      ) : (
        <Text variant="header3" color={colors.text.primary}>
          {title}
        </Text>
      )}
      {rightContent ? (
        <View style={styles.rightContentContainer}>
          {rightContent}
        </View>
      ) : actionText && onActionPress ? (
        <TouchableOpacity onPress={onActionPress}>
          <Text variant="smMd" color={colors.text.secondary}>
            {actionText}
          </Text>
        </TouchableOpacity>
      ) : !isScreenHeader && (
        <View style={styles.rightContentPlaceholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  screenHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(24),
    backgroundColor: colors.white,
  },
  rightContentContainer: {
    minWidth: 24,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  rightContentPlaceholder: {
    minWidth: 24,
  },
});

export default SectionHeader;
