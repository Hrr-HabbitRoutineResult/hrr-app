import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { scale, verticalScale } from '../../utils/scaling';
import { colors, typography, spacing } from '../../design/tokens';

type SectionHeaderProps = {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
  rightContent?: React.ReactNode;
};

const SectionHeader = ({ title, actionText, onActionPress, rightContent }: SectionHeaderProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {rightContent ? (
        <View style={styles.rightContentContainer}>
          {rightContent}
        </View>
      ) : actionText && onActionPress ? (
        <TouchableOpacity onPress={onActionPress}>
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      ) : (
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
  title: {
    ...typography.header3,
    color: colors.text.primary,
  },
  actionText: {
    ...typography.smMd,
    color: colors.text.secondary,
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
