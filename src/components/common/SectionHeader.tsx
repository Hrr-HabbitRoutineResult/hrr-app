import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
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

  const topPadding = isScreenHeader ? verticalScale(20) : 0
  const bottomPadding = isScreenHeader ? verticalScale(14) : 0;
  const safeAreaTop = isScreenHeader ? insets.top : 0;

  return (
    <View style={[
      isScreenHeader ? styles.screenHeaderContainer : styles.container,
      isScreenHeader && {
        paddingTop: safeAreaTop + topPadding,
        paddingBottom: bottomPadding,
        height: safeAreaTop + topPadding + bottomPadding + verticalScale(34),
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
    paddingLeft: scale(20),
    paddingRight: scale(10),
    backgroundColor: colors.white,
  },
  rightContentContainer: {
    minWidth: scale(24),
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  rightContentPlaceholder: {
    minWidth: scale(24),
  },
});

export default SectionHeader;
